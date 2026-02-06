"use client";

import { useState } from "react";
import { useResumeStore } from "@/stores/resumeStore";
import apiClient from "@/lib/api-client";
import { Sparkles, X, Loader2, Wand2, MessageSquare, CheckCircle } from "lucide-react";

interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  resumeId: string;
}

type AIMode = "generate" | "improve" | "analyze";

export default function AIPanel({ isOpen, onClose, resumeId }: AIPanelProps) {
  const { resume, updateBasics, updateWork } = useResumeStore();
  const [mode, setMode] = useState<AIMode>("generate");
  const [prompt, setPrompt] = useState("");
  const [targetSection, setTargetSection] = useState("summary");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await apiClient.post("/api/ai/generate", {
        prompt,
        resumeId,
        context: `Target section: ${targetSection}`,
      });
      setResult(response.data.content);
    } catch (err) {
      setError("Failed to generate content. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImprove = async () => {
    if (!resume) return;
    setLoading(true);
    setError(null);
    setResult(null);

    let content;
    if (targetSection === "summary") {
      content = resume.basics.summary;
    } else if (targetSection === "work" && resume.work.length > 0) {
      content = resume.work[0];
    }

    if (!content) {
      setError("No content to improve. Please add content first.");
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.post("/api/ai/improve", {
        section: targetSection,
        content,
        instructions: prompt || "Make it more impactful and concise",
      });
      setResult(response.data.improved);
    } catch (err) {
      setError("Failed to improve content. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await apiClient.post("/api/ai/analyze", {
        resumeId,
        targetRole: prompt || undefined,
      });
      setResult(response.data.analysis);
    } catch (err) {
      setError("Failed to analyze resume. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyResult = () => {
    if (!result || !resume) return;

    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(result);

      if (targetSection === "summary" && typeof parsed === "string") {
        updateBasics({ summary: parsed });
      } else if (targetSection === "summary" && parsed.summary) {
        updateBasics({ summary: parsed.summary });
      }
      // Add more section handlers as needed

      setResult(null);
      setPrompt("");
    } catch {
      // If not JSON, apply as plain text for summary
      if (targetSection === "summary") {
        updateBasics({ summary: result });
        setResult(null);
        setPrompt("");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold">AI Assistant</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setMode("generate")}
            className={`flex-1 py-3 text-sm font-medium transition ${
              mode === "generate"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Wand2 className="w-4 h-4 inline mr-1" />
            Generate
          </button>
          <button
            onClick={() => setMode("improve")}
            className={`flex-1 py-3 text-sm font-medium transition ${
              mode === "improve"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Sparkles className="w-4 h-4 inline mr-1" />
            Improve
          </button>
          <button
            onClick={() => setMode("analyze")}
            className={`flex-1 py-3 text-sm font-medium transition ${
              mode === "analyze"
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <MessageSquare className="w-4 h-4 inline mr-1" />
            Analyze
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Section selector */}
          {mode !== "analyze" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Section</label>
              <select
                value={targetSection}
                onChange={(e) => setTargetSection(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="summary">Professional Summary</option>
                <option value="work">Work Experience</option>
                <option value="skills">Skills</option>
              </select>
            </div>
          )}

          {/* Prompt input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {mode === "generate" && "What do you want to generate?"}
              {mode === "improve" && "Any specific instructions? (optional)"}
              {mode === "analyze" && "Target role (optional)"}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder={
                mode === "generate"
                  ? "E.g., Write a professional summary for a senior software engineer..."
                  : mode === "improve"
                    ? "E.g., Add more metrics and achievements..."
                    : "E.g., Product Manager at FAANG company"
              }
            />
          </div>

          {/* Action button */}
          <button
            onClick={
              mode === "generate"
                ? handleGenerate
                : mode === "improve"
                  ? handleImprove
                  : handleAnalyze
            }
            disabled={loading || (mode === "generate" && !prompt.trim())}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {mode === "generate" && "Generate Content"}
                {mode === "improve" && "Improve Section"}
                {mode === "analyze" && "Analyze Resume"}
              </>
            )}
          </button>

          {/* Error */}
          {error && <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}

          {/* Result */}
          {result && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Result</span>
                {mode !== "analyze" && (
                  <button
                    onClick={applyResult}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Apply
                  </button>
                )}
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 whitespace-pre-wrap text-sm">
                {result}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
