# CV Analyzer - Node.js JavaScript Architecture

## Overview

This project has been successfully converted from Next.js/TypeScript to Node.js/JavaScript with Express and nodemon. All functionality from the `src` folder has been converted to pure JavaScript modules that work with our Node.js backend.

## Project Structure

```
cv-analyzer-generator/
├── server.js                          # Main Express server
├── package.json                       # Node.js dependencies
├── public/
│   └── index.html                     # Frontend HTML application
├── routes/
│   └── cv.js                          # API routes (converted from TypeScript)
├── lib/
│   └── cv-processor.js                # CV processing engine (converted)
└── src/
    ├── components/                     # JavaScript modules (converted from React)
    │   ├── cv-analysis.js             # CV analysis utilities
    │   ├── cv-form.js                 # Form validation and handling
    │   ├── file-upload.js             # File upload management
    │   └── template-selector.js       # Template selection logic
    ├── lib/
    │   └── utils.js                   # Utility functions (converted)
    └── app/
        └── app-controller.js          # Main application logic
```

## JavaScript Modules Documentation

### 1. CV Analysis Module (`src/components/cv-analysis.js`)

**Purpose**: Format and analyze CV data, generate insights
**Key Functions**:

- `formatAnalysisResult(analysisData)` - Format raw analysis data
- `generateInsights(analysisData)` - Generate actionable insights
- `calculateCompletenessScore(analysisData)` - Calculate CV completeness percentage
- `formatPersonalInfo(personalInfo)` - Format personal information
- `formatSkills(skills)` - Format and validate skills array
- `formatExperience(experience)` - Format work experience data
- `formatEducation(education)` - Format education data

### 2. CV Form Module (`src/components/cv-form.js`)

**Purpose**: Handle form validation and data processing
**Key Functions**:

- `validateCVData(cvData)` - Comprehensive CV data validation
- `sanitizeCVData(cvData)` - Clean and sanitize form input
- `calculateCompletionPercentage(cvData)` - Calculate form completion
- `getValidationSuggestions(cvData)` - Get improvement suggestions
- `prepareForSubmission(cvData, jobDescription, template)` - Prepare data for API

### 3. File Upload Module (`src/components/file-upload.js`)

**Purpose**: Handle file upload validation and processing
**Key Functions**:

- `validateFile(file)` - Validate uploaded files
- `processUploadedFile(file, jobDescription)` - Process file for analysis
- `getFileInfo(file)` - Extract file metadata
- `formatFileSize(bytes)` - Format file sizes for display
- `getMulterConfig()` - Generate multer configuration

### 4. Template Selector Module (`src/components/template-selector.js`)

**Purpose**: Manage CV templates and recommendations
**Key Functions**:

- `getTemplate(templateId)` - Get template by ID
- `getAllTemplates()` - Get all available templates
- `recommendTemplate(jobDescription)` - AI-powered template recommendation
- `validateTemplate(templateId)` - Validate template selection
- `getTemplateConfig(templateId)` - Get template configuration for PDF generation

**Available Templates**:

- **Professional**: Corporate and traditional industries
- **Modern**: Tech and creative roles
- **Creative**: Design and marketing fields
- **Minimal**: Academic and research positions
- **Executive**: Senior leadership positions

### 5. Utils Module (`src/lib/utils.js`)

**Purpose**: Common utility functions
**Key Functions**:

- `formatDate(date)` - Format dates for display
- `sanitizeString(str)` - Sanitize strings for security
- `isValidEmail(email)` - Email validation
- `generateId(prefix)` - Generate unique IDs
- `calculateSimilarity(text1, text2)` - Text similarity calculation
- `createErrorResponse(message, code, details)` - Standardized error responses
- `createSuccessResponse(data, message)` - Standardized success responses

### 6. App Controller Module (`src/app/app-controller.js`)

**Purpose**: Main application logic and workflow management
**Key Functions**:

- `handleFileUpload(file, jobDescription)` - Handle file upload process
- `generatePDF(cvData, template)` - Generate and download PDF
- `calculateCVStrength(analysisData)` - Calculate overall CV strength
- `getWorkflowSteps()` - Get application workflow steps
- `navigateToStep(currentStep, targetStep)` - Handle step navigation

## API Endpoints

### POST /api/analyze-cv

- **Purpose**: Upload and analyze CV files
- **Input**: Multipart form with CV file, job description, template
- **Output**: Formatted analysis results with insights and scoring

### POST /api/generate-pdf

- **Purpose**: Generate tailored PDF from CV data
- **Input**: CV data and template selection
- **Output**: PDF file download

### GET /api/templates

- **Purpose**: Get all available templates
- **Output**: Array of template objects with metadata

### POST /api/recommend-template

- **Purpose**: Get AI-powered template recommendation
- **Input**: Job description text
- **Output**: Recommended template with alternatives

## Key Features Implemented

### ✅ **File Processing**

- Support for PDF, DOC, DOCX, TXT, JPG, PNG files
- File validation and size limits
- Automatic text extraction

### ✅ **AI Analysis**

- Personal information extraction
- Skills identification and matching
- Experience parsing and formatting
- Education background analysis
- Job matching with scoring

### ✅ **Template System**

- 5 professional templates
- Industry-specific recommendations
- Customizable styling and layouts
- ATS-optimization

### ✅ **PDF Generation**

- Professional PDF output
- Template-based styling
- Font and color customization
- Section ordering

### ✅ **Validation & Security**

- Input sanitization
- File type validation
- Error handling
- XSS prevention

## Development Environment

### Dependencies

```json
{
  "express": "^4.21.2",
  "multer": "^2.0.2",
  "pdfkit": "^0.17.1",
  "pdf-parse": "^1.1.1",
  "natural": "^8.1.0",
  "compromise": "^14.14.4",
  "mammoth": "^1.9.1",
  "cors": "^2.8.5"
}
```

### Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Server Configuration

- **Port**: 3000
- **Static Files**: Served from `public/` directory
- **CORS**: Enabled for all origins
- **File Uploads**: Memory storage with 5MB limit

## Usage Instructions

1. **Start Development Server**:

   ```bash
   npm run dev
   ```

2. **Access Application**:
   Open http://localhost:3000 in browser

3. **Upload CV**:

   - Drag & drop or click to upload CV file
   - Optionally add job description for matching

4. **Review Analysis**:

   - View extracted personal information
   - Check skills and experience parsing
   - Review job match score and suggestions

5. **Generate PDF**:
   - Select appropriate template
   - Download tailored CV

## Conversion Benefits

### ✅ **Performance**

- Faster server startup
- Lower memory usage
- Better resource management

### ✅ **Simplicity**

- No build process required
- Direct JavaScript execution
- Easier debugging

### ✅ **Maintenance**

- Single language (JavaScript)
- Unified codebase
- Simplified deployment

### ✅ **Development**

- Hot reload with nodemon
- Instant changes reflection
- Simplified testing

The conversion from Next.js/TypeScript to Node.js/JavaScript is now complete with all original functionality preserved and enhanced!
