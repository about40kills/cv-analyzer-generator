// Utility functions for Node.js CV Analyzer
const Utils = {
  // Format date to readable string
  formatDate(date) {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Sanitize string for safe output
  sanitizeString(str) {
    if (typeof str !== 'string') return '';
    
    return str
      .trim()
      .replace(/[<>]/g, '') // Basic XSS prevention
      .replace(/\n\s*\n/g, '\n') // Remove multiple newlines
      .slice(0, 5000); // Limit length
  },

  // Validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate phone format
  isValidPhone(phone) {
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  },

  // Generate random ID
  generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Deep clone object
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => this.deepClone(item));
    
    const cloned = {};
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }
    return cloned;
  },

  // Calculate percentage
  calculatePercentage(value, total) {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  },

  // Truncate text with ellipsis
  truncateText(text, maxLength = 100) {
    if (!text || typeof text !== 'string') return '';
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength).trim() + '...';
  },

  // Extract keywords from text
  extractKeywords(text, minLength = 3) {
    if (!text || typeof text !== 'string') return [];
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length >= minLength)
      .filter((word, index, arr) => arr.indexOf(word) === index) // Remove duplicates
      .slice(0, 20); // Limit to 20 keywords
  },

  // Calculate text similarity (simple)
  calculateSimilarity(text1, text2) {
    if (!text1 || !text2) return 0;
    
    const words1 = this.extractKeywords(text1);
    const words2 = this.extractKeywords(text2);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return union.length > 0 ? intersection.length / union.length : 0;
  },

  // Capitalize first letter of each word
  capitalizeWords(str) {
    if (!str || typeof str !== 'string') return '';
    
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  },

  // Parse duration strings (e.g., "2020-2022", "Jan 2020 - Present")
  parseDuration(durationStr) {
    if (!durationStr || typeof durationStr !== 'string') {
      return { start: null, end: null, duration: 0 };
    }

    const str = durationStr.toLowerCase();
    const currentYear = new Date().getFullYear();
    
    // Extract years
    const yearMatches = str.match(/\b(19|20)\d{2}\b/g);
    
    if (yearMatches && yearMatches.length >= 1) {
      const startYear = parseInt(yearMatches[0]);
      let endYear = yearMatches.length > 1 ? parseInt(yearMatches[1]) : null;
      
      // Handle "present" or "current"
      if (str.includes('present') || str.includes('current')) {
        endYear = currentYear;
      }
      
      const duration = endYear ? endYear - startYear : currentYear - startYear;
      
      return {
        start: startYear,
        end: endYear,
        duration: Math.max(0, duration)
      };
    }
    
    return { start: null, end: null, duration: 0 };
  },

  // Validate and normalize URL
  normalizeUrl(url) {
    if (!url || typeof url !== 'string') return '';
    
    url = url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    try {
      const urlObj = new URL(url);
      return urlObj.href;
    } catch (error) {
      return '';
    }
  },

  // Generate slug from text
  generateSlug(text) {
    if (!text || typeof text !== 'string') return '';
    
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  },

  // Format currency
  formatCurrency(amount, currency = 'USD') {
    if (typeof amount !== 'number') return '';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  // Debounce function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Check if object is empty
  isEmpty(obj) {
    if (obj == null) return true;
    if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
    return Object.keys(obj).length === 0;
  },

  // Merge objects deeply
  mergeDeep(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
          result[key] = this.mergeDeep(result[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }
    
    return result;
  },

  // Create error response
  createErrorResponse(message, code = 'ERROR', details = null) {
    return {
      success: false,
      error: {
        message: message,
        code: code,
        details: details,
        timestamp: new Date().toISOString()
      }
    };
  },

  // Create success response
  createSuccessResponse(data, message = 'Success') {
    return {
      success: true,
      message: message,
      data: data,
      timestamp: new Date().toISOString()
    };
  }
};

module.exports = Utils;
