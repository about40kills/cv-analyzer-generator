// CV Analysis module for Node.js
const CVAnalysis = {
  // Format analysis results for display
  formatAnalysisResult(analysisData) {
    return {
      personalInfo: this.formatPersonalInfo(analysisData.personalInfo),
      summary: this.formatSummary(analysisData.summary),
      experience: this.formatExperience(analysisData.experience),
      skills: this.formatSkills(analysisData.skills),
      education: this.formatEducation(analysisData.education),
      jobMatch: this.formatJobMatch(analysisData.jobMatch)
    };
  },

  formatPersonalInfo(personalInfo) {
    if (!personalInfo) return {};
    
    return {
      name: personalInfo.name || 'Not provided',
      email: personalInfo.email || 'Not provided',
      phone: personalInfo.phone || 'Not provided',
      location: personalInfo.location || 'Not provided',
      linkedin: personalInfo.linkedin || 'Not provided'
    };
  },

  formatSummary(summary) {
    if (!summary || summary.trim() === '') {
      return 'No summary available. Consider adding a professional summary to your CV.';
    }
    return summary;
  },

  formatExperience(experience) {
    if (!experience || !Array.isArray(experience) || experience.length === 0) {
      return [{
        title: 'No experience found',
        company: 'Please ensure your CV includes work experience',
        duration: '',
        description: 'Add your work history with job titles, companies, and descriptions'
      }];
    }

    return experience.map(exp => ({
      title: exp.title || 'Position not specified',
      company: exp.company || 'Company not specified',
      duration: exp.duration || 'Duration not specified',
      description: exp.description || 'No description available'
    }));
  },

  formatSkills(skills) {
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return ['No skills detected', 'Please add a skills section to your CV'];
    }

    // Remove duplicates and filter out empty strings
    const uniqueSkills = [...new Set(skills.filter(skill => skill && skill.trim() !== ''))];
    
    return uniqueSkills.length > 0 ? uniqueSkills : ['No skills detected'];
  },

  formatEducation(education) {
    if (!education || !Array.isArray(education) || education.length === 0) {
      return [{
        degree: 'No education found',
        institution: 'Please add your educational background',
        year: ''
      }];
    }

    return education.map(edu => ({
      degree: edu.degree || 'Degree not specified',
      institution: edu.institution || 'Institution not specified',
      year: edu.year || 'Year not specified'
    }));
  },

  formatJobMatch(jobMatch) {
    if (!jobMatch) {
      return {
        matchScore: 0,
        matchingKeywords: [],
        missingKeywords: [],
        suggestions: ['Upload a job description to get matching analysis']
      };
    }

    return {
      matchScore: jobMatch.matchScore || 0,
      matchingKeywords: jobMatch.matchingKeywords || [],
      missingKeywords: jobMatch.missingKeywords || [],
      suggestions: jobMatch.suggestions || []
    };
  },

  // Generate analysis insights
  generateInsights(analysisData) {
    const insights = [];
    const { personalInfo, skills, experience, education, jobMatch } = analysisData;

    // Personal info completeness
    const personalInfoFields = ['name', 'email', 'phone'];
    const missingPersonalInfo = personalInfoFields.filter(field => 
      !personalInfo[field] || personalInfo[field] === 'Not provided'
    );
    
    if (missingPersonalInfo.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Incomplete Contact Information',
        message: `Missing: ${missingPersonalInfo.join(', ')}. Complete contact info is essential.`
      });
    }

    // Skills analysis
    if (!skills || skills.length < 5) {
      insights.push({
        type: 'suggestion',
        title: 'Expand Your Skills Section',
        message: 'Consider adding more relevant skills to improve your CV\'s impact.'
      });
    }

    // Experience analysis
    if (!experience || experience.length === 0) {
      insights.push({
        type: 'critical',
        title: 'No Work Experience Found',
        message: 'Add your work experience to make your CV more compelling.'
      });
    }

    // Job match analysis
    if (jobMatch && jobMatch.matchScore < 50) {
      insights.push({
        type: 'improvement',
        title: 'Low Job Match Score',
        message: 'Consider tailoring your CV more closely to the job requirements.'
      });
    }

    return insights;
  },

  // Calculate CV completeness score
  calculateCompletenessScore(analysisData) {
    let score = 0;
    const maxScore = 100;

    // Personal info (20 points)
    const personalInfoFields = ['name', 'email', 'phone'];
    const completedPersonalFields = personalInfoFields.filter(field => 
      analysisData.personalInfo[field] && analysisData.personalInfo[field] !== 'Not provided'
    );
    score += (completedPersonalFields.length / personalInfoFields.length) * 20;

    // Summary (15 points)
    if (analysisData.summary && analysisData.summary.length > 50) {
      score += 15;
    }

    // Experience (30 points)
    if (analysisData.experience && analysisData.experience.length > 0) {
      score += Math.min(analysisData.experience.length * 10, 30);
    }

    // Skills (20 points)
    if (analysisData.skills && analysisData.skills.length > 0) {
      score += Math.min(analysisData.skills.length * 2, 20);
    }

    // Education (15 points)
    if (analysisData.education && analysisData.education.length > 0) {
      score += Math.min(analysisData.education.length * 7.5, 15);
    }

    return Math.round(Math.min(score, maxScore));
  }
};

module.exports = CVAnalysis;
