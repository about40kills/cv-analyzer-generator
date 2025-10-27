"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  Plus,
  Minus,
  Download,
  Eye,
  Lightbulb
} from "lucide-react";
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

interface CVFormProps {
  initialData: CVData;
  selectedTemplate: string;
  onDataChange: (data: CVData) => void;
  analysisResult?: {
    suggestions: string[];
    missingKeywords: string[];
  } | null;
}

export function CVForm({ initialData, selectedTemplate, onDataChange, analysisResult }: CVFormProps) {
  const [cvData, setCvData] = useState(initialData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  const updatePersonalInfo = (field: string, value: string) => {
    const updatedData = {
      ...cvData,
      personalInfo: {
        ...cvData.personalInfo,
        [field]: value
      }
    };
    setCvData(updatedData);
    onDataChange(updatedData);
  };

  const updateSummary = (value: string) => {
    const updatedData = {
      ...cvData,
      summary: value
    };
    setCvData(updatedData);
    onDataChange(updatedData);
  };

  const addExperience = () => {
    const updatedData = {
      ...cvData,
      experience: [
        ...cvData.experience,
        { title: "", company: "", duration: "", description: "" }
      ]
    };
    setCvData(updatedData);
    onDataChange(updatedData);
  };

  const updateExperience = (index: number, field: string, value: string) => {
    const updatedExperience = [...cvData.experience];
    updatedExperience[index] = {
      ...updatedExperience[index],
      [field]: value
    };
    const updatedData = {
      ...cvData,
      experience: updatedExperience
    };
    setCvData(updatedData);
    onDataChange(updatedData);
  };

  const removeExperience = (index: number) => {
    const updatedData = {
      ...cvData,
      experience: cvData.experience.filter((_, i) => i !== index)
    };
    setCvData(updatedData);
    onDataChange(updatedData);
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      const updatedData = {
        ...cvData,
        skills: [...cvData.skills, newSkill.trim()]
      };
      setCvData(updatedData);
      onDataChange(updatedData);
      setNewSkill("");
    }
  };

  const removeSkill = (index: number) => {
    const updatedData = {
      ...cvData,
      skills: cvData.skills.filter((_, i) => i !== index)
    };
    setCvData(updatedData);
    onDataChange(updatedData);
  };

  const addEducation = () => {
    const updatedData = {
      ...cvData,
      education: [
        ...cvData.education,
        { degree: "", institution: "", year: "" }
      ]
    };
    setCvData(updatedData);
    onDataChange(updatedData);
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const updatedEducation = [...cvData.education];
    updatedEducation[index] = {
      ...updatedEducation[index],
      [field]: value
    };
    const updatedData = {
      ...cvData,
      education: updatedEducation
    };
    setCvData(updatedData);
    onDataChange(updatedData);
  };

  const removeEducation = (index: number) => {
    const updatedData = {
      ...cvData,
      education: cvData.education.filter((_, i) => i !== index)
    };
    setCvData(updatedData);
    onDataChange(updatedData);
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cvData,
          template: selectedTemplate
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${cvData.personalInfo.name || 'CV'}_${selectedTemplate}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Customize Your CV</span>
              </CardTitle>
              <CardDescription className="mt-2">
                Edit your information and generate a professional CV using the {selectedTemplate} template
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="w-full sm:w-auto"
              >
                <Eye className="w-4 h-4 mr-2" />
                {showPreview ? "Hide" : "Show"} Preview
              </Button>
              <Button
                onClick={generatePDF}
                disabled={isGenerating}
                className="w-full sm:w-auto sm:px-6"
              >
                <Download className="w-4 h-4 mr-2" />
                {isGenerating ? "Generating..." : "Download PDF"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Suggestions Panel */}
      {analysisResult && (analysisResult.suggestions.length > 0 || analysisResult.missingKeywords.length > 0) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-yellow-800">
              <Lightbulb className="w-5 h-5" />
              <span>Optimization Tips</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysisResult.suggestions.length > 0 && (
              <div>
                <h4 className="font-medium text-yellow-800 mb-2">Suggestions:</h4>
                <ul className="space-y-1">
                  {analysisResult.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-yellow-700 flex items-start space-x-2">
                      <span className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0" />
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {analysisResult.missingKeywords.length > 0 && (
              <div>
                <h4 className="font-medium text-yellow-800 mb-2">Consider adding these keywords:</h4>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.missingKeywords.slice(0, 8).map((keyword, index) => (
                    <Badge key={index} variant="outline" className="text-yellow-700 border-yellow-400">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Preview Section */}
      {showPreview && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">CV Preview</CardTitle>
            <CardDescription>Preview of your CV data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Personal Info Preview */}
            <div>
              <h3 className="font-semibold text-lg mb-2">{cvData.personalInfo.name || "Your Name"}</h3>
              <div className="text-sm text-slate-600 space-y-1">
                {cvData.personalInfo.email && <p>📧 {cvData.personalInfo.email}</p>}
                {cvData.personalInfo.phone && <p>📱 {cvData.personalInfo.phone}</p>}
                {cvData.personalInfo.location && <p>📍 {cvData.personalInfo.location}</p>}
                {cvData.personalInfo.linkedin && <p>🔗 {cvData.personalInfo.linkedin}</p>}
              </div>
            </div>

            {/* Summary Preview */}
            {cvData.summary && (
              <div>
                <h4 className="font-semibold mb-2">Professional Summary</h4>
                <p className="text-sm text-slate-700">{cvData.summary}</p>
              </div>
            )}

            {/* Experience Preview */}
            {cvData.experience.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Work Experience</h4>
                <div className="space-y-3">
                  {cvData.experience.map((exp, index) => (
                    <div key={index} className="border-l-2 border-blue-300 pl-3">
                      <p className="font-medium">{exp.title || "Job Title"}</p>
                      <p className="text-sm text-slate-600">{exp.company || "Company"} • {exp.duration || "Duration"}</p>
                      {exp.description && <p className="text-sm text-slate-700 mt-1">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills Preview */}
            {cvData.skills.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {cvData.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Education Preview */}
            {cvData.education.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Education</h4>
                <div className="space-y-2">
                  {cvData.education.map((edu, index) => (
                    <div key={index}>
                      <p className="font-medium">{edu.degree || "Degree"}</p>
                      <p className="text-sm text-slate-600">{edu.institution || "Institution"} • {edu.year || "Year"}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Form Tabs */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
          <TabsTrigger value="personal" className="text-sm px-2 py-2">
            <span className="hidden sm:inline">Personal Info</span>
            <span className="sm:hidden">Personal</span>
          </TabsTrigger>
          <TabsTrigger value="summary" className="text-sm px-2 py-2">Summary</TabsTrigger>
          <TabsTrigger value="experience" className="text-sm px-2 py-2">Experience</TabsTrigger>
          <TabsTrigger value="skills-education" className="text-sm px-2 py-2">
            <span className="hidden sm:inline">Skills & Education</span>
            <span className="sm:hidden">Skills/Edu</span>
          </TabsTrigger>
        </TabsList>

        {/* Personal Information */}
        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={cvData.personalInfo.name}
                    onChange={(e) => updatePersonalInfo('name', e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={cvData.personalInfo.email}
                    onChange={(e) => updatePersonalInfo('email', e.target.value)}
                    placeholder="your.email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={cvData.personalInfo.phone}
                    onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={cvData.personalInfo.location}
                    onChange={(e) => updatePersonalInfo('location', e.target.value)}
                    placeholder="City, State/Country"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="linkedin">LinkedIn Profile</Label>
                  <Input
                    id="linkedin"
                    value={cvData.personalInfo.linkedin}
                    onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                    placeholder="linkedin.com/in/yourprofile"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Professional Summary */}
        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Professional Summary</span>
              </CardTitle>
              <CardDescription>
                A brief overview of your professional background and key strengths
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={cvData.summary}
                onChange={(e) => updateSummary(e.target.value)}
                placeholder="Write a compelling professional summary that highlights your key skills, experience, and career objectives..."
                rows={6}
                className="resize-none"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Work Experience */}
        <TabsContent value="experience" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="space-y-4">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Briefcase className="w-5 h-5" />
                    <span>Work Experience</span>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Add your work experience in reverse chronological order
                  </CardDescription>
                </div>
                <Button onClick={addExperience} size="sm" className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Experience
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {cvData.experience.map((exp, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Experience {index + 1}</h4>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeExperience(index)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Job Title</Label>
                      <Input
                        value={exp.title}
                        onChange={(e) => updateExperience(index, 'title', e.target.value)}
                        placeholder="Senior Software Engineer"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Company</Label>
                      <Input
                        value={exp.company}
                        onChange={(e) => updateExperience(index, 'company', e.target.value)}
                        placeholder="Company Name"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Duration</Label>
                      <Input
                        value={exp.duration}
                        onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                        placeholder="Jan 2020 - Present"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Description</Label>
                      <Textarea
                        value={exp.description}
                        onChange={(e) => updateExperience(index, 'description', e.target.value)}
                        placeholder="Describe your responsibilities and achievements..."
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {cvData.experience.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>No work experience added yet</p>
                  <p className="text-sm">Click "Add Experience" to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills & Education */}
        <TabsContent value="skills-education" className="space-y-4">
          {/* Skills */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="w-5 h-5" />
                    <span>Skills</span>
                  </CardTitle>
                  <CardDescription>
                    Add relevant technical and soft skills
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addSkill();
                    }
                  }}
                />
                <Button onClick={addSkill}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {cvData.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {skill}
                    <button
                      onClick={() => removeSkill(index)}
                      className="ml-2 text-slate-500 hover:text-slate-700"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <div className="space-y-4">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <GraduationCap className="w-5 h-5" />
                    <span>Education</span>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Add your educational background
                  </CardDescription>
                </div>
                <Button onClick={addEducation} size="sm" className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Education
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {cvData.education.map((edu, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Education {index + 1}</h4>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeEducation(index)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label>Degree</Label>
                      <Input
                        value={edu.degree}
                        onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                        placeholder="Bachelor of Science in Computer Science"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Institution</Label>
                      <Input
                        value={edu.institution}
                        onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                        placeholder="University Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Year</Label>
                      <Input
                        value={edu.year}
                        onChange={(e) => updateEducation(index, 'year', e.target.value)}
                        placeholder="2020"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {cvData.education.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <GraduationCap className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>No education added yet</p>
                  <p className="text-sm">Click "Add Education" to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
