"use client";

import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Plus, FileText, Clock, TrendingUp, Trash2, Copy, MoreVertical } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api-client";
import TemplateSelectionModal from "@/components/templates/TemplateSelectionModal";

interface Resume {
  id: string;
  title: string;
  updatedAt: string;
  snapshots: Array<{ version: number; content?: Record<string, unknown> }>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  // Close context menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchResumes() {
    try {
      const response = await apiClient.get("/resumes");
      setResumes(response.data.resumes);
    } catch (error) {
      console.error("Error fetching resumes:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleNewResume() {
    setShowTemplateModal(true);
  }

  async function handleDeleteResume(resumeId: string) {
    try {
      await apiClient.delete(`/resumes/${resumeId}`);
      setResumes((prev) => prev.filter((r) => r.id !== resumeId));
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Error deleting resume:", error);
    }
  }

  async function handleDuplicateResume(resume: Resume) {
    setDuplicatingId(resume.id);
    try {
      const content = resume.snapshots?.[0]?.content || {};
      const response = await apiClient.post("/resumes", {
        title: `${resume.title} (Copy)`,
        content,
      });
      const newResume = response.data.resume;
      setResumes((prev) => [newResume, ...prev]);
    } catch (error) {
      console.error("Error duplicating resume:", error);
    } finally {
      setDuplicatingId(null);
    }
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-50 rounded-xl">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Resumes</p>
                <p className="text-2xl font-bold text-gray-900">{resumes.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-xl">
                <Clock className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="text-2xl font-bold text-gray-900">
                  {resumes.length > 0 ? formatDate(resumes[0].updatedAt) : "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-violet-50 rounded-xl">
                <TrendingUp className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">AI Credits</p>
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
              onClick={handleNewResume}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Resume
            </button>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500 text-sm">Loading resumes...</p>
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No resumes yet</h3>
              <p className="text-gray-500 mb-6 text-sm">Create your first resume to get started</p>
              <button
                onClick={handleNewResume}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Create Resume
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer"
                  onClick={() => router.push(`/dashboard/editor/${resume.id}`)}
                >
                  {/* Card top accent */}
                  <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500" />

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 bg-indigo-50 rounded-lg">
                        <FileText className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-400 font-medium">
                          v{resume.snapshots[0]?.version || 1}
                        </span>
                        {/* Context menu */}
                        <div className="relative" ref={menuOpenId === resume.id ? menuRef : null}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpenId(menuOpenId === resume.id ? null : resume.id);
                            }}
                            className="p-1 rounded hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                          {menuOpenId === resume.id && (
                            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 min-w-[150px]">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMenuOpenId(null);
                                  handleDuplicateResume(resume);
                                }}
                                disabled={duplicatingId === resume.id}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                <Copy className="w-4 h-4" />
                                {duplicatingId === resume.id ? "Duplicating..." : "Duplicate"}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMenuOpenId(null);
                                  setDeleteConfirmId(resume.id);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-1 truncate">{resume.title}</h3>
                    <p className="text-xs text-gray-400">Updated {formatDate(resume.updatedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Template Selection Modal */}
      <TemplateSelectionModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteConfirmId(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-4 w-full">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Resume?</h3>
              <p className="text-sm text-gray-500 mb-6">
                This action cannot be undone. The resume and all its versions will be permanently
                deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteResume(deleteConfirmId)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
