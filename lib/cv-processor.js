const natural = require('natural');
const nlp = require('compromise');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

class CVProcessor {
  constructor() {
    this.tokenizer = new natural.WordTokenizer();
    this.stemmer = natural.PorterStemmer;
  }

  async processCV(buffer) {
    try {
      // Extract text from buffer (simplified for demo)
      const text = await this.extractTextFromBuffer(buffer);
      
      // Process the extracted text
      const personalInfo = this.extractPersonalInfo(text);
      const skills = this.extractSkills(text);
      const experience = this.extractExperience(text);
      const education = this.extractEducation(text);
      const summary = this.generateSummary(text);

      return {
        personalInfo,
        summary,
        experience,
        skills,
        education,
        extractedText: text
      };
    } catch (error) {
      console.error('Error processing CV:', error);
      throw new Error('Failed to process CV');
    }
  }

  async extractTextFromBuffer(buffer) {
    // Simple text extraction - in real implementation, detect file type and use appropriate parser
    try {
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      // Fallback to treating as text
      return buffer.toString('utf8');
    }
  }

  extractPersonalInfo(text) {
    const doc = nlp(text);
    
    // Extract email
    const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    const email = emailMatch ? emailMatch[0] : '';

    // Extract phone
    const phoneMatch = text.match(/(\+?\d{1,4}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/);
    const phone = phoneMatch ? phoneMatch[0] : '';

    // Extract name (simplified)
    const people = doc.people().out('array');
    const name = people.length > 0 ? people[0] : '';

    return {
      name,
      email,
      phone,
      location: '',
      linkedin: ''
    };
  }

  extractSkills(text) {
    const commonSkills = [
      'javascript', 'python', 'java', 'react', 'node.js', 'html', 'css',
      'sql', 'git', 'docker', 'aws', 'azure', 'typescript', 'angular',
      'vue.js', 'mongodb', 'postgresql', 'mysql', 'express', 'django',
      'flask', 'spring', 'kubernetes', 'jenkins', 'ci/cd', 'agile',
      'scrum', 'rest api', 'graphql', 'microservices', 'terraform'
    ];

    const skills = [];
    const lowerText = text.toLowerCase();

    commonSkills.forEach(skill => {
      if (lowerText.includes(skill.toLowerCase())) {
        skills.push(skill);
      }
    });

    return skills;
  }

  extractExperience(text) {
    // Simplified experience extraction
    const experienceKeywords = ['experience', 'work history', 'employment', 'career'];
    const lines = text.split('\n');
    const experience = [];

    let inExperienceSection = false;
    
    for (let line of lines) {
      if (experienceKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
        inExperienceSection = true;
        continue;
      }
      
      if (inExperienceSection && line.trim()) {
        // Simple heuristic: if line contains year, it might be experience
        if (/\d{4}/.test(line)) {
          experience.push({
            title: line.trim(),
            company: '',
            duration: '',
            description: line.trim()
          });
        }
      }
    }

    return experience.slice(0, 5); // Limit to 5 entries
  }

  extractEducation(text) {
    const educationKeywords = ['education', 'degree', 'university', 'college', 'bachelor', 'master', 'phd'];
    const lines = text.split('\n');
    const education = [];

    let inEducationSection = false;
    
    for (let line of lines) {
      if (educationKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
        inEducationSection = true;
        continue;
      }
      
      if (inEducationSection && line.trim()) {
        if (/\d{4}/.test(line)) {
          education.push({
            degree: line.trim(),
            institution: '',
            year: ''
          });
        }
      }
    }

    return education.slice(0, 3); // Limit to 3 entries
  }

  generateSummary(text) {
    // Simple summary generation
    const sentences = text.split('.').filter(s => s.trim().length > 10);
    return sentences.slice(0, 2).join('. ') + '.';
  }

  async performJobMatching(cvText, jobDescription) {
    try {
      const cvTokens = this.tokenizer.tokenize(cvText.toLowerCase());
      const jobTokens = this.tokenizer.tokenize(jobDescription.toLowerCase());

      // Simple keyword matching
      const matchingKeywords = cvTokens.filter(token => jobTokens.includes(token));
      const matchScore = Math.round((matchingKeywords.length / jobTokens.length) * 100);

      const missingKeywords = jobTokens.filter(token => !cvTokens.includes(token))
        .filter((token, index, arr) => arr.indexOf(token) === index) // Remove duplicates
        .slice(0, 10); // Limit to 10

      return {
        matchScore,
        matchingKeywords: matchingKeywords.slice(0, 10),
        missingKeywords,
        suggestions: [
          'Consider adding more relevant keywords from the job description',
          'Highlight specific achievements and metrics',
          'Tailor your experience descriptions to match job requirements'
        ]
      };
    } catch (error) {
      console.error('Error performing job matching:', error);
      throw new Error('Failed to perform job matching');
    }
  }
}

module.exports = CVProcessor;