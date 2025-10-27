"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  User,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Briefcase,
  GraduationCap,
  Award,
  ArrowRight
} from "lucide-react";

// TypeScript interfaces
interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
}

interface CVData {
  personalInfo: PersonalInfo;
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

interface CVAnalysisProps {
  result: AnalysisResult;
  onProceedToTemplates: () => void;
}

export function CVAnalysis({ result, onProceedToTemplates }: CVAnalysisProps) {
  const { matchScore, extractedData, suggestions, missingKeywords } = result;

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  }

  const getScoreIcon = (score: number) => {
    if (score >= 70) return CheckCircle;
    if (score >= 50) return AlertTriangle;
    return AlertTriangle;
  };

  const ScoreIcon = getScoreIcon(matchScore);

  return (
    <div className="space-y-6">
      {/* Match Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>CV Analysis Results</span>
          </CardTitle>
          <CardDescription>
            Here's how your CV performs and what we extracted from it
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <ScoreIcon className={`w-8 h-8 ${getScoreColor(matchScore)}`} />
              <div>
                <p className="text-3xl font-bold">
                  <span className={getScoreColor(matchScore)}>{matchScore}%</span>
                </p>
                <p className="text-sm text-slate-600">Match Score</p>
              </div>
            </div>
            <Progress value={matchScore} className="w-full max-w-sm mx-auto" />
            <p className="text-sm text-slate-600">
              {matchScore >= 70 ? "Excellent match!" :
               matchScore >= 50 ? "Good foundation, room for improvement" :
               "Needs significant optimization"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Extracted Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Extracted Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600">Name:</span>
                <span className="font-medium">{extractedData.personalInfo.name || "Not found"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600">Email:</span>
                <span className="font-medium">{extractedData.personalInfo.email || "Not found"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600">Phone:</span>
                <span className="font-medium">{extractedData.personalInfo.phone || "Not found"}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Linkedin className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600">LinkedIn:</span>
                <span className="font-medium">{extractedData.personalInfo.linkedin || "Not found"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600">Location:</span>
                <span className="font-medium">{extractedData.personalInfo.location || "Not specified"}</span>
              </div>
            </div>
          </div>

          {extractedData.summary && (
            <div className="pt-4 border-t">
              <h4 className="font-medium text-slate-700 mb-2">Professional Summary:</h4>
              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-md">
                {extractedData.summary}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skills and Experience Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span>Skills Found</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {extractedData.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {extractedData.skills.slice(0, 12).map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {extractedData.skills.length > 12 && (
                  <Badge variant="outline" className="text-xs">
                    +{extractedData.skills.length - 12} more
                  </Badge>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No skills section found</p>
            )}
          </CardContent>
        </Card>

        {/* Experience Count */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Briefcase className="w-5 h-5" />
              <span>Work Experience</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-slate-700">
                {extractedData.experience.length}
              </p>
              <p className="text-sm text-slate-600">
                {extractedData.experience.length === 1 ? "Position" : "Positions"} found
              </p>
              {extractedData.experience.length > 0 && (
                <p className="text-xs text-slate-500">
                  Latest: {extractedData.experience[0]?.title} at {extractedData.experience[0]?.company}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span>Improvement Suggestions</span>
            </CardTitle>
            <CardDescription>
              Here are some recommendations to optimize your CV
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-slate-700">{suggestion}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Missing Keywords */}
      {missingKeywords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span>Missing Keywords</span>
            </CardTitle>
            <CardDescription>
              Consider adding these keywords to improve your match score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {missingKeywords.slice(0, 10).map((keyword, index) => (
                <Badge key={index} variant="outline" className="text-orange-700 border-orange-300">
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Step */}
      <Card>
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Ready to Create an Improved CV?
          </h3>
          <p className="text-slate-600 mb-4">
            Choose from our professional templates and we'll help you create an ATS-optimized CV
          </p>
          <Button
            onClick={onProceedToTemplates}
            size="lg"
            className="px-8"
          >
            Choose Template
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}