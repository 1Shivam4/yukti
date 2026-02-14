"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Settings, User, Bell, Shield, Palette } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account preferences</p>
        </div>

        {/* Profile Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={user?.name || ""}
                disabled
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user?.plan === "PRO"
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {user?.plan === "PRO" ? "Pro" : "Free"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Sections */}
        {[
          {
            icon: Bell,
            title: "Notifications",
            desc: "Email alerts and update preferences",
          },
          {
            icon: Shield,
            title: "Security",
            desc: "Password and two-factor authentication",
          },
          {
            icon: Palette,
            title: "Appearance",
            desc: "Theme and display preferences",
          },
        ].map((section) => (
          <div
            key={section.title}
            className="bg-white border border-gray-200 rounded-xl p-6 mb-4 opacity-60"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <section.icon className="w-5 h-5 text-gray-400" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{section.title}</h3>
                  <p className="text-xs text-gray-500">{section.desc}</p>
                </div>
              </div>
              <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                Coming Soon
              </span>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
