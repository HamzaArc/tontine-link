
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Users, Calendar, DollarSign, Clock, Mail, Phone } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
}

interface Member {
  id: string;
  role: string;
  status: string;
  joined_at: string | null;
  user_id: string;
  profiles: Profile;
}

interface PaymentCycle {
  id: string;
  cycle_month: string;
  status: string;
  recipient_id: string | null;
  recipient: Profile | null;
}

interface Invitation {
  id: string;
  email: string | null;
  phone: string | null;
  status: string;
  created_at: string;
  invited_by: string;
}

interface TontineData {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  currency: string;
  frequency: string;
  max_members: number;
  admin_id: string;
  created_at: string;
  members: Member[];
  cycles: PaymentCycle[];
  invitations: Invitation[];
  userRole: string | null;
  isAdmin: boolean;
}

const TontineDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePhone, setInvitePhone] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const { data: tontineData, isLoading } = useQuery({
    queryKey: ['tontineDetail', id],
    queryFn: async () => {
      if (!user || !id) return null;
      
      // Fetch the tontine group data
      const { data: tontine, error: tontineError } = await supabase
        .from('tontine_groups')
        .select('*')
        .eq('id', id)
        .single();
        
      if (tontineError) {
        console.error("Error fetching tontine:", tontineError);
        throw tontineError;
      }
      
      // Fetch members data with separate query for profiles
      const { data: members, error: membersError } = await supabase
        .from('group_members')
        .select('id, role, status, joined_at, user_id')
        .eq('group_id', id);
        
      if (membersError) {
        console.error("Error fetching members:", membersError);
        throw membersError;
      }
      
      // Fetch profiles for all members
      const memberProfiles: Record<string, Profile> = {};
      if (members && members.length > 0) {
        const userIds = members.map(member => member.user_id);
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url')
          .in('id', userIds);
          
        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
          // Don't throw here, we can still show partial data
        } else if (profiles) {
          profiles.forEach(profile => {
            memberProfiles[profile.id] = profile as Profile;
          });
        }
      }
      
      // Fetch cycles data with separate query for recipient profiles
      const { data: cycles, error: cyclesError } = await supabase
        .from('payment_cycles')
        .select('id, cycle_month, status, recipient_id')
        .eq('group_id', id)
        .order('cycle_month', { ascending: true });
        
      if (cyclesError) {
        console.error("Error fetching cycles:", cyclesError);
        throw cyclesError;
      }
      
      // Fetch recipient profiles for all cycles
      const recipientProfiles: Record<string, Profile> = {};
      if (cycles && cycles.length > 0) {
        const recipientIds = cycles
          .map(cycle => cycle.recipient_id)
          .filter((id): id is string => id !== null);
          
        if (recipientIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name, email, avatar_url')
            .in('id', recipientIds);
            
          if (profilesError) {
            console.error("Error fetching recipient profiles:", profilesError);
            // Don't throw here, we can still show partial data
          } else if (profiles) {
            profiles.forEach(profile => {
              recipientProfiles[profile.id] = profile as Profile;
            });
          }
        }
      }
      
      // Fetch invitations
      const { data: invitations, error: invitationsError } = await supabase
        .from('invitations')
        .select('*')
        .eq('group_id', id);
        
      if (invitationsError) {
        console.error("Error fetching invitations:", invitationsError);
        throw invitationsError;
      }
      
      // Fetch user role
      const { data: userRole, error: userRoleError } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', id)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (userRoleError && userRoleError.code !== 'PGRST116') {
        console.error("Error fetching user role:", userRoleError);
        // Don't throw, user might not be a member
      }
      
      // Process members with their profiles
      const processedMembers = members?.map(member => {
        const profile = memberProfiles[member.user_id] || {
          id: member.user_id,
          full_name: null,
          email: "",
          avatar_url: null
        };
        
        return {
          ...member,
          profiles: profile
        } as Member;
      }) || [];
      
      // Process cycles with their recipient profiles
      const processedCycles = cycles?.map(cycle => {
        const recipient = cycle.recipient_id ? recipientProfiles[cycle.recipient_id] || null : null;
        
        return {
          ...cycle,
          recipient
        } as PaymentCycle;
      }) || [];
      
      // Compile and return the final tontine data
      return {
        ...tontine,
        members: processedMembers,
        cycles: processedCycles,
        invitations: invitations || [],
        userRole: userRole?.role || (tontine.admin_id === user.id ? 'admin' : null),
        isAdmin: tontine.admin_id === user.id || userRole?.role === 'admin'
      } as TontineData;
    },
    enabled: !!user && !!id,
  });
  
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !id || (!inviteEmail && !invitePhone)) {
      toast({
        title: "Invalid invitation",
        description: "Please provide either an email or phone number.",
        variant: "destructive",
      });
      return;
    }
    
    setIsInviting(true);
    
    try {
      const { error } = await supabase
        .from('invitations')
        .insert({
          group_id: id,
          email: inviteEmail || null,
          phone: invitePhone || null,
          invited_by: user.id
        });
        
      if (error) throw error;
      
      toast({
        title: "Invitation sent",
        description: "Your invitation has been sent successfully.",
      });
      
      setInviteEmail("");
      setInvitePhone("");
      setShowInviteDialog(false);
    } catch (error: any) {
      console.error("Error sending invitation:", error);
      toast({
        title: "Invitation failed",
        description: error.message || "Failed to send invitation.",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };
  
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }
  
  if (loading || isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!tontineData) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 container max-w-7xl px-4 pt-24 pb-12 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Tontine Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The tontine you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }
  
  const cycleProgress = tontineData.cycles.length > 0
    ? Math.round((tontineData.cycles.filter(c => c.status === 'completed').length / tontineData.max_members) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container max-w-7xl px-4 pt-24 pb-12">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-6"
          onClick={() => navigate('/dashboard')}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{tontineData.name}</h1>
              <p className="text-muted-foreground mt-1">
                {tontineData.description}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-2xl font-bold">{tontineData.members.filter(m => m.status === 'active').length}/{tontineData.max_members}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Contribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-primary" />
                    <span className="text-2xl font-bold">{tontineData.currency} {tontineData.amount}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Cycle Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{cycleProgress}%</span>
                    </div>
                    <Progress value={cycleProgress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="cycles">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="cycles">Payment Cycles</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="invitations">Invitations</TabsTrigger>
              </TabsList>
              
              <TabsContent value="cycles" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Payment Cycles</h2>
                  {tontineData.isAdmin && (
                    <Button size="sm">
                      Add Cycle
                    </Button>
                  )}
                </div>
                
                {tontineData.cycles.length > 0 ? (
                  <div className="space-y-3">
                    {tontineData.cycles.map((cycle) => (
                      <Card key={cycle.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">
                                {new Date(cycle.cycle_month).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'long'
                                })}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Status: <span className="capitalize">{cycle.status}</span>
                              </p>
                            </div>
                            <div className="flex items-center">
                              {cycle.recipient && (
                                <div className="flex items-center mr-3">
                                  <Avatar className="h-8 w-8 mr-2">
                                    <AvatarImage src={cycle.recipient.avatar_url || undefined} />
                                    <AvatarFallback>{(cycle.recipient.full_name || cycle.recipient.email || "").substring(0, 2).toUpperCase()}</AvatarFallback>
                                  </Avatar>
                                  <div className="text-sm">
                                    <p className="font-medium">{cycle.recipient.full_name || cycle.recipient.email}</p>
                                    <p className="text-muted-foreground">Recipient</p>
                                  </div>
                                </div>
                              )}
                              {tontineData.isAdmin && (
                                <Button size="sm" variant="outline">Manage</Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border rounded-lg">
                    <p className="text-muted-foreground">No payment cycles have been set up yet.</p>
                    {tontineData.isAdmin && (
                      <Button className="mt-4">Create First Cycle</Button>
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="members" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Members</h2>
                  {tontineData.isAdmin && (
                    <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                      <DialogTrigger asChild>
                        <Button size="sm">Invite Member</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Invite New Member</DialogTitle>
                          <DialogDescription>
                            Send an invitation to join this tontine group.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleInvite} className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="member@example.com"
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                            />
                          </div>
                          <p className="text-center text-sm text-muted-foreground">- OR -</p>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              type="tel"
                              placeholder="+1234567890"
                              value={invitePhone}
                              onChange={(e) => setInvitePhone(e.target.value)}
                            />
                          </div>
                          <div className="flex justify-end gap-2 mt-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowInviteDialog(false)}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" disabled={isInviting || (!inviteEmail && !invitePhone)}>
                              {isInviting ? "Sending..." : "Send Invitation"}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
                
                <div className="space-y-3">
                  {tontineData.members.map((member) => (
                    <Card key={member.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarImage src={member.profiles?.avatar_url || undefined} />
                              <AvatarFallback>{(member.profiles?.full_name || member.profiles?.email || "").substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">{member.profiles?.full_name || member.profiles?.email}</h3>
                              <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                            </div>
                          </div>
                          {tontineData.isAdmin && member.user_id !== user?.id && (
                            <Button size="sm" variant="outline">
                              Manage
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="invitations" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Pending Invitations</h2>
                </div>
                
                {tontineData.invitations.length > 0 ? (
                  <div className="space-y-3">
                    {tontineData.invitations.map((invitation) => (
                      <Card key={invitation.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              {invitation.email ? (
                                <Mail className="h-5 w-5 mr-3 text-muted-foreground" />
                              ) : (
                                <Phone className="h-5 w-5 mr-3 text-muted-foreground" />
                              )}
                              <div>
                                <h3 className="font-medium">{invitation.email || invitation.phone}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Invited: {new Date(invitation.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            {tontineData.isAdmin && (
                              <Button size="sm" variant="outline">Cancel</Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border rounded-lg">
                    <p className="text-muted-foreground">No pending invitations.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tontine Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Admin</p>
                  <p>
                    {tontineData.members.find(m => m.user_id === tontineData.admin_id)?.profiles?.full_name ||
                    "Unknown"}
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <p>{new Date(tontineData.created_at).toLocaleDateString()}</p>
                </div>
                
                <Separator />
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Frequency</p>
                  <p className="capitalize">{tontineData.frequency}</p>
                </div>
                
                <Separator />
                
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Your Role</p>
                  <p className="capitalize">{tontineData.userRole}</p>
                </div>
                
                {!tontineData.isAdmin && (
                  <>
                    <Separator />
                    <Button variant="outline" className="w-full">Leave Group</Button>
                  </>
                )}
              </CardContent>
            </Card>
            
            {tontineData.isAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle>Admin Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full">Manage Cycles</Button>
                  <Button variant="outline" className="w-full">Edit Tontine</Button>
                  <Button variant="destructive" className="w-full">Delete Tontine</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TontineDetail;

