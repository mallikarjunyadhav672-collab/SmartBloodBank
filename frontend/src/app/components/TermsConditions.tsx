import { Link } from "react-router";
import { ArrowLeft, Shield, AlertTriangle, FileText, Users } from "lucide-react";

export function TermsConditions() {
  return (
    <div className="pt-16 min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-primary hover:text-primary-700 mb-8 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-white rounded-md border border-border shadow-sm p-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Terms & Conditions</h1>
          <p className="text-muted-foreground mb-8">
            Last updated: February 25, 2026
          </p>

          <div className="space-y-8">
            {/* Important Notice */}
            <div className="bg-warning-50 border-l-4 border-warning-600 p-6 rounded-r-lg">
              <div className="flex gap-3">
                <AlertTriangle className="w-6 h-6 text-warning-600 flex-shrink-0" />
                <div>
                  <h2 className="text-xl font-bold text-warning-900 mb-2">Important Notice</h2>
                  <p className="text-warning-800">
                    This platform is a coordination system designed to connect blood donors,
                    receivers, and blood banks. It is NOT a replacement for professional medical
                    services or hospitals. All blood donations must be conducted through
                    authorized blood banks with proper medical supervision.
                  </p>
                </div>
              </div>
            </div>

            {/* Donor Responsibility */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Donor Responsibility Declaration</h2>
              </div>
              <div className="space-y-4 text-foreground leading-relaxed">
                <p>
                  By registering as a blood donor on this platform, you acknowledge and agree to
                  the following responsibilities:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Truthful Information:</strong> You will provide accurate and honest
                    information about your health status, medical history, and eligibility.
                  </li>
                  <li>
                    <strong>Medical Screening:</strong> You understand that the pre-screening
                    questionnaire on this platform is preliminary. Final screening and testing
                    will be conducted by the blood bank.
                  </li>
                  <li>
                    <strong>Health Requirements:</strong> You meet the basic eligibility criteria
                    (age 18-60, weight minimum 50kg, no chronic illnesses, etc.).
                  </li>
                  <li>
                    <strong>Donation Intervals:</strong> You will respect the minimum 90-day
                    interval between blood donations.
                  </li>
                  <li>
                    <strong>Voluntary Participation:</strong> Your participation is voluntary and
                    without any coercion or monetary compensation.
                  </li>
                </ul>
              </div>
            </section>

            {/* Data Privacy Assurance */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Data Privacy & Security</h2>
              </div>
              <div className="space-y-4 text-foreground leading-relaxed">
                <p>
                  We are committed to protecting your personal information and medical data:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Data Collection:</strong> We collect only necessary information
                    required for blood donation coordination (name, contact, blood group, medical
                    screening responses).
                  </li>
                  <li>
                    <strong>Data Usage:</strong> Your information will be used solely for matching
                    donors with receivers and coordinating with blood banks.
                  </li>
                  <li>
                    <strong>Data Sharing:</strong> Personal information will only be shared with
                    authorized blood banks and receivers in case of confirmed donation matches.
                  </li>
                  <li>
                    <strong>Data Security:</strong> We implement industry-standard security
                    measures to protect your data from unauthorized access.
                  </li>
                  <li>
                    <strong>Data Retention:</strong> Your data will be retained as long as you
                    maintain an active account. You can request deletion at any time.
                  </li>
                </ul>
              </div>
            </section>

            {/* Medical Safety Disclaimer */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">Medical Safety Disclaimer</h2>
              </div>
              <div className="space-y-4 text-foreground leading-relaxed">
                <p className="font-semibold text-destructive">
                  IMPORTANT: Read this section carefully before proceeding.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Not Medical Advice:</strong> This platform does not provide medical
                    advice, diagnosis, or treatment. Always consult qualified healthcare
                    professionals.
                  </li>
                  <li>
                    <strong>Blood Bank Authority:</strong> The blood bank has final and absolute
                    authority for donor screening, blood testing, and approval for donation.
                  </li>
                  <li>
                    <strong>Pre-Screening Only:</strong> Our medical questionnaire is for
                    preliminary screening only. It does NOT guarantee eligibility.
                  </li>
                  <li>
                    <strong>Professional Testing Required:</strong> All donated blood must undergo
                    professional testing for infectious diseases as per regulatory requirements.
                  </li>
                  <li>
                    <strong>Health Risks:</strong> If you have any doubts about your eligibility
                    or health status, consult a doctor before registering as a donor.
                  </li>
                  <li>
                    <strong>Emergency Situations:</strong> In medical emergencies, always contact
                    emergency services (ambulance, hospital) immediately.
                  </li>
                </ul>
              </div>
            </section>

            {/* Platform Role */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Platform Role & Limitations
              </h2>
              <div className="space-y-4 text-foreground leading-relaxed">
                <p>This platform serves as:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    A <strong>coordination system</strong> to connect donors, receivers, and blood
                    banks
                  </li>
                  <li>
                    A <strong>matching service</strong> to help find compatible blood donors
                    quickly
                  </li>
                  <li>
                    An <strong>information platform</strong> to raise awareness about blood
                    donation
                  </li>
                  <li>
                    A <strong>communication tool</strong> to facilitate emergency blood requests
                  </li>
                </ul>
                <p className="font-semibold mt-4">This platform is NOT:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>A replacement for hospitals or blood banks</li>
                  <li>A medical testing or screening facility</li>
                  <li>A blood storage or distribution center</li>
                  <li>A guarantee of blood availability or donation success</li>
                </ul>
              </div>
            </section>

            {/* User Obligations */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">User Obligations</h2>
              <div className="space-y-4 text-foreground leading-relaxed">
                <p>All users of this platform agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate and up-to-date information</li>
                  <li>Respect the privacy of other users</li>
                  <li>Use the platform responsibly and ethically</li>
                  <li>Not misuse the platform for fraudulent activities</li>
                  <li>Follow all applicable laws and regulations</li>
                  <li>Cooperate with blood banks and medical professionals</li>
                  <li>Report any technical issues or suspicious activities</li>
                </ul>
              </div>
            </section>

            {/* Liability Limitation */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Limitation of Liability</h2>
              <div className="space-y-4 text-foreground leading-relaxed">
                <p>
                  To the fullest extent permitted by law, the platform operators, administrators,
                  and associated parties shall not be liable for:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Any adverse health outcomes related to blood donation</li>
                  <li>Delays in matching donors or finding blood</li>
                  <li>Inaccurate information provided by users</li>
                  <li>Technical failures or service interruptions</li>
                  <li>Actions or omissions of third parties (donors, blood banks, hospitals)</li>
                </ul>
              </div>
            </section>

            {/* Consent */}
            <section className="bg-surface p-6 rounded-md border-2 border-warning-200">
              <h2 className="text-2xl font-bold text-foreground mb-4">User Consent</h2>
              <p className="text-foreground leading-relaxed">
                By using this platform, creating an account, or registering as a donor/receiver,
                you confirm that you have read, understood, and agree to these Terms & Conditions.
                You acknowledge that you have been informed about the limitations of this platform
                and the importance of professional medical supervision for all blood donation
                activities.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">Contact & Support</h2>
              <div className="text-foreground space-y-2">
                <p>
                  For questions, concerns, or support regarding these terms:
                </p>
                <p>
                  <strong>Email:</strong> support@smartbloodbank.org
                </p>
                <p>
                  <strong>Phone:</strong> +91 1800-BLOOD-HELP
                </p>
                <p>
                  <strong>Emergency Hotline:</strong> Available 24/7
                </p>
              </div>
            </section>

            {/* Acceptance */}
            <div className="mt-8 pt-8 border-t-2">
              <div className="flex gap-4">
                <Link
                  to="/"
                  className="flex-1 text-center bg-muted text-foreground py-3 rounded-md hover:bg-muted/80 transition font-semibold"
                >
                  Go Back
                </Link>
                <Link
                  to="/register"
                  className="flex-1 text-center bg-primary text-white py-3 rounded-md hover:bg-primary-700 transition font-semibold"
                >
                  I Accept - Proceed to Register
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
