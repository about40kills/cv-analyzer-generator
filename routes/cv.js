const express = require('express');
const multer = require('multer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const os = require('os');
const CVProcessor = require('../lib/cv-processor');

// Import our new JavaScript modules
const CVAnalysis = require('../src/components/cv-analysis');
const CVForm = require('../src/components/cv-form');
const FileUpload = require('../src/components/file-upload');
const TemplateSelector = require('../src/components/template-selector');
const Utils = require('../src/lib/utils');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Create temporary directories
const tempDir = path.join(os.tmpdir(), 'cv-analyzer');
const pdfDir = path.join(tempDir, 'pdfs');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

// Process CV with enhanced analysis
router.post('/analyze-cv', upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(
        Utils.createErrorResponse('No file uploaded', 'NO_FILE')
      );
    }

    // Validate uploaded file
    const fileValidation = FileUpload.validateFile(req.file);
    if (!fileValidation.isValid) {
      return res.status(400).json(
        Utils.createErrorResponse(fileValidation.errors.join(', '), 'INVALID_FILE')
      );
    }

    const { jobTitle, jobDescription, template } = req.body;
    
    // Validate template
    const templateValidation = TemplateSelector.validateTemplate(template);
    const selectedTemplate = templateValidation.isValid ? 
      templateValidation.template : 
      TemplateSelector.getTemplate('professional');

    // Process CV using our enhanced processor
    const processor = new CVProcessor();
    const cvData = await processor.processCV(req.file.buffer);

    // Perform job matching if job description provided
    let jobMatch = null;
    if (jobDescription && jobDescription.trim()) {
      jobMatch = await processor.performJobMatching(cvData.extractedText, jobDescription);
    }

    // Format analysis results
    const analysisResult = CVAnalysis.formatAnalysisResult({
      personalInfo: cvData.personalInfo,
      summary: cvData.summary,
      experience: cvData.experience,
      skills: cvData.skills,
      education: cvData.education,
      jobMatch: jobMatch
    });

    // Generate insights and completeness score
    const insights = CVAnalysis.generateInsights(analysisResult);
    const completenessScore = CVAnalysis.calculateCompletenessScore(analysisResult);

    const response = Utils.createSuccessResponse({
      ...analysisResult,
      insights: insights,
      completenessScore: completenessScore,
      fileInfo: FileUpload.getFileInfo(req.file),
      selectedTemplate: selectedTemplate,
      extractedText: cvData.extractedText
    }, 'CV analyzed successfully');

    res.json(response);

  } catch (error) {
    console.error('CV processing error:', error);
    res.status(500).json(
      Utils.createErrorResponse('Failed to process CV', 'PROCESSING_ERROR', error.message)
    );
  }
});

// Match CV with job description
router.post('/match-job', async (req, res) => {
  try {
    const { cvText, jobDescription } = req.body;
    
    if (!cvText || !jobDescription) {
      return res.status(400).json(
        Utils.createErrorResponse('CV text and job description are required', 'MISSING_DATA')
      );
    }

    const processor = new CVProcessor();
    const matchResult = await processor.performJobMatching(cvText, jobDescription);
    
    res.json(Utils.createSuccessResponse(matchResult, 'Job matching completed'));
  } catch (error) {
    console.error('Job matching error:', error);
    res.status(500).json(
      Utils.createErrorResponse('Failed to match job', 'MATCHING_ERROR', error.message)
    );
  }
});

// Generate ATS-optimized PDF
router.post('/generate-pdf', async (req, res) => {
  try {
    const { cvData, template } = req.body;
    
    if (!cvData) {
      return res.status(400).json(
        Utils.createErrorResponse('CV data is required', 'MISSING_DATA')
      );
    }

    // Validate template
    const selectedTemplate = template || 'professional';
    const templateConfig = TemplateSelector.getTemplateConfig(selectedTemplate);

    // Generate PDF
    const pdfPath = await generatePDF(cvData, templateConfig);
    
    // Send PDF as download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="tailored-cv.pdf"');
    
    const pdfBuffer = fs.readFileSync(pdfPath);
    res.send(pdfBuffer);

    // Clean up temp file
    setTimeout(() => {
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath);
      }
    }, 5000);

  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json(
      Utils.createErrorResponse('Failed to generate PDF', 'PDF_ERROR', error.message)
    );
  }
});

// Get available templates
router.get('/templates', (req, res) => {
  try {
    const templates = TemplateSelector.getAllTemplates();
    res.json(Utils.createSuccessResponse(templates, 'Templates retrieved successfully'));
  } catch (error) {
    console.error('Template retrieval error:', error);
    res.status(500).json(
      Utils.createErrorResponse('Failed to retrieve templates', 'TEMPLATE_ERROR', error.message)
    );
  }
});

// Get template recommendation
router.post('/recommend-template', (req, res) => {
  try {
    const { jobDescription } = req.body;
    
    const recommendedTemplate = TemplateSelector.recommendTemplate(jobDescription);
    
    res.json(Utils.createSuccessResponse({
      recommended: recommendedTemplate,
      alternatives: TemplateSelector.getAllTemplates().filter(t => t.id !== recommendedTemplate.id)
    }, 'Template recommendation generated'));
  } catch (error) {
    console.error('Template recommendation error:', error);
    res.status(500).json(
      Utils.createErrorResponse('Failed to recommend template', 'RECOMMENDATION_ERROR', error.message)
    );
  }
});

// Generate ATS-optimized PDF
async function generatePDF(cvData, templateConfig) {
  const doc = new PDFDocument({ 
    size: 'A4', 
    margins: { top: 50, bottom: 50, left: 50, right: 50 }
  });
  
  const filename = `cv-${Utils.generateId()}.pdf`;
  const pdfPath = path.join(pdfDir, filename);
  const writeStream = fs.createWriteStream(pdfPath);
  doc.pipe(writeStream);
  
  // Add content sections based on template
  let yPosition = 50;
  
  // Header with personal info
  yPosition = addPersonalInfo(doc, cvData.personalInfo, templateConfig, yPosition);
  
  // Add sections in template order
  const sections = templateConfig.sections || ['summary', 'experience', 'skills', 'education'];
  
  for (const section of sections) {
    switch (section) {
      case 'summary':
        if (cvData.summary) {
          yPosition = addSection(doc, 'Summary', cvData.summary, templateConfig, yPosition);
        }
        break;
      case 'experience':
        if (cvData.experience && cvData.experience.length > 0) {
          yPosition = addExperienceSection(doc, cvData.experience, templateConfig, yPosition);
        }
        break;
      case 'skills':
        if (cvData.skills && cvData.skills.length > 0) {
          yPosition = addSkillsSection(doc, cvData.skills, templateConfig, yPosition);
        }
        break;
      case 'education':
        if (cvData.education && cvData.education.length > 0) {
          yPosition = addEducationSection(doc, cvData.education, templateConfig, yPosition);
        }
        break;
    }
  }
  
  doc.end();
  
  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => resolve(pdfPath));
    writeStream.on('error', reject);
  });
}

// Helper functions for PDF generation
function addPersonalInfo(doc, personalInfo, templateConfig, yPosition) {
  const fonts = templateConfig.fonts;
  const colors = templateConfig.colors;
  
  // Name
  doc.font(fonts.heading).fontSize(24).fillColor(colors.primary);
  doc.text(personalInfo.name || 'Name Not Provided', 50, yPosition);
  yPosition += 35;
  
  // Contact info
  doc.font(fonts.body).fontSize(10).fillColor(colors.secondary);
  const contactInfo = [];
  if (personalInfo.email) contactInfo.push(`Email: ${personalInfo.email}`);
  if (personalInfo.phone) contactInfo.push(`Phone: ${personalInfo.phone}`);
  if (personalInfo.location) contactInfo.push(`Location: ${personalInfo.location}`);
  if (personalInfo.linkedin) contactInfo.push(`LinkedIn: ${personalInfo.linkedin}`);
  
  doc.text(contactInfo.join(' | '), 50, yPosition);
  yPosition += 30;
  
  return yPosition;
}

function addSection(doc, title, content, templateConfig, yPosition) {
  const fonts = templateConfig.fonts;
  const colors = templateConfig.colors;
  const spacing = templateConfig.spacing;
  
  // Section title
  doc.font(fonts.heading).fontSize(14).fillColor(colors.primary);
  doc.text(title, 50, yPosition);
  yPosition += spacing.section;
  
  // Section content
  doc.font(fonts.body).fontSize(10).fillColor('#000000');
  doc.text(content, 50, yPosition, { width: 500, align: 'justify' });
  yPosition += spacing.section + 10;
  
  return yPosition;
}

function addExperienceSection(doc, experience, templateConfig, yPosition) {
  const fonts = templateConfig.fonts;
  const colors = templateConfig.colors;
  const spacing = templateConfig.spacing;
  
  // Section title
  doc.font(fonts.heading).fontSize(14).fillColor(colors.primary);
  doc.text('Experience', 50, yPosition);
  yPosition += spacing.section;
  
  experience.forEach(exp => {
    // Job title and company
    doc.font(fonts.heading).fontSize(11).fillColor('#000000');
    doc.text(`${exp.title} - ${exp.company}`, 50, yPosition);
    yPosition += 15;
    
    // Duration
    if (exp.duration) {
      doc.font(fonts.accent).fontSize(9).fillColor(colors.secondary);
      doc.text(exp.duration, 50, yPosition);
      yPosition += 12;
    }
    
    // Description
    if (exp.description) {
      doc.font(fonts.body).fontSize(9).fillColor('#000000');
      doc.text(exp.description, 50, yPosition, { width: 500 });
      yPosition += 20;
    }
    
    yPosition += 10;
  });
  
  return yPosition;
}

function addSkillsSection(doc, skills, templateConfig, yPosition) {
  const fonts = templateConfig.fonts;
  const colors = templateConfig.colors;
  const spacing = templateConfig.spacing;
  
  // Section title
  doc.font(fonts.heading).fontSize(14).fillColor(colors.primary);
  doc.text('Skills', 50, yPosition);
  yPosition += spacing.section;
  
  // Skills content
  doc.font(fonts.body).fontSize(10).fillColor('#000000');
  doc.text(skills.join(' • '), 50, yPosition, { width: 500 });
  yPosition += spacing.section;
  
  return yPosition;
}

function addEducationSection(doc, education, templateConfig, yPosition) {
  const fonts = templateConfig.fonts;
  const colors = templateConfig.colors;
  const spacing = templateConfig.spacing;
  
  // Section title
  doc.font(fonts.heading).fontSize(14).fillColor(colors.primary);
  doc.text('Education', 50, yPosition);
  yPosition += spacing.section;
  
  education.forEach(edu => {
    // Degree
    doc.font(fonts.heading).fontSize(11).fillColor('#000000');
    doc.text(edu.degree, 50, yPosition);
    yPosition += 15;
    
    // Institution and year
    doc.font(fonts.body).fontSize(9).fillColor(colors.secondary);
    const eduInfo = [];
    if (edu.institution) eduInfo.push(edu.institution);
    if (edu.year) eduInfo.push(edu.year);
    doc.text(eduInfo.join(' - '), 50, yPosition);
    yPosition += 20;
  });
  
  return yPosition;
}

// Direct API routes for main application compatibility
router.post('/analyze-cv', upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const jobDescription = req.body.jobDescription || '';
    
    // Use existing CV processing logic
    const processor = new CVProcessor();
    const result = await processor.processCV({
      buffer: req.file.buffer,
      mimetype: req.file.mimetype,
      originalname: req.file.originalname
    }, {
      jobDescription,
      extractText: true,
      analyzeMatch: true,
      generateInsights: true
    });

    res.json(result);
  } catch (error) {
    console.error('CV Analysis Error:', error);
    res.status(500).json({ error: 'Failed to analyze CV' });
  }
});

router.post('/generate-pdf', upload.none(), (req, res) => {
  try {
    const { name, email, phone, location, summary, template = 'modern' } = req.body;
    
    // Create PDF
    const doc = new PDFDocument();
    const filename = `cv-${Date.now()}.pdf`;
    const filepath = path.join(pdfDir, filename);
    
    doc.pipe(fs.createWriteStream(filepath));
    
    // Generate CV content
    doc.fontSize(20).text(name || 'Your Name', 50, 50);
    doc.fontSize(12).text(email || '', 50, 80);
    doc.fontSize(12).text(phone || '', 50, 100);
    doc.fontSize(12).text(location || '', 50, 120);
    
    if (summary) {
      doc.fontSize(14).text('Professional Summary', 50, 160);
      doc.fontSize(10).text(summary, 50, 180, { width: 500 });
    }
    
    doc.end();
    
    // Send PDF after it's created
    doc.on('end', () => {
      res.download(filepath, 'optimized-cv.pdf', (err) => {
        if (err) {
          console.error('Download error:', err);
          res.status(500).json({ error: 'Failed to download PDF' });
        }
        // Clean up file
        fs.unlink(filepath, () => {});
      });
    });
    
  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

module.exports = router;