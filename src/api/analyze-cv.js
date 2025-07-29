const express = require('express');
const multer = require('multer');
const CVProcessor = require('../../lib/cv-processor');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const os = require('os');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Create temporary directories
const tempDir = path.join(os.tmpdir(), 'cv-analyzer');
const pdfDir = path.join(tempDir, 'pdfs');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

// CV Analysis API endpoint
router.post('/', upload.single('cv'), async (req, res) => {
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

    // Format response for main app compatibility
    const formattedResult = {
      matchScore: result.analysis?.atsScore || 0,
      extractedData: {
        personalInfo: {
          name: result.personalInfo?.name || '',
          email: result.personalInfo?.email || '',
          phone: result.personalInfo?.phone || '',
          location: result.personalInfo?.location || '',
          linkedin: result.personalInfo?.linkedin || ''
        },
        summary: result.summary || '',
        experience: result.experience || [],
        skills: result.skills || [],
        education: result.education || []
      },
      suggestions: result.suggestions || [],
      missingKeywords: result.analysis?.missingKeywords || []
    };

    res.json(formattedResult);
  } catch (error) {
    console.error('CV Analysis Error:', error);
    res.status(500).json({ error: 'Failed to analyze CV' });
  }
});

module.exports = router;
