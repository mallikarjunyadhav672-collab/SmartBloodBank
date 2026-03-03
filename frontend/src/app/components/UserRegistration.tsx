import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, CheckCircle } from "lucide-react";
import logo from "../../assets/logo.svg";
import { useAuth } from "../contexts/AuthContext";

export function UserRegistration() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    role: "donor",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = "Password must include at least one uppercase letter";
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = "Password must include at least one lowercase letter";
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = "Password must include at least one number";
    } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) {
      newErrors.password = "Password must include at least one special character (!@#$%^&* etc)";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register(
        formData.email,
        formData.password,
        formData.fullName,
        formData.role as "donor" | "receiver"
      );
      setSuccess(true);

      // Redirect after successful registration
      setTimeout(() => {
        if (formData.role === "donor") {
          navigate("/donor-register");
        } else if (formData.role === "receiver") {
          navigate("/request");
        } else if (formData.role === "admin") {
          navigate("/admin-dashboard");
        }
      }, 2000);
    } catch (err) {
      setErrors({
        submit:
          err instanceof Error ? err.message : "Registration failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="pt-16 min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg border border-border shadow-sm p-8 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-success-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Registration Successful!</h2>
            <p className="text-muted-foreground mb-4">
              Welcome, {formData.fullName}! Redirecting you now...
            </p>
            <p className="text-sm text-muted-foreground">
              You'll be taken to complete your {formData.role} profile.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto px-4 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-primary hover:text-primary-700 mb-8 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-white rounded-lg border border-border shadow-sm p-8">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="BloodLink Logo" className="w-12 h-12" />
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-2 text-center">Create Account</h1>
          <p className="text-muted-foreground text-center mb-8">Join us in saving lives together</p>

          {errors.submit && (
            <div className="mb-6 p-4 bg-destructive-50 border border-destructive-200 rounded-lg">
              <p className="text-sm text-destructive-700">{errors.submit}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Select Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-2.5 border border-border bg-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed text-foreground"
              >
                <option value="donor">Blood Donor</option>
                <option value="receiver">Blood Receiver / Hospital</option>
                <option value="admin">Blood Bank Admin</option>
              </select>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-2.5 border border-border bg-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed text-foreground placeholder-muted-foreground transition-colors"
                placeholder="Enter your full name"
              />
              {errors.fullName && (
                <p className="text-destructive text-sm mt-2">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-2.5 border border-border bg-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed text-foreground placeholder-muted-foreground transition-colors"
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-destructive text-sm mt-2">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-2.5 border border-border bg-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed text-foreground placeholder-muted-foreground transition-colors"
                placeholder="Min 8 chars: uppercase, lowercase, number, special char"
              />
              {errors.password && (
                <p className="text-destructive text-sm mt-2">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-2.5 border border-border bg-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed text-foreground placeholder-muted-foreground transition-colors"
                placeholder="Re-enter your password"
              />
              {errors.confirmPassword && (
                <p className="text-destructive text-sm mt-2">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                disabled={loading}
                className="mt-1 w-4 h-4 border border-border rounded accent-primary cursor-pointer disabled:cursor-not-allowed"
              />
              <label className="text-sm text-muted-foreground">
                I accept the{" "}
                <Link to="/terms" className="text-primary hover:text-primary-700 font-medium transition-colors">
                  Terms & Conditions
                </Link>{" "}
                and understand the responsibilities of being part of this platform
              </label>
            </div>
            {errors.termsAccepted && (
              <p className="text-destructive text-sm">{errors.termsAccepted}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-md font-medium hover:bg-primary-700 disabled:bg-muted disabled:cursor-not-allowed disabled:text-muted-foreground transition-colors mt-6"
            >
              {loading ? "Creating Account..." : "Register Account"}
            </button>
          </form>

          <p className="text-center text-muted-foreground mt-6 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:text-primary-700 font-medium transition-colors">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
