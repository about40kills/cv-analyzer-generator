import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';

interface CVData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
  };
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  skills: string[];
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const { cvData, template } = await request.json();

    if (!cvData || !template) {
      return NextResponse.json({ error: 'Missing CV data or template' }, { status: 400 });
    }

    // Create PDF based on template
    const pdfBuffer = await generatePDF(cvData, template);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${cvData.personalInfo.name || 'CV'}_${template}.pdf"`
      }
    });

  } catch (error) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

async function generatePDF(cvData: CVData, template: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `${cvData.personalInfo.name} - CV`,
          Author: cvData.personalInfo.name,
          Subject: 'Curriculum Vitae'
        }
      });

      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      doc.on('end', () => {
        const result = Buffer.concat(chunks);
        resolve(result);
      });

      doc.on('error', (error: Error) => {
        reject(error);
      });

      // Generate PDF based on template
      switch (template) {
        case 'professional':
          generateProfessionalTemplate(doc, cvData);
          break;
        case 'modern':
          generateModernTemplate(doc, cvData);
          break;
        case 'minimalist':
          generateMinimalistTemplate(doc, cvData);
          break;
        case 'creative':
          generateCreativeTemplate(doc, cvData);
          break;
        case 'executive':
          generateExecutiveTemplate(doc, cvData);
          break;
        default:
          generateProfessionalTemplate(doc, cvData);
      }

      doc.end();

    } catch (error) {
      reject(error);
    }
  });
}

function generateProfessionalTemplate(doc: InstanceType<typeof PDFDocument>, cvData: CVData) {
  const pageWidth = doc.page.width - 100; // Account for margins
  const leftColumnWidth = 180;
  const rightColumnWidth = pageWidth - leftColumnWidth - 20;

  // Header with name
  doc.fontSize(24)
     .font('Helvetica-Bold')
     .fillColor('#2c3e50')
     .text(cvData.personalInfo.name || 'Your Name', 50, 50);

  // Contact info in left column
  let yPos = 100;
  doc.fontSize(10)
     .font('Helvetica')
     .fillColor('#34495e');

  if (cvData.personalInfo.email) {
    doc.text(`Email: ${cvData.personalInfo.email}`, 50, yPos);
    yPos += 15;
  }
  if (cvData.personalInfo.phone) {
    doc.text(`Phone: ${cvData.personalInfo.phone}`, 50, yPos);
    yPos += 15;
  }
  if (cvData.personalInfo.location) {
    doc.text(`Location: ${cvData.personalInfo.location}`, 50, yPos);
    yPos += 15;
  }
  if (cvData.personalInfo.linkedin) {
    doc.text(`LinkedIn: ${cvData.personalInfo.linkedin}`, 50, yPos);
    yPos += 15;
  }

  // Skills section in left column
  yPos += 20;
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .fillColor('#2c3e50')
     .text('SKILLS', 50, yPos);

  yPos += 20;
  doc.fontSize(9)
     .font('Helvetica')
     .fillColor('#34495e');

  cvData.skills.forEach((skill) => {
    doc.text(`• ${skill}`, 50, yPos, { width: leftColumnWidth });
    yPos += 12;
  });

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

    cvData.experience.forEach((exp) => {
      if (rightYPos > 700) {
        doc.addPage();
        rightYPos = 50;
      }

      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor('#2c3e50')
         .text(exp.title, rightColumnX, rightYPos);

      rightYPos += 15;
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor('#7f8c8d')
         .text(`${exp.company} | ${exp.duration}`, rightColumnX, rightYPos);

      rightYPos += 15;
      if (exp.description) {
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor('#34495e')
           .text(exp.description, rightColumnX, rightYPos, { width: rightColumnWidth });

        rightYPos += doc.heightOfString(exp.description, { width: rightColumnWidth }) + 15;
      }
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

    cvData.education.forEach((edu) => {
      if (rightYPos > 700) {
        doc.addPage();
        rightYPos = 50;
      }

      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor('#2c3e50')
         .text(edu.degree, rightColumnX, rightYPos);

      rightYPos += 12;
      doc.fontSize(9)
         .font('Helvetica')
         .fillColor('#7f8c8d')
         .text(`${edu.institution} | ${edu.year}`, rightColumnX, rightYPos);

      rightYPos += 20;
    });
  }
}

function generateModernTemplate(doc: PDFKit.PDFDocument, cvData: CVData) {
  // Header with colored background
  doc.rect(0, 0, doc.page.width, 120)
     .fill('#6c5ce7');

  // Name in header
  doc.fontSize(28)
     .font('Helvetica-Bold')
     .fillColor('white')
     .text(cvData.personalInfo.name || 'Your Name', 50, 40);

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

  // Skills with progress bars
  if (cvData.skills.length > 0) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#2d3436')
       .text('Technical Skills', 50, yPos);

    yPos += 25;

    cvData.skills.slice(0, 8).forEach((skill) => {
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#636e72')
         .text(skill, 50, yPos);

      // Skill level bar (random for demo)
      const skillLevel = 0.6 + Math.random() * 0.4;
      doc.rect(200, yPos + 2, 150, 8)
         .fillColor('#ddd');
      doc.rect(200, yPos + 2, 150 * skillLevel, 8)
         .fillColor('#6c5ce7');

      yPos += 20;
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

    cvData.experience.forEach((exp) => {
      if (yPos > 700) {
        doc.addPage();
        yPos = 50;
      }

      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#2d3436')
         .text(exp.title, 50, yPos);

      yPos += 15;
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor('#6c5ce7')
         .text(`${exp.company} | ${exp.duration}`, 50, yPos);

      yPos += 15;
      if (exp.description) {
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor('#636e72')
           .text(exp.description, 50, yPos, { width: 500 });

        yPos += doc.heightOfString(exp.description, { width: 500 }) + 20;
      }
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

    cvData.education.forEach((edu) => {
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor('#2d3436')
         .text(edu.degree, 50, yPos);

      yPos += 12;
      doc.fontSize(9)
         .font('Helvetica')
         .fillColor('#636e72')
         .text(`${edu.institution} | ${edu.year}`, 50, yPos);

      yPos += 20;
    });
  }
}

function generateMinimalistTemplate(doc: PDFKit.PDFDocument, cvData: CVData) {
  let yPos = 50;

  // Name
  doc.fontSize(32)
     .font('Helvetica-Light')
     .fillColor('#2c3e50')
     .text(cvData.personalInfo.name || 'Your Name', 50, yPos);

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

    cvData.experience.forEach((exp) => {
      if (yPos > 700) {
        doc.addPage();
        yPos = 50;
      }

      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor('#2c3e50')
         .text(exp.title, 50, yPos);

      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#7f8c8d')
         .text(`${exp.company}`, 300, yPos);

      doc.text(`${exp.duration}`, 450, yPos);

      yPos += 20;
      if (exp.description) {
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor('#34495e')
           .text(exp.description, 50, yPos, { width: 495 });

        yPos += doc.heightOfString(exp.description, { width: 495 }) + 20;
      }
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

    cvData.skills.forEach((skill) => {
      doc.text(`• ${skill}`, 50, skillY, { width: 200 });
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
    cvData.education.forEach((edu) => {
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .fillColor('#2c3e50')
         .text(edu.degree, 300, eduY, { width: 245 });

      eduY += 12;
      doc.fontSize(9)
         .font('Helvetica')
         .fillColor('#7f8c8d')
         .text(`${edu.institution} | ${edu.year}`, 300, eduY, { width: 245 });

      eduY += 20;
    });
  }
}

function generateCreativeTemplate(doc: PDFKit.PDFDocument, cvData: CVData) {
  // Creative header with shapes
  doc.circle(100, 100, 50)
     .fill('#ff6b6b');

  doc.rect(200, 50, 100, 100)
     .fill('#4ecdc4');

  // Name overlaid
  doc.fontSize(24)
     .font('Helvetica-Bold')
     .fillColor('white')
     .text(cvData.personalInfo.name || 'Your Name', 200, 90);

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

  contactItems.forEach((item) => {
    doc.text(`${item.icon} ${item.text}`, 50, yPos);
    yPos += 15;
  });

  yPos += 20;

  // Rest of the template follows professional structure but with creative touches
  generateProfessionalTemplate(doc, cvData);
}

function generateExecutiveTemplate(doc: PDFKit.PDFDocument, cvData: CVData) {
  let yPos = 50;

  // Centered header
  doc.fontSize(28)
     .font('Helvetica-Bold')
     .fillColor('#1a1a1a')
     .text(cvData.personalInfo.name || 'Your Name', 0, yPos, { align: 'center', width: doc.page.width });

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

  // Continue with professional experience in executive style
  if (cvData.experience.length > 0) {
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#1a1a1a')
       .text('PROFESSIONAL EXPERIENCE', 0, yPos, { align: 'center', width: doc.page.width });

    yPos += 25;

    cvData.experience.forEach((exp) => {
      if (yPos > 700) {
        doc.addPage();
        yPos = 50;
      }

      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#1a1a1a')
         .text(exp.title, 75, yPos);

      yPos += 15;
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor('#4a4a4a')
         .text(`${exp.company} • ${exp.duration}`, 75, yPos);

      yPos += 15;
      if (exp.description) {
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#2c3e50')
           .text(exp.description, 75, yPos, { width: 445, align: 'justify' });

        yPos += doc.heightOfString(exp.description, { width: 445 }) + 20;
      }
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

    cvData.education.forEach((edu) => {
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#2c3e50')
         .text(`${edu.degree} • ${edu.institution} • ${edu.year}`, 75, yPos);
      yPos += 15;
    });

    if (cvData.skills.length > 0) {
      yPos += 10;
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor('#1a1a1a')
         .text('CORE COMPETENCIES', 75, yPos);

      yPos += 15;
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#2c3e50')
         .text(cvData.skills.join(' • '), 75, yPos, { width: 445 });
    }
  }
}
