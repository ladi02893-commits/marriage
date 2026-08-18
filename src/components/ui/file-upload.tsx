'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, CheckCircle2 } from 'lucide-react';

interface FileUploadProps {
  onUploadSuccess: (url: string) => void;
  bucket?: string;
  folder?: string;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  value?: string;
}

export function FileUpload({
  onUploadSuccess,
  bucket = 'uploads',
  folder = '',
  accept = 'image/*',
  maxSizeMB = 5,
  label = 'Upload Image',
  value = ''
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File must be less than ${maxSizeMB}MB`);
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', bucket);
      if (folder) formData.append('folder', folder);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Upload failed');

      onUploadSuccess(data.url);
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setIsUploading(false);
      // Reset input so the same file can be uploaded again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-4">
        {value ? (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border bg-muted/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Uploaded" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-white bg-black/50 p-1 rounded-full"
              >
                <Upload className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-16 w-16 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition"
            disabled={isUploading}
          >
            {isUploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
          </button>
        )}
        
        <div className="flex flex-col flex-1">
          <span className="text-sm font-medium text-foreground">{label}</span>
          <span className="text-xs text-muted-foreground">
            {isUploading ? 'Uploading to cloud...' : value ? 'Uploaded successfully' : `JPG, PNG up to ${maxSizeMB}MB`}
          </span>
          {error && <span className="text-xs text-red-500 mt-0.5">{error}</span>}
        </div>

        {value && !isUploading && (
          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
