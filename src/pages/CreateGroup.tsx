import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { ChevronLeft, Plus, X, HelpCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const CreateGroup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  
  // Form states
  const [tontineName, setTontineName] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("MAD");
  const [memberLimit, setMemberLimit] = useState("");
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  
  // Step state
  const [currentStep, setCurrentStep] = useState(1);
  
  // If not authenticated, redirect to login
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }
  
  const handleEmailAdd = () => {
    if (newEmail && !invitedEmails.includes(newEmail)) {
      setInvitedEmails([...invitedEmails, newEmail]);
      setNewEmail("");
    }
  };
  
  const handleEmailRemove = (emailToRemove: string) => {
    setInvitedEmails(invitedEmails.filter(email => email !== emailToRemove));
  };
  
  const handleNextStep = () => {
    if (currentStep === 1) {
      // Validate first step
      if (!tontineName || !description || !amount || !memberLimit) {
        toast({
          title: "Missing information",
          description: "Please fill out all required fields before continuing.",
          variant: "destructive",
        });
        return;
      }
    }
    
    setCurrentStep(currentStep + 1);
  };
  
  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Here we would typically send the data to the backend
    console.log({
      tontineName,
      description,
      amount,
      currency,
      memberLimit,
      invitedEmails,
    });
    
    toast({
      title: "Tontine Created",
      description: "Your new tontine group has been created successfully!",
    });
    
    // Navigate to dashboard after creation
    navigate("/dashboard");
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container max-w-3xl px-4 pt-24 pb-12">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Create New Tontine</h1>
          <p className="text-muted-foreground mb-8">
            Set up a new savings group and invite members to join
          </p>
          
          <Card>
            <CardHeader className="relative">
              <CardTitle>Step {currentStep} of 2: {currentStep === 1 ? "Basic Information" : "Invite Members"}</CardTitle>
              <CardDescription>
                {currentStep === 1 
                  ? "Enter the basic details for your new tontine group" 
                  : "Invite people to join your tontine group"}
              </CardDescription>
              
              <div className="absolute top-4 right-6 flex gap-1.5">
                <div className={`h-2.5 w-2.5 rounded-full ${currentStep === 1 ? "bg-primary" : "bg-muted"}`} />
                <div className={`h-2.5 w-2.5 rounded-full ${currentStep === 2 ? "bg-primary" : "bg-muted"}`} />
              </div>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {currentStep === 1 && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="space-y-3">
                      <Label htmlFor="tontine-name">
                        Tontine Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="tontine-name"
                        placeholder="e.g., Family Savings Circle"
                        value={tontineName}
                        onChange={(e) => setTontineName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="description">
                        Description <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Describe the purpose of this tontine group"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <Label htmlFor="amount" className="mr-2">
                            Contribution Amount <span className="text-destructive">*</span>
                          </Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <HelpCircle className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="w-60">
                                  The fixed amount each member contributes per cycle
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className="relative">
                          <Input
                            id="amount"
                            type="number"
                            placeholder="1000"
                            min="1"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="currency">Currency</Label>
                        <Select value={currency} onValueChange={setCurrency}>
                          <SelectTrigger id="currency">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MAD">MAD - Moroccan Dirham</SelectItem>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <Label htmlFor="member-limit" className="mr-2">
                          Maximum Members <span className="text-destructive">*</span>
                        </Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <HelpCircle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-60">
                                This determines the number of cycles in your tontine. Each member gets one payout cycle.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Input
                        id="member-limit"
                        type="number"
                        min="2"
                        max="24"
                        placeholder="e.g., 12"
                        value={memberLimit}
                        onChange={(e) => setMemberLimit(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Choose between 2 and 24 members
                      </p>
                    </div>
                  </div>
                )}
                
                {currentStep === 2 && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="space-y-3">
                      <Label htmlFor="invite-email">Invite Members via Email</Label>
                      <div className="flex gap-2">
                        <Input
                          id="invite-email"
                          type="email"
                          placeholder="Enter email address"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleEmailAdd}
                          disabled={!newEmail}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        You can invite up to {memberLimit} members
                      </p>
                    </div>
                    
                    {invitedEmails.length > 0 && (
                      <div className="space-y-3">
                        <Label>Invited Members ({invitedEmails.length})</Label>
                        <div className="flex flex-wrap gap-2">
                          {invitedEmails.map((email, index) => (
                            <div 
                              key={index} 
                              className="bg-muted px-3 py-1.5 rounded-full flex items-center gap-1.5"
                            >
                              <span className="text-sm">{email}</span>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="h-5 w-5 rounded-full hover:bg-muted-foreground/20"
                                onClick={() => handleEmailRemove(email)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <Separator />
                    
                    <div>
                      <p className="text-muted-foreground text-sm mb-4">
                        You don't have to invite everyone now. You can add more members later.
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
                  {currentStep > 1 && (
                    <Button type="button" variant="outline" onClick={handlePrevStep}>
                      Previous Step
                    </Button>
                  )}
                  
                  <div className="flex justify-end space-x-2 mb-2 sm:mb-0">
                    {currentStep < 2 ? (
                      <Button type="button" onClick={handleNextStep}>
                        Next Step
                      </Button>
                    ) : (
                      <Button type="submit">
                        Create Tontine
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CreateGroup;
