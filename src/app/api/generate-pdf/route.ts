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
  const sidebarWidth = 65;
  const mainStart = sidebarWidth + 10;
  const mainWidth = 135;

  // Sidebar background
  doc.setFillColor(41, 50, 65);
  doc.rect(0, 0, sidebarWidth, 297, "F");

  // Name in sidebar
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  const nameLines = doc.splitTextToSize(
    cvData.personalInfo.name || "Your Name",
    sidebarWidth - 10
  );
  doc.text(nameLines, 5, 20);

  let sidebarY = 20 + nameLines.length * 7 + 5;

  // Contact section in sidebar
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("CONTACT", 5, sidebarY);
  sidebarY += 7;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(220, 220, 220);

  if (cvData.personalInfo.phone) {
    const phoneLines = doc.splitTextToSize(
      cvData.personalInfo.phone,
      sidebarWidth - 10
    );
    doc.text(phoneLines, 5, sidebarY);
    sidebarY += phoneLines.length * 4 + 2;
  }
  if (cvData.personalInfo.email) {
    const emailLines = doc.splitTextToSize(
      cvData.personalInfo.email,
      sidebarWidth - 10
    );
    doc.text(emailLines, 5, sidebarY);
    sidebarY += emailLines.length * 4 + 2;
  }
  if (cvData.personalInfo.location) {
    const locLines = doc.splitTextToSize(
      cvData.personalInfo.location,
      sidebarWidth - 10
    );
    doc.text(locLines, 5, sidebarY);
    sidebarY += locLines.length * 4 + 2;
  }
  if (cvData.personalInfo.linkedin) {
    const linkedinLines = doc.splitTextToSize(
      cvData.personalInfo.linkedin,
      sidebarWidth - 10
    );
    doc.text(linkedinLines, 5, sidebarY);
    sidebarY += linkedinLines.length * 4 + 2;
  }

  sidebarY += 8;

  // Skills in sidebar
  if (cvData.skills.length > 0) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("SKILLS", 5, sidebarY);
    sidebarY += 7;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(220, 220, 220);

    cvData.skills.slice(0, 15).forEach((skill) => {
      if (sidebarY > 280) return;
      const skillLines = doc.splitTextToSize(`• ${skill}`, sidebarWidth - 10);
      doc.text(skillLines, 5, sidebarY);
      sidebarY += skillLines.length * 4 + 1;
    });

    sidebarY += 5;
  }

  // Education in sidebar
  if (cvData.education.length > 0 && sidebarY < 250) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("EDUCATION", 5, sidebarY);
    sidebarY += 7;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(220, 220, 220);

    cvData.education.forEach((edu) => {
      if (sidebarY > 280) return;

      doc.setFont("helvetica", "bold");
      const degreeLines = doc.splitTextToSize(
        edu.degree || "Degree",
        sidebarWidth - 10
      );
      doc.text(degreeLines, 5, sidebarY);
      sidebarY += degreeLines.length * 4;

      doc.setFont("helvetica", "normal");
      const instLines = doc.splitTextToSize(
        edu.institution || "",
        sidebarWidth - 10
      );
      doc.text(instLines, 5, sidebarY);
      sidebarY += instLines.length * 4;

      if (edu.year) {
        doc.text(edu.year, 5, sidebarY);
        sidebarY += 4;
      }
      sidebarY += 4;
    });
  }

  // Main content area
  let mainY = 20;

  // Professional Summary
  if (cvData.summary) {
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 50, 65);
    doc.text("PROFESSIONAL SUMMARY", mainStart, mainY);
    mainY += 2;

    doc.setLineWidth(0.5);
    doc.setDrawColor(41, 50, 65);
    doc.line(mainStart, mainY, mainStart + mainWidth, mainY);
    mainY += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    const summaryLines = doc.splitTextToSize(cvData.summary, mainWidth);
    doc.text(summaryLines, mainStart, mainY);
    mainY += summaryLines.length * 4 + 10;
  }

  // Work Experience
  if (cvData.experience.length > 0) {
    if (mainY > 250) {
      doc.addPage();
      doc.setFillColor(41, 50, 65);
      doc.rect(0, 0, sidebarWidth, 297, "F");
      mainY = 20;
    }

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 50, 65);
    doc.text("WORK EXPERIENCE", mainStart, mainY);
    mainY += 2;

    doc.setLineWidth(0.5);
    doc.setDrawColor(41, 50, 65);
    doc.line(mainStart, mainY, mainStart + mainWidth, mainY);
    mainY += 6;

    cvData.experience.forEach((exp) => {
      if (mainY > 270) {
        doc.addPage();
        doc.setFillColor(41, 50, 65);
        doc.rect(0, 0, sidebarWidth, 297, "F");
        mainY = 20;
      }

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(41, 50, 65);
      doc.text(exp.title || "Position Title", mainStart, mainY);
      mainY += 5;

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 100, 100);
      doc.text(exp.company || "Company", mainStart, mainY);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 120, 120);
      doc.text(exp.duration || "", mainStart + 60, mainY);
      mainY += 5;

      if (exp.description) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);
        const descLines = doc.splitTextToSize(exp.description, mainWidth);
        doc.text(descLines, mainStart, mainY);
        mainY += descLines.length * 4 + 6;
      }
    });
  }
}

function generateModernTemplate(doc: jsPDF, cvData: CVData) {
  // Modern gradient-style header
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, 210, 50, "F");

  // Name
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(cvData.personalInfo.name || "Your Name", 105, 22, {
    align: "center",
  });

  // Contact bar
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(255, 255, 255);
  const contacts = [
    cvData.personalInfo.email,
    cvData.personalInfo.phone,
    cvData.personalInfo.location,
  ].filter(Boolean);
  doc.text(contacts.join("  •  "), 105, 32, { align: "center" });

  if (cvData.personalInfo.linkedin) {
    doc.text(cvData.personalInfo.linkedin, 105, 38, { align: "center" });
  }

  let yPos = 65;
  const margin = 20;
  const contentWidth = 170;

  // Summary with accent
  if (cvData.summary) {
    doc.setFillColor(249, 250, 251);
    doc.rect(margin - 5, yPos - 5, contentWidth + 10, 0, "F");

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(79, 70, 229);
    doc.text("PROFILE", margin, yPos);
    yPos += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(55, 65, 81);
    const summaryLines = doc.splitTextToSize(cvData.summary, contentWidth);
    doc.text(summaryLines, margin, yPos);
    yPos += summaryLines.length * 4 + 12;
  }

  // Experience with modern styling
  if (cvData.experience.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(79, 70, 229);
    doc.text("EXPERIENCE", margin, yPos);
    yPos += 2;

    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(1);
    doc.line(margin, yPos, margin + 30, yPos);
    yPos += 8;

    cvData.experience.forEach((exp) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      // Job title with accent color
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(31, 41, 55);
      doc.text(exp.title || "Position", margin, yPos);
      yPos += 5;

      // Company and duration
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(79, 70, 229);
      doc.text(exp.company || "Company", margin, yPos);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(107, 114, 128);
      doc.text(exp.duration || "", margin + 70, yPos);
      yPos += 5;

      // Description with bullet
      if (exp.description) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(55, 65, 81);
        const descLines = doc.splitTextToSize(
          exp.description,
          contentWidth - 5
        );
        doc.text(descLines, margin + 3, yPos);
        yPos += descLines.length * 4 + 8;
      }
    });

    yPos += 5;
  }

  // Two-column layout for Skills and Education
  const col1X = margin;
  const col2X = 115;
  const colWidth = 80;
  let col1Y = yPos;
  let col2Y = yPos;

  // Skills column
  if (cvData.skills.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(79, 70, 229);
    doc.text("SKILLS", col1X, col1Y);
    col1Y += 2;

    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(1);
    doc.line(col1X, col1Y, col1X + 20, col1Y);
    col1Y += 7;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(55, 65, 81);

    const skillsPerRow = 2;
    for (let i = 0; i < cvData.skills.length; i += skillsPerRow) {
      const rowSkills = cvData.skills.slice(i, i + skillsPerRow);
      doc.text(`• ${rowSkills.join("  • ")}`, col1X, col1Y);
      col1Y += 4;
      if (col1Y > 280) break;
    }
  }

  // Education column
  if (cvData.education.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(79, 70, 229);
    doc.text("EDUCATION", col2X, col2Y);
    col2Y += 2;

    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(1);
    doc.line(col2X, col2Y, col2X + 25, col2Y);
    col2Y += 7;

    cvData.education.forEach((edu) => {
      if (col2Y > 280) return;

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(31, 41, 55);
      const degreeLines = doc.splitTextToSize(edu.degree || "Degree", colWidth);
      doc.text(degreeLines, col2X, col2Y);
      col2Y += degreeLines.length * 4;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(107, 114, 128);
      const instLines = doc.splitTextToSize(edu.institution || "", colWidth);
      doc.text(instLines, col2X, col2Y);
      col2Y += instLines.length * 4;

      if (edu.year) {
        doc.setTextColor(79, 70, 229);
        doc.text(edu.year, col2X, col2Y);
        col2Y += 4;
      }
      col2Y += 3;
    });
  }
}

function generateMinimalistTemplate(doc: jsPDF, cvData: CVData) {
  const margin = 25;
  const contentWidth = 160;
  let yPos = 30;

  // Name - large and clean
  doc.setFontSize(28);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 30, 30);
  doc.text(cvData.personalInfo.name || "Your Name", margin, yPos);
  yPos += 10;

  // Contact - minimal and inline
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  const contacts = [
    cvData.personalInfo.email,
    cvData.personalInfo.phone,
    cvData.personalInfo.location,
    cvData.personalInfo.linkedin,
  ]
    .filter(Boolean)
    .join("  •  ");
  doc.text(contacts, margin, yPos);
  yPos += 8;

  // Subtle divider
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(margin, yPos, 185, yPos);
  yPos += 12;

  // Summary - no header, just content
  if (cvData.summary) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    const summaryLines = doc.splitTextToSize(cvData.summary, contentWidth);
    doc.text(summaryLines, margin, yPos);
    yPos += summaryLines.length * 4.5 + 12;
  }

  // Experience - minimal headers
  if (cvData.experience.length > 0) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("Experience", margin, yPos);
    yPos += 8;

    cvData.experience.forEach((exp) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 25;
      }

      // Title and duration on same line
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text(exp.title || "Position", margin, yPos);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 120, 120);
      doc.text(exp.duration || "", 160, yPos, { align: "right" });
      yPos += 5;

      // Company
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(exp.company || "Company", margin, yPos);
      yPos += 5;

      // Description
      if (exp.description) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);
        const descLines = doc.splitTextToSize(exp.description, contentWidth);
        doc.text(descLines, margin, yPos);
        yPos += descLines.length * 4 + 8;
      }
    });

    yPos += 5;
  }

  // Skills and Education in two columns
  const col1X = margin;
  const col2X = 110;
  let col1Y = yPos;
  let col2Y = yPos;

  // Skills
  if (cvData.skills.length > 0) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("Skills", col1X, col1Y);
    col1Y += 7;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);

    cvData.skills.slice(0, 12).forEach((skill) => {
      if (col1Y > 280) return;
      doc.text(skill, col1X, col1Y);
      col1Y += 4;
    });
  }

  // Education
  if (cvData.education.length > 0) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("Education", col2X, col2Y);
    col2Y += 7;

    cvData.education.forEach((edu) => {
      if (col2Y > 280) return;

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      const degreeLines = doc.splitTextToSize(edu.degree || "Degree", 75);
      doc.text(degreeLines, col2X, col2Y);
      col2Y += degreeLines.length * 4;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(edu.institution || "", col2X, col2Y);
      col2Y += 4;

      doc.setTextColor(120, 120, 120);
      doc.text(edu.year || "", col2X, col2Y);
      col2Y += 7;
    });
  }
}

function generateCreativeTemplate(doc: jsPDF, cvData: CVData) {
  // Creative two-tone design
  const accentColor = [236, 72, 153]; // Pink accent
  const darkColor = [31, 41, 55];

  // Left accent bar
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(0, 0, 8, 297, "F");

  let yPos = 25;
  const margin = 20;
  const contentWidth = 170;

  // Name with creative styling
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text(cvData.personalInfo.name || "Your Name", margin, yPos);
  yPos += 8;

  // Accent line under name
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(margin, yPos, 40, 2, "F");
  yPos += 8;

  // Contact with icons representation
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);

  if (cvData.personalInfo.email) {
    doc.text(`✉ ${cvData.personalInfo.email}`, margin, yPos);
    yPos += 5;
  }
  if (cvData.personalInfo.phone) {
    doc.text(`☎ ${cvData.personalInfo.phone}`, margin, yPos);
    yPos += 5;
  }
  if (cvData.personalInfo.location) {
    doc.text(`⌂ ${cvData.personalInfo.location}`, margin, yPos);
    yPos += 5;
  }
  if (cvData.personalInfo.linkedin) {
    doc.text(`⚲ ${cvData.personalInfo.linkedin}`, margin, yPos);
    yPos += 5;
  }

  yPos += 10;

  // Summary with accent box
  if (cvData.summary) {
    doc.setFillColor(252, 231, 243);
    doc.rect(margin - 3, yPos - 3, contentWidth + 6, 0, "F");

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text("ABOUT ME", margin, yPos);
    yPos += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    const summaryLines = doc.splitTextToSize(cvData.summary, contentWidth);
    doc.text(summaryLines, margin, yPos);
    yPos += summaryLines.length * 4 + 12;
  }

  // Experience with creative bullets
  if (cvData.experience.length > 0) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text("EXPERIENCE", margin, yPos);
    yPos += 8;

    cvData.experience.forEach((exp) => {
      if (yPos > 270) {
        doc.addPage();
        doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.rect(0, 0, 8, 297, "F");
        yPos = 25;
      }

      // Accent dot
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.circle(margin - 2, yPos - 1.5, 1.5, "F");

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.text(exp.title || "Position", margin + 3, yPos);
      yPos += 5;

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text(exp.company || "Company", margin + 3, yPos);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 120, 120);
      doc.text(exp.duration || "", margin + 70, yPos);
      yPos += 5;

      if (exp.description) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);
        const descLines = doc.splitTextToSize(
          exp.description,
          contentWidth - 6
        );
        doc.text(descLines, margin + 3, yPos);
        yPos += descLines.length * 4 + 8;
      }
    });

    yPos += 5;
  }

  // Skills with visual bars
  if (cvData.skills.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.rect(0, 0, 8, 297, "F");
      yPos = 25;
    }

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text("SKILLS", margin, yPos);
    yPos += 7;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);

    const skillsPerRow = 3;
    for (let i = 0; i < cvData.skills.length && i < 15; i += skillsPerRow) {
      const rowSkills = cvData.skills.slice(i, i + skillsPerRow);
      doc.text(rowSkills.join("  •  "), margin, yPos);
      yPos += 5;
    }

    yPos += 8;
  }

  // Education
  if (cvData.education.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.rect(0, 0, 8, 297, "F");
      yPos = 25;
    }

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text("EDUCATION", margin, yPos);
    yPos += 7;

    cvData.education.forEach((edu) => {
      if (yPos > 280) return;

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      const degreeLines = doc.splitTextToSize(
        edu.degree || "Degree",
        contentWidth
      );
      doc.text(degreeLines, margin, yPos);
      yPos += degreeLines.length * 4;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(`${edu.institution || ""} • ${edu.year || ""}`, margin, yPos);
      yPos += 7;
    });
  }
}

function generateExecutiveTemplate(doc: jsPDF, cvData: CVData) {
  const margin = 25;
  const contentWidth = 160;
  let yPos = 35;

  // Formal centered header
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 20, 20);
  doc.text(cvData.personalInfo.name || "Your Name", 105, yPos, {
    align: "center",
  });
  yPos += 10;

  // Contact centered and formal
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  const line1 = [cvData.personalInfo.email, cvData.personalInfo.phone]
    .filter(Boolean)
    .join("  |  ");
  const line2 = [cvData.personalInfo.location, cvData.personalInfo.linkedin]
    .filter(Boolean)
    .join("  |  ");

  if (line1) {
    doc.text(line1, 105, yPos, { align: "center" });
    yPos += 4;
  }
  if (line2) {
    doc.text(line2, 105, yPos, { align: "center" });
    yPos += 4;
  }

  yPos += 8;

  // Elegant divider
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.5);
  doc.line(50, yPos, 160, yPos);
  yPos += 12;

  // Executive Profile
  if (cvData.summary) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 20, 20);
    doc.text("EXECUTIVE PROFILE", margin, yPos);
    yPos += 7;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    const summaryLines = doc.splitTextToSize(cvData.summary, contentWidth);
    doc.text(summaryLines, margin, yPos);
    yPos += summaryLines.length * 4.5 + 12;
  }

  // Professional Experience
  if (cvData.experience.length > 0) {
    if (yPos > 260) {
      doc.addPage();
      yPos = 25;
    }

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 20, 20);
    doc.text("PROFESSIONAL EXPERIENCE", margin, yPos);
    yPos += 2;

    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, margin + 70, yPos);
    yPos += 8;

    cvData.experience.forEach((exp) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 25;
      }

      // Title and Duration on same line
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(20, 20, 20);
      doc.text(exp.title || "Position", margin, yPos);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(exp.duration || "", 185, yPos, { align: "right" });
      yPos += 5;

      // Company
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(80, 80, 80);
      doc.text(exp.company || "Company", margin, yPos);
      yPos += 6;

      // Description
      if (exp.description) {
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(50, 50, 50);
        const descLines = doc.splitTextToSize(exp.description, contentWidth);
        doc.text(descLines, margin, yPos);
        yPos += descLines.length * 4 + 10;
      }
    });

    yPos += 5;
  }

  // Education and Core Competencies side by side
  const col1X = margin;
  const col2X = 110;
  let col1Y = yPos;
  let col2Y = yPos;

  // Education
  if (cvData.education.length > 0) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 20, 20);
    doc.text("EDUCATION", col1X, col1Y);
    col1Y += 2;

    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.3);
    doc.line(col1X, col1Y, col1X + 30, col1Y);
    col1Y += 7;

    cvData.education.forEach((edu) => {
      if (col1Y > 280) return;

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(20, 20, 20);
      const degreeLines = doc.splitTextToSize(edu.degree || "Degree", 75);
      doc.text(degreeLines, col1X, col1Y);
      col1Y += degreeLines.length * 4;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(80, 80, 80);
      const instLines = doc.splitTextToSize(edu.institution || "", 75);
      doc.text(instLines, col1X, col1Y);
      col1Y += instLines.length * 4;

      doc.setTextColor(100, 100, 100);
      doc.text(edu.year || "", col1X, col1Y);
      col1Y += 7;
    });
  }

  // Core Competencies
  if (cvData.skills.length > 0) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 20, 20);
    doc.text("CORE COMPETENCIES", col2X, col2Y);
    col2Y += 2;

    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.3);
    doc.line(col2X, col2Y, col2X + 50, col2Y);
    col2Y += 7;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);

    cvData.skills.slice(0, 12).forEach((skill) => {
      if (col2Y > 280) return;
      doc.text(`• ${skill}`, col2X, col2Y);
      col2Y += 4;
    });
  }
}
