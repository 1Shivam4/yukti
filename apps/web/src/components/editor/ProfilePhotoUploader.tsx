/**
 * Profile Photo Uploader Component
 * Drag-and-drop image upload with S3 pre-signed URLs
 */

"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Camera, Loader2 } from "lucide-react";
import apiClient from "@/lib/api-client";

interface ProfilePhotoUploaderProps {
  value?: string;
  onChange: (url: string | undefined) => void;
}

export default function ProfilePhotoUploader({ value, onChange }: ProfilePhotoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (file: File) => {
      setError(null);

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        setError("Please upload a JPG, PNG, or WebP image");
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be smaller than 5MB");
        return;
      }

      setIsUploading(true);

      try {
        // Get pre-signed URL from API
        const response = await apiClient.post("/uploads/presigned", {
          filename: file.name,
          contentType: file.type,
          fileSize: file.size,
        });

        const { uploadUrl, imageUrl } = response.data;

        // Upload directly to S3
        await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type,
          },
        });

        // Update the form with the image URL
        onChange(imageUrl);
      } catch (err) {
        console.error("Upload error:", err);
        setError("Failed to upload image. Please try again.");
      } finally {
        setIsUploading(false);
      }
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemove = () => {
    onChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        <Camera className="w-4 h-4 inline mr-1" />
        Profile Photo
        <span className="text-gray-400 font-normal ml-1">(optional)</span>
      </label>

      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
          />
          <button
            onClick={handleRemove}
            className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            type="button"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileInputRef.current?.click()}
          className={`
            w-full h-32 border-2 border-dashed rounded-lg cursor-pointer
            flex flex-col items-center justify-center gap-2 transition-colors
            ${
              dragOver
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-300 hover:border-gray-400 bg-gray-50"
            }
            ${isUploading ? "pointer-events-none opacity-60" : ""}
          `}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <span className="text-sm text-gray-500">Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-sm text-gray-500">Drop image here or click to browse</span>
              <span className="text-xs text-gray-400">JPG, PNG, WebP (max 5MB)</span>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleInputChange}
        className="hidden"
      />

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
