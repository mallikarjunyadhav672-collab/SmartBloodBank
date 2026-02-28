import { Link, useNavigate } from "react-router";
import { Menu, X, Droplet, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
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
    <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Project Name */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="bg-red-600 p-2 rounded-lg">
              <Droplet className="w-6 h-6 text-white fill-white" />
            </div>
            <span className="font-bold text-lg text-gray-900 hidden sm:block">
              Smart Blood Bank
            </span>
            <span className="font-bold text-lg text-gray-900 sm:hidden">
              SBB
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-700 hover:text-red-600 transition">
              Home
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-red-600 transition">
              About
            </Link>

            {user && (
              <>
                <Link
                  to={getDashboardLink() || "/"}
                  className="text-gray-700 hover:text-red-600 transition"
                >
                  Dashboard
                </Link>
                <Link to="/analytics" className="text-gray-700 hover:text-red-600 transition">
                  Analytics
                </Link>
              </>
            )}

            {user ? (
              <>
                <div className="flex items-center gap-3 pl-6 border-l border-gray-300">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-red-600" />
                    </div>
                    <span className="text-sm text-gray-700 font-medium">
                      {user.fullName || user.email}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-red-600 transition py-2 flex items-center gap-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-red-600 transition">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-2 border-t">
            <Link
              to="/"
              className="block px-4 py-2 text-gray-700 hover:bg-red-50 rounded"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/about"
              className="block px-4 py-2 text-gray-700 hover:bg-red-50 rounded"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>

            {user && (
              <>
                <Link
                  to={getDashboardLink() || "/"}
                  className="block px-4 py-2 text-gray-700 hover:bg-red-50 rounded"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/analytics"
                  className="block px-4 py-2 text-gray-700 hover:bg-red-50 rounded"
                  onClick={() => setIsOpen(false)}
                >
                  Analytics
                </Link>
              </>
            )}

            {user ? (
              <>
                <div className="px-4 py-2 bg-red-50 rounded mx-4 mb-2">
                  <p className="text-sm text-gray-700 font-medium">{user.fullName || user.email}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-4 py-2 text-gray-700 hover:bg-red-50 rounded"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded mx-4"
                  onClick={() => setIsOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
