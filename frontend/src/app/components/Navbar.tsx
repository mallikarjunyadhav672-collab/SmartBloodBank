import { Link, useNavigate } from "react-router";
import { Menu, X, LogOut, User, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import logo from "../../assets/logo.svg";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    setIsProfileOpen(false);
    navigate("/");
  };

  const getDashboardLink = () => {
    if (!user) return null;
    if (user.role === "donor") return "/donor-dashboard";
    if (user.role === "receiver") return "/receiver-dashboard";
    if (user.role === "admin") return "/admin-dashboard";
    return null;
  };

  return (
    <nav className="bg-white border-b border-border fixed top-0 left-0 right-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Project Name */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <img src={logo} alt="BloodLink Logo" className="w-8 h-8" />
            <div className="hidden sm:block">
              <span className="font-semibold text-lg text-primary block leading-tight">
                BloodLink
              </span>
              <span className="text-xs text-muted-foreground font-medium">Smart Blood Bank</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/about">About</NavLink>

            {user && (
              <>
                <NavLink to={getDashboardLink() || "/"}>Dashboard</NavLink>
                <NavLink to="/analytics">Analytics</NavLink>
                <NavLink to="/search">Search</NavLink>
                <NavLink to="/saved-donors">Saved</NavLink>
              </>
            )}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
              <ProfileMenu user={user} handleLogout={handleLogout} getDashboardLink={getDashboardLink} />
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline-flex px-4 py-2 text-sm font-medium text-foreground hover:bg-surface rounded-md transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary-700 transition-colors"
                >
                  Register
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-surface transition-colors text-foreground"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 space-y-1 border-t border-border">
            <MobileNavLink to="/" onClick={() => setIsOpen(false)}>
              Home
            </MobileNavLink>
            <MobileNavLink to="/about" onClick={() => setIsOpen(false)}>
              About
            </MobileNavLink>

            {user && (
              <>
                <MobileNavLink to={getDashboardLink() || "/"} onClick={() => setIsOpen(false)}>
                  Dashboard
                </MobileNavLink>
                <MobileNavLink to="/analytics" onClick={() => setIsOpen(false)}>
                  Analytics
                </MobileNavLink>
                <MobileNavLink to="/search" onClick={() => setIsOpen(false)}>
                  Search Donors
                </MobileNavLink>
                <MobileNavLink to="/saved-donors" onClick={() => setIsOpen(false)}>
                  Saved Donors
                </MobileNavLink>
                <MobileNavLink to="/search-history" onClick={() => setIsOpen(false)}>
                  Search History
                </MobileNavLink>
              </>
            )}

            {!user && (
              <MobileNavLink to="/login" onClick={() => setIsOpen(false)}>
                Sign In
              </MobileNavLink>
            )}

            {user && (
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-surface rounded-md transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
}

function NavLink({ to, children }: NavLinkProps) {
  return (
    <Link
      to={to}
      className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary rounded-md hover:bg-surface transition-colors"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ to, children, onClick }: NavLinkProps & { onClick?: () => void }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block px-4 py-2 text-sm text-foreground hover:bg-surface rounded-md transition-colors"
    >
      {children}
    </Link>
  );
}

interface ProfileMenuProps {
  user: any;
  handleLogout: () => void;
  getDashboardLink: () => string | null;
}

function ProfileMenu({ user, handleLogout, getDashboardLink }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative group">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-surface transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-primary" />
        </div>
        <span className="hidden sm:inline text-sm font-medium text-foreground truncate max-w-[100px]">
          {user.fullName?.split(' ')[0] || user.email?.split('@')[0]}
        </span>
        <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:inline" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white border border-border rounded-md shadow-lg py-2 z-50">
          <div className="px-4 py-2 border-b border-border">
            <p className="text-sm font-medium text-foreground">{user.fullName || user.email}</p>
            <p className="text-xs text-muted-foreground capitalize mt-1">{user.role}</p>
          </div>

          <Link
            to={getDashboardLink() || "/"}
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 text-sm text-foreground hover:bg-surface transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/search-history"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 text-sm text-foreground hover:bg-surface transition-colors"
          >
            Search History
          </Link>

          <button
            onClick={() => {
              setIsOpen(false);
              handleLogout();
            }}
            className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-surface transition-colors flex items-center gap-2 border-t border-border mt-2 pt-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
