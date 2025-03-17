
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogIn, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  
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

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!profile?.full_name) return "U";
    return profile.full_name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase();
  };

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
          {!user ? (
            <div className="flex items-center space-x-3">
              <Button 
                asChild 
                variant="outline" 
                className={cn(
                  "border-2 rounded-full",
                  isScrolled ? "border-primary text-primary hover:bg-primary/10" : "border-white text-white hover:bg-white/10"
                )}
              >
                <Link to="/auth">
                  <LogIn className="mr-1 h-4 w-4" />
                  Login
                </Link>
              </Button>
              <Button asChild className="rounded-full">
                <Link to="/auth?tab=register">Get Started</Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link to="/create-group">
                  Create Tontine
                </Link>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8 hover:ring-2 hover:ring-primary/20">
                      <AvatarImage src={profile?.avatar_url || ''} />
                      <AvatarFallback className="bg-primary/10">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{profile?.full_name || user?.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="cursor-pointer">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                  {!user ? (
                    <>
                      <Button asChild variant="outline" className="w-full justify-center rounded-full">
                        <Link to="/auth">Login</Link>
                      </Button>
                      <Button asChild className="w-full justify-center rounded-full">
                        <Link to="/auth?tab=register">Get Started</Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center space-x-3 py-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={profile?.avatar_url || ''} />
                          <AvatarFallback className="bg-primary/10">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{profile?.full_name || 'User'}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <Button asChild variant="outline" className="w-full justify-center rounded-full">
                        <Link to="/create-group">Create Tontine</Link>
                      </Button>
                      <Button asChild variant="ghost" className="w-full justify-start rounded-full">
                        <Link to="/profile" className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          My Profile
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-destructive border-destructive/30"
                        onClick={signOut}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </>
                  )}
                </div>
              </>
            )}

            {isDashboard && user && (
              <>
                <div className="flex items-center space-x-3 py-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || ''} />
                    <AvatarFallback className="bg-primary/10">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{profile?.full_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Button asChild variant="outline" className="w-full justify-center rounded-full">
                  <Link to="/create-group">Create Tontine</Link>
                </Button>
                <Button asChild variant="ghost" className="w-full justify-start rounded-full">
                  <Link to="/dashboard" className="flex items-center">
                    Dashboard
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="w-full justify-start rounded-full">
                  <Link to="/profile" className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    My Profile
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-destructive border-destructive/30"
                  onClick={signOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
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
