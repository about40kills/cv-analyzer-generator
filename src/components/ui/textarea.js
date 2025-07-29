// Textarea utilities for Node.js
const Textarea = {
  // Generate textarea HTML with proper styling
  generateHTML(options = {}) {
    const {
      name = '',
      id = '',
      placeholder = '',
      value = '',
      className = '',
      required = false,
      disabled = false,
      readonly = false,
      rows = 4,
      cols = '',
      maxlength = '',
      minlength = '',
      wrap = 'soft'
    } = options;

    const baseClasses = 'flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-vertical';
    
    const allClasses = `${baseClasses} ${className}`.trim();

    const attributes = [
      `class="${allClasses}"`,
      name ? `name="${name}"` : '',
      id ? `id="${id}"` : '',
      placeholder ? `placeholder="${placeholder}"` : '',
      required ? 'required' : '',
      disabled ? 'disabled' : '',
      readonly ? 'readonly' : '',
      rows ? `rows="${rows}"` : '',
      cols ? `cols="${cols}"` : '',
      maxlength ? `maxlength="${maxlength}"` : '',
      minlength ? `minlength="${minlength}"` : '',
      wrap ? `wrap="${wrap}"` : ''
    ].filter(Boolean).join(' ');

    return `<textarea ${attributes}>${value}</textarea>`;
  },

  // Generate textarea with label
  generateWithLabel(options = {}) {
    const {
      label = '',
      labelFor = '',
      textareaOptions = {},
      required = false,
      error = '',
      helpText = '',
      characterCount = false
    } = options;

    const textareaId = labelFor || textareaOptions.id || `textarea_${Date.now()}`;
    const textareaHTML = this.generateHTML({ ...textareaOptions, id: textareaId });

    let html = '<div class="space-y-2">';
    
    if (label) {
      html += `<label for="${textareaId}" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        ${label}${required ? ' <span class="text-red-500">*</span>' : ''}
      </label>`;
    }
    
    html += textareaHTML;
    
    if (characterCount && textareaOptions.maxlength) {
      html += `<div class="flex justify-end">
        <span class="text-xs text-gray-500" id="${textareaId}_count">0/${textareaOptions.maxlength}</span>
      </div>`;
    }
    
    if (error) {
      html += `<p class="text-sm text-red-600">${error}</p>`;
    } else if (helpText) {
      html += `<p class="text-sm text-gray-600">${helpText}</p>`;
    }
    
    html += '</div>';
    
    return html;
  },

  // Generate textarea with different sizes
  generateSmall(options = {}) {
    return this.generateHTML({
      rows: 2,
      className: 'min-h-[60px]',
      ...options
    });
  },

  generateMedium(options = {}) {
    return this.generateHTML({
      rows: 4,
      className: 'min-h-[80px]',
      ...options
    });
  },

  generateLarge(options = {}) {
    return this.generateHTML({
      rows: 8,
      className: 'min-h-[160px]',
      ...options
    });
  },

  // Generate auto-resizing textarea
  generateAutoResize(options = {}) {
    const textareaId = options.id || `textarea_${Date.now()}`;
    
    const textareaHTML = this.generateHTML({
      ...options,
      id: textareaId,
      className: `${options.className || ''} overflow-hidden`.trim()
    });

    const script = `
      <script>
        (function() {
          const textarea = document.getElementById('${textareaId}');
          if (textarea) {
            function autoResize() {
              textarea.style.height = 'auto';
              textarea.style.height = textarea.scrollHeight + 'px';
            }
            textarea.addEventListener('input', autoResize);
            textarea.addEventListener('keyup', autoResize);
            // Initial resize
            setTimeout(autoResize, 0);
          }
        })();
      </script>
    `;

    return textareaHTML + script;
  },

  // Generate textarea with character counter
  generateWithCounter(options = {}) {
    const {
      maxlength = 500,
      showRemaining = false,
      ...textareaOptions
    } = options;

    const textareaId = textareaOptions.id || `textarea_${Date.now()}`;
    const counterId = `${textareaId}_counter`;

    const textareaHTML = this.generateHTML({
      ...textareaOptions,
      id: textareaId,
      maxlength
    });

    const counterHTML = `
      <div class="flex justify-end mt-1">
        <span class="text-xs text-gray-500" id="${counterId}">
          ${showRemaining ? `${maxlength} remaining` : `0/${maxlength}`}
        </span>
      </div>
    `;

    const script = `
      <script>
        (function() {
          const textarea = document.getElementById('${textareaId}');
          const counter = document.getElementById('${counterId}');
          if (textarea && counter) {
            function updateCounter() {
              const current = textarea.value.length;
              const max = ${maxlength};
              if (${showRemaining}) {
                const remaining = max - current;
                counter.textContent = remaining + ' remaining';
                counter.className = remaining < 10 ? 'text-xs text-red-500' : 'text-xs text-gray-500';
              } else {
                counter.textContent = current + '/' + max;
                counter.className = current > max * 0.9 ? 'text-xs text-orange-500' : 'text-xs text-gray-500';
              }
            }
            textarea.addEventListener('input', updateCounter);
            textarea.addEventListener('keyup', updateCounter);
            updateCounter();
          }
        })();
      </script>
    `;

    return `<div>${textareaHTML}${counterHTML}</div>${script}`;
  },

  // Get CSS classes for different textarea states
  getClasses(state = 'default', size = 'medium') {
    const baseClasses = 'flex w-full rounded-md border px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-vertical';
    
    const stateClasses = {
      default: 'border-gray-300 bg-white focus-visible:ring-blue-500',
      error: 'border-red-500 bg-white focus-visible:ring-red-500',
      success: 'border-green-500 bg-white focus-visible:ring-green-500',
      disabled: 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
    };

    const sizeClasses = {
      small: 'min-h-[60px]',
      medium: 'min-h-[80px]',
      large: 'min-h-[160px]'
    };

    return `${baseClasses} ${stateClasses[state] || stateClasses.default} ${sizeClasses[size] || sizeClasses.medium}`;
  },

  // Validate textarea configuration
  validateConfig(config) {
    const errors = [];

    if (config.rows && (isNaN(parseInt(config.rows)) || parseInt(config.rows) < 1)) {
      errors.push('rows must be a positive number');
    }

    if (config.cols && (isNaN(parseInt(config.cols)) || parseInt(config.cols) < 1)) {
      errors.push('cols must be a positive number');
    }

    if (config.maxlength && (isNaN(parseInt(config.maxlength)) || parseInt(config.maxlength) < 1)) {
      errors.push('maxlength must be a positive number');
    }

    if (config.minlength && (isNaN(parseInt(config.minlength)) || parseInt(config.minlength) < 0)) {
      errors.push('minlength must be a non-negative number');
    }

    if (config.wrap && !['soft', 'hard', 'off'].includes(config.wrap)) {
      errors.push('wrap must be "soft", "hard", or "off"');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

module.exports = Textarea;
