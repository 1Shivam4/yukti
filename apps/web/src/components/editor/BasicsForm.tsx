"use client";

import { useResumeStore } from "@/stores/resumeStore";
import { User, Mail, Phone, MapPin, Link as LinkIcon, AlertCircle } from "lucide-react";
import ProfilePhotoUploader from "./ProfilePhotoUploader";
import { useState, useEffect } from "react";

export default function BasicsForm() {
  const { resume, updateBasics } = useResumeStore();
  const [errors, setErrors] = useState<{ email?: string; url?: string }>({});

  if (!resume) return null;

  const { basics } = resume;

  const inputClasses =
    "w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-gray-400 transition-colors";

  const errorInputClasses =
    "w-full px-4 py-2.5 border border-red-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 placeholder:text-gray-400 transition-colors";

  // Validation functions
  const validateEmail = (email: string) => {
    if (!email) return true; // Empty is OK (optional)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUrl = (url: string) => {
    if (!url) return true; // Empty is OK (optional)
    try {
      new URL(url);
      return url.startsWith("http://") || url.startsWith("https://");
    } catch {
      return false;
    }
  };

  // Validate on change
  const handleEmailChange = (email: string) => {
    updateBasics({ email });
    if (email && !validateEmail(email)) {
      setErrors((prev) => ({ ...prev, email: "Invalid email format" }));
    } else {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handleUrlChange = (url: string) => {
    updateBasics({ url });
    if (url && !validateUrl(url)) {
      setErrors((prev) => ({ ...prev, url: "Invalid URL format (e.g., https://example.com)" }));
    } else {
      setErrors((prev) => ({ ...prev, url: undefined }));
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <User className="w-5 h-5 text-indigo-600" />
        Personal Information
      </h2>

      {/* Profile Photo Upload */}
      <ProfilePhotoUploader value={basics.image} onChange={(url) => updateBasics({ image: url })} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Full Name</label>
          <input
            type="text"
            value={basics.name || ""}
            onChange={(e) => updateBasics({ name: e.target.value })}
            className={inputClasses}
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Professional Title
          </label>
          <input
            type="text"
            value={basics.label || ""}
            onChange={(e) => updateBasics({ label: e.target.value })}
            className={inputClasses}
            placeholder="Software Engineer"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            <Mail className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
            Email
          </label>
          <input
            type="email"
            value={basics.email || ""}
            onChange={(e) => handleEmailChange(e.target.value)}
            className={errors.email ? errorInputClasses : inputClasses}
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            <Phone className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
            Phone
          </label>
          <input
            type="tel"
            value={basics.phone || ""}
            onChange={(e) => updateBasics({ phone: e.target.value })}
            className={inputClasses}
            placeholder="+1 (555) 000-0000"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            <MapPin className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
            City
          </label>
          <input
            type="text"
            value={basics.location?.city || ""}
            onChange={(e) =>
              updateBasics({
                location: {
                  ...basics.location,
                  city: e.target.value,
                  countryCode: basics.location?.countryCode || "US",
                },
              })
            }
            className={inputClasses}
            placeholder="San Francisco"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            <LinkIcon className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
            Website / Portfolio
          </label>
          <input
            type="url"
            value={basics.url || ""}
            onChange={(e) => handleUrlChange(e.target.value)}
            className={errors.url ? errorInputClasses : inputClasses}
            placeholder="https://yourportfolio.com"
          />
          {errors.url && (
            <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.url}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5">
          Professional Summary
        </label>
        <textarea
          rows={4}
          value={basics.summary || ""}
          onChange={(e) => updateBasics({ summary: e.target.value })}
          className={inputClasses}
          placeholder="Brief overview of your professional background and key strengths..."
        />
      </div>
    </div>
  );
}
