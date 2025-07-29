const express = require('express');
const multer = require('multer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const os = require('os');

const router = express.Router();
const upload = multer();

// Create temporary directories
const tempDir = path.join(os.tmpdir(), 'cv-analyzer');
const pdfDir = path.join(tempDir, 'pdfs');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

// PDF Generation API endpoint
router.post('/', upload.none(), (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      location, 
      linkedin,
      summary, 
      template = 'professional',
      experience,
      skills,
      education
    } = req.body;

    // Parse arrays if they come as strings
    const parseArray = (field) => {
      if (Array.isArray(field)) return field;
      if (typeof field === 'string') {
        try {
          return JSON.parse(field);
        } catch {
          return field.split(',').map(s => s.trim()).filter(Boolean);
        }
      }
      return [];
    };

    const cvData = {
      personalInfo: {
        name: name || 'Your Name',
        email: email || '',
        phone: phone || '',
        location: location || '',
        linkedin: linkedin || ''
      },
      summary: summary || '',
      experience: parseArray(experience),
      skills: parseArray(skills),
      education: parseArray(education)
    };
    
    // Create PDF
    const doc = new PDFDocument({ 
      size: 'A4', 
      margin: 50,
      info: {
        Title: `${cvData.personalInfo.name} - CV`,
        Author: cvData.personalInfo.name,
        Subject: 'Curriculum Vitae'
      }
    });
    
    const filename = `cv-${Date.now()}.pdf`;
    const filepath = path.join(pdfDir, filename);
    
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);
    
    // Generate PDF based on template
    switch (template.toLowerCase()) {
      case 'modern':
        generateModernTemplate(doc, cvData);
        break;
      case 'creative':
        generateCreativeTemplate(doc, cvData);
        break;
      case 'minimalist':
      case 'minimal':
        generateMinimalistTemplate(doc, cvData);
        break;
      case 'executive':
        generateExecutiveTemplate(doc, cvData);
        break;
      case 'professional':
      default:
        generateProfessionalTemplate(doc, cvData);
        break;
    }
    
    doc.end();
    
    // Send PDF after it's created
    stream.on('finish', () => {
      res.download(filepath, `${cvData.personalInfo.name.replace(/\s+/g, '_')}_${template}.pdf`, (err) => {
        if (err) {
          console.error('Download error:', err);
          res.status(500).json({ error: 'Failed to download PDF' });
        }
        // Clean up file after a delay
        setTimeout(() => {
          fs.unlink(filepath, () => {});
        }, 5000);
      });
    });
    
    stream.on('error', (err) => {
      console.error('PDF creation error:', err);
      res.status(500).json({ error: 'Failed to create PDF' });
    });
    
  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Professional Template (two-column layout)
function generateProfessionalTemplate(doc, cvData) {
  const pageWidth = doc.page.width - 100;
  const leftColumnWidth = 180;
  const rightColumnWidth = pageWidth - leftColumnWidth - 20;

  // Header with name
  doc.fontSize(24)
     .font('Helvetica-Bold')
     .fillColor('#2c3e50')
     .text(cvData.personalInfo.name, 50, 50);

  // Contact info in left column
  let yPos = 100;
  doc.fontSize(10)
     .font('Helvetica')
     .fillColor('#34495e');

  const contactInfo = [
    { label: 'Email', value: cvData.personalInfo.email },
    { label: 'Phone', value: cvData.personalInfo.phone },
    { label: 'Location', value: cvData.personalInfo.location },
    { label: 'LinkedIn', value: cvData.personalInfo.linkedin }
  ].filter(item => item.value);

  contactInfo.forEach(item => {
    doc.text(`${item.label}: ${item.value}`, 50, yPos);
    yPos += 15;
  });

  // Skills section in left column
  if (cvData.skills.length > 0) {
    yPos += 20;
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text('SKILLS', 50, yPos);

    yPos += 20;
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor('#34495e');

    cvData.skills.forEach(skill => {
      doc.text(`• ${skill}`, 50, yPos, { width: leftColumnWidth });
      yPos += 12;
    });
  }

  // Main content in right column
  const rightColumnX = 50 + leftColumnWidth + 20;
  let rightYPos = 100;

  // Professional Summary
  if (cvData.summary) {
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text('PROFESSIONAL SUMMARY', rightColumnX, rightYPos);

    rightYPos += 20;
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#34495e')
       .text(cvData.summary, rightColumnX, rightYPos, { width: rightColumnWidth });

    rightYPos += doc.heightOfString(cvData.summary, { width: rightColumnWidth }) + 20;
  }

  // Work Experience
  if (cvData.experience.length > 0) {
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text('WORK EXPERIENCE', rightColumnX, rightYPos);

    rightYPos += 20;

    cvData.experience.forEach(exp => {
      if (rightYPos > 700) {
        doc.addPage();
        rightYPos = 50;
      }

      const title = typeof exp === 'string' ? exp : exp.title || '';
      const company = typeof exp === 'object' ? exp.company || '' : '';
      const duration = typeof exp === 'object' ? exp.duration || '' : '';
      const description = typeof exp === 'object' ? exp.description || '' : '';

      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor('#2c3e50')
         .text(title, rightColumnX, rightYPos);

      rightYPos += 15;
      if (company || duration) {
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor('#7f8c8d')
           .text(`${company}${company && duration ? ' | ' : ''}${duration}`, rightColumnX, rightYPos);
        rightYPos += 15;
      }

      if (description) {
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor('#34495e')
           .text(description, rightColumnX, rightYPos, { width: rightColumnWidth });
        rightYPos += doc.heightOfString(description, { width: rightColumnWidth }) + 10;
      }
      rightYPos += 10;
    });
  }

  // Education
  if (cvData.education.length > 0) {
    rightYPos += 10;
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text('EDUCATION', rightColumnX, rightYPos);

    rightYPos += 20;

    cvData.education.forEach(edu => {
      if (rightYPos > 720) {
        doc.addPage();
        rightYPos = 50;
      }

      const degree = typeof edu === 'string' ? edu : edu.degree || '';
      const institution = typeof edu === 'object' ? edu.institution || '' : '';
      const year = typeof edu === 'object' ? edu.year || '' : '';

      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor('#2c3e50')
         .text(degree, rightColumnX, rightYPos);

      rightYPos += 12;
      if (institution || year) {
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor('#7f8c8d')
           .text(`${institution}${institution && year ? ' | ' : ''}${year}`, rightColumnX, rightYPos);
        rightYPos += 15;
      }
    });
  }
}

// Modern Template (colorful header)
function generateModernTemplate(doc, cvData) {
  // Header with colored background
  doc.rect(0, 0, doc.page.width, 120)
     .fill('#6c5ce7');

  // Name in header
  doc.fontSize(28)
     .font('Helvetica-Bold')
     .fillColor('white')
     .text(cvData.personalInfo.name, 50, 40);

  // Contact info in header
  const contactY = 80;
  doc.fontSize(10)
     .font('Helvetica')
     .fillColor('white');

  const contactInfo = [
    cvData.personalInfo.email,
    cvData.personalInfo.phone,
    cvData.personalInfo.location,
    cvData.personalInfo.linkedin
  ].filter(Boolean).join(' | ');

  doc.text(contactInfo, 50, contactY);

  // Main content
  let yPos = 150;

  // Professional Summary
  if (cvData.summary) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#2d3436')
       .text('Professional Summary', 50, yPos);

    yPos += 25;
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#636e72')
       .text(cvData.summary, 50, yPos, { width: 500 });

    yPos += doc.heightOfString(cvData.summary, { width: 500 }) + 30;
  }

  // Skills with visual emphasis
  if (cvData.skills.length > 0) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#2d3436')
       .text('Technical Skills', 50, yPos);

    yPos += 25;

    cvData.skills.slice(0, 8).forEach(skill => {
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#636e72')
         .text(`• ${skill}`, 50, yPos);
      yPos += 15;
    });

    yPos += 20;
  }

  // Experience
  if (cvData.experience.length > 0) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#2d3436')
       .text('Work Experience', 50, yPos);

    yPos += 25;

    cvData.experience.forEach(exp => {
      if (yPos > 700) {
        doc.addPage();
        yPos = 50;
      }

      const title = typeof exp === 'string' ? exp : exp.title || '';
      const company = typeof exp === 'object' ? exp.company || '' : '';
      const duration = typeof exp === 'object' ? exp.duration || '' : '';
      const description = typeof exp === 'object' ? exp.description || '' : '';

      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#6c5ce7')
         .text(title, 50, yPos);

      yPos += 15;
      if (company || duration) {
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#636e72')
           .text(`${company}${company && duration ? ' | ' : ''}${duration}`, 50, yPos);
        yPos += 15;
      }

      if (description) {
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor('#2d3436')
           .text(description, 50, yPos, { width: 495 });
        yPos += doc.heightOfString(description, { width: 495 }) + 15;
      }
      yPos += 10;
    });
  }

  // Education
  if (cvData.education.length > 0) {
    if (yPos > 650) {
      doc.addPage();
      yPos = 50;
    }

    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#2d3436')
       .text('Education', 50, yPos);

    yPos += 25;

    cvData.education.forEach(edu => {
      const degree = typeof edu === 'string' ? edu : edu.degree || '';
      const institution = typeof edu === 'object' ? edu.institution || '' : '';
      const year = typeof edu === 'object' ? edu.year || '' : '';

      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor('#6c5ce7')
         .text(degree, 50, yPos);

      yPos += 15;
      if (institution || year) {
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor('#636e72')
           .text(`${institution}${institution && year ? ' | ' : ''}${year}`, 50, yPos);
        yPos += 20;
      }
    });
  }
}

// Minimalist Template (clean and simple)
function generateMinimalistTemplate(doc, cvData) {
  let yPos = 50;

  // Name
  doc.fontSize(32)
     .font('Helvetica-Light')
     .fillColor('#2c3e50')
     .text(cvData.personalInfo.name, 50, yPos);

  yPos += 50;

  // Contact info in a line
  doc.fontSize(10)
     .font('Helvetica')
     .fillColor('#7f8c8d');

  const contactInfo = [
    cvData.personalInfo.email,
    cvData.personalInfo.phone,
    cvData.personalInfo.location
  ].filter(Boolean).join('  •  ');

  doc.text(contactInfo, 50, yPos);
  yPos += 40;

  // Thin line
  doc.moveTo(50, yPos)
     .lineTo(545, yPos)
     .stroke('#ecf0f1');
  yPos += 30;

  // Summary
  if (cvData.summary) {
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#2c3e50')
       .text(cvData.summary, 50, yPos, { width: 495 });

    yPos += doc.heightOfString(cvData.summary, { width: 495 }) + 30;
  }

  // Experience
  if (cvData.experience.length > 0) {
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text('Experience', 50, yPos);

    yPos += 25;

    cvData.experience.forEach(exp => {
      if (yPos > 700) {
        doc.addPage();
        yPos = 50;
      }

      const title = typeof exp === 'string' ? exp : exp.title || '';
      const company = typeof exp === 'object' ? exp.company || '' : '';
      const duration = typeof exp === 'object' ? exp.duration || '' : '';
      const description = typeof exp === 'object' ? exp.description || '' : '';

      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor('#2c3e50')
         .text(title, 50, yPos);

      yPos += 15;
      if (company || duration) {
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor('#7f8c8d')
           .text(`${company}${company && duration ? ' | ' : ''}${duration}`, 50, yPos);
        yPos += 15;
      }

      if (description) {
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor('#34495e')
           .text(description, 50, yPos, { width: 495 });
        yPos += doc.heightOfString(description, { width: 495 }) + 15;
      }
      yPos += 10;
    });
  }

  // Skills and Education side by side
  const leftColumnY = yPos + 20;

  // Skills
  if (cvData.skills.length > 0) {
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text('Skills', 50, leftColumnY);

    let skillY = leftColumnY + 20;
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor('#34495e');

    cvData.skills.forEach(skill => {
      doc.text(`• ${skill}`, 50, skillY);
      skillY += 12;
    });
  }

  // Education
  if (cvData.education.length > 0) {
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text('Education', 300, leftColumnY);

    let eduY = leftColumnY + 20;
    cvData.education.forEach(edu => {
      const degree = typeof edu === 'string' ? edu : edu.degree || '';
      const institution = typeof edu === 'object' ? edu.institution || '' : '';
      const year = typeof edu === 'object' ? edu.year || '' : '';

      doc.fontSize(9)
         .font('Helvetica')
         .fillColor('#34495e')
         .text(degree, 300, eduY);
      eduY += 12;
      if (institution || year) {
        doc.text(`${institution}${institution && year ? ' | ' : ''}${year}`, 300, eduY);
        eduY += 15;
      }
    });
  }
}

// Creative Template (with visual elements)
function generateCreativeTemplate(doc, cvData) {
  // Creative header with shapes
  doc.circle(100, 100, 50)
     .fill('#ff6b6b');

  doc.rect(200, 50, 100, 100)
     .fill('#4ecdc4');

  // Name overlaid
  doc.fontSize(24)
     .font('Helvetica-Bold')
     .fillColor('white')
     .text(cvData.personalInfo.name, 200, 90);

  let yPos = 180;

  // Contact with creative styling
  doc.fontSize(10)
     .font('Helvetica')
     .fillColor('#2c3e50');

  const contactItems = [
    { icon: '✉', text: cvData.personalInfo.email },
    { icon: '📞', text: cvData.personalInfo.phone },
    { icon: '📍', text: cvData.personalInfo.location },
    { icon: '💼', text: cvData.personalInfo.linkedin }
  ].filter(item => item.text);

  contactItems.forEach(item => {
    doc.text(`${item.icon} ${item.text}`, 50, yPos);
    yPos += 15;
  });

  yPos += 20;

  // Continue with professional structure but with creative touches
  generateProfessionalTemplate(doc, cvData);
}

// Executive Template (formal and centered)
function generateExecutiveTemplate(doc, cvData) {
  let yPos = 50;

  // Centered header
  doc.fontSize(28)
     .font('Helvetica-Bold')
     .fillColor('#1a1a1a')
     .text(cvData.personalInfo.name, 0, yPos, { align: 'center', width: doc.page.width });

  yPos += 40;

  // Contact info centered
  doc.fontSize(10)
     .font('Helvetica')
     .fillColor('#4a4a4a');

  const contactInfo = [
    cvData.personalInfo.email,
    cvData.personalInfo.phone,
    cvData.personalInfo.location
  ].filter(Boolean).join('  |  ');

  doc.text(contactInfo, 0, yPos, { align: 'center', width: doc.page.width });
  yPos += 30;

  // Professional line
  doc.moveTo(100, yPos)
     .lineTo(495, yPos)
     .lineWidth(2)
     .stroke('#1a1a1a');
  yPos += 30;

  // Executive Summary
  if (cvData.summary) {
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#1a1a1a')
       .text('EXECUTIVE SUMMARY', 0, yPos, { align: 'center', width: doc.page.width });

    yPos += 25;
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#2c3e50')
       .text(cvData.summary, 75, yPos, { width: 445, align: 'justify' });

    yPos += doc.heightOfString(cvData.summary, { width: 445 }) + 30;
  }

  // Continue with experience and education in executive style
  if (cvData.experience.length > 0) {
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#1a1a1a')
       .text('PROFESSIONAL EXPERIENCE', 0, yPos, { align: 'center', width: doc.page.width });

    yPos += 25;

    cvData.experience.forEach(exp => {
      if (yPos > 700) {
        doc.addPage();
        yPos = 50;
      }

      const title = typeof exp === 'string' ? exp : exp.title || '';
      const company = typeof exp === 'object' ? exp.company || '' : '';
      const duration = typeof exp === 'object' ? exp.duration || '' : '';
      const description = typeof exp === 'object' ? exp.description || '' : '';

      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor('#1a1a1a')
         .text(title, 75, yPos);

      yPos += 15;
      if (company || duration) {
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#4a4a4a')
           .text(`${company}${company && duration ? ' | ' : ''}${duration}`, 75, yPos);
        yPos += 15;
      }

      if (description) {
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor('#2c3e50')
           .text(description, 75, yPos, { width: 445 });
        yPos += doc.heightOfString(description, { width: 445 }) + 15;
      }
      yPos += 10;
    });
  }

  // Education and Skills in footer style
  if (cvData.education.length > 0 || cvData.skills.length > 0) {
    if (yPos > 650) {
      doc.addPage();
      yPos = 50;
    }

    doc.fontSize(11)
       .font('Helvetica-Bold')
       .fillColor('#1a1a1a')
       .text('EDUCATION & QUALIFICATIONS', 75, yPos);

    yPos += 20;

    cvData.education.forEach(edu => {
      const degree = typeof edu === 'string' ? edu : edu.degree || '';
      const institution = typeof edu === 'object' ? edu.institution || '' : '';
      const year = typeof edu === 'object' ? edu.year || '' : '';

      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#2c3e50')
         .text(`${degree}${institution ? ` - ${institution}` : ''}${year ? ` (${year})` : ''}`, 75, yPos);
      yPos += 15;
    });

    if (cvData.skills.length > 0) {
      yPos += 10;
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor('#1a1a1a')
         .text('Key Skills:', 75, yPos);
      yPos += 15;
      
      doc.fontSize(9)
         .font('Helvetica')
         .fillColor('#2c3e50')
         .text(cvData.skills.join(' • '), 75, yPos, { width: 445 });
    }
  }
}

module.exports = router;
