
import { useState } from "react";
import { User, Mail, Phone, Lock, Bell, LogOut } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const Profile = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("account");
  const [isEditing, setIsEditing] = useState(false);
  
  // Mock user data
  const [userData, setUserData] = useState({
    name: "Mohammed Alami",
    email: "mohammed.alami@example.com",
    phone: "+212 611223344",
    avatar: "",
  });
  
  const handleSaveProfile = () => {
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved successfully.",
    });
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container max-w-6xl px-4 pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-fade-in">
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="flex flex-col items-center mb-6 p-6 border rounded-xl bg-card">
                <Avatar className="h-24 w-24 mb-4 ring-4 ring-primary/10">
                  <AvatarImage src={userData.avatar} />
                  <AvatarFallback className="text-2xl bg-primary/5 border-2">
                    {userData.name.split(' ').map(part => part[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold text-center">{userData.name}</h2>
                <p className="text-sm text-muted-foreground text-center mt-1">{userData.email}</p>
              </div>
              
              <Tabs
                defaultValue="account"
                orientation="vertical"
                className="hidden lg:block"
                value={activeTab}
                onValueChange={setActiveTab}
              >
                <TabsList className="flex flex-col h-auto bg-transparent space-y-1 p-0">
                  <TabsTrigger 
                    value="account" 
                    className={cn(
                      "justify-start py-2 px-4 border",
                      activeTab === "account" ? "bg-primary text-primary-foreground border-primary" : "bg-transparent hover:bg-muted"
                    )}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Account
                  </TabsTrigger>
                  <TabsTrigger 
                    value="security" 
                    className={cn(
                      "justify-start py-2 px-4 border",
                      activeTab === "security" ? "bg-primary text-primary-foreground border-primary" : "bg-transparent hover:bg-muted"
                    )}
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    Security
                  </TabsTrigger>
                  <TabsTrigger 
                    value="notifications" 
                    className={cn(
                      "justify-start py-2 px-4 border",
                      activeTab === "notifications" ? "bg-primary text-primary-foreground border-primary" : "bg-transparent hover:bg-muted"
                    )}
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Tabs
                defaultValue="account"
                className="lg:hidden mt-4"
                value={activeTab}
                onValueChange={setActiveTab}
              >
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="account">
                    <User className="mr-2 h-4 w-4" />
                    Account
                  </TabsTrigger>
                  <TabsTrigger value="security">
                    <Lock className="mr-2 h-4 w-4" />
                    Security
                  </TabsTrigger>
                  <TabsTrigger value="notifications">
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Button variant="outline" className="w-full mt-6 text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            </div>
          </div>
          
          <div className="lg:col-span-3">
            <TabsContent value="account" className="m-0 animate-fade-in">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">Account Information</CardTitle>
                      <CardDescription className="mt-1.5">
                        Update your personal information and contact details
                      </CardDescription>
                    </div>
                    {!isEditing ? (
                      <Button size="sm" onClick={() => setIsEditing(true)}>
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleSaveProfile}>
                          Save Changes
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="name"
                            placeholder="Your full name"
                            value={userData.name}
                            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                            className="pl-9"
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="Your email address"
                            value={userData.email}
                            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                            className="pl-9"
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          placeholder="Your phone number"
                          value={userData.phone}
                          onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                          className="pl-9"
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Profile Picture</h3>
                    <div className="flex items-center gap-6">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={userData.avatar} />
                        <AvatarFallback className="text-xl bg-primary/5 border-2">
                          {userData.name.split(' ').map(part => part[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <Button size="sm" variant="outline" disabled={!isEditing}>
                          Upload New Picture
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          Recommended size: 300x300px. Max file size: 2MB.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security" className="m-0 animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Security</CardTitle>
                  <CardDescription className="mt-1.5">
                    Manage your password and security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Change Password</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" placeholder="••••••••" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="new-password">New Password</Label>
                          <Input id="new-password" type="password" placeholder="••••••••" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirm New Password</Label>
                          <Input id="confirm-password" type="password" placeholder="••••••••" />
                        </div>
                      </div>
                      <Button className="mt-2">Update Password</Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Enable two-factor authentication</p>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
                    <Button variant="outline" className="text-destructive border-destructive/20">
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notifications" className="m-0 animate-fade-in">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Notifications</CardTitle>
                  <CardDescription className="mt-1.5">
                    Manage how you receive notifications and updates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Email Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Payment Reminders</p>
                          <p className="text-sm text-muted-foreground">
                            Receive email reminders for upcoming payments
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">New Member Alerts</p>
                          <p className="text-sm text-muted-foreground">
                            Get notified when someone joins your tontine group
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Payment Confirmations</p>
                          <p className="text-sm text-muted-foreground">
                            Receive confirmation emails for payments
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">SMS Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Payment Reminders</p>
                          <p className="text-sm text-muted-foreground">
                            Receive SMS reminders for upcoming payments
                          </p>
                        </div>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Urgent Alerts</p>
                          <p className="text-sm text-muted-foreground">
                            Get SMS for urgent or important notifications
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
