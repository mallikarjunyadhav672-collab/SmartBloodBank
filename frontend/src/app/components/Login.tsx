import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, AlertCircle } from "lucide-react";
import logo from "../../assets/logo.svg";
import { useAuth } from "../contexts/AuthContext";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEmailError("");
    setPasswordError("");
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate("/");
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : "Login failed. Please try again.";
      if (msg.toLowerCase().includes("email")) {
        setEmailError(msg);
      } else if (msg.toLowerCase().includes("password")) {
        setPasswordError(msg);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-surface flex items-center justify-center">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl px-4 py-12">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-primary hover:text-primary-600 mb-8 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Login Card */}
        <div className="bg-white rounded-lg border border-border shadow-sm p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src={logo} alt="BloodLink Logo" className="w-12 h-12" />
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-foreground mb-2 text-center">
            Sign In
          </h1>
          <p className="text-muted-foreground text-center mb-8 text-sm">
            Welcome back to BloodLink
          </p>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-destructive-50 border border-destructive-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-2.5 border border-border bg-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed text-foreground placeholder-muted-foreground transition-colors"
                placeholder="you@example.com"
              />
              {emailError && (
                <p className="mt-2 text-xs text-destructive">{emailError}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                className="w-full px-4 py-2.5 border border-border bg-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed text-foreground placeholder-muted-foreground transition-colors"
                placeholder="Enter your password"
              />
              {passwordError && (
                <p className="mt-2 text-xs text-destructive">{passwordError}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 border border-border rounded accent-primary cursor-pointer"
                  disabled={loading}
                />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:text-primary-700 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-md font-medium hover:bg-primary-700 disabled:bg-muted disabled:cursor-not-allowed disabled:text-muted-foreground transition-colors mt-6"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-muted-foreground">Need an account?</span>
            </div>
          </div>

          {/* Register Link */}
          <Link
            to="/register"
            className="block w-full text-center px-4 py-2.5 border border-primary text-primary rounded-md font-medium hover:bg-primary-50 transition-colors"
          >
            Create an Account
          </Link>

          {/* Terms */}
          <p className="text-xs text-muted-foreground text-center mt-6">
            By signing in, you agree to our{" "}
            <Link to="/terms" className="text-primary hover:text-primary-700 font-medium transition-colors">
              Terms & Conditions
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
