// Template Selector module for Node.js
const TemplateSelector = {
  // Available CV templates
  templates: {
    professional: {
      id: 'professional',
      name: 'Professional & Clean',
      description: 'Perfect for corporate environments and traditional industries',
      features: ['Clean typography', 'Professional layout', 'ATS-friendly', 'Contact sidebar'],
      category: 'business',
      popularity: 'high',
      suitableFor: ['corporate', 'finance', 'consulting', 'legal', 'healthcare'],
      colors: {
        primary: '#2c3e50',
        secondary: '#3498db',
        accent: '#27ae60'
      },
      layout: {
        columns: 2,
        header: 'center',
        sidebar: 'left'
      }
    },
    modern: {
      id: 'modern',
      name: 'Modern Tech',
      description: 'Ideal for tech professionals and creative roles',
      features: ['Contemporary design', 'Skills visualization', 'Project highlights', 'Tech-focused'],
      category: 'technology',
      popularity: 'high',
      suitableFor: ['software', 'engineering', 'data science', 'product management', 'startup'],
      colors: {
        primary: '#34495e',
        secondary: '#e74c3c',
        accent: '#f39c12'
      },
      layout: {
        columns: 2,
        header: 'full-width',
        sidebar: 'right'
      }
    },
    creative: {
      id: 'creative',
      name: 'Creative & Bold',
      description: 'Stand out in creative industries with this eye-catching design',
      features: ['Bold colors', 'Creative sections', 'Portfolio space', 'Visual appeal'],
      category: 'creative',
      popularity: 'medium',
      suitableFor: ['design', 'marketing', 'advertising', 'media', 'arts'],
      colors: {
        primary: '#8e44ad',
        secondary: '#e67e22',
        accent: '#2ecc71'
      },
      layout: {
        columns: 1,
        header: 'creative',
        sidebar: 'none'
      }
    },
    minimal: {
      id: 'minimal',
      name: 'Minimal & Elegant',
      description: 'Clean and simple design that focuses on content',
      features: ['Minimalist design', 'Typography focus', 'Clean lines', 'Elegant spacing'],
      category: 'minimalist',
      popularity: 'medium',
      suitableFor: ['academia', 'research', 'writing', 'consulting', 'executive'],
      colors: {
        primary: '#2c3e50',
        secondary: '#95a5a6',
        accent: '#3498db'
      },
      layout: {
        columns: 1,
        header: 'simple',
        sidebar: 'none'
      }
    },
    executive: {
      id: 'executive',
      name: 'Executive Leadership',
      description: 'Professional template for senior-level positions',
      features: ['Executive layout', 'Achievement focus', 'Leadership emphasis', 'Premium feel'],
      category: 'executive',
      popularity: 'medium',
      suitableFor: ['executive', 'management', 'director', 'c-level', 'board'],
      colors: {
        primary: '#2c3e50',
        secondary: '#34495e',
        accent: '#27ae60'
      },
      layout: {
        columns: 2,
        header: 'executive',
        sidebar: 'left'
      }
    }
  },

  // Get template by ID
  getTemplate(templateId) {
    return this.templates[templateId] || this.templates.professional;
  },

  // Get all templates
  getAllTemplates() {
    return Object.values(this.templates);
  },

  // Filter templates by category
  getTemplatesByCategory(category) {
    return Object.values(this.templates).filter(template => 
      template.category === category
    );
  },

  // Get templates suitable for specific industries
  getTemplatesByIndustry(industry) {
    return Object.values(this.templates).filter(template =>
      template.suitableFor.includes(industry.toLowerCase())
    );
  },

  // Recommend template based on job description
  recommendTemplate(jobDescription) {
    if (!jobDescription || typeof jobDescription !== 'string') {
      return this.templates.professional;
    }

    const jobLower = jobDescription.toLowerCase();
    
    // Tech/Engineering keywords
    if (jobLower.includes('software') || jobLower.includes('developer') || 
        jobLower.includes('engineer') || jobLower.includes('programmer') ||
        jobLower.includes('data scientist') || jobLower.includes('product manager')) {
      return this.templates.modern;
    }

    // Creative keywords
    if (jobLower.includes('design') || jobLower.includes('creative') ||
        jobLower.includes('marketing') || jobLower.includes('brand') ||
        jobLower.includes('advertising') || jobLower.includes('artist')) {
      return this.templates.creative;
    }

    // Executive keywords
    if (jobLower.includes('director') || jobLower.includes('executive') ||
        jobLower.includes('manager') || jobLower.includes('lead') ||
        jobLower.includes('head of') || jobLower.includes('chief')) {
      return this.templates.executive;
    }

    // Academic/Research keywords
    if (jobLower.includes('research') || jobLower.includes('academic') ||
        jobLower.includes('professor') || jobLower.includes('scientist') ||
        jobLower.includes('analyst')) {
      return this.templates.minimal;
    }

    // Default to professional
    return this.templates.professional;
  },

  // Validate template selection
  validateTemplate(templateId) {
    if (!templateId || typeof templateId !== 'string') {
      return {
        isValid: false,
        error: 'Template ID is required',
        defaultTemplate: 'professional'
      };
    }

    if (!this.templates[templateId]) {
      return {
        isValid: false,
        error: `Template '${templateId}' not found`,
        defaultTemplate: 'professional'
      };
    }

    return {
      isValid: true,
      template: this.templates[templateId]
    };
  },

  // Get template configuration for PDF generation
  getTemplateConfig(templateId) {
    const template = this.getTemplate(templateId);
    
    return {
      id: template.id,
      name: template.name,
      colors: template.colors,
      layout: template.layout,
      fonts: this.getTemplateFonts(templateId),
      spacing: this.getTemplateSpacing(templateId),
      sections: this.getTemplateSections(templateId)
    };
  },

  // Get fonts for template
  getTemplateFonts(templateId) {
    const fontMappings = {
      professional: {
        heading: 'Helvetica-Bold',
        body: 'Helvetica',
        accent: 'Helvetica-Oblique'
      },
      modern: {
        heading: 'Times-Bold',
        body: 'Times-Roman',
        accent: 'Times-Italic'
      },
      creative: {
        heading: 'Helvetica-Bold',
        body: 'Helvetica',
        accent: 'Helvetica-BoldOblique'
      },
      minimal: {
        heading: 'Times-Bold',
        body: 'Times-Roman',
        accent: 'Times-Italic'
      },
      executive: {
        heading: 'Helvetica-Bold',
        body: 'Helvetica',
        accent: 'Helvetica-Oblique'
      }
    };

    return fontMappings[templateId] || fontMappings.professional;
  },

  // Get spacing configuration for template
  getTemplateSpacing(templateId) {
    const spacingMappings = {
      professional: { section: 20, paragraph: 12, line: 14 },
      modern: { section: 25, paragraph: 15, line: 16 },
      creative: { section: 30, paragraph: 18, line: 18 },
      minimal: { section: 15, paragraph: 10, line: 12 },
      executive: { section: 22, paragraph: 14, line: 15 }
    };

    return spacingMappings[templateId] || spacingMappings.professional;
  },

  // Get section order for template
  getTemplateSections(templateId) {
    const sectionMappings = {
      professional: ['personalInfo', 'summary', 'experience', 'skills', 'education'],
      modern: ['personalInfo', 'skills', 'experience', 'summary', 'education'],
      creative: ['personalInfo', 'summary', 'skills', 'experience', 'education'],
      minimal: ['personalInfo', 'summary', 'experience', 'education', 'skills'],
      executive: ['personalInfo', 'summary', 'experience', 'skills', 'education']
    };

    return sectionMappings[templateId] || sectionMappings.professional;
  },

  // Get template preview info
  getTemplatePreview(templateId) {
    const template = this.getTemplate(templateId);
    
    return {
      id: template.id,
      name: template.name,
      description: template.description,
      features: template.features,
      previewUrl: `/templates/preview-${template.id}.png`,
      category: template.category,
      popularity: template.popularity
    };
  }
};

module.exports = TemplateSelector;
