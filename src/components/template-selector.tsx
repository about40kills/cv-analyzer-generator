"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, Palette } from "lucide-react";

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
  onProceedToGenerate: () => void;
}

const templates = [
  {
    id: "professional",
    name: "Professional & Clean",
    description: "Perfect for corporate environments and traditional industries",
    features: ["Clean typography", "Professional layout", "ATS-friendly", "Contact sidebar"],
    preview: "/api/template-preview/professional",
    color: "bg-blue-50 border-blue-200",
    badge: "Most Popular",
    badgeColor: "bg-blue-100 text-blue-700"
  },
  {
    id: "modern",
    name: "Modern Tech",
    description: "Ideal for tech professionals and creative roles",
    features: ["Contemporary design", "Skills visualization", "Project highlights", "Tech-focused"],
    preview: "/api/template-preview/modern",
    color: "bg-purple-50 border-purple-200",
    badge: "Tech Focused",
    badgeColor: "bg-purple-100 text-purple-700"
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Clean and simple design that highlights your content",
    features: ["Minimal design", "Focus on content", "White space", "Easy to read"],
    preview: "/api/template-preview/minimalist",
    color: "bg-gray-50 border-gray-200",
    badge: "Clean",
    badgeColor: "bg-gray-100 text-gray-700"
  },
  {
    id: "creative",
    name: "Creative Design",
    description: "Stand out with this creative layout for design roles",
    features: ["Creative layout", "Visual elements", "Portfolio section", "Design-focused"],
    preview: "/api/template-preview/creative",
    color: "bg-orange-50 border-orange-200",
    badge: "Creative",
    badgeColor: "bg-orange-100 text-orange-700"
  },
  {
    id: "executive",
    name: "Executive/Traditional",
    description: "Traditional format for senior executives and formal industries",
    features: ["Traditional format", "Executive summary", "Achievement focus", "Formal style"],
    preview: "/api/template-preview/executive",
    color: "bg-green-50 border-green-200",
    badge: "Executive",
    badgeColor: "bg-green-100 text-green-700"
  }
];

export function TemplateSelector({ selectedTemplate, onTemplateSelect, onProceedToGenerate }: TemplateSelectorProps) {
  const [hoveredTemplate, setHoveredTemplate] = useState<string>("");

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Palette className="w-5 h-5" />
            <span>Choose Your CV Template</span>
          </CardTitle>
          <CardDescription>
            Select a professional template that matches your industry and personal style
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`
              cursor-pointer transition-all duration-300 hover:shadow-lg
              ${selectedTemplate === template.id ? 'ring-2 ring-blue-500 shadow-lg' : ''}
              ${hoveredTemplate === template.id ? 'scale-105' : ''}
            `}
            onClick={() => onTemplateSelect(template.id)}
            onMouseEnter={() => setHoveredTemplate(template.id)}
            onMouseLeave={() => setHoveredTemplate("")}
          >
            <CardHeader className="relative">
              {/* Preview Image Placeholder */}
              <div className={`
                w-full h-48 rounded-md mb-4 ${template.color}
                flex items-center justify-center relative overflow-hidden
              `}>
                {/* Template Preview Mockup */}
                <div className="w-full h-full relative">
                  {template.id === "professional" && <ProfessionalPreview />}
                  {template.id === "modern" && <ModernPreview />}
                  {template.id === "minimalist" && <MinimalistPreview />}
                  {template.id === "creative" && <CreativePreview />}
                  {template.id === "executive" && <ExecutivePreview />}
                </div>

                {/* Selected Indicator */}
                {selectedTemplate === template.id && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="w-6 h-6 text-blue-600 bg-white rounded-full" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">{template.name}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${template.badgeColor}`}>
                    {template.badge}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {template.description}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <ul className="space-y-1">
                {template.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm text-slate-600">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={selectedTemplate === template.id ? "default" : "outline"}
                className="w-full mt-4"
                onClick={(e) => {
                  e.stopPropagation();
                  onTemplateSelect(template.id);
                }}
              >
                {selectedTemplate === template.id ? "Selected" : "Select Template"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Proceed Button */}
      {selectedTemplate && (
        <div className="bg-white rounded-lg shadow mt-8">
          <div className="p-6 text-center">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Template Selected: {templates.find(t => t.id === selectedTemplate)?.name}
            </h3>
            <p className="text-slate-600 mb-4">
              Ready to customize your CV with the selected template
            </p>
            <Button
              onClick={onProceedToGenerate}
              size="lg"
              className="px-8"
            >
              Customize CV
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Template Preview Components
function ProfessionalPreview() {
  return (
    <div className="w-full h-full bg-white p-4 text-xs">
      <div className="flex">
        <div className="w-1/3 bg-slate-100 p-2 space-y-2">
          <div className="h-3 bg-slate-300 rounded" />
          <div className="h-2 bg-slate-200 rounded" />
          <div className="h-2 bg-slate-200 rounded w-3/4" />
        </div>
        <div className="w-2/3 p-2 space-y-2">
          <div className="h-4 bg-slate-800 rounded" />
          <div className="h-2 bg-slate-300 rounded" />
          <div className="h-2 bg-slate-300 rounded w-4/5" />
          <div className="space-y-1 mt-3">
            <div className="h-2 bg-slate-200 rounded" />
            <div className="h-2 bg-slate-200 rounded w-5/6" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ModernPreview() {
  return (
    <div className="w-full h-full bg-white p-4 text-xs">
      <div className="space-y-2">
        <div className="h-4 bg-purple-600 rounded" />
        <div className="flex space-x-2">
          <div className="h-2 bg-purple-200 rounded flex-1" />
          <div className="h-2 bg-purple-300 rounded flex-1" />
          <div className="h-2 bg-purple-400 rounded flex-1" />
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="space-y-1">
            <div className="h-2 bg-slate-300 rounded" />
            <div className="h-2 bg-slate-200 rounded w-4/5" />
          </div>
          <div className="space-y-1">
            <div className="h-2 bg-slate-300 rounded" />
            <div className="h-2 bg-slate-200 rounded w-3/4" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MinimalistPreview() {
  return (
    <div className="w-full h-full bg-white p-4 text-xs">
      <div className="space-y-3">
        <div className="border-b border-slate-200 pb-2">
          <div className="h-3 bg-slate-800 rounded w-1/2" />
          <div className="h-2 bg-slate-400 rounded w-1/3 mt-1" />
        </div>
        <div className="space-y-2">
          <div className="h-2 bg-slate-200 rounded" />
          <div className="h-2 bg-slate-200 rounded w-5/6" />
          <div className="h-2 bg-slate-200 rounded w-4/6" />
        </div>
        <div className="space-y-1 mt-4">
          <div className="h-2 bg-slate-300 rounded w-1/4" />
          <div className="h-1 bg-slate-100 rounded" />
          <div className="h-1 bg-slate-100 rounded w-4/5" />
        </div>
      </div>
    </div>
  );
}

function CreativePreview() {
  return (
    <div className="w-full h-full bg-white p-4 text-xs">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-orange-400 rounded-full" />
          <div className="h-3 bg-slate-800 rounded flex-1" />
        </div>
        <div className="ml-8 space-y-1">
          <div className="h-2 bg-orange-200 rounded w-3/4" />
          <div className="h-2 bg-slate-200 rounded w-1/2" />
        </div>
        <div className="flex space-x-1 mt-3">
          <div className="w-3 h-3 bg-orange-300 rounded" />
          <div className="w-3 h-3 bg-orange-400 rounded" />
          <div className="w-3 h-3 bg-orange-500 rounded" />
        </div>
        <div className="space-y-1">
          <div className="h-2 bg-slate-200 rounded" />
          <div className="h-2 bg-slate-200 rounded w-4/5" />
        </div>
      </div>
    </div>
  );
}

function ExecutivePreview() {
  return (
    <div className="w-full h-full bg-white p-4 text-xs">
      <div className="space-y-2">
        <div className="text-center space-y-1">
          <div className="h-4 bg-slate-800 rounded mx-auto w-2/3" />
          <div className="h-2 bg-slate-400 rounded mx-auto w-1/2" />
        </div>
        <div className="border border-slate-200 p-2 mt-3">
          <div className="h-2 bg-green-500 rounded w-1/4 mb-1" />
          <div className="space-y-1">
            <div className="h-1 bg-slate-200 rounded" />
            <div className="h-1 bg-slate-200 rounded w-5/6" />
            <div className="h-1 bg-slate-200 rounded w-4/6" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="h-2 bg-slate-300 rounded w-1/3" />
          <div className="h-1 bg-slate-100 rounded" />
          <div className="h-1 bg-slate-100 rounded w-4/5" />
        </div>
      </div>
    </div>
  );
}
