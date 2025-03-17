
import { ArrowRight, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Hero() {
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById("features");
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0 hero-gradient z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(40%_40%_at_50%_50%,rgba(51,179,255,0.1)_0%,rgba(255,255,255,0)_100%)] z-0" />
      
      {/* Floating Shapes */}
      <div className="absolute top-1/4 left-1/5 w-64 h-64 rounded-full bg-tontine-blue-500/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/5 w-72 h-72 rounded-full bg-gold-500/5 blur-3xl" />

      <div className="container px-4 md:px-6 z-10 my-auto">
        <div className="flex flex-col items-center text-center space-y-8 md:space-y-12">
          <div className="animate-fade-in space-y-3">
            <div className="inline-block rounded-full bg-muted border px-3 py-1 text-sm text-muted-foreground mb-4">
              Simplified Saving for Moroccans
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
              Modern, User-Friendly
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-tontine-blue-500 to-gold-500"> Tontine Management</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Create, manage, and participate in traditional savings groups with a beautifully
              designed platform that makes financial collaboration simple for everyone.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in [animation-delay:200ms]">
            <Button asChild size="lg" className="rounded-full text-base px-8">
              <Link to="/dashboard">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full border-2 text-base"
              onClick={scrollToFeatures}
            >
              Learn More
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          {/* Dashboard Preview */}
          <div className="relative w-full max-w-6xl mt-8 md:mt-16 animate-fade-in [animation-delay:400ms]">
            <div className="w-full overflow-hidden rounded-xl border bg-background shadow-xl">
              <div className="rounded-t-xl bg-muted px-4 py-2 border-b flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <div className="ml-4 text-xs text-muted-foreground">
                  TontineLink Dashboard
                </div>
              </div>
              <div className="overflow-hidden">
                <img 
                  src="https://placehold.co/1200x800/EBF8FF/333.png?text=Beautiful+Dashboard+Preview" 
                  alt="TontineLink Dashboard Preview"
                  className="w-full object-cover transition-transform hover:scale-[1.02]"
                  width="1200"
                  height="800"
                />
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-6 -left-6 w-12 h-12 rounded-lg bg-tontine-blue-500/10 backdrop-blur-md border border-tontine-blue-500/20 z-20 hidden md:block" />
            <div className="absolute -bottom-4 -right-4 w-8 h-8 rounded-lg bg-gold-500/10 backdrop-blur-md border border-gold-500/20 z-20 hidden md:block" />
          </div>
        </div>
      </div>
      
      {/* Scroll down indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ChevronDown className="h-6 w-6 text-muted-foreground" />
      </div>
    </section>
  );
}
