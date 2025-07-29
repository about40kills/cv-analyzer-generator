import { NextRequest, NextResponse } from 'next/server';

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

// Common ATS keywords
const ATS_KEYWORDS = [
  'leadership', 'management', 'project management', 'team leadership',
  'communication', 'collaboration', 'problem solving', 'analytical',
  'strategic', 'innovative', 'results-driven', 'data analysis',
  'software development', 'programming', 'database', 'cloud',
  'agile', 'scrum', 'devops', 'machine learning', 'artificial intelligence'
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('cv') as File;
    const jobDescription = formData.get('jobDescription') as string || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Extract text based on file type
    let extractedText = '';

    if (file.type === 'application/pdf') {
      const pdfParse = (await import('pdf-parse')).default;
      const buffer = await file.arrayBuffer();
      const data = await pdfParse(Buffer.from(buffer));
      extractedText = data.text;
    } else if (file.type.includes('word')) {
      const mammoth = await import('mammoth');
      const buffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
      extractedText = result.value;
    } else if (file.type.includes('image')) {
      // Use OCR for images
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng');
      const buffer = await file.arrayBuffer();
      const { data: { text } } = await worker.recognize(Buffer.from(buffer));
      extractedText = text;
      await worker.terminate();
    }

    if (!extractedText.trim()) {
      return NextResponse.json({ error: 'Could not extract text from file' }, { status: 400 });
    }

    // Parse the extracted text
    const cvData = parseCV(extractedText);

    // Analyze against job description if provided
    let matchScore = 0;
    let missingKeywords: string[] = [];
    let suggestions: string[] = [];

    if (jobDescription.trim()) {
      const analysis = await analyzeMatch(extractedText, jobDescription);
      matchScore = analysis.score;
      missingKeywords = analysis.missingKeywords;
      suggestions = analysis.suggestions;
    } else {
      // General ATS optimization suggestions
      suggestions = generateGeneralSuggestions(extractedText, cvData);
      matchScore = calculateATSScore(extractedText);
    }

    const result: AnalysisResult = {
      matchScore,
      extractedData: cvData,
      suggestions,
      missingKeywords
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('CV Analysis Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze CV' },
      { status: 500 }
    );
  }
}

function parseCV(text: string): CVData {
  const lines = text.split('\n').filter(line => line.trim());

  // Extract email
  const emailMatch = text.match(/[\w\.-]+@[\w\.-]+\.\w+/);
  const email = emailMatch ? emailMatch[0] : '';

  // Extract phone
  const phoneMatch = text.match(/[\+]?[\d\s\-\(\)]{10,}/);
  const phone = phoneMatch ? phoneMatch[0].trim() : '';

  // Extract LinkedIn
  const linkedinMatch = text.match(/linkedin\.com\/in\/[\w\-]+|linkedin\.com\/[\w\-]+/i);
  const linkedin = linkedinMatch ? linkedinMatch[0] : '';

  // Extract name (assume first non-empty line is name)
  const name = lines[0] || '';

  // Extract skills - look for skills section
  const skillsSection = extractSection(text, ['skills', 'technical skills', 'core competencies']);
  const skills = extractSkills(skillsSection);

  // Extract experience
  const experienceSection = extractSection(text, ['experience', 'work experience', 'employment', 'professional experience']);
  const experience = extractExperience(experienceSection);

  // Extract education
  const educationSection = extractSection(text, ['education', 'academic background']);
  const education = extractEducation(educationSection);

  // Extract summary/objective
  const summarySection = extractSection(text, ['summary', 'objective', 'profile', 'about']);
  const summary = summarySection.split('\n')[0] || '';

  return {
    personalInfo: {
      name,
      email,
      phone,
      location: '', // Could be enhanced to extract location
      linkedin
    },
    summary,
    experience,
    skills,
    education
  };
}

function extractSection(text: string, keywords: string[]): string {
  const lowerText = text.toLowerCase();

  for (const keyword of keywords) {
    const index = lowerText.indexOf(keyword);
    if (index !== -1) {
      // Find the end of this section (next major heading)
      const afterSection = text.substring(index);
      const nextSectionMatch = afterSection.match(/\n\s*[A-Z][A-Z\s]{2,}\s*\n/);

      if (nextSectionMatch) {
        return afterSection.substring(0, nextSectionMatch.index);
      } else {
        return afterSection;
      }
    }
  }

  return '';
}

function extractSkills(text: string): string[] {
  if (!text) return [];

  // Common skill indicators
  const skillPatterns = [
    /(?:skills?|technologies?|tools?)[:\-]?\s*([^\n]+)/gi,
    /•\s*([^\n•]+)/g,
    /-\s*([^\n-]+)/g
  ];

  const skills: string[] = [];

  for (const pattern of skillPatterns) {
    const matches = [...text.matchAll(pattern)];
    for (const match of matches) {
      const skillText = match[1];
      // Split by common delimiters
      const splitSkills = skillText.split(/[,;|•-]/).map(s => s.trim()).filter(s => s.length > 0);
      skills.push(...splitSkills);
    }
  }

  return [...new Set(skills)].slice(0, 20); // Remove duplicates and limit
}

function extractExperience(text: string): Array<{title: string, company: string, duration: string, description: string}> {
  if (!text) return [];

  const experiences: Array<{title: string, company: string, duration: string, description: string}> = [];

  // Split by potential job entries
  const jobBlocks = text.split(/\n\s*\n/).filter(block => block.trim().length > 20);

  for (const block of jobBlocks.slice(0, 5)) { // Limit to 5 entries
    const lines = block.split('\n').filter(line => line.trim());
    if (lines.length >= 2) {
      const title = lines[0] || '';
      const company = lines[1] || '';
      const duration = extractDuration(block) || '';
      const description = lines.slice(2).join(' ') || '';

      experiences.push({ title, company, duration, description });
    }
  }

  return experiences;
}

function extractEducation(text: string): Array<{degree: string, institution: string, year: string}> {
  if (!text) return [];

  const education: Array<{degree: string, institution: string, year: string}> = [];
  const lines = text.split('\n').filter(line => line.trim());

  for (const line of lines.slice(0, 3)) { // Limit to 3 entries
    const yearMatch = line.match(/\b(19|20)\d{2}\b/);
    const year = yearMatch ? yearMatch[0] : '';

    const degree = line.split(',')[0] || line;
    const institution = line.includes(',') ? line.split(',')[1]?.trim() || '' : '';

    if (degree.trim()) {
      education.push({ degree, institution, year });
    }
  }

  return education;
}

function extractDuration(text: string): string {
  const patterns = [
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}\s*[-–—]\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}\b/i,
    /\b\d{4}\s*[-–—]\s*\d{4}\b/,
    /\b\d{4}\s*[-–—]\s*present\b/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[0];
  }

  return '';
}

async function analyzeMatch(cvText: string, jobDescription: string) {
  const cvWords = await tokenizeAndStem(cvText.toLowerCase());
  const jdWords = await tokenizeAndStem(jobDescription.toLowerCase());

  // Calculate overlap
  const cvWordSet = new Set(cvWords);
  const jdWordSet = new Set(jdWords);

  const intersection = new Set([...cvWordSet].filter(x => jdWordSet.has(x)));
  const score = Math.round((intersection.size / jdWordSet.size) * 100);

  // Find missing important keywords
  const missingKeywords = [...jdWordSet]
    .filter(word => !cvWordSet.has(word))
    .filter(word => word.length > 3)
    .slice(0, 10);

  const suggestions = generateMatchSuggestions(score, missingKeywords);

  return {
    score: Math.min(score, 95), // Cap at 95%
    missingKeywords,
    suggestions
  };
}

async function tokenizeAndStem(text: string): Promise<string[]> {
  const natural = await import('natural');
  const tokenizer = new natural.WordTokenizer();
  const words = tokenizer.tokenize(text) || [];

  return words
    .filter(word => word.length > 2)
    .map(word => natural.PorterStemmer.stem(word))
    .filter(word => !natural.stopwords.includes(word));
}

function generateMatchSuggestions(score: number, missingKeywords: string[]): string[] {
  const suggestions: string[] = [];

  if (score < 30) {
    suggestions.push("Your CV has low keyword overlap with the job description. Consider adding more relevant technical skills and experience.");
  } else if (score < 60) {
    suggestions.push("Good foundation, but you could improve keyword matching by incorporating more job-specific terms.");
  } else {
    suggestions.push("Excellent keyword alignment! Your CV matches well with the job requirements.");
  }

  if (missingKeywords.length > 0) {
    suggestions.push(`Consider adding these keywords: ${missingKeywords.slice(0, 5).join(', ')}`);
  }

  return suggestions;
}

function generateGeneralSuggestions(text: string, cvData: CVData): string[] {
  const suggestions: string[] = [];

  if (!cvData.personalInfo.email) {
    suggestions.push("Add a professional email address");
  }

  if (!cvData.personalInfo.phone) {
    suggestions.push("Include your phone number");
  }

  if (cvData.skills.length < 5) {
    suggestions.push("Add more relevant technical skills");
  }

  if (!cvData.summary) {
    suggestions.push("Include a professional summary or objective statement");
  }

  if (cvData.experience.length < 2) {
    suggestions.push("Add more work experience details");
  }

  return suggestions;
}

function calculateATSScore(text: string): number {
  let score = 0;
  const lowerText = text.toLowerCase();

  // Check for ATS-friendly elements
  if (lowerText.includes('email') || /@/.test(text)) score += 10;
  if (/\d{3}[-.]?\d{3}[-.]?\d{4}/.test(text)) score += 10;
  if (lowerText.includes('experience')) score += 10;
  if (lowerText.includes('education')) score += 10;
  if (lowerText.includes('skills')) score += 10;

  // Check for keywords
  const keywordCount = ATS_KEYWORDS.filter(keyword =>
    lowerText.includes(keyword)
  ).length;

  score += Math.min(keywordCount * 5, 40);

  return Math.min(score, 90);
}
