const { cn } = require('../../lib/utils');

/**
 * Form components for handling user input and validation
 */
class Form {
  /**
   * Create form container
   * @param {Object} options - Form options
   * @param {string} options.id - Form ID
   * @param {string} options.className - Additional CSS classes
   * @param {string} options.action - Form action URL
   * @param {string} options.method - Form method (GET, POST)
   * @param {string} options.enctype - Form encoding type
   * @param {string} options.content - Form content HTML
   * @param {Object} options.attributes - Additional HTML attributes
   * @returns {string} Form HTML
   */
  static create(options = {}) {
    const {
      id = '',
      className = '',
      action = '',
      method = 'POST',
      enctype = '',
      content = '',
      attributes = {}
    } = options;

    const classes = cn('space-y-6', className);
    
    const attrs = Object.entries(attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');

    return `
      <form 
        ${id ? `id="${id}"` : ''}
        class="${classes}"
        ${action ? `action="${action}"` : ''}
        method="${method}"
        ${enctype ? `enctype="${enctype}"` : ''}
        ${attrs}
      >
        ${content}
      </form>
    `;
  }

  /**
   * Create form field container
   * @param {Object} options - Field options
   * @param {string} options.className - Additional CSS classes
   * @param {string} options.content - Field content HTML
   * @param {string} options.id - Field ID
   * @returns {string} Form field HTML
   */
  static createField(options = {}) {
    const {
      className = '',
      content = '',
      id = ''
    } = options;

    const classes = cn('space-y-2', className);

    return `
      <div 
        ${id ? `id="${id}"` : ''}
        class="${classes}"
      >
        ${content}
      </div>
    `;
  }

  /**
   * Create form label
   * @param {Object} options - Label options
   * @param {string} options.text - Label text
   * @param {string} options.htmlFor - Associated input ID
   * @param {string} options.className - Additional CSS classes
   * @param {boolean} options.required - Whether field is required
   * @returns {string} Form label HTML
   */
  static createLabel(options = {}) {
    const {
      text = '',
      htmlFor = '',
      className = '',
      required = false
    } = options;

    const classes = cn(
      'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      className
    );

    return `
      <label 
        ${htmlFor ? `for="${htmlFor}"` : ''}
        class="${classes}"
      >
        ${text}
        ${required ? '<span class="text-destructive">*</span>' : ''}
      </label>
    `;
  }

  /**
   * Create form control wrapper
   * @param {Object} options - Control options
   * @param {string} options.content - Control content HTML
   * @param {string} options.className - Additional CSS classes
   * @returns {string} Form control HTML
   */
  static createControl(options = {}) {
    const {
      content = '',
      className = ''
    } = options;

    const classes = cn('', className);

    return `
      <div class="${classes}">
        ${content}
      </div>
    `;
  }

  /**
   * Create form description
   * @param {Object} options - Description options
   * @param {string} options.text - Description text
   * @param {string} options.className - Additional CSS classes
   * @returns {string} Form description HTML
   */
  static createDescription(options = {}) {
    const {
      text = '',
      className = ''
    } = options;

    const classes = cn('text-sm text-muted-foreground', className);

    return `
      <p class="${classes}">
        ${text}
      </p>
    `;
  }

  /**
   * Create form error message
   * @param {Object} options - Error options
   * @param {string} options.message - Error message
   * @param {string} options.className - Additional CSS classes
   * @returns {string} Form error HTML
   */
  static createError(options = {}) {
    const {
      message = '',
      className = ''
    } = options;

    if (!message) return '';

    const classes = cn('text-sm text-destructive', className);

    return `
      <p class="${classes}" role="alert">
        ${message}
      </p>
    `;
  }

  /**
   * Create complete form field with label, control, description, and error
   * @param {Object} options - Complete field options
   * @param {string} options.label - Field label
   * @param {string} options.control - Control HTML
   * @param {string} options.description - Field description
   * @param {string} options.error - Error message
   * @param {boolean} options.required - Whether field is required
   * @param {string} options.fieldId - Field container ID
   * @param {string} options.controlId - Control element ID
   * @returns {string} Complete form field HTML
   */
  static createCompleteField(options = {}) {
    const {
      label = '',
      control = '',
      description = '',
      error = '',
      required = false,
      fieldId = '',
      controlId = ''
    } = options;

    const labelHtml = label ? this.createLabel({
      text: label,
      htmlFor: controlId,
      required
    }) : '';

    const controlHtml = this.createControl({ content: control });
    const descriptionHtml = description ? this.createDescription({ text: description }) : '';
    const errorHtml = this.createError({ message: error });

    const fieldContent = [labelHtml, controlHtml, descriptionHtml, errorHtml]
      .filter(Boolean)
      .join('\n');

    return this.createField({
      id: fieldId,
      content: fieldContent
    });
  }

  /**
   * Validate form data
   * @param {Object} data - Form data to validate
   * @param {Object} rules - Validation rules
   * @returns {Object} Validation result with errors
   */
  static validate(data, rules) {
    const errors = {};

    Object.keys(rules).forEach(field => {
      const value = data[field];
      const fieldRules = rules[field];

      if (fieldRules.required && (!value || value.trim() === '')) {
        errors[field] = `${field} is required`;
        return;
      }

      if (value && fieldRules.minLength && value.length < fieldRules.minLength) {
        errors[field] = `${field} must be at least ${fieldRules.minLength} characters`;
        return;
      }

      if (value && fieldRules.maxLength && value.length > fieldRules.maxLength) {
        errors[field] = `${field} must be no more than ${fieldRules.maxLength} characters`;
        return;
      }

      if (value && fieldRules.pattern && !fieldRules.pattern.test(value)) {
        errors[field] = fieldRules.message || `${field} format is invalid`;
        return;
      }

      if (fieldRules.custom) {
        const customError = fieldRules.custom(value);
        if (customError) {
          errors[field] = customError;
        }
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

module.exports = { Form };
