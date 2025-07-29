# CV Analyzer Generator

A modern web application for analyzing CVs and generating detailed reports with PDF export functionality.

## Features

- **File Upload**: Drag and drop or browse to upload CV files (PDF/TXT)
- **CV Analysis**: AI-powered analysis of skills, experience, and education
- **Template Selection**: Choose from multiple report templates
- **PDF Generation**: Export analysis results as professional PDF reports
- **Modern UI**: Built with Next.js and Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, React 18
- **Styling**: Tailwind CSS
- **Language**: JavaScript
- **UI Components**: Custom component library

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd cv-analyzer-generator
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── analyze-cv/
│   │   │   └── route.js
│   │   └── generate-pdf/
│   │       └── route.js
│   ├── globals.css
│   ├── layout.js
│   └── page.js
├── components/
│   ├── ui/
│   │   ├── badge.jsx
│   │   ├── button.jsx
│   │   ├── card.jsx
│   │   ├── dialog.jsx
│   │   ├── form.jsx
│   │   ├── input.jsx
│   │   ├── label.jsx
│   │   ├── progress.jsx
│   │   ├── select.jsx
│   │   ├── sheet.jsx
│   │   ├── tabs.jsx
│   │   └── textarea.jsx
│   ├── cv-analysis.jsx
│   ├── cv-form.jsx
│   ├── file-upload.jsx
│   └── template-selector.jsx
└── lib/
    └── utils.js
```

## Usage

1. **Upload CV**: Drag and drop or click to upload your CV file
2. **Select Template**: Choose from Professional, Creative, Minimal, or Executive templates
3. **Analyze**: Click "Analyze CV" to process your document
4. **Review Results**: View detailed analysis including skills, experience, and recommendations
5. **Generate PDF**: Export your analysis as a professional PDF report

## API Endpoints

- `POST /api/analyze-cv`: Analyzes uploaded CV files
- `POST /api/generate-pdf`: Generates PDF reports from analysis data

## Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

### Adding New Features

1. Create new components in `src/components/`
2. Add API routes in `src/app/api/`
3. Update UI components in `src/components/ui/`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
