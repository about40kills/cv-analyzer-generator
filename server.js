const express = require('express');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const os = require('os');

// Import route handlers
const cvRoutes = require('./routes/cv');
const analyzeCV = require('./src/api/analyze-cv');
const generatePDF = require('./src/api/generate-pdf');

// Import the main app generator
const { CVAnalyzerApp } = require('./src/app/cv-analyzer-app');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));
app.use('/images', express.static('public/images'));

// Routes
app.use('/api/cv', cvRoutes);

// Main application API routes
app.use('/api/analyze-cv', analyzeCV);
app.use('/api/generate-pdf', generatePDF);

// Main application route - serve the generated CV analyzer app
app.get('/', (req, res) => {
  const appHtml = CVAnalyzerApp.generateApp({
    data: {
      activeTab: 'upload',
      uploadedFile: null,
      analysisResult: null,
      selectedTemplate: '',
      cvData: {
        personalInfo: { name: '', email: '', phone: '', location: '', linkedin: '' },
        summary: '',
        experience: [],
        skills: [],
        education: []
      }
    }
  });
  
  res.send(appHtml);
});

// Legacy route for existing index.html (keep for compatibility)
app.get('/legacy', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'public')}`);
});
