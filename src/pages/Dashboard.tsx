
import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { Plus, Filter, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { TontineCard } from "@/components/ui/tontine-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TontineGroup {
  id: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  max_members: number;
  admin_id: string;
  created_at: string;
  role?: string;
  status?: string;
  members_count?: number;
  total_members?: number;
  cycle_progress?: number;
  next_payment?: string;
}

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  console.log("Dashboard rendering, user:", user?.id);

  const fetchTontineGroups = async () => {
    console.log("Fetching tontine groups for user:", user?.id);
    if (!user) return [];
    
    try {
      // Fetch all groups where the user is a member
      const { data: memberGroups, error: memberError } = await supabase
        .from('group_members')
        .select(`
          group_id,
          role,
          status,
          tontine_groups:group_id(*)
        `)
        .eq('user_id', user.id);
      
      if (memberError) {
        console.error("Error fetching member groups:", memberError);
        throw memberError;
      }
      
      console.log("Member groups fetched:", memberGroups);
      
      // Also fetch groups where the user is an admin
      const { data: adminGroups, error: adminError } = await supabase
        .from('tontine_groups')
        .select('*')
        .eq('admin_id', user.id);
      
      if (adminError) {
        console.error("Error fetching admin groups:", adminError);
        throw adminError;
      }
      
      console.log("Admin groups fetched:", adminGroups);
      
      // Combine and format the results
      const formattedGroups: TontineGroup[] = [];
      
      // Add member groups
      if (memberGroups) {
        for (const memberGroup of memberGroups) {
          if (memberGroup.tontine_groups) {
            formattedGroups.push({
              ...(memberGroup.tontine_groups as any),
              role: memberGroup.role,
              status: memberGroup.status
            });
          }
        }
      }
      
      // Add admin groups that are not already in the list
      if (adminGroups) {
        for (const adminGroup of adminGroups) {
          if (!formattedGroups.some(g => g.id === adminGroup.id)) {
            formattedGroups.push({
              ...adminGroup,
              role: 'admin',
              status: 'active'
            });
          }
        }
      }
      
      console.log("Combined groups before enrichment:", formattedGroups);
      
      // Enrich each group with additional data
      const enrichedGroups = await Promise.all(
        formattedGroups.map(async (group) => {
          try {
            // Fetch member count
            const { count: membersCount, error: countError } = await supabase
              .from('group_members')
              .select('*', { count: 'exact', head: true })
              .eq('group_id', group.id)
              .eq('status', 'active');
            
            if (!countError) {
              group.members_count = membersCount || 0;
              group.total_members = group.max_members;
            }
            
            // Fetch payment cycles
            const { data: cycles, error: cycleError } = await supabase
              .from('payment_cycles')
              .select('*')
              .eq('group_id', group.id)
              .order('cycle_month', { ascending: true });
            
            if (!cycleError && cycles && cycles.length > 0) {
              // Calculate cycle progress
              const totalCycles = group.max_members;
              const completedCycles = cycles.filter(c => c.status === 'completed').length;
              group.cycle_progress = Math.round((completedCycles / totalCycles) * 100);
              
              // Find the next payment
              const activeCycle = cycles.find(c => c.status === 'active');
              if (activeCycle) {
                const cycleDate = new Date(activeCycle.cycle_month);
                group.next_payment = cycleDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }
            } else {
              group.cycle_progress = 0;
            }
            
            return group;
          } catch (err) {
            console.error("Error enriching group data:", err, "Group:", group.id);
            return group;
          }
        })
      );
      
      console.log("Final enriched groups:", enrichedGroups);
      return enrichedGroups;
    } catch (err) {
      console.error("Error in fetchTontineGroups:", err);
      toast({
        title: "Error",
        description: "Failed to load tontine groups. Please try again.",
        variant: "destructive",
      });
      return [];
    }
  };
  
  const { data: tontineGroups, isLoading: loadingGroups, error } = useQuery({
    queryKey: ['tontineGroups', user?.id],
    queryFn: fetchTontineGroups,
    enabled: !!user,
    retry: 2,
  });
  
  if (error) {
    console.error("Query error:", error);
  }
  
  // If user is still loading, show loading spinner
  if (authLoading) {
    console.log("Auth is still loading");
    return <LoadingSpinner />;
  }
  
  // If user is not authenticated and not loading, redirect to auth
  if (!user && !authLoading) {
    console.log("User not authenticated, redirecting to auth");
    return <Navigate to="/auth" replace />;
  }

  const filteredTontines = tontineGroups?.filter(tontine => {
    if (!tontine) return false;
    
    const matchesSearch = tontine.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (tontine.description && tontine.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "admin") return matchesSearch && tontine.role === "admin";
    if (activeTab === "member") return matchesSearch && tontine.role === "member";
    if (activeTab === "pending") return matchesSearch && tontine.status === "pending";
    
    return matchesSearch;
  }) || [];

  // Show loading spinner while groups are being fetched
  if (loadingGroups) {
    console.log("Tontine groups are still loading");
    return <LoadingSpinner />;
  }

  console.log("Rendering dashboard with data:", { 
    filteredTontines: filteredTontines.length,
    activeTab
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container max-w-7xl px-4 pt-24 pb-12">
        <div className="animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Tontines</h1>
              <p className="text-muted-foreground mt-1">
                Manage and track all your savings groups in one place
              </p>
            </div>
            
            <Button asChild size="lg" className="rounded-full">
              <Link to="/create-group">
                <Plus className="mr-2 h-4 w-4" />
                Create New Tontine
              </Link>
            </Button>
          </div>
          
          <div className="mb-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tontines..."
                  className="pl-9 rounded-full bg-background"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto rounded-full">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filter By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Most Recent</DropdownMenuItem>
                  <DropdownMenuItem>Amount (High to Low)</DropdownMenuItem>
                  <DropdownMenuItem>Amount (Low to High)</DropdownMenuItem>
                  <DropdownMenuItem>Alphabetical</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="all" className="rounded-full">
                  All
                </TabsTrigger>
                <TabsTrigger value="admin" className="rounded-full">
                  Admin
                </TabsTrigger>
                <TabsTrigger value="member" className="rounded-full">
                  Member
                </TabsTrigger>
                <TabsTrigger value="pending" className="rounded-full">
                  Pending
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-0">
                {filteredTontines.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTontines.map((tontine, index) => (
                      <TontineCard 
                        key={tontine.id}
                        id={tontine.id}
                        name={tontine.name}
                        description={tontine.description || ""}
                        members={{
                          current: tontine.members_count || 0,
                          total: tontine.total_members || tontine.max_members
                        }}
                        cycleProgress={tontine.cycle_progress || 0}
                        amount={tontine.amount}
                        currency={tontine.currency}
                        nextPayment={tontine.next_payment}
                        className={`animate-fade-in [animation-delay:${index * 100}ms]`}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No tontines found matching your criteria.</p>
                    <Button asChild>
                      <Link to="/create-group">Create Your First Tontine</Link>
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="admin" className="mt-0">
                {filteredTontines.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTontines.map((tontine, index) => (
                      <TontineCard 
                        key={tontine.id}
                        id={tontine.id}
                        name={tontine.name}
                        description={tontine.description || ""}
                        members={{
                          current: tontine.members_count || 0,
                          total: tontine.total_members || tontine.max_members
                        }}
                        cycleProgress={tontine.cycle_progress || 0}
                        amount={tontine.amount}
                        currency={tontine.currency}
                        nextPayment={tontine.next_payment}
                        className={`animate-fade-in [animation-delay:${index * 100}ms]`}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No tontines found where you are an admin.</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="member" className="mt-0">
                {filteredTontines.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTontines.map((tontine, index) => (
                      <TontineCard 
                        key={tontine.id}
                        id={tontine.id}
                        name={tontine.name}
                        description={tontine.description || ""}
                        members={{
                          current: tontine.members_count || 0,
                          total: tontine.total_members || tontine.max_members
                        }}
                        cycleProgress={tontine.cycle_progress || 0}
                        amount={tontine.amount}
                        currency={tontine.currency}
                        nextPayment={tontine.next_payment}
                        className={`animate-fade-in [animation-delay:${index * 100}ms]`}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No tontines found where you are a member.</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="pending" className="mt-0">
                {filteredTontines.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTontines.map((tontine, index) => (
                      <TontineCard 
                        key={tontine.id}
                        id={tontine.id}
                        name={tontine.name}
                        description={tontine.description || ""}
                        members={{
                          current: tontine.members_count || 0,
                          total: tontine.total_members || tontine.max_members
                        }}
                        cycleProgress={tontine.cycle_progress || 0}
                        amount={tontine.amount}
                        currency={tontine.currency}
                        nextPayment={tontine.next_payment}
                        className={`animate-fade-in [animation-delay:${index * 100}ms]`}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No pending tontines found.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
