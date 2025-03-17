
import { 
  Users, 
  CreditCard, 
  Clock, 
  Bell, 
  BarChart, 
  Shield 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
}

const Feature = ({ title, description, icon, className }: FeatureProps) => (
  <div className={cn(
    "glass-card p-6 hover-lift transition-all duration-300", 
    className
  )}>
    <div className="rounded-full p-3 bg-primary/10 w-fit mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default function Features() {
  const features = [
    {
      title: "Easy Group Creation",
      description: "Set up your tontine in minutes with intuitive group creation tools designed for everyone.",
      icon: <Users className="h-6 w-6 text-primary" />,
    },
    {
      title: "Payment Tracking",
      description: "Monitor contributions with visual payment tracking and automatic status updates.",
      icon: <CreditCard className="h-6 w-6 text-primary" />,
    },
    {
      title: "Cycle Management",
      description: "Organize payment cycles and recipient schedules with our simple planning tools.",
      icon: <Clock className="h-6 w-6 text-primary" />,
    },
    {
      title: "Smart Reminders",
      description: "Never miss a payment with customizable notification reminders for all members.",
      icon: <Bell className="h-6 w-6 text-primary" />,
    },
    {
      title: "Visual Reports",
      description: "Track your group's performance with beautiful, easy-to-understand visualizations.",
      icon: <BarChart className="h-6 w-6 text-primary" />,
    },
    {
      title: "Secure Platform",
      description: "Your financial data is protected with bank-level security and privacy controls.",
      icon: <Shield className="h-6 w-6 text-primary" />,
    },
  ];

  return (
    <section id="features" className="section-padding relative overflow-hidden">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm text-primary mb-4">
            Features
          </div>
          <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
            Everything You Need to Manage Your Tontine
          </h2>
          <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl/relaxed">
            Our platform is designed to make traditional saving circles accessible and easy to manage for everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <Feature 
              key={index}
              {...feature}
              className={`animate-fade-in [animation-delay:${index * 100}ms]`}
            />
          ))}
        </div>
      </div>
      
      {/* Background Elements */}
      <div className="absolute left-0 top-1/3 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute right-0 bottom-1/4 w-[400px] h-[400px] bg-gold-500/5 rounded-full blur-3xl -z-10" />
    </section>
  );
}
