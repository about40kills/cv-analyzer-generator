"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileUpload } from "@/components/file-upload";
import { CVAnalysis } from "@/components/cv-analysis";
import { TemplateSelector } from "@/components/template-selector";
import { CVForm } from "@/components/cv-form";
import { Upload, FileText, Palette, Download, Github } from "lucide-react";

interface CVData {
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
}

interface AnalysisResult {
  matchScore: number;
  extractedData: CVData;
  suggestions: string[];
  missingKeywords: string[];
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("upload");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [cvData, setCvData] = useState<CVData>({
    personalInfo: {
      name: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
    },
    summary: "",
    experience: [],
    skills: [],
    education: [],
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8 px-2">
          <h1 className="text-3xl sm:text-4xl md:text-4xl font-bold text-slate-800 mb-2">
            Smart CV Analyzer & Generator
          </h1>
          <p className="text-base sm:text-lg md:text-lg text-slate-600 max-w-2xl mx-auto">
            Upload your CV, get AI-powered insights, and create an ATS-optimized resume
            using our professional templates
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-6 md:mb-8 overflow-x-auto">
          <div className="flex items-center justify-center space-x-3 sm:space-x-4 mb-4 min-w-max px-4">
            <div className={`flex items-center space-x-2 ${activeTab === "upload" ? "text-blue-600" : "text-slate-400"}`}>
              <Upload className="w-5 h-5" />
              <span className="text-sm font-medium hidden sm:inline">Upload CV</span>
              <span className="text-sm font-medium sm:hidden">Upload</span>
            </div>
            <div className="w-6 sm:w-8 h-px bg-slate-300" />
            <div className={`flex items-center space-x-2 ${activeTab === "analysis" ? "text-blue-600" : "text-slate-400"}`}>
              <FileText className="w-5 h-5" />
              <span className="text-sm font-medium">Analysis</span>
            </div>
            <div className="w-6 sm:w-8 h-px bg-slate-300" />
            <div className={`flex items-center space-x-2 ${activeTab === "templates" ? "text-blue-600" : "text-slate-400"}`}>
              <Palette className="w-5 h-5" />
              <span className="text-sm font-medium">Templates</span>
            </div>
            <div className="w-6 sm:w-8 h-px bg-slate-300" />
            <div className={`flex items-center space-x-2 ${activeTab === "generate" ? "text-blue-600" : "text-slate-400"}`}>
              <Download className="w-5 h-5" />
              <span className="text-sm font-medium">Generate</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto">
            <TabsTrigger value="upload" className="text-sm px-3 py-2">
              <span className="hidden sm:inline">Upload CV</span>
              <span className="sm:hidden">Upload</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" disabled={!uploadedFile} className="text-sm px-3 py-2">Analysis</TabsTrigger>
            <TabsTrigger value="templates" disabled={!analysisResult} className="text-sm px-3 py-2">Templates</TabsTrigger>
            <TabsTrigger value="generate" disabled={!selectedTemplate} className="text-sm px-3 py-2">Generate</TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Your CV</CardTitle>
                <CardDescription>
                  Support for PDF, DOCX, and image files. We'll extract and analyze your information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  onFileSelect={setUploadedFile}
                  onAnalysisComplete={(result) => {
                    setAnalysisResult(result);
                    setCvData(result.extractedData);
                    setActiveTab("analysis");
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            {analysisResult && (
              <CVAnalysis
                result={analysisResult}
                onProceedToTemplates={() => setActiveTab("templates")}
              />
            )}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <TemplateSelector
              selectedTemplate={selectedTemplate}
              onTemplateSelect={setSelectedTemplate}
              onProceedToGenerate={() => setActiveTab("generate")}
            />
          </TabsContent>

          {/* Generate Tab */}
          <TabsContent value="generate" className="space-y-6">
            <CVForm
              initialData={cvData}
              selectedTemplate={selectedTemplate}
              onDataChange={setCvData}
              analysisResult={analysisResult}
            />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="mt-12 md:mt-16 py-6 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 text-slate-600 px-4">
            <p className="text-xs sm:text-sm text-center">© 2025 Smart CV Analyzer & Generator</p>
            <a
              href="https://github.com/about40kills"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
