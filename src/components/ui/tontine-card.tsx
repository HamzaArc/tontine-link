
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface TontineCardProps {
  id: string;
  name: string;
  description: string;
  members: {
    current: number;
    total: number;
  };
  cycleProgress: number;
  amount: number;
  currency: string;
  nextPayment?: string;
  variant?: "default" | "compact";
  className?: string;
}

export function TontineCard({
  id,
  name,
  description,
  members,
  cycleProgress,
  amount,
  currency,
  nextPayment,
  variant = "default",
  className,
}: TontineCardProps) {
  const isCompact = variant === "compact";
  
  return (
    <Card className={`border overflow-hidden transition-all duration-300 hover:shadow-card-hover ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{name}</CardTitle>
            {!isCompact && <CardDescription className="mt-1">{description}</CardDescription>}
          </div>
          <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <Users size={16} />
            <span>{members.current}/{members.total}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-muted-foreground">Cycle Progress</span>
              <span className="font-medium">{cycleProgress}%</span>
            </div>
            <Progress value={cycleProgress} className="h-2" />
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <div className="text-2xl font-bold">
                {currency} {amount.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                per member
              </div>
            </div>
            
            {nextPayment && (
              <div className="flex items-center text-sm bg-accent/50 px-3 py-1.5 rounded-full">
                <Calendar size={14} className="mr-1.5 text-primary" />
                <span>Next: {nextPayment}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-3 bg-muted/20">
        <Button asChild variant="outline" className="w-full justify-between rounded-full">
          <Link to={`/tontine/${id}`}>
            <span>View Details</span>
            <ArrowRight size={16} />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
