const Tesseract = require('tesseract.js');
const Jimp = require('jimp');
const natural = require('natural');
const nlp = require('compromise');
const path = require('path');
const fs = require('fs');

class CVProcessor {
  constructor() {
    // Initialize NLP tools
    this.tokenizer = new natural.WordTokenizer();
    this.tfidf = new natural.TfIdf();
    
    // CV-related keywords for detection
    this.cvKeywords = [
      'experience', 'education', 'skills', 'projects', 'certificates', 'awards',
      'resume', 'curriculum vitae', 'objective', 'summary', 'work history',
      'cv', 'employment', 'contact', 'referees', 'qualifications', 'achievements'
    ];
    
    // CV scoring criteria
    this.scoringCriteria = {
      'experience': 30,
      'education': 20,
      'skills': 25,
      'contact': 10,
      'achievements': 15,
    };
    
    // Common skills keywords
    this.skillKeywords = [
      'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'mongodb',
      'aws', 'docker', 'kubernetes', 'git', 'agile', 'scrum', 'leadership',
      'project management', 'data analysis', 'machine learning', 'ai',
      'html', 'css', 'typescript', 'angular', 'vue', 'php', 'c#', 'c++',
      'ruby', 'go', 'rust', 'swift', 'kotlin', 'scala', 'r', 'matlab',
      'tableau', 'powerbi', 'excel', 'word', 'powerpoint', 'photoshop',
      'illustrator', 'figma', 'sketch', 'invision', 'zeplin'
    ];
  }

  async preprocessImage(imageBuffer) {
    try {
      // Load image with Jimp
      const image = await Jimp.read(imageBuffer);
      
      // Resize for better OCR - scale up small images
      const width = image.getWidth();
      const height = image.getHeight();
      
      if (width < 1000 || height < 1000) {
        const scaleFactor = Math.max(1000 / width, 1000 / height, 2.0);
        const newWidth = Math.round(width * scaleFactor);
        const newHeight = Math.round(height * scaleFactor);
        image.resize(newWidth, newHeight, Jimp.RESIZE_BICUBIC);
      }
      
      // Convert to grayscale
      image.grayscale();
      
      // Enhance contrast
      image.contrast(0.2);
      
      // Apply threshold for better text recognition
      image.threshold({ max: 128 });
      
      // Get buffer for OCR
      return await image.getBufferAsync(Jimp.MIME_PNG);
    } catch (error) {
      console.error('Image preprocessing error:', error);
      throw new Error(`Image preprocessing failed: ${error.message}`);
    }
  }

  async extractText(imageBuffer) {
    try {
      // Preprocess the image
      const processedImageBuffer = await this.preprocessImage(imageBuffer);
      
      // Perform OCR with Tesseract.js
      const result = await Tesseract.recognize(
        processedImageBuffer,
        'eng',
        {
          logger: m => console.log(m),
          errorHandler: err => console.error(err)
        }
      );
      
      const text = result.data.text;
      console.log(`Extracted text length: ${text.length}`);
      console.log(`Text sample: ${text.substring(0, 200)}`);
      
      return this.cleanExtractedText(text);
    } catch (error) {
      console.error('OCR error:', error);
      throw new Error(`OCR failed: ${error.message}`);
    }
  }

  cleanExtractedText(text) {
    if (!text) return "";
    
    // Remove excessive whitespace
    const lines = text.split('\n');
    const cleanedLines = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        // Remove multiple spaces
        const cleanedLine = trimmedLine.replace(/\s+/g, ' ');
        cleanedLines.push(cleanedLine);
      }
    }
    
    return cleanedLines.join('\n');
  }

  isCV(text) {
    const textLower = text.toLowerCase();
    const keywordMatches = this.cvKeywords.filter(keyword => 
      textLower.includes(keyword)
    ).length;
    
    return keywordMatches >= 3;
  }

  scoreCV(text) {
    const doc = nlp(text.toLowerCase());
    
    // Define section keywords
    const sections = {
      'education': ['education', 'degree', 'university', 'school', 'college',
                    'phd', 'bachelor', 'master', 'diploma', 'certificate'],
      'experience': ['experience', 'work', 'role', 'position', 'employment',
                     'job', 'intern', 'employment', 'career', 'professional'],
      'skills': ['skills', 'technical', 'proficiency', 'programming', 'languages', 
                 'expertise', 'competencies', 'capabilities'],
      'contact': ['contact', 'email', 'phone', 'address', 'location', 'linkedin', 
                  'github', 'portfolio', 'website'],
      'achievements': ['achievements', 'awards', 'accomplishments', 'projects', 
                      'certifications', 'honors', 'recognition']
    };

    let score = 0;
    const sectionScores = {};

    for (const [section, keywords] of Object.entries(sections)) {
      // Check for keyword presence
      const sectionPresent = keywords.some(keyword => 
        text.toLowerCase().includes(keyword)
      );
      
      if (sectionPresent) {
        score += this.scoringCriteria[section];
      }

      sectionScores[section] = {
        present: sectionPresent,
        score: this.scoringCriteria[section] || 0
      };
    }

    return {
      totalScore: score,
      maxPossibleScore: Object.values(this.scoringCriteria).reduce((a, b) => a + b, 0),
      sections: sectionScores
    };
  }

  async performEnhancedAnalysis(text) {
    const doc = nlp(text);
    
    // Extract key information
    const analysis = {
      personalInfo: this.extractPersonalInfo(doc),
      skills: this.extractSkills(doc),
      experience: this.extractExperience(doc),
      education: this.extractEducation(doc),
      keywords: this.extractKeywords(doc),
      suggestions: this.generateSuggestions(doc)
    };

    return analysis;
  }

  extractPersonalInfo(doc) {
    const people = doc.people().out('array');
    const emails = doc.emails().out('array');
    const phones = doc.phoneNumbers().out('array');
    
    return {
      name: people[0] || 'Not found',
      email: emails[0] || 'Not found',
      phone: phones[0] || 'Not found'
    };
  }

  extractSkills(doc) {
    const text = doc.text().toLowerCase();
    const foundSkills = this.skillKeywords.filter(skill => 
      text.includes(skill.toLowerCase())
    );
    
    return foundSkills;
  }

  extractExperience(doc) {
    const sentences = doc.sentences().out('array');
    const experienceKeywords = ['experience', 'worked', 'job', 'position', 'role', 'employment'];
    
    const experienceSentences = sentences.filter(sentence => 
      experienceKeywords.some(keyword => 
        sentence.toLowerCase().includes(keyword)
      )
    );
    
    return experienceSentences.slice(0, 5); // Return top 5 experience sentences
  }

  extractEducation(doc) {
    const sentences = doc.sentences().out('array');
    const educationKeywords = ['university', 'college', 'degree', 'bachelor', 'master', 'phd', 'school'];
    
    const educationSentences = sentences.filter(sentence => 
      educationKeywords.some(keyword => 
        sentence.toLowerCase().includes(keyword)
      )
    );
    
    return educationSentences.slice(0, 3); // Return top 3 education sentences
  }

  extractKeywords(doc) {
    const text = doc.text();
    const tokens = this.tokenizer.tokenize(text.toLowerCase());
    
    // Remove common stop words
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const filteredTokens = tokens.filter(token => 
      token.length > 3 && !stopWords.includes(token)
    );
    
    // Calculate TF-IDF
    this.tfidf.addDocument(filteredTokens);
    const keywords = this.tfidf.listTerms(0).slice(0, 10).map(item => item.term);
    
    return keywords;
  }

  generateSuggestions(doc) {
    const suggestions = [];
    const text = doc.text().toLowerCase();
    
    if (!text.includes('experience')) {
      suggestions.push('Add work experience section');
    }
    
    if (!text.includes('education')) {
      suggestions.push('Add education section');
    }
    
    if (!text.includes('skills')) {
      suggestions.push('Add skills section');
    }
    
    if (!text.includes('@') && !text.includes('email')) {
      suggestions.push('Add contact information');
    }
    
    if (text.length < 500) {
      suggestions.push('Consider adding more details to your CV');
    }
    
    return suggestions;
  }

  async performJobMatching(cvText, jobDescription) {
    const cvTokens = this.tokenizer.tokenize(cvText.toLowerCase());
    const jobTokens = this.tokenizer.tokenize(jobDescription.toLowerCase());
    
    // Calculate keyword overlap
    const cvSet = new Set(cvTokens);
    const jobSet = new Set(jobTokens);
    
    const intersection = new Set([...cvSet].filter(x => jobSet.has(x)));
    const union = new Set([...cvSet, ...jobSet]);
    
    const matchScore = (intersection.size / union.size) * 100;
    
    // Find missing keywords
    const missingKeywords = [...jobSet].filter(keyword => !cvSet.has(keyword));
    
    return {
      matchScore: Math.round(matchScore),
      matchingKeywords: Array.from(intersection),
      missingKeywords: missingKeywords.slice(0, 10),
      suggestions: this.generateJobSuggestions(missingKeywords)
    };
  }

  generateJobSuggestions(missingKeywords) {
    const suggestions = [];
    
    if (missingKeywords.length > 0) {
      suggestions.push(`Add these keywords to your CV: ${missingKeywords.slice(0, 5).join(', ')}`);
    }
    
    suggestions.push('Tailor your experience descriptions to match the job requirements');
    suggestions.push('Highlight relevant achievements and metrics');
    suggestions.push('Use action verbs to describe your responsibilities');
    
    return suggestions;
  }

  async processCV(imageBuffer) {
    try {
      // Extract text from image
      const text = await this.extractText(imageBuffer);
      
      // Check if it's a CV
      const isCV = this.isCV(text);
      const score = isCV ? this.scoreCV(text) : null;
      
      // Perform enhanced analysis
      const enhancedAnalysis = await this.performEnhancedAnalysis(text);
      
      return {
        isCV,
        text,
        score,
        enhancedAnalysis
      };
    } catch (error) {
      console.error('CV processing error:', error);
      throw error;
    }
  }
}

module.exports = CVProcessor; 