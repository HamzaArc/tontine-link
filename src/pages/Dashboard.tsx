import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Plus, Filter, Search } from "lucide-react";
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

const mockTontines = [
  {
    id: "1",
    name: "Family Savings",
    description: "Monthly savings with family members",
    members: { current: 8, total: 10 },
    cycleProgress: 60,
    amount: 1000,
    currency: "MAD",
    nextPayment: "Oct 30",
    status: "active",
    role: "admin",
  },
  {
    id: "2",
    name: "Friends Group",
    description: "Savings circle with close friends",
    members: { current: 5, total: 5 },
    cycleProgress: 40,
    amount: 750,
    currency: "MAD",
    nextPayment: "Nov 15",
    status: "active",
    role: "member",
  },
  {
    id: "3",
    name: "Colleagues Tontine",
    description: "Office savings for yearly trips",
    members: { current: 7, total: 12 },
    cycleProgress: 25,
    amount: 500,
    currency: "MAD",
    nextPayment: "Nov 5",
    status: "active",
    role: "member",
  },
  {
    id: "4",
    name: "Emergency Fund",
    description: "Collective savings for emergencies",
    members: { current: 4, total: 6 },
    cycleProgress: 80,
    amount: 1200,
    currency: "MAD",
    nextPayment: "Oct 25",
    status: "pending",
    role: "admin",
  },
];

const Dashboard = () => {
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  const filteredTontines = mockTontines.filter(tontine => {
    const matchesSearch = tontine.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         tontine.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "admin") return matchesSearch && tontine.role === "admin";
    if (activeTab === "member") return matchesSearch && tontine.role === "member";
    if (activeTab === "pending") return matchesSearch && tontine.status === "pending";
    
    return matchesSearch;
  });

  if (loading) {
    return <LoadingSpinner />;
  }

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
                        {...tontine}
                        className={`animate-fade-in [animation-delay:${index * 100}ms]`}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No tontines found matching your criteria.</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="admin" className="mt-0">
                {filteredTontines.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTontines.map((tontine, index) => (
                      <TontineCard 
                        key={tontine.id}
                        {...tontine}
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
                        {...tontine}
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
                        {...tontine}
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
