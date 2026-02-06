"use client";

import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Plus, FileText, Clock, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import apiClient from "@/lib/api-client";

interface Resume {
  id: string;
  title: string;
  updatedAt: string;
  snapshots: Array<{ version: number }>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResumes();
  }, []);

  async function fetchResumes() {
    try {
      const response = await apiClient.get("/api/resumes");
      setResumes(response.data.resumes);
    } catch (error) {
      console.error("Error fetching resumes:", error);
    } finally {
      setLoading(false);
    }
  }

  async function createResume() {
    try {
      const response = await apiClient.post("/api/resumes", {
        title: "New Resume",
        content: {
          basics: {
            name: user?.name || "",
            email: user?.email || "",
          },
          work: [],
          education: [],
          skills: [],
          projects: [],
        },
      });

      // Navigate to editor
      window.location.href = `/dashboard/editor/${response.data.resume.id}`;
    } catch (error) {
      console.error("Error creating resume:", error);
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Resumes</h1>
          <p className="text-gray-600 mt-2">Create and manage your professional resumes</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Resumes</p>
                <p className="text-2xl font-bold text-gray-900">{resumes.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="text-2xl font-bold text-gray-900">
                  {resumes.length > 0 ? "Today" : "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">AI Credits</p>
                <p className="text-2xl font-bold text-gray-900">Unlimited</p>
              </div>
            </div>
          </div>
        </div>

        {/* Resume list */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Resumes</h2>
            <button
              onClick={createResume}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Resume
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading resumes...</p>
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No resumes yet</h3>
              <p className="text-gray-600 mb-6">Create your first resume to get started</p>
              <button
                onClick={createResume}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create Resume
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => (window.location.href = `/dashboard/editor/${resume.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <FileText className="w-6 h-6 text-indigo-600" />
                    </div>
                    <span className="text-xs text-gray-500">
                      v{resume.snapshots[0]?.version || 1}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2">{resume.title}</h3>
                  <p className="text-sm text-gray-500">
                    Updated {new Date(resume.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
