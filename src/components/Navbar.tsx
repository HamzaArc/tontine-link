
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogIn, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  // Change navbar appearance on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Whether we should show the dark logo/button
  const isDashboard = location.pathname !== '/';
  
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/#features' },
    { name: 'Pricing', path: '/#pricing' },
    { name: 'About', path: '/#about' },
  ];

  return (
    <header
      className={cn(
        'fixed w-full top-0 z-40 transition-all duration-200 px-4 lg:px-8',
        isScrolled || isDashboard ? 'bg-white/80 backdrop-blur-md border-b shadow-sm py-2' : 'py-4'
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <h1 className={cn(
            "text-xl font-bold transition-colors",
            isDashboard || isScrolled ? "text-primary" : "text-white"
          )}>
            <span>Tontine</span>
            <span className="text-gold-500">Link</span>
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {!isDashboard && (
            <div className="flex space-x-6">
              {navLinks.map(link => (
                <a 
                  key={link.path} 
                  href={link.path}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    isScrolled ? "text-foreground" : "text-white"
                  )}
                >
                  {link.name}
                </a>
              ))}
            </div>
          )}

          {/* Auth buttons */}
          {!isDashboard ? (
            <div className="flex items-center space-x-3">
              <Button 
                asChild 
                variant="outline" 
                className={cn(
                  "border-2 rounded-full",
                  isScrolled ? "border-primary text-primary hover:bg-primary/10" : "border-white text-white hover:bg-white/10"
                )}
              >
                <Link to="/dashboard">
                  <LogIn className="mr-1 h-4 w-4" />
                  Login
                </Link>
              </Button>
              <Button asChild className="rounded-full">
                <Link to="/dashboard">Get Started</Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link to="/create-group">
                  Create Tontine
                </Link>
              </Button>
              <Button asChild variant="ghost" size="icon" className="rounded-full">
                <Link to="/profile">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 -mr-2 text-foreground" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b shadow-lg animate-fade-in">
          <div className="flex flex-col p-4 space-y-4">
            {!isDashboard && (
              <>
                {navLinks.map(link => (
                  <a 
                    key={link.path} 
                    href={link.path}
                    className="text-foreground font-medium py-2"
                  >
                    {link.name}
                  </a>
                ))}
                <div className="border-t pt-4 flex flex-col space-y-3">
                  <Button asChild variant="outline" className="w-full justify-center rounded-full">
                    <Link to="/dashboard">Login</Link>
                  </Button>
                  <Button asChild className="w-full justify-center rounded-full">
                    <Link to="/dashboard">Get Started</Link>
                  </Button>
                </div>
              </>
            )}
            {isDashboard && (
              <>
                <Button asChild variant="outline" className="w-full justify-center rounded-full">
                  <Link to="/create-group">Create Tontine</Link>
                </Button>
                <Button asChild variant="ghost" className="w-full justify-start rounded-full">
                  <Link to="/profile" className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    My Profile
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
