const { cn } = require('../../lib/utils');

/**
 * Label component for form inputs and accessibility
 */
class Label {
  /**
   * Create label element
   * @param {Object} options - Label options
   * @param {string} options.text - Label text content
   * @param {string} options.htmlFor - Associated input element ID
   * @param {string} options.className - Additional CSS classes
   * @param {boolean} options.required - Whether the associated field is required
   * @param {string} options.id - Label element ID
   * @param {Object} options.attributes - Additional HTML attributes
   * @returns {string} Label HTML
   */
  static create(options = {}) {
    const {
      text = '',
      htmlFor = '',
      className = '',
      required = false,
      id = '',
      attributes = {}
    } = options;

    const classes = cn(
      'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      className
    );

    const attrs = Object.entries(attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');

    return `
      <label 
        ${id ? `id="${id}"` : ''}
        ${htmlFor ? `for="${htmlFor}"` : ''}
        class="${classes}"
        ${attrs}
      >
        ${text}
        ${required ? '<span class="text-destructive ml-1">*</span>' : ''}
      </label>
    `;
  }

  /**
   * Create label with tooltip
   * @param {Object} options - Label options with tooltip
   * @param {string} options.text - Label text
   * @param {string} options.tooltip - Tooltip text
   * @param {string} options.htmlFor - Associated input ID
   * @param {boolean} options.required - Whether field is required
   * @returns {string} Label with tooltip HTML
   */
  static createWithTooltip(options = {}) {
    const {
      text = '',
      tooltip = '',
      htmlFor = '',
      required = false
    } = options;

    const labelHtml = this.create({
      text,
      htmlFor,
      required,
      className: 'inline-flex items-center gap-1'
    });

    if (!tooltip) return labelHtml;

    return `
      <div class="inline-flex items-center gap-1">
        ${labelHtml}
        <span 
          class="inline-flex items-center justify-center w-4 h-4 text-xs bg-muted rounded-full cursor-help"
          title="${tooltip}"
        >
          ?
        </span>
      </div>
    `;
  }

  /**
   * Create fieldset legend (group label)
   * @param {Object} options - Legend options
   * @param {string} options.text - Legend text
   * @param {string} options.className - Additional CSS classes
   * @param {boolean} options.required - Whether fieldset is required
   * @returns {string} Legend HTML
   */
  static createLegend(options = {}) {
    const {
      text = '',
      className = '',
      required = false
    } = options;

    const classes = cn(
      'text-base font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      className
    );

    return `
      <legend class="${classes}">
        ${text}
        ${required ? '<span class="text-destructive ml-1">*</span>' : ''}
      </legend>
    `;
  }

  /**
   * Create label for checkbox or radio
   * @param {Object} options - Checkbox/radio label options
   * @param {string} options.text - Label text
   * @param {string} options.htmlFor - Associated input ID
   * @param {string} options.inputType - Input type (checkbox, radio)
   * @param {boolean} options.checked - Whether input is checked
   * @returns {string} Checkbox/radio label HTML
   */
  static createForInput(options = {}) {
    const {
      text = '',
      htmlFor = '',
      inputType = 'checkbox',
      checked = false
    } = options;

    const classes = cn(
      'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      'flex items-center gap-2 cursor-pointer'
    );

    return `
      <label 
        ${htmlFor ? `for="${htmlFor}"` : ''}
        class="${classes}"
      >
        <input 
          type="${inputType}"
          ${htmlFor ? `id="${htmlFor}"` : ''}
          ${checked ? 'checked' : ''}
          class="peer"
        />
        <span>${text}</span>
      </label>
    `;
  }

  /**
   * Create multiple labels for a group
   * @param {Array} labels - Array of label options
   * @param {string} groupClass - CSS class for the group container
   * @returns {string} Multiple labels HTML
   */
  static createGroup(labels = [], groupClass = 'space-y-2') {
    const labelsHtml = labels.map(label => this.create(label)).join('\n');
    
    return `
      <div class="${groupClass}">
        ${labelsHtml}
      </div>
    `;
  }

  /**
   * Get label CSS classes
   * @param {string} className - Additional classes
   * @returns {string} Combined CSS classes
   */
  static getClasses(className = '') {
    return cn(
      'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      className
    );
  }

  /**
   * Create accessible label with ARIA attributes
   * @param {Object} options - Accessible label options
   * @param {string} options.text - Label text
   * @param {string} options.htmlFor - Associated control ID
   * @param {string} options.describedBy - ID of element that describes the control
   * @param {boolean} options.required - Whether field is required
   * @returns {string} Accessible label HTML
   */
  static createAccessible(options = {}) {
    const {
      text = '',
      htmlFor = '',
      describedBy = '',
      required = false
    } = options;

    const attributes = {};
    if (describedBy) {
      attributes['aria-describedby'] = describedBy;
    }

    return this.create({
      text,
      htmlFor,
      required,
      attributes
    });
  }
}

module.exports = { Label };
