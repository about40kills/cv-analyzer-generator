// CV Form handling module for Node.js
const CVForm = {
  // Validate CV data
  validateCVData(cvData) {
    const errors = [];
    
    // Validate personal info
    if (!cvData.personalInfo) {
      errors.push('Personal information is required');
    } else {
      if (!cvData.personalInfo.name || cvData.personalInfo.name.trim() === '') {
        errors.push('Name is required');
      }
      if (!cvData.personalInfo.email || !this.isValidEmail(cvData.personalInfo.email)) {
        errors.push('Valid email is required');
      }
    }

    // Validate experience
    if (!cvData.experience || cvData.experience.length === 0) {
      errors.push('At least one work experience entry is required');
    } else {
      cvData.experience.forEach((exp, index) => {
        if (!exp.title || exp.title.trim() === '') {
          errors.push(`Experience ${index + 1}: Job title is required`);
        }
        if (!exp.company || exp.company.trim() === '') {
          errors.push(`Experience ${index + 1}: Company name is required`);
        }
      });
    }

    // Validate skills
    if (!cvData.skills || cvData.skills.length === 0) {
      errors.push('At least one skill is required');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },

  // Email validation helper
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Phone validation helper
  isValidPhone(phone) {
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  },

  // Sanitize CV data
  sanitizeCVData(cvData) {
    return {
      personalInfo: {
        name: this.sanitizeString(cvData.personalInfo?.name || ''),
        email: this.sanitizeString(cvData.personalInfo?.email || '').toLowerCase(),
        phone: this.sanitizeString(cvData.personalInfo?.phone || ''),
        location: this.sanitizeString(cvData.personalInfo?.location || ''),
        linkedin: this.sanitizeString(cvData.personalInfo?.linkedin || '')
      },
      summary: this.sanitizeString(cvData.summary || ''),
      experience: (cvData.experience || []).map(exp => ({
        title: this.sanitizeString(exp.title || ''),
        company: this.sanitizeString(exp.company || ''),
        duration: this.sanitizeString(exp.duration || ''),
        description: this.sanitizeString(exp.description || '')
      })),
      skills: (cvData.skills || []).map(skill => this.sanitizeString(skill)).filter(skill => skill.length > 0),
      education: (cvData.education || []).map(edu => ({
        degree: this.sanitizeString(edu.degree || ''),
        institution: this.sanitizeString(edu.institution || ''),
        year: this.sanitizeString(edu.year || '')
      }))
    };
  },

  // String sanitization helper
  sanitizeString(str) {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/[<>]/g, ''); // Basic XSS prevention
  },

  // Generate CV form template
  generateFormTemplate() {
    return {
      personalInfo: {
        name: '',
        email: '',
        phone: '',
        location: '',
        linkedin: ''
      },
      summary: '',
      experience: [
        {
          title: '',
          company: '',
          duration: '',
          description: ''
        }
      ],
      skills: [],
      education: [
        {
          degree: '',
          institution: '',
          year: ''
        }
      ]
    };
  },

  // Parse skills string to array
  parseSkills(skillsString) {
    if (!skillsString || typeof skillsString !== 'string') return [];
    
    return skillsString
      .split(/[,\n]/)
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);
  },

  // Format skills array to string
  formatSkills(skillsArray) {
    if (!Array.isArray(skillsArray)) return '';
    return skillsArray.join(', ');
  },

  // Calculate form completion percentage
  calculateCompletionPercentage(cvData) {
    let totalFields = 0;
    let completedFields = 0;

    // Personal info fields (5 fields, name and email required)
    totalFields += 5;
    if (cvData.personalInfo?.name) completedFields++;
    if (cvData.personalInfo?.email) completedFields++;
    if (cvData.personalInfo?.phone) completedFields++;
    if (cvData.personalInfo?.location) completedFields++;
    if (cvData.personalInfo?.linkedin) completedFields++;

    // Summary (1 field)
    totalFields += 1;
    if (cvData.summary && cvData.summary.length > 10) completedFields++;

    // Experience (at least 1 entry with title and company)
    totalFields += 2;
    if (cvData.experience && cvData.experience.length > 0) {
      if (cvData.experience[0].title) completedFields++;
      if (cvData.experience[0].company) completedFields++;
    }

    // Skills (at least 1 skill)
    totalFields += 1;
    if (cvData.skills && cvData.skills.length > 0) completedFields++;

    // Education (at least 1 entry with degree)
    totalFields += 1;
    if (cvData.education && cvData.education.length > 0 && cvData.education[0].degree) {
      completedFields++;
    }

    return Math.round((completedFields / totalFields) * 100);
  },

  // Get form validation suggestions
  getValidationSuggestions(cvData) {
    const suggestions = [];
    
    if (!cvData.personalInfo?.name) {
      suggestions.push('Add your full name');
    }
    
    if (!cvData.personalInfo?.email) {
      suggestions.push('Add your email address');
    }
    
    if (!cvData.personalInfo?.phone) {
      suggestions.push('Add your phone number');
    }
    
    if (!cvData.summary || cvData.summary.length < 50) {
      suggestions.push('Write a professional summary (at least 50 characters)');
    }
    
    if (!cvData.experience || cvData.experience.length === 0) {
      suggestions.push('Add your work experience');
    }
    
    if (!cvData.skills || cvData.skills.length < 3) {
      suggestions.push('Add at least 3 relevant skills');
    }
    
    if (!cvData.education || cvData.education.length === 0) {
      suggestions.push('Add your educational background');
    }
    
    return suggestions;
  },

  // Process form data for API submission
  prepareForSubmission(cvData, jobDescription = '', template = 'modern') {
    const sanitizedData = this.sanitizeCVData(cvData);
    const validation = this.validateCVData(sanitizedData);
    
    return {
      cvData: sanitizedData,
      jobDescription: this.sanitizeString(jobDescription),
      template: template,
      validation: validation,
      completionPercentage: this.calculateCompletionPercentage(sanitizedData)
    };
  }
};

module.exports = CVForm;
