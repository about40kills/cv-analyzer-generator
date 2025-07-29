const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const natural = require('natural');
const nlp = require('compromise');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const os = require('os');
const CVProcessor = require('../lib/cv-processor');

// Create temporary directories
const tempDir = path.join(os.tmpdir(), 'cv-analyzer');
const pdfDir = path.join(tempDir, 'pdfs');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });



// CV templates
const cvTemplates = {
  professional: {
    name: 'Professional',
    description: 'Clean and formal template suitable for corporate positions',
    style: 'modern'
  },
  creative: {
    name: 'Creative',
    description: 'Colorful and modern template for creative industries',
    style: 'colorful'
  },
  minimal: {
    name: 'Minimal',
    description: 'Simple and clean template focusing on content',
    style: 'minimal'
  },
  executive: {
    name: 'Executive',
    description: 'Premium template for senior positions',
    style: 'premium'
  }
};

// Process CV with enhanced analysis
router.post('/process', upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Initialize CV processor
    const cvProcessor = new CVProcessor();
    
    // Process CV with Node.js backend
    const cvData = await cvProcessor.processCV(req.file.buffer);
    
    // Combine results
    const result = {
      ...cvData,
      templates: cvTemplates
    };

    res.json(result);
  } catch (error) {
    console.error('CV processing error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Match CV with job description
router.post('/match-job', async (req, res) => {
  try {
    const { cvText, jobDescription } = req.body;
    
    if (!cvText || !jobDescription) {
      return res.status(400).json({ error: 'CV text and job description are required' });
    }

    const cvProcessor = new CVProcessor();
    const matchResult = await cvProcessor.performJobMatching(cvText, jobDescription);
    res.json(matchResult);
  } catch (error) {
    console.error('Job matching error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate ATS-optimized PDF
router.post('/generate-pdf', async (req, res) => {
  try {
    const { cvData, template, jobDescription } = req.body;
    
    if (!cvData || !template) {
      return res.status(400).json({ error: 'CV data and template are required' });
    }

    const pdfPath = await generateATSPDF(cvData, template, jobDescription);
    res.json({ 
      success: true, 
      pdfUrl: `/cv/pdf/${path.basename(pdfPath)}`,
      filename: path.basename(pdfPath)
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve generated PDFs
router.get('/pdf/:filename', (req, res) => {
  const filename = req.params.filename;
  const pdfPath = path.join(pdfDir, filename);
  
  if (fs.existsSync(pdfPath)) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.sendFile(pdfPath);
  } else {
    res.status(404).send('PDF not found');
  }
});



// Generate ATS-optimized PDF
async function generateATSPDF(cvData, template, jobDescription) {
  const doc = new PDFDocument({ 
    size: 'A4', 
    margins: { top: 50, bottom: 50, left: 50, right: 50 }
  });
  
  const filename = `cv-${Date.now()}.pdf`;
  const pdfPath = path.join(pdfDir, filename);
  const writeStream = fs.createWriteStream(pdfPath);
  doc.pipe(writeStream);
  
  // Apply template styling
  applyTemplateStyling(doc, template);
  
  // Add content
  addCVContent(doc, cvData, jobDescription);
  
  doc.end();
  
  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => resolve(pdfPath));
    writeStream.on('error', reject);
  });
}

// Apply template styling
function applyTemplateStyling(doc, template) {
  switch (template) {
    case 'professional':
      doc.font('Helvetica-Bold').fontSize(24);
      break;
    case 'creative':
      doc.font('Helvetica').fontSize(22);
      break;
    case 'minimal':
      doc.font('Helvetica').fontSize(20);
      break;
    case 'executive':
      doc.font('Times-Bold').fontSize(26);
      break;
    default:
      doc.font('Helvetica').fontSize(22);
  }
}

// Add CV content to PDF
function addCVContent(doc, cvData, jobDescription) {
  let yPosition = 50;
  
  // Header
  doc.fontSize(24).text(cvData.personalInfo.name, 50, yPosition);
  yPosition += 40;
  
  doc.fontSize(12).text(`Email: ${cvData.personalInfo.email}`, 50, yPosition);
  yPosition += 20;
  doc.text(`Phone: ${cvData.personalInfo.phone}`, 50, yPosition);
  yPosition += 40;
  
  // Skills
  if (cvData.skills && cvData.skills.length > 0) {
    doc.fontSize(16).text('Skills', 50, yPosition);
    yPosition += 25;
    doc.fontSize(12).text(cvData.skills.join(', '), 50, yPosition);
    yPosition += 40;
  }
  
  // Experience
  if (cvData.experience && cvData.experience.length > 0) {
    doc.fontSize(16).text('Experience', 50, yPosition);
    yPosition += 25;
    cvData.experience.forEach(exp => {
      doc.fontSize(12).text(exp, 50, yPosition);
      yPosition += 20;
    });
    yPosition += 20;
  }
  
  // Education
  if (cvData.education && cvData.education.length > 0) {
    doc.fontSize(16).text('Education', 50, yPosition);
    yPosition += 25;
    cvData.education.forEach(edu => {
      doc.fontSize(12).text(edu, 50, yPosition);
      yPosition += 20;
    });
  }
  
  // Job matching info
  if (jobDescription) {
    yPosition += 40;
    doc.fontSize(16).text('Job Match Analysis', 50, yPosition);
    yPosition += 25;
    doc.fontSize(12).text(`Match Score: ${cvData.matchScore || 'N/A'}%`, 50, yPosition);
  }
}

module.exports = router; 