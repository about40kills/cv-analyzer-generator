import { NextRequest, NextResponse } from "next/server";

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
  "leadership",
  "management",
  "project management",
  "team leadership",
  "communication",
  "collaboration",
  "problem solving",
  "analytical",
  "strategic",
  "innovative",
  "results-driven",
  "data analysis",
  "software development",
  "programming",
  "database",
  "cloud",
  "agile",
  "scrum",
  "devops",
  "machine learning",
  "artificial intelligence",
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("cv") as File;
    const jobDescription = (formData.get("jobDescription") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Extract text based on file type
    let extractedText = "";

    if (file.type === "application/pdf") {
      const pdfParse = (await import("pdf-parse")).default;
      const buffer = await file.arrayBuffer();
      const data = await pdfParse(Buffer.from(buffer));
      extractedText = data.text;
    } else if (file.type.includes("word")) {
      const mammoth = await import("mammoth");
      const buffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({
        buffer: Buffer.from(buffer),
      });
      extractedText = result.value;
    } else if (file.type.includes("image")) {
      // Use OCR for images
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng");

      const buffer = await file.arrayBuffer();
      const {
        data: { text },
      } = await worker.recognize(Buffer.from(buffer));
      extractedText = text;
      await worker.terminate();
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from file" },
        { status: 400 }
      );
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
      missingKeywords,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("CV Analysis Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze CV" },
      { status: 500 }
    );
  }
}

function parseCV(text: string): CVData {
  const lines = text.split("\n").filter((line) => line.trim());

  // Extract email (including from hyperlinks)
  const emailMatch = text.match(/[\w\.-]+@[\w\.-]+\.\w{2,}/i);
  const email = emailMatch ? emailMatch[0] : "";

  // Extract phone
  const phoneMatch = text.match(/[\+]?[(]?[\d\s\-\(\)]{10,}[)]?/);
  const phone = phoneMatch ? phoneMatch[0].trim() : "";

  // Extract LinkedIn (including from hyperlinks)
  const linkedinMatch = text.match(
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w\-]+/i
  );
  const linkedin = linkedinMatch ? linkedinMatch[0] : "";

  // Extract name (assume first non-empty line is name)
  const name = lines[0] || "";

  // Extract skills - look for skills section
  const skillsSection = extractSection(text, [
    "skills",
    "technical skills",
    "core competencies",
  ]);
  const skills = extractSkills(skillsSection);

  // Extract experience
  const experienceSection = extractSection(text, [
    "experience",
    "work experience",
    "employment",
    "professional experience",
  ]);
  const experience = extractExperience(experienceSection);

  // Extract education
  const educationSection = extractSection(text, [
    "education",
    "academic background",
  ]);
  const education = extractEducation(educationSection);

  // Extract summary/objective - get all lines, not just first
  const summarySection = extractSection(text, [
    "summary",
    "objective",
    "profile",
    "about",
  ]);
  const summary = summarySection
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join(" ")
    .trim();

  return {
    personalInfo: {
      name,
      email,
      phone,
      location: "", // Could be enhanced to extract location
      linkedin,
    },
    summary,
    experience,
    skills,
    education,
  };
}

function extractSection(text: string, keywords: string[]): string {
  const lines = text.split("\n");

  for (const keyword of keywords) {
    const keywordLower = keyword.toLowerCase();

    // Find the line that contains the keyword
    for (let i = 0; i < lines.length; i++) {
      const lineLower = lines[i].toLowerCase().trim();

      // Check if this line is a section header
      if (
        lineLower === keywordLower ||
        lineLower.startsWith(keywordLower + ":") ||
        lineLower.startsWith(keywordLower + " ") ||
        (lineLower.includes(keywordLower) && lines[i].trim().length < 50)
      ) {
        // Extract all lines until the next section
        const sectionLines: string[] = [];

        for (let j = i + 1; j < lines.length; j++) {
          const currentLine = lines[j].trim();
          const currentLineLower = currentLine.toLowerCase();

          // Stop immediately if we hit references/referees section
          if (
            /^(references?|referees?)$/i.test(currentLine) ||
            /^(references?|referees?)\s*:/i.test(currentLine) ||
            currentLineLower.includes("available upon request") ||
            currentLineLower.includes("references available")
          ) {
            break;
          }

          // Check if we hit another major section
          const isNewSection =
            /^(personal|contact|summary|objective|profile|experience|work|employment|education|skills|technical|certifications?|projects?|awards?|languages?|interests?|hobbies?|publications?|volunteer)$/i.test(
              currentLine
            );

          if (isNewSection && currentLine.length < 50) {
            break;
          }

          sectionLines.push(lines[j]);
        }

        return sectionLines.join("\n");
      }
    }
  }

  return "";
}

function extractSkills(text: string): string[] {
  if (!text) return [];

  const skills: string[] = [];
  const lines = text.split("\n");

  for (const line of lines) {
    const trimmedLine = line.trim();
    const lowerLine = trimmedLine.toLowerCase();

    if (trimmedLine.length === 0) continue;

    // Stop immediately if we hit references or referees section
    if (
      /^(references?|referees?)$/i.test(trimmedLine) ||
      /^(references?|referees?)\s*:/i.test(trimmedLine) ||
      lowerLine.includes("available upon request") ||
      lowerLine.includes("references available") ||
      lowerLine.includes("referees available")
    ) {
      break;
    }

    // Stop if we hit other non-skill sections
    if (
      /^(interests?|hobbies?|publications?|volunteer|awards?|certifications?)/i.test(
        trimmedLine
      )
    ) {
      break;
    }

    // Remove bullet points and common prefixes
    let cleanLine = trimmedLine
      .replace(/^[•\-\*\+]\s*/, "")
      .replace(/^skills?[:\-]?\s*/i, "")
      .replace(/^technologies?[:\-]?\s*/i, "")
      .replace(/^tools?[:\-]?\s*/i, "");

    // Split by common delimiters
    const splitSkills = cleanLine
      .split(/[,;|•]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 1 && s.length < 60) // Reasonable skill name length
      .filter(
        (s) =>
          !/^(and|or|the|with|using|including|available|upon|request|referees?)$/i.test(
            s
          )
      ); // Filter common words

    skills.push(...splitSkills);
  }

  // Remove duplicates and limit
  return [...new Set(skills)].slice(0, 30);
}

function extractExperience(text: string): Array<{
  title: string;
  company: string;
  duration: string;
  description: string;
}> {
  if (!text) return [];

  const experiences: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }> = [];

  const lines = text.split("\n");
  let currentJob: any = null;
  let descriptionLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lowerLine = line.toLowerCase();

    if (line.length === 0) continue;

    // Stop if we hit references section
    if (
      /^(references?|referees?)$/i.test(line) ||
      /^(references?|referees?)\s*:/i.test(line) ||
      lowerLine.includes("available upon request") ||
      lowerLine.includes("references available")
    ) {
      break;
    }

    // Check if this line contains a date pattern
    const duration = extractDuration(line);

    // Check if line looks like a job title (not a bullet point, reasonable length)
    const looksLikeTitle =
      line.length > 5 &&
      line.length < 100 &&
      !line.startsWith("-") &&
      !line.startsWith("•") &&
      !line.startsWith("*");

    // Start new job entry if we find a duration or potential title
    if (duration || looksLikeTitle) {
      // Save previous job if exists
      if (currentJob && currentJob.title) {
        currentJob.description = descriptionLines
          .map((l) => l.replace(/^[•\-\*]\s*/, ""))
          .join(" ")
          .trim();
        experiences.push(currentJob);

        if (experiences.length >= 5) break;
      }

      // Initialize new job entry
      currentJob = {
        title: "",
        company: "",
        duration: "",
        description: "",
      };
      descriptionLines = [];

      // Parse current line
      if (duration) {
        // Line has date - extract title and company
        currentJob.duration = duration;
        let remaining = line.replace(duration, "").trim();

        // Remove common separators
        remaining = remaining
          .replace(/^[\-–—|,]\s*/, "")
          .replace(/[\-–—|,]\s*$/, "");

        // Try to split by common patterns
        const parts = remaining.split(/\s*[\|@]\s*|\s*,\s*(?=[A-Z])/);

        if (parts.length >= 2) {
          currentJob.title = parts[0].trim();
          currentJob.company = parts[1].trim();
        } else if (parts.length === 1 && parts[0]) {
          // Might be title or company, assume title
          currentJob.title = parts[0].trim();
        }
      } else {
        // No date on this line - likely just the title
        currentJob.title = line;
      }

      // Look ahead for company and/or duration if not found yet
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();

        if (
          nextLine.length > 0 &&
          !nextLine.startsWith("-") &&
          !nextLine.startsWith("•")
        ) {
          const nextDuration = extractDuration(nextLine);

          if (nextDuration && !currentJob.duration) {
            // Next line has the duration
            currentJob.duration = nextDuration;
            let remaining = nextLine.replace(nextDuration, "").trim();
            remaining = remaining
              .replace(/^[\-–—|,]\s*/, "")
              .replace(/[\-–—|,]\s*$/, "");

            if (remaining && !currentJob.company) {
              currentJob.company = remaining;
            }
            i++; // Skip next line
          } else if (!currentJob.company && nextLine.length < 100) {
            // Next line is likely the company
            currentJob.company = nextLine;
            i++; // Skip next line

            // Check line after that for duration
            if (i + 1 < lines.length && !currentJob.duration) {
              const thirdLine = lines[i + 1].trim();
              const thirdDuration = extractDuration(thirdLine);
              if (thirdDuration) {
                currentJob.duration = thirdDuration;
                i++; // Skip this line too
              }
            }
          }
        }
      }
    } else if (currentJob) {
      // This is a description line
      descriptionLines.push(line);
    }
  }

  // Save last job
  if (currentJob && currentJob.title) {
    currentJob.description = descriptionLines
      .map((l) => l.replace(/^[•\-\*]\s*/, ""))
      .join(" ")
      .trim();
    experiences.push(currentJob);
  }

  return experiences.slice(0, 5);
}

function extractEducation(
  text: string
): Array<{ degree: string; institution: string; year: string }> {
  if (!text) return [];

  const education: Array<{
    degree: string;
    institution: string;
    year: string;
  }> = [];

  const lines = text.split("\n");
  let currentEdu: any = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lowerLine = line.toLowerCase();

    if (line.length === 0) continue;

    // Stop if we hit references section
    if (
      /^(references?|referees?)$/i.test(line) ||
      /^(references?|referees?)\s*:/i.test(line) ||
      lowerLine.includes("available upon request") ||
      lowerLine.includes("references available")
    ) {
      break;
    }

    // Check if line contains a year (graduation year)
    const yearMatch = line.match(/\b(19|20)\d{2}\b/);

    // Check if line looks like a degree (substantial text, not a bullet)
    const looksLikeDegree =
      line.length > 5 &&
      !line.startsWith("-") &&
      !line.startsWith("•") &&
      !line.startsWith("*");

    if (looksLikeDegree) {
      // Save previous entry
      if (currentEdu && currentEdu.degree) {
        education.push(currentEdu);
        if (education.length >= 3) break;
      }

      // Start new entry
      currentEdu = {
        degree: "",
        institution: "",
        year: "",
      };

      // Extract year from current line if present
      if (yearMatch) {
        currentEdu.year = yearMatch[0];
        // Remove year from line for cleaner parsing
        const lineWithoutYear = line.replace(yearMatch[0], "").trim();

        // Try to split by common separators
        const parts = lineWithoutYear
          .split(/\s*[\|@,]\s*/)
          .map((p) => p.trim())
          .filter((p) => p && p.length > 1);

        if (parts.length >= 2) {
          // First part is degree, second is institution
          currentEdu.degree = parts[0];
          currentEdu.institution = parts[1];
        } else if (parts.length === 1) {
          currentEdu.degree = parts[0];
        }
      } else {
        // No year on this line
        const parts = line
          .split(/\s*[\|@,]\s*/)
          .map((p) => p.trim())
          .filter((p) => p && p.length > 1);

        if (parts.length >= 2) {
          currentEdu.degree = parts[0];
          currentEdu.institution = parts[1];
        } else {
          currentEdu.degree = line;
        }
      }

      // Look ahead for missing information
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();

        if (nextLine.length > 0 && nextLine.length < 150) {
          const nextYearMatch = nextLine.match(/\b(19|20)\d{2}\b/);

          // If we don't have institution yet and next line doesn't start with bullet
          if (
            !currentEdu.institution &&
            !nextLine.startsWith("-") &&
            !nextLine.startsWith("•")
          ) {
            if (nextYearMatch && !currentEdu.year) {
              // Next line has year and possibly institution
              currentEdu.year = nextYearMatch[0];
              const remaining = nextLine.replace(nextYearMatch[0], "").trim();
              if (remaining) {
                currentEdu.institution = remaining
                  .replace(/^[\-–—|,]\s*/, "")
                  .replace(/[\-–—|,]\s*$/, "");
              }
              i++;
            } else if (!nextYearMatch) {
              // Next line is likely institution
              currentEdu.institution = nextLine;
              i++;

              // Check line after that for year
              if (i + 1 < lines.length && !currentEdu.year) {
                const thirdLine = lines[i + 1].trim();
                const thirdYearMatch = thirdLine.match(/\b(19|20)\d{2}\b/);
                if (thirdYearMatch) {
                  currentEdu.year = thirdYearMatch[0];
                  i++;
                }
              }
            }
          } else if (!currentEdu.year && nextYearMatch) {
            // We have degree and institution, just need year
            currentEdu.year = nextYearMatch[0];
            i++;
          }
        }
      }
    }
  }

  // Save last entry
  if (currentEdu && currentEdu.degree) {
    education.push(currentEdu);
  }

  return education.slice(0, 3);
}

function extractDuration(text: string): string {
  const patterns = [
    // Full month format: Jan 2020 - Dec 2023
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}\s*[-–—to]\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}\b/i,
    // Full month to present: Jan 2020 - Present
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}\s*[-–—to]\s*present\b/i,
    // Year only: 2020 - 2023
    /\b\d{4}\s*[-–—to]\s*\d{4}\b/,
    // Year to present: 2020 - Present
    /\b\d{4}\s*[-–—to]\s*present\b/i,
    // Month/Year format: 01/2020 - 12/2023
    /\b\d{1,2}\/\d{4}\s*[-–—to]\s*\d{1,2}\/\d{4}\b/,
    // Month/Year to present: 01/2020 - Present
    /\b\d{1,2}\/\d{4}\s*[-–—to]\s*present\b/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[0];
  }

  return "";
}

async function analyzeMatch(cvText: string, jobDescription: string) {
  const cvWords = await tokenizeAndStem(cvText.toLowerCase());
  const jdWords = await tokenizeAndStem(jobDescription.toLowerCase());

  // Calculate overlap
  const cvWordSet = new Set(cvWords);
  const jdWordSet = new Set(jdWords);

  const intersection = new Set([...cvWordSet].filter((x) => jdWordSet.has(x)));
  const score = Math.round((intersection.size / jdWordSet.size) * 100);

  // Find missing important keywords
  const missingKeywords = [...jdWordSet]
    .filter((word) => !cvWordSet.has(word))
    .filter((word) => word.length > 3)
    .slice(0, 10);

  const suggestions = generateMatchSuggestions(score, missingKeywords);

  return {
    score: Math.min(score, 95), // Cap at 95%
    missingKeywords,
    suggestions,
  };
}

async function tokenizeAndStem(text: string): Promise<string[]> {
  const natural = await import("natural");
  const tokenizer = new natural.WordTokenizer();
  const words = tokenizer.tokenize(text) || [];

  return words
    .filter((word) => word.length > 2)
    .map((word) => natural.PorterStemmer.stem(word))
    .filter((word) => !natural.stopwords.includes(word));
}

function generateMatchSuggestions(
  score: number,
  missingKeywords: string[]
): string[] {
  const suggestions: string[] = [];

  if (score < 30) {
    suggestions.push(
      "Your CV has low keyword overlap with the job description. Consider adding more relevant technical skills and experience."
    );
  } else if (score < 60) {
    suggestions.push(
      "Good foundation, but you could improve keyword matching by incorporating more job-specific terms."
    );
  } else {
    suggestions.push(
      "Excellent keyword alignment! Your CV matches well with the job requirements."
    );
  }

  if (missingKeywords.length > 0) {
    suggestions.push(
      `Consider adding these keywords: ${missingKeywords
        .slice(0, 5)
        .join(", ")}`
    );
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
  if (lowerText.includes("email") || /@/.test(text)) score += 10;
  if (/\d{3}[-.]?\d{3}[-.]?\d{4}/.test(text)) score += 10;
  if (lowerText.includes("experience")) score += 10;
  if (lowerText.includes("education")) score += 10;
  if (lowerText.includes("skills")) score += 10;

  // Check for keywords
  const keywordCount = ATS_KEYWORDS.filter((keyword) =>
    lowerText.includes(keyword)
  ).length;

  score += Math.min(keywordCount * 5, 40);

  return Math.min(score, 90);
}
