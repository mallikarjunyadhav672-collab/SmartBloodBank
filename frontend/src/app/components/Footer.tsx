import { Link } from "react-router";
import { Heart, Mail, Phone, MapPin, ArrowRight, Github, Linkedin, Twitter } from "lucide-react";
import logo from "../../assets/logo.svg";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-gradient-to-br from-slate-900 via-primary-900 to-primary-950 text-white overflow-hidden shadow-2xl">
      {/* Enhanced Decorative background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[length:40px_40px]"></div>
      </div>

      {/* Animated gradient overlay */}
      <div className="absolute inset-0 opacity-10 bg-gradient-to-t from-destructive/20 via-transparent to-transparent"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Top Section - Enhanced Spacing */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
            {/* Brand Section - Enhanced */}
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-white/30 to-white/10 p-3 rounded-xl backdrop-blur-sm hover:from-white/40 hover:to-white/20 transition-all duration-300 shadow-lg">
                  <img src={logo} alt="BloodLink Logo" className="w-8 h-8" />
                </div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-white via-primary-100 to-destructive text-transparent bg-clip-text drop-shadow-lg">
                  BloodLink
                </h3>
              </div>
              <p className="text-primary-200 text-sm leading-relaxed mb-4 flex-1">
                Connecting lives through blood donation. A complete management system for donors, receivers, and blood banks.
              </p>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10 hover:border-destructive/50 transition-all duration-300">
                <Heart className="w-5 h-5 text-destructive fill-current animate-pulse" />
                <span className="text-primary-100 text-sm font-semibold">Save a life today</span>
              </div>
            </div>

            {/* Quick Links - Enhanced */}
            <div>
              <h3 className="text-lg font-bold mb-6 flex items-center gap-3 pb-3 border-b-2 border-destructive/50">
                <span className="w-1.5 h-7 bg-gradient-to-b from-destructive to-primary rounded-full"></span>
                Quick Links
              </h3>
              <ul className="space-y-4">
                {[
                  { to: "/", label: "Home" },
                  { to: "/about", label: "About Us" },
                  { to: "/terms", label: "Terms & Conditions" },
                ].map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="group text-primary-200 hover:text-white flex items-center gap-2 transition-all duration-300 hover:translate-x-2"
                    >
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info - Enhanced */}
            <div>
              <h3 className="text-lg font-bold mb-6 flex items-center gap-3 pb-3 border-b-2 border-destructive/50">
                <span className="w-1.5 h-7 bg-gradient-to-b from-destructive to-primary rounded-full"></span>
                Contact
              </h3>
              <div className="space-y-4">
                <a
                  href="mailto:support@bloodlink.org"
                  className="group flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-all duration-300"
                >
                  <Mail className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300" />
                  <div className="flex flex-col">
                    <span className="text-primary-100 text-sm font-semibold">Email</span>
                    <span className="text-primary-200 hover:text-white text-sm">support@bloodlink.org</span>
                  </div>
                </a>
                <a
                  href="tel:+918001234567"
                  className="group flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-all duration-300"
                >
                  <Phone className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300" />
                  <div className="flex flex-col">
                    <span className="text-primary-100 text-sm font-semibold">Phone</span>
                    <span className="text-primary-200 hover:text-white text-sm">+91-800-BLOOD-1</span>
                  </div>
                </a>
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-all duration-300">
                  <MapPin className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-primary-100 text-sm font-semibold">Support</span>
                    <span className="text-primary-200 text-sm">Available 24/7</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action - Enhanced */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-destructive/50 to-primary/50 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/20 group-hover:border-destructive/50 transition-all duration-300 shadow-2xl h-full flex flex-col">
                <h3 className="text-xl font-bold mb-3 text-white">Ready to Donate?</h3>
                <p className="text-primary-200 text-sm mb-6 flex-1 leading-relaxed">
                  Make a difference in someone's life today. Join our community of lifesavers.
                </p>
                <Link
                  to="/donor-register"
                  className="group/btn flex items-center justify-center gap-2 w-full bg-gradient-to-r from-destructive to-destructive-600 hover:from-destructive-600 hover:to-destructive-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-destructive/50 transform hover:scale-105 active:scale-95"
                >
                  <span>🩸 Become a Donor</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </div>
          </div>

          {/* Divider - Enhanced */}
          <div className="my-12 h-px bg-gradient-to-r from-transparent via-destructive/50 to-transparent relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-destructive/20 to-transparent blur-md"></div>
          </div>

          {/* Bottom Section - Enhanced */}
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6 text-center lg:text-left">
            <div className="text-primary-200 text-sm">
              <p className="font-semibold text-primary-100">
                &copy; {currentYear} BloodLink. All rights reserved.
              </p>
              <p className="mt-2 text-primary-300">✨ Designed for social impact and healthcare support.</p>
            </div>

            {/* Footer Links & Social */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex gap-4 text-sm border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-6">
                <a href="#privacy" className="text-primary-300 hover:text-white transition-colors duration-300 hover:underline decoration-destructive">
                  Privacy Policy
                </a>
                <span className="text-primary-500">•</span>
                <a href="#terms" className="text-primary-300 hover:text-white transition-colors duration-300 hover:underline decoration-destructive">
                  Terms of Service
                </a>
                <span className="text-primary-500">•</span>
                <a href="#contact" className="text-primary-300 hover:text-white transition-colors duration-300 hover:underline decoration-destructive">
                  Contact Us
                </a>
              </div>

              {/* Social Icons */}
              <div className="flex gap-4">
                <a href="#github" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-primary-300 hover:text-white transition-all duration-300 hover:scale-110" title="GitHub">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#linkedin" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-primary-300 hover:text-white transition-all duration-300 hover:scale-110" title="LinkedIn">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#twitter" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-primary-300 hover:text-white transition-all duration-300 hover:scale-110" title="Twitter">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom accent gradient bar - Enhanced */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-destructive via-primary via-60% to-destructive opacity-75"></div>

        {/* Additional accent line */}
        <div className="absolute bottom-1.5 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      </div>
    </footer>
  );
}
