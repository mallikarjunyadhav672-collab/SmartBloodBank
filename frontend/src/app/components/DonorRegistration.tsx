import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Upload, CheckCircle, XCircle } from "lucide-react";
import * as api from "../api";
import { createDonor } from "../api";
import { useAuth } from "../contexts/AuthContext";

export function DonorRegistration() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    age: "",
    gender: "",
    bloodGroup: "",
    weight: "",
    city: "",
    phone: "",
    lastDonationDate: "",
    availabilityStatus: "available",
    chronicIllness: "",
    recentSurgery: "",
    medication: "",
    infectionHistory: "",
    doctorAdvised: "",
    consent: false,
  });

  const [fileName, setFileName] = useState<string>("");
  const [eligibilityResult, setEligibilityResult] = useState<{
    eligible: boolean;
    reason: string;
  } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Check eligibility when medical questions are answered
    if (
      ["chronicIllness", "recentSurgery", "medication", "infectionHistory", "doctorAdvised"].includes(
        name
      ) ||
      name === "age" ||
      name === "weight"
    ) {
      checkEligibility({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const checkEligibility = (data: typeof formData) => {
    const age = parseInt(data.age);
    const weight = parseInt(data.weight);

    // Age validation
    if (age && (age < 18 || age > 60)) {
      setEligibilityResult({
        eligible: false,
        reason: "Age must be between 18 and 60 years",
      });
      return;
    }

    // Weight validation
    if (weight && weight < 50) {
      setEligibilityResult({
        eligible: false,
        reason: "Minimum weight requirement is 50 kg",
      });
      return;
    }

    // Medical screening
    if (data.chronicIllness === "yes") {
      setEligibilityResult({
        eligible: false,
        reason: "Temporarily deferred due to chronic illness",
      });
      return;
    }

    if (data.recentSurgery === "yes") {
      setEligibilityResult({
        eligible: false,
        reason: "Temporarily deferred due to recent surgery",
      });
      return;
    }

    if (data.medication === "yes") {
      setEligibilityResult({
        eligible: false,
        reason: "Temporarily deferred - consult with blood bank about medication",
      });
      return;
    }

    if (data.infectionHistory === "yes") {
      setEligibilityResult({
        eligible: false,
        reason: "Temporarily deferred due to infection history",
      });
      return;
    }

    if (data.doctorAdvised === "yes") {
      setEligibilityResult({
        eligible: false,
        reason: "Temporarily deferred as per doctor's advice",
      });
      return;
    }

    // Last donation date check
    if (data.lastDonationDate) {
      const lastDonation = new Date(data.lastDonationDate);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - lastDonation.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff < 90) {
        setEligibilityResult({
          eligible: false,
          reason: "Must wait 90 days between donations",
        });
        return;
      }
    }

    // If all checks pass
    if (age >= 18 && age <= 60 && weight >= 50) {
      setEligibilityResult({
        eligible: true,
        reason: "You are eligible to donate! Final screening will be done at the blood bank.",
      });
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  // fetch existing donor and prefill
  useEffect(() => {
    if (!user) return;
    api
      .getDonorByUser(user.id)
      .then((d) => {
        if (d) {
          setFormData((prev) => ({ ...prev, ...d }));
          // run eligibility check based on loaded data
          checkEligibility(d as any);
        }
      })
      .catch(() => {
        /* ignore if no donor yet */
      });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("Please log in first");
      navigate("/login");
      return;
    }

    if (!formData.consent) {
      alert("Please confirm the consent checkbox");
      return;
    }

    if (!eligibilityResult?.eligible) {
      alert("Please complete the medical screening questions to check your eligibility");
      return;
    }

    setIsSubmitting(true);
    try {
      const donorData = {
        ...formData,
        userId: user.id,
      };
      const result = await createDonor(donorData as any);
      console.log("saved donor", result);
      const msg = result.updated
        ? "Profile updated successfully!"
        : `Registration successful! Welcome, ${formData.fullName}!`;
      alert(msg);
      navigate("/donor-dashboard");
    } catch (err: any) {
      console.error(err);
      alert("Failed to submit registration. " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-primary hover:text-primary-700 mb-8 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-white rounded-lg border border-border shadow-sm p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Donor Registration</h1>
            <p className="text-muted-foreground">
              Safety first - Complete medical screening before donation
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground border-b border-border pb-2">
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-border bg-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed text-foreground placeholder-muted-foreground transition-colors"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Age *</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    min="18"
                    max="60"
                    className="w-full px-4 py-2.5 border border-border bg-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed text-foreground placeholder-muted-foreground transition-colors"
                    placeholder="18-60 years"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Must be between 18 and 60 years</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-border bg-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed text-foreground"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Blood Group *
                  </label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-border bg-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed text-foreground"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Weight (kg) *
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    required
                    min="50"
                    className="w-full px-4 py-2.5 border border-border bg-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed text-foreground placeholder-muted-foreground transition-colors"
                    placeholder="Minimum 50 kg"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Minimum weight requirement: 50 kg</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-border bg-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed text-foreground placeholder-muted-foreground transition-colors"
                    placeholder="e.g. Village, Mandal, District, State"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    pattern="[0-9]{10}"
                    className="w-full px-4 py-2.5 border border-border bg-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed text-foreground placeholder-muted-foreground transition-colors"
                    placeholder="10-digit mobile number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Last Donation Date
                  </label>
                  <input
                    type="date"
                    name="lastDonationDate"
                    value={formData.lastDonationDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-border bg-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave blank if first-time donor
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Availability Status *
                  </label>
                  <select
                    name="availabilityStatus"
                    value={formData.availabilityStatus}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-border bg-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                  >
                    <option value="available">Available</option>
                    <option value="not-available">Not Available</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Medical Self-Declaration */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground border-b border-border pb-2">
                Medical Self-Declaration
              </h2>
              <p className="text-sm text-muted-foreground">
                Please answer honestly. This helps ensure safety for both donor and receiver.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Do you have any chronic illness (diabetes, heart disease, etc.)? *
                  </label>
                  <select
                    name="chronicIllness"
                    value={formData.chronicIllness}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-border bg-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                  >
                    <option value="">Select</option>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Have you had any surgery in the last 6 months? *
                  </label>
                  <select
                    name="recentSurgery"
                    value={formData.recentSurgery}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-border bg-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                  >
                    <option value="">Select</option>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Are you currently taking any medication? *
                  </label>
                  <select
                    name="medication"
                    value={formData.medication}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-border bg-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                  >
                    <option value="">Select</option>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Any history of infectious diseases (HIV, Hepatitis, etc.)? *
                  </label>
                  <select
                    name="infectionHistory"
                    value={formData.infectionHistory}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-border bg-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                  >
                    <option value="">Select</option>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Has your doctor advised you not to donate blood? *
                  </label>
                  <select
                    name="doctorAdvised"
                    value={formData.doctorAdvised}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-border bg-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                  >
                    <option value="">Select</option>
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Eligibility Result */}
            {eligibilityResult && (
              <div
                className={`p-4 rounded-lg flex items-start gap-3 ${
                  eligibilityResult.eligible
                    ? "bg-success-50 border border-success-200"
                    : "bg-warning-50 border border-warning-200"
                }`}
              >
                {eligibilityResult.eligible ? (
                  <CheckCircle className="w-6 h-6 text-success-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-warning-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h3
                    className={`font-semibold mb-1 ${
                      eligibilityResult.eligible ? "text-success-900" : "text-warning-900"
                    }`}
                  >
                    {eligibilityResult.eligible ? "Eligible to Donate" : "Temporarily Deferred"}
                  </h3>
                  <p
                    className={
                      eligibilityResult.eligible ? "text-success-800" : "text-warning-800"
                    }
                  >
                    {eligibilityResult.reason}
                  </p>
                </div>
              </div>
            )}

            {/* Health Certificate Upload */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-foreground border-b border-border pb-2">
                Health Certificate Upload (Optional)
              </h2>
              <p className="text-sm text-muted-foreground">
                You can upload a health certificate if available. Final screening will be done by
                the Blood Bank.
              </p>

              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition bg-surface">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <label className="cursor-pointer">
                  <span className="text-primary font-medium hover:text-primary-700">
                    Click to upload
                  </span>
                  <span className="text-muted-foreground"> or drag and drop</span>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-muted-foreground mt-2">PDF, JPG, PNG (Max 5MB)</p>
                {fileName && (
                  <p className="text-sm text-success-600 mt-3 font-medium">
                    Uploaded: {fileName}
                  </p>
                )}
              </div>
            </div>

            {/* Consent */}
            <div className="flex items-start gap-3 p-4 bg-surface rounded-lg border border-border">
              <input
                type="checkbox"
                name="consent"
                checked={formData.consent}
                onChange={handleChange}
                required
                className="mt-1 w-4 h-4 text-primary border-border rounded focus:ring-primary accent-primary"
              />
              <label className="text-sm text-muted-foreground">
                I confirm that the information provided is true and accurate to the best of my
                knowledge. I understand that final medical screening will be conducted by the
                blood bank before donation, and I agree to undergo all necessary medical tests. *
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="flex-1 bg-muted text-foreground py-2.5 rounded-md font-medium hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-md font-medium hover:bg-primary-700 transition-colors disabled:bg-muted disabled:cursor-not-allowed disabled:text-muted-foreground"
                disabled={!eligibilityResult?.eligible}
              >
                Submit Registration
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
