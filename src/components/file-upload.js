// File Upload handling module for Node.js
const FileUpload = {
  // Supported file types
  supportedTypes: {
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'text/plain': 'txt',
    'image/jpeg': 'jpg',
    'image/png': 'png'
  },

  // Maximum file size (5MB)
  maxFileSize: 5 * 1024 * 1024,

  // Validate uploaded file
  validateFile(file) {
    const errors = [];
    
    if (!file) {
      errors.push('No file provided');
      return { isValid: false, errors };
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      errors.push(`File size exceeds ${this.maxFileSize / (1024 * 1024)}MB limit`);
    }

    // Check file type
    if (!this.supportedTypes[file.mimetype]) {
      errors.push(`Unsupported file type: ${file.mimetype}. Supported types: PDF, DOC, DOCX, TXT, JPG, PNG`);
    }

    // Check if file has content
    if (file.size === 0) {
      errors.push('File appears to be empty');
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
      fileType: this.supportedTypes[file.mimetype] || 'unknown'
    };
  },

  // Get file information
  getFileInfo(file) {
    return {
      name: file.originalname || file.name || 'unknown',
      size: file.size,
      type: file.mimetype,
      extension: this.supportedTypes[file.mimetype] || 'unknown',
      sizeFormatted: this.formatFileSize(file.size)
    };
  },

  // Format file size for display
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Process uploaded file for analysis
  async processUploadedFile(file, jobDescription = '') {
    try {
      // Validate file first
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(`File validation failed: ${validation.errors.join(', ')}`);
      }

      // Get file info
      const fileInfo = this.getFileInfo(file);
      
      // Prepare file data for processing
      const processData = {
        buffer: file.buffer,
        filename: fileInfo.name,
        mimetype: file.mimetype,
        size: file.size,
        jobDescription: jobDescription,
        uploadTimestamp: new Date().toISOString()
      };

      return {
        success: true,
        fileInfo: fileInfo,
        processData: processData,
        validation: validation
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        fileInfo: null,
        processData: null
      };
    }
  },

  // Generate upload response
  generateUploadResponse(result, analysisResult = null) {
    if (!result.success) {
      return {
        success: false,
        message: result.error,
        data: null
      };
    }

    const response = {
      success: true,
      message: 'File uploaded and processed successfully',
      data: {
        fileInfo: result.fileInfo,
        uploadedAt: new Date().toISOString()
      }
    };

    // Add analysis results if available
    if (analysisResult) {
      response.data.analysis = analysisResult;
    }

    return response;
  },

  // Handle multiple file uploads (if needed in future)
  validateMultipleFiles(files) {
    const results = [];
    const errors = [];

    if (!Array.isArray(files)) {
      files = [files];
    }

    files.forEach((file, index) => {
      const validation = this.validateFile(file);
      results.push({
        index: index,
        filename: file.originalname || file.name,
        validation: validation
      });

      if (!validation.isValid) {
        errors.push(`File ${index + 1} (${file.originalname}): ${validation.errors.join(', ')}`);
      }
    });

    return {
      isValid: errors.length === 0,
      results: results,
      errors: errors
    };
  },

  // Get file type icon/description
  getFileTypeInfo(mimetype) {
    const typeInfo = {
      'application/pdf': { icon: '📄', description: 'PDF Document' },
      'application/msword': { icon: '📝', description: 'Word Document' },
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: '📝', description: 'Word Document' },
      'text/plain': { icon: '📄', description: 'Text File' },
      'image/jpeg': { icon: '🖼️', description: 'JPEG Image' },
      'image/png': { icon: '🖼️', description: 'PNG Image' }
    };

    return typeInfo[mimetype] || { icon: '📎', description: 'Unknown File Type' };
  },

  // Clean up temporary files (utility function)
  cleanupTempFiles(tempFilePaths) {
    const fs = require('fs');
    
    if (!Array.isArray(tempFilePaths)) {
      tempFilePaths = [tempFilePaths];
    }

    tempFilePaths.forEach(filePath => {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error(`Failed to cleanup temp file ${filePath}:`, error);
      }
    });
  },

  // Generate file upload middleware configuration
  getMulterConfig() {
    const multer = require('multer');
    
    return multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: this.maxFileSize,
        files: 1 // Limit to 1 file at a time
      },
      fileFilter: (req, file, cb) => {
        if (this.supportedTypes[file.mimetype]) {
          cb(null, true);
        } else {
          cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
        }
      }
    });
  }
};

module.exports = FileUpload;
