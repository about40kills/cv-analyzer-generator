"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, File, AlertCircle, CheckCircle } from "lucide-react";

interface AnalysisResult {
  matchScore: number;
  extractedData: {
    personalInfo: {
      name: string;
      email: string;
      phone: string;
      location: string;
      linkedin: string;
    };
    summary: string;
    experience: Array<{
      title: string;
      company: string;
      duration: string;
      description: string;
    }>;
    skills: string[];
    education: Array<{
      degree: string;
      institution: string;
      year: string;
    }>;
  };
  suggestions: string[];
  missingKeywords: string[];
}

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  onAnalysisComplete: (result: AnalysisResult) => void;
}

export function FileUpload({ onFileSelect, onAnalysisComplete }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [jobDescription, setJobDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'image/jpeg',
    'image/png',
    'image/jpg'
  ];

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    setError("");

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      setError("Please upload a PDF, DOCX, or image file (JPG, PNG)");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    setUploadedFile(file);
    onFileSelect(file);
  };

  const processCV = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('cv', uploadedFile);
      if (jobDescription.trim()) {
        formData.append('jobDescription', jobDescription);
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/analyze-cv', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error('Failed to analyze CV');
      }

      const result = await response.json();
      onAnalysisComplete(result);

    } catch (error) {
      console.error('Error processing CV:', error);
      setError('Failed to process CV. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.includes('pdf')) return '📄';
    if (file.type.includes('word')) return '📝';
    if (file.type.includes('image')) return '🖼️';
    return '📎';
  };

  return (
    <div className="space-y-6">
      {/* File Drop Zone */}
      <Card>
        <CardContent className="p-6">
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
              ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400'}
              ${uploadedFile ? 'border-green-500 bg-green-50' : ''}
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {uploadedFile ? (
              <div className="space-y-3">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                <div className="space-y-1">
                  <p className="text-lg font-medium text-green-700">
                    {getFileIcon(uploadedFile)} {uploadedFile.name}
                  </p>
                  <p className="text-sm text-slate-600">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadedFile(null);
                    onFileSelect(null);
                  }}
                >
                  Choose Different File
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-12 h-12 text-slate-400 mx-auto" />
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-slate-700">
                    Drop your CV here or click to browse
                  </h3>
                  <p className="text-sm text-slate-500">
                    Support for PDF, DOCX, DOC, JPG, PNG files up to 10MB
                  </p>
                </div>
                <Button variant="outline">
                  <File className="w-4 h-4 mr-2" />
                  Browse Files
                </Button>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Description Input */}
      {uploadedFile && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <Label htmlFor="job-description" className="text-base font-medium">
                Job Description (Optional)
              </Label>
              <p className="text-sm text-slate-600 mt-1">
                Paste the job description to get a match score and keyword recommendations
              </p>
            </div>
            <Textarea
              id="job-description"
              placeholder="Paste the job description here to get personalized recommendations..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </CardContent>
        </Card>
      )}

      {/* Process Button */}
      {uploadedFile && (
        <Card>
          <CardContent className="p-6">
            {isUploading ? (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-2">
                    Analyzing your CV...
                  </p>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              </div>
            ) : (
              <div className="text-center">
                <Button
                  onClick={processCV}
                  size="lg"
                  className="w-full sm:w-auto px-8"
                >
                  <File className="w-4 h-4 mr-2" />
                  Analyze CV
                </Button>
                <p className="text-sm text-slate-600 mt-2">
                  This will extract your information and provide improvement suggestions
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
