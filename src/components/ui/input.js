// Input utilities for Node.js
const Input = {
  // Generate input HTML with proper styling
  generateHTML(options = {}) {
    const {
      type = 'text',
      name = '',
      id = '',
      placeholder = '',
      value = '',
      className = '',
      required = false,
      disabled = false,
      readonly = false,
      min = '',
      max = '',
      maxlength = '',
      pattern = '',
      autocomplete = ''
    } = options;

    const baseClasses = 'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
    
    const allClasses = `${baseClasses} ${className}`.trim();

    const attributes = [
      `type="${type}"`,
      `class="${allClasses}"`,
      name ? `name="${name}"` : '',
      id ? `id="${id}"` : '',
      placeholder ? `placeholder="${placeholder}"` : '',
      value ? `value="${value}"` : '',
      required ? 'required' : '',
      disabled ? 'disabled' : '',
      readonly ? 'readonly' : '',
      min ? `min="${min}"` : '',
      max ? `max="${max}"` : '',
      maxlength ? `maxlength="${maxlength}"` : '',
      pattern ? `pattern="${pattern}"` : '',
      autocomplete ? `autocomplete="${autocomplete}"` : ''
    ].filter(Boolean).join(' ');

    return `<input ${attributes}>`;
  },

  // Generate input with label
  generateWithLabel(options = {}) {
    const {
      label = '',
      labelFor = '',
      inputOptions = {},
      required = false,
      error = '',
      helpText = ''
    } = options;

    const inputId = labelFor || inputOptions.id || `input_${Date.now()}`;
    const inputHTML = this.generateHTML({ ...inputOptions, id: inputId });

    let html = '<div class="space-y-2">';
    
    if (label) {
      html += `<label for="${inputId}" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        ${label}${required ? ' <span class="text-red-500">*</span>' : ''}
      </label>`;
    }
    
    html += inputHTML;
    
    if (error) {
      html += `<p class="text-sm text-red-600">${error}</p>`;
    } else if (helpText) {
      html += `<p class="text-sm text-gray-600">${helpText}</p>`;
    }
    
    html += '</div>';
    
    return html;
  },

  // Generate different input types
  generateEmailInput(options = {}) {
    return this.generateHTML({
      type: 'email',
      autocomplete: 'email',
      ...options
    });
  },

  generatePasswordInput(options = {}) {
    return this.generateHTML({
      type: 'password',
      autocomplete: 'current-password',
      ...options
    });
  },

  generatePhoneInput(options = {}) {
    return this.generateHTML({
      type: 'tel',
      autocomplete: 'tel',
      ...options
    });
  },

  generateNumberInput(options = {}) {
    return this.generateHTML({
      type: 'number',
      ...options
    });
  },

  generateDateInput(options = {}) {
    return this.generateHTML({
      type: 'date',
      ...options
    });
  },

  generateFileInput(options = {}) {
    const {
      accept = '',
      multiple = false,
      ...otherOptions
    } = options;

    const fileAttributes = [
      accept ? `accept="${accept}"` : '',
      multiple ? 'multiple' : ''
    ].filter(Boolean);

    return this.generateHTML({
      type: 'file',
      className: 'file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100',
      ...otherOptions,
      ...Object.fromEntries(fileAttributes.map(attr => {
        const [key, value] = attr.split('=');
        return [key, value ? value.replace(/"/g, '') : true];
      }))
    });
  },

  // Generate search input
  generateSearchInput(options = {}) {
    return this.generateHTML({
      type: 'search',
      placeholder: 'Search...',
      ...options
    });
  },

  // Get CSS classes for different input states
  getClasses(state = 'default') {
    const baseClasses = 'flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
    
    const stateClasses = {
      default: 'border-gray-300 bg-white focus-visible:ring-blue-500',
      error: 'border-red-500 bg-white focus-visible:ring-red-500',
      success: 'border-green-500 bg-white focus-visible:ring-green-500',
      disabled: 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
    };

    return `${baseClasses} ${stateClasses[state] || stateClasses.default}`;
  },

  // Validate input configuration
  validateConfig(config) {
    const validTypes = ['text', 'email', 'password', 'number', 'tel', 'url', 'search', 'date', 'time', 'datetime-local', 'file', 'hidden', 'checkbox', 'radio'];
    const errors = [];

    if (config.type && !validTypes.includes(config.type)) {
      errors.push(`Invalid input type: ${config.type}. Valid options: ${validTypes.join(', ')}`);
    }

    if (config.type === 'email' && config.pattern) {
      errors.push('Email inputs should not use pattern attribute');
    }

    if (config.maxlength && isNaN(parseInt(config.maxlength))) {
      errors.push('maxlength must be a number');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Generate input group (input with prefix/suffix)
  generateInputGroup(options = {}) {
    const {
      prefix = '',
      suffix = '',
      inputOptions = {},
      className = ''
    } = options;

    const groupClasses = `relative flex items-center ${className}`.trim();
    
    let html = `<div class="${groupClasses}">`;
    
    if (prefix) {
      html += `<div class="absolute left-3 z-10 text-gray-500">${prefix}</div>`;
      inputOptions.className = `pl-10 ${inputOptions.className || ''}`.trim();
    }
    
    html += this.generateHTML(inputOptions);
    
    if (suffix) {
      html += `<div class="absolute right-3 z-10 text-gray-500">${suffix}</div>`;
      if (!prefix) {
        inputOptions.className = `pr-10 ${inputOptions.className || ''}`.trim();
      }
    }
    
    html += '</div>';
    
    return html;
  }
};

module.exports = Input;
