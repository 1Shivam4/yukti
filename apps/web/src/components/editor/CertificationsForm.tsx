"use client";

import { useResumeStore } from "@/stores/resumeStore";
import { Award, Plus, Trash2 } from "lucide-react";
import type { Certification } from "@yukti/shared";

export default function CertificationsForm() {
  const { resume, updateCertifications } = useResumeStore();

  if (!resume) return null;

  const { certifications } = resume;

  const inputClasses =
    "w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-gray-400 transition-colors";

  const addCertification = () => {
    const newCert: Certification = {
      name: "",
      issuer: "",
      date: "",
    };
    updateCertifications([...certifications, newCert]);
  };

  const removeCertification = (index: number) => {
    updateCertifications(certifications.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, updates: Partial<Certification>) => {
    const updated = certifications.map((item, i) => (i === index ? { ...item, ...updates } : item));
    updateCertifications(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-600" />
          Certifications
        </h2>
        <button
          onClick={addCertification}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Certification
        </button>
      </div>

      {certifications.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
          <Award className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No certifications added yet.</p>
          <button
            onClick={addCertification}
            className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            + Add your first certification
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {certifications.map((item, index) => (
            <div
              key={index}
              className="p-5 bg-gray-50/80 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Certification {index + 1}
                </span>
                <button
                  onClick={() => removeCertification(index)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Certification Name
                  </label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(index, { name: e.target.value })}
                    placeholder="AWS Solutions Architect..."
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Issuing Organization
                  </label>
                  <input
                    type="text"
                    value={item.issuer}
                    onChange={(e) => updateItem(index, { issuer: e.target.value })}
                    placeholder="Amazon Web Services, Google..."
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Date Issued
                  </label>
                  <input
                    type="text"
                    value={item.date}
                    onChange={(e) => updateItem(index, { date: e.target.value })}
                    placeholder="2024-01"
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={item.expiryDate || ""}
                    onChange={(e) => updateItem(index, { expiryDate: e.target.value })}
                    placeholder="2027-01 or N/A"
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Credential ID
                  </label>
                  <input
                    type="text"
                    value={item.credentialId || ""}
                    onChange={(e) => updateItem(index, { credentialId: e.target.value })}
                    placeholder="ABC-123-XYZ"
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Credential URL
                  </label>
                  <input
                    type="url"
                    value={item.url || ""}
                    onChange={(e) => updateItem(index, { url: e.target.value || undefined })}
                    placeholder="https://verify.example.com/..."
                    className={inputClasses}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
