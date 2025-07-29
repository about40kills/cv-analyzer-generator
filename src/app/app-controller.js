// Main application logic for Node.js CV Analyzer
const AppController = {
  // Initialize application state
  initializeApp() {
    return {
      currentStep: 'upload',
      uploadedFile: null,
      analysisResults: null,
      selectedTemplate: 'professional',
      cvData: null,
      jobDescription: '',
      isProcessing: false,
      error: null
    };
  },

  // Handle file upload step
  async handleFileUpload(file, jobDescription = '') {
    try {
      if (!file) {
        throw new Error('No file provided');
      }

      const formData = new FormData();
      formData.append('cv', file);
      formData.append('jobDescription', jobDescription);
      formData.append('template', 'professional');

      const response = await fetch('/api/analyze-cv', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Analysis failed');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Analysis failed');
      }

      return {
        success: true,
        data: result.data,
        message: result.message
      };

    } catch (error) {
      console.error('File upload error:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  },

  // Handle template selection
  async getTemplateRecommendation(jobDescription) {
    try {
      const response = await fetch('/api/recommend-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jobDescription })
      });

      if (!response.ok) {
        throw new Error('Failed to get template recommendation');
      }

      const result = await response.json();
      return result.data;

    } catch (error) {
      console.error('Template recommendation error:', error);
      return null;
    }
  },

  // Handle PDF generation
  async generatePDF(cvData, template) {
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cvData: cvData,
          template: template
        })
      });

      if (!response.ok) {
        throw new Error('PDF generation failed');
      }

      // Get PDF as blob and create download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `tailored-cv-${template}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return {
        success: true,
        message: 'PDF downloaded successfully'
      };

    } catch (error) {
      console.error('PDF generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  // Validate form data
  validateCVData(cvData) {
    const errors = [];
    
    if (!cvData.personalInfo?.name) {
      errors.push('Name is required');
    }
    
    if (!cvData.personalInfo?.email) {
      errors.push('Email is required');
    }
    
    if (!cvData.skills || cvData.skills.length === 0) {
      errors.push('At least one skill is required');
    }
    
    if (!cvData.experience || cvData.experience.length === 0) {
      errors.push('At least one experience entry is required');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },

  // Format analysis results for display
  formatAnalysisResults(analysisData) {
    return {
      personalInfo: {
        name: analysisData.personalInfo?.name || 'Not provided',
        email: analysisData.personalInfo?.email || 'Not provided',
        phone: analysisData.personalInfo?.phone || 'Not provided',
        location: analysisData.personalInfo?.location || 'Not provided',
        linkedin: analysisData.personalInfo?.linkedin || 'Not provided'
      },
      summary: analysisData.summary || 'No summary available',
      experience: analysisData.experience || [],
      skills: analysisData.skills || [],
      education: analysisData.education || [],
      jobMatch: analysisData.jobMatch || {
        matchScore: 0,
        matchingKeywords: [],
        missingKeywords: [],
        suggestions: []
      },
      insights: analysisData.insights || [],
      completenessScore: analysisData.completenessScore || 0
    };
  },

  // Calculate overall CV strength
  calculateCVStrength(analysisData) {
    let score = 0;
    let maxScore = 100;

    // Personal info completeness (20 points)
    const personalFields = ['name', 'email', 'phone'];
    const completedPersonal = personalFields.filter(field => 
      analysisData.personalInfo[field] && 
      analysisData.personalInfo[field] !== 'Not provided'
    );
    score += (completedPersonal.length / personalFields.length) * 20;

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

    return {
      score: Math.round(Math.min(score, maxScore)),
      level: this.getStrengthLevel(score),
      recommendations: this.getStrengthRecommendations(score, analysisData)
    };
  },

  // Get strength level description
  getStrengthLevel(score) {
    if (score >= 85) return { level: 'Excellent', color: 'green' };
    if (score >= 70) return { level: 'Good', color: 'blue' };
    if (score >= 50) return { level: 'Average', color: 'yellow' };
    return { level: 'Needs Improvement', color: 'red' };
  },

  // Get recommendations based on CV strength
  getStrengthRecommendations(score, analysisData) {
    const recommendations = [];

    if (score < 50) {
      recommendations.push('Your CV needs significant improvement');
      recommendations.push('Consider adding more detailed work experience');
      recommendations.push('Expand your skills section with relevant keywords');
    } else if (score < 70) {
      recommendations.push('Your CV is decent but has room for improvement');
      recommendations.push('Consider adding more specific achievements');
      recommendations.push('Enhance your professional summary');
    } else if (score < 85) {
      recommendations.push('Your CV is good with minor improvements needed');
      recommendations.push('Fine-tune your experience descriptions');
      recommendations.push('Consider adding more industry-specific keywords');
    } else {
      recommendations.push('Excellent CV! Well structured and comprehensive');
      recommendations.push('Consider tailoring it for specific job applications');
      recommendations.push('Keep it updated with your latest achievements');
    }

    return recommendations;
  },

  // Generate step-by-step workflow
  getWorkflowSteps() {
    return [
      {
        id: 'upload',
        title: 'Upload CV',
        description: 'Upload your CV file for analysis',
        icon: 'upload',
        completed: false
      },
      {
        id: 'analyze',
        title: 'AI Analysis',
        description: 'Our AI analyzes your CV content',
        icon: 'brain',
        completed: false
      },
      {
        id: 'template',
        title: 'Select Template',
        description: 'Choose the best template for your industry',
        icon: 'palette',
        completed: false
      },
      {
        id: 'generate',
        title: 'Generate PDF',
        description: 'Create your tailored CV',
        icon: 'download',
        completed: false
      }
    ];
  },

  // Update workflow step status
  updateWorkflowStep(steps, stepId, completed) {
    return steps.map(step => 
      step.id === stepId ? { ...step, completed } : step
    );
  },

  // Get next workflow step
  getNextStep(currentStep) {
    const stepOrder = ['upload', 'analyze', 'template', 'generate'];
    const currentIndex = stepOrder.indexOf(currentStep);
    return currentIndex < stepOrder.length - 1 ? 
      stepOrder[currentIndex + 1] : null;
  },

  // Handle navigation between steps
  navigateToStep(currentStep, targetStep, analysisData) {
    // Validate that user can navigate to target step
    const stepOrder = ['upload', 'analyze', 'template', 'generate'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const targetIndex = stepOrder.indexOf(targetStep);

    // Can't go to future steps without completing current requirements
    if (targetIndex > currentIndex) {
      if (targetStep === 'analyze' && !analysisData) {
        return { success: false, error: 'Please upload a CV first' };
      }
      if (targetStep === 'template' && !analysisData) {
        return { success: false, error: 'Please complete CV analysis first' };
      }
      if (targetStep === 'generate' && !analysisData) {
        return { success: false, error: 'Please complete previous steps first' };
      }
    }

    return { success: true, step: targetStep };
  }
};

module.exports = AppController;
