import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";

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
      return NextResponse.json(
        { error: "Missing CV data or template" },
        { status: 400 }
      );
    }

    // Create PDF based on template
    const pdfBuffer = await generatePDF(cvData, template);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${
          cvData.personalInfo.name || "CV"
        }_${template}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}

async function generatePDF(cvData: CVData, template: string): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Generate PDF based on template
  switch (template) {
    case "professional":
      generateProfessionalTemplate(doc, cvData);
      break;
    case "modern":
      generateModernTemplate(doc, cvData);
      break;
    case "minimalist":
      generateMinimalistTemplate(doc, cvData);
      break;
    case "creative":
      generateCreativeTemplate(doc, cvData);
      break;
    case "executive":
      generateExecutiveTemplate(doc, cvData);
      break;
    default:
      generateProfessionalTemplate(doc, cvData);
  }

  // Convert to buffer
  const pdfOutput = doc.output("arraybuffer");
  return Buffer.from(pdfOutput);
}

function generateProfessionalTemplate(doc: jsPDF, cvData: CVData) {
  let yPos = 25;
  const leftMargin = 20;
  const pageWidth = 170;

  // Header with name
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(44, 62, 80);
  doc.text(cvData.personalInfo.name || "Your Name", leftMargin, yPos);
  yPos += 8;

  // Line under name
  doc.setDrawColor(44, 62, 80);
  doc.setLineWidth(0.5);
  doc.line(leftMargin, yPos, leftMargin + 170, yPos);
  yPos += 8;

  // Contact info in a compact line
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(52, 73, 94);

  const contactParts = [];
  if (cvData.personalInfo.email) contactParts.push(cvData.personalInfo.email);
  if (cvData.personalInfo.phone) contactParts.push(cvData.personalInfo.phone);
  if (cvData.personalInfo.location)
    contactParts.push(cvData.personalInfo.location);
  if (cvData.personalInfo.linkedin)
    contactParts.push(cvData.personalInfo.linkedin);

  if (contactParts.length > 0) {
    doc.text(contactParts.join(" | "), leftMargin, yPos);
    yPos += 10;
  }

  yPos += 5;

  // Professional Summary
  if (cvData.summary) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(44, 62, 80);
    doc.text("PROFESSIONAL SUMMARY", leftMargin, yPos);
    yPos += 6;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(52, 73, 94);
    const summaryLines = doc.splitTextToSize(cvData.summary, pageWidth);
    doc.text(summaryLines, leftMargin, yPos);
    yPos += summaryLines.length * 5 + 8;
  }

  // Work Experience
  if (cvData.experience.length > 0) {
    if (yPos > 260) {
      doc.addPage();
      yPos = 25;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(44, 62, 80);
    doc.text("WORK EXPERIENCE", leftMargin, yPos);
    yPos += 6;

    cvData.experience.forEach((exp, index) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 25;
      }

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(44, 62, 80);
      doc.text(exp.title || "Position Title", leftMargin, yPos);
      yPos += 5;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(127, 140, 141);
      const companyLine = [exp.company, exp.duration]
        .filter(Boolean)
        .join(" | ");
      if (companyLine) {
        doc.text(companyLine, leftMargin, yPos);
        yPos += 5;
      }

      if (exp.description) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(52, 73, 94);
        const descLines = doc.splitTextToSize(exp.description, pageWidth);
        doc.text(descLines, leftMargin + 3, yPos);
        yPos += descLines.length * 4 + 6;
      }

      // Add spacing between entries
      if (index < cvData.experience.length - 1) {
        yPos += 3;
      }
    });

    yPos += 5;
  }

  // Skills
  if (cvData.skills.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 25;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(44, 62, 80);
    doc.text("SKILLS", leftMargin, yPos);
    yPos += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(52, 73, 94);

    // Display skills in a more compact format
    const skillsText = cvData.skills.join(" • ");
    const skillLines = doc.splitTextToSize(skillsText, pageWidth);
    doc.text(skillLines, leftMargin, yPos);
    yPos += skillLines.length * 4 + 8;
  }

  // Education
  if (cvData.education.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 25;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(44, 62, 80);
    doc.text("EDUCATION", leftMargin, yPos);
    yPos += 6;

    cvData.education.forEach((edu, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 25;
      }

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(44, 62, 80);
      doc.text(edu.degree || "Degree", leftMargin, yPos);
      yPos += 5;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(127, 140, 141);
      const eduLine = [edu.institution, edu.year].filter(Boolean).join(" | ");
      if (eduLine) {
        doc.text(eduLine, leftMargin, yPos);
        yPos += 5;
      }

      // Add spacing between entries
      if (index < cvData.education.length - 1) {
        yPos += 2;
      }
    });
  }
}

function generateModernTemplate(doc: jsPDF, cvData: CVData) {
  // Header with colored background
  doc.setFillColor(108, 92, 231);
  doc.rect(0, 0, 210, 45, "F");

  // Name in header
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(cvData.personalInfo.name || "Your Name", 20, 22);

  // Contact info in header
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const contactInfo = [
    cvData.personalInfo.email,
    cvData.personalInfo.phone,
    cvData.personalInfo.location,
    cvData.personalInfo.linkedin,
  ]
    .filter(Boolean)
    .join(" | ");
  doc.text(contactInfo, 20, 35);

  let yPos = 60;
  const leftMargin = 20;
  const pageWidth = 170;

  // Professional Summary
  if (cvData.summary) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(45, 52, 54);
    doc.text("PROFESSIONAL SUMMARY", leftMargin, yPos);
    yPos += 6;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(99, 110, 114);
    const summaryLines = doc.splitTextToSize(cvData.summary, pageWidth);
    doc.text(summaryLines, leftMargin, yPos);
    yPos += summaryLines.length * 5 + 8;
  }

  // Experience
  if (cvData.experience.length > 0) {
    if (yPos > 260) {
      doc.addPage();
      yPos = 25;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(45, 52, 54);
    doc.text("WORK EXPERIENCE", leftMargin, yPos);
    yPos += 6;

    cvData.experience.forEach((exp, index) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 25;
      }

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(45, 52, 54);
      doc.text(exp.title || "Position Title", leftMargin, yPos);
      yPos += 5;

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(108, 92, 231);
      const companyLine = [exp.company, exp.duration]
        .filter(Boolean)
        .join(" | ");
      if (companyLine) {
        doc.text(companyLine, leftMargin, yPos);
        yPos += 5;
      }

      if (exp.description) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(99, 110, 114);
        const descLines = doc.splitTextToSize(exp.description, pageWidth);
        doc.text(descLines, leftMargin + 3, yPos);
        yPos += descLines.length * 4 + 6;
      }

      if (index < cvData.experience.length - 1) {
        yPos += 3;
      }
    });

    yPos += 5;
  }

  // Skills
  if (cvData.skills.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 25;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(45, 52, 54);
    doc.text("SKILLS", leftMargin, yPos);
    yPos += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(99, 110, 114);

    const skillsText = cvData.skills.join(" • ");
    const skillLines = doc.splitTextToSize(skillsText, pageWidth);
    doc.text(skillLines, leftMargin, yPos);
    yPos += skillLines.length * 4 + 8;
  }

  // Education
  if (cvData.education.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 25;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(45, 52, 54);
    doc.text("EDUCATION", leftMargin, yPos);
    yPos += 6;

    cvData.education.forEach((edu, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 25;
      }

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(45, 52, 54);
      doc.text(edu.degree || "Degree", leftMargin, yPos);
      yPos += 5;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(99, 110, 114);
      const eduLine = [edu.institution, edu.year].filter(Boolean).join(" | ");
      if (eduLine) {
        doc.text(eduLine, leftMargin, yPos);
        yPos += 5;
      }

      if (index < cvData.education.length - 1) {
        yPos += 2;
      }
    });
  }
}

function generateMinimalistTemplate(doc: jsPDF, cvData: CVData) {
  let yPos = 20;
  const leftMargin = 20;
  const pageWidth = 170;

  // Name
  doc.setFontSize(32);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(44, 62, 80);
  doc.text(cvData.personalInfo.name || "Your Name", leftMargin, yPos);
  yPos += 15;

  // Contact info in a line
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(127, 140, 141);
  const contactInfo = [
    cvData.personalInfo.email,
    cvData.personalInfo.phone,
    cvData.personalInfo.location,
  ]
    .filter(Boolean)
    .join("  •  ");
  doc.text(contactInfo, leftMargin, yPos);
  yPos += 10;

  // Thin line
  doc.setDrawColor(236, 240, 241);
  doc.line(leftMargin, yPos, 190, yPos);
  yPos += 10;

  // Summary
  if (cvData.summary) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(44, 62, 80);
    const summaryLines = doc.splitTextToSize(cvData.summary, pageWidth);
    doc.text(summaryLines, leftMargin, yPos);
    yPos += summaryLines.length * 5 + 10;
  }

  // Experience
  if (cvData.experience.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(44, 62, 80);
    doc.text("Experience", leftMargin, yPos);
    yPos += 7;

    cvData.experience.forEach((exp) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(44, 62, 80);
      doc.text(exp.title, leftMargin, yPos);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(127, 140, 141);
      doc.text(exp.company, 100, yPos);
      doc.text(exp.duration, 150, yPos);
      yPos += 6;

      if (exp.description) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(52, 73, 94);
        const descLines = doc.splitTextToSize(exp.description, pageWidth);
        doc.text(descLines, leftMargin, yPos);
        yPos += descLines.length * 4 + 8;
      }
    });
  }

  // Skills and Education side by side
  const skillsY = yPos + 5;

  // Skills
  if (cvData.skills.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(44, 62, 80);
    doc.text("Skills", leftMargin, skillsY);

    let skillY = skillsY + 7;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(52, 73, 94);

    cvData.skills.forEach((skill) => {
      doc.text(`• ${skill}`, leftMargin, skillY);
      skillY += 5;
    });
  }

  // Education
  if (cvData.education.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(44, 62, 80);
    doc.text("Education", 110, skillsY);

    let eduY = skillsY + 7;
    cvData.education.forEach((edu) => {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(44, 62, 80);
      const degreeLines = doc.splitTextToSize(edu.degree, 80);
      doc.text(degreeLines, 110, eduY);
      eduY += degreeLines.length * 5;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(127, 140, 141);
      doc.text(`${edu.institution} | ${edu.year}`, 110, eduY);
      eduY += 8;
    });
  }
}

function generateCreativeTemplate(doc: jsPDF, cvData: CVData) {
  // Use modern template as base for creative
  generateModernTemplate(doc, cvData);
}

function generateExecutiveTemplate(doc: jsPDF, cvData: CVData) {
  let yPos = 20;
  const leftMargin = 20;
  const pageWidth = 170;

  // Centered header
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 26, 26);
  doc.text(cvData.personalInfo.name || "Your Name", 105, yPos, {
    align: "center",
  });
  yPos += 12;

  // Contact info centered
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(74, 74, 74);
  const contactInfo = [
    cvData.personalInfo.email,
    cvData.personalInfo.phone,
    cvData.personalInfo.location,
  ]
    .filter(Boolean)
    .join("  |  ");
  doc.text(contactInfo, 105, yPos, { align: "center" });
  yPos += 10;

  // Professional line
  doc.setLineWidth(0.5);
  doc.setDrawColor(26, 26, 26);
  doc.line(40, yPos, 170, yPos);
  yPos += 10;

  // Executive Summary
  if (cvData.summary) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 26, 26);
    doc.text("EXECUTIVE SUMMARY", 105, yPos, { align: "center" });
    yPos += 7;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(44, 62, 80);
    const summaryLines = doc.splitTextToSize(cvData.summary, 150);
    doc.text(summaryLines, 30, yPos);
    yPos += summaryLines.length * 5 + 10;
  }

  // Professional Experience
  if (cvData.experience.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 26, 26);
    doc.text("PROFESSIONAL EXPERIENCE", 105, yPos, { align: "center" });
    yPos += 7;

    cvData.experience.forEach((exp) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(26, 26, 26);
      doc.text(exp.title, 30, yPos);
      yPos += 6;

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(74, 74, 74);
      doc.text(`${exp.company} • ${exp.duration}`, 30, yPos);
      yPos += 6;

      if (exp.description) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(44, 62, 80);
        const descLines = doc.splitTextToSize(exp.description, 150);
        doc.text(descLines, 30, yPos);
        yPos += descLines.length * 4 + 8;
      }
    });
  }

  // Education and Skills
  if (cvData.education.length > 0 || cvData.skills.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 26, 26);
    doc.text("EDUCATION & QUALIFICATIONS", 30, yPos);
    yPos += 7;

    cvData.education.forEach((edu) => {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(44, 62, 80);
      doc.text(`${edu.degree} • ${edu.institution} • ${edu.year}`, 30, yPos);
      yPos += 6;
    });

    if (cvData.skills.length > 0) {
      yPos += 5;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(26, 26, 26);
      doc.text("CORE COMPETENCIES", 30, yPos);
      yPos += 7;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(44, 62, 80);
      const skillsText = cvData.skills.join(" • ");
      const skillsLines = doc.splitTextToSize(skillsText, 150);
      doc.text(skillsLines, 30, yPos);
    }
  }
}
