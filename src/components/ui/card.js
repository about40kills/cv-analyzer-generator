// Card utilities for Node.js
const Card = {
  // Generate card HTML structure
  generateHTML(options = {}) {
    const {
      className = '',
      id = '',
      header = null,
      content = '',
      footer = null
    } = options;

    const cardClasses = `rounded-lg border bg-white text-gray-900 shadow-sm ${className}`.trim();
    const cardId = id ? `id="${id}"` : '';

    let html = `<div class="${cardClasses}" ${cardId}>`;
    
    if (header) {
      html += this.generateHeaderHTML(header);
    }
    
    if (content) {
      html += this.generateContentHTML(content);
    }
    
    if (footer) {
      html += this.generateFooterHTML(footer);
    }
    
    html += '</div>';
    
    return html;
  },

  // Generate card header HTML
  generateHeaderHTML(header) {
    if (typeof header === 'string') {
      return `<div class="flex flex-col space-y-1.5 p-6">
        <h3 class="text-2xl font-semibold leading-none tracking-tight">${header}</h3>
      </div>`;
    }

    const {
      title = '',
      description = '',
      className = ''
    } = header;

    const headerClasses = `flex flex-col space-y-1.5 p-6 ${className}`.trim();

    let headerHTML = `<div class="${headerClasses}">`;
    
    if (title) {
      headerHTML += `<h3 class="text-2xl font-semibold leading-none tracking-tight">${title}</h3>`;
    }
    
    if (description) {
      headerHTML += `<p class="text-sm text-gray-600">${description}</p>`;
    }
    
    headerHTML += '</div>';
    
    return headerHTML;
  },

  // Generate card content HTML
  generateContentHTML(content) {
    if (typeof content === 'string') {
      return `<div class="p-6 pt-0">${content}</div>`;
    }

    const {
      html = '',
      className = ''
    } = content;

    const contentClasses = `p-6 pt-0 ${className}`.trim();
    
    return `<div class="${contentClasses}">${html}</div>`;
  },

  // Generate card footer HTML
  generateFooterHTML(footer) {
    if (typeof footer === 'string') {
      return `<div class="flex items-center p-6 pt-0">${footer}</div>`;
    }

    const {
      html = '',
      className = ''
    } = footer;

    const footerClasses = `flex items-center p-6 pt-0 ${className}`.trim();
    
    return `<div class="${footerClasses}">${html}</div>`;
  },

  // Get CSS classes for different card parts
  getClasses() {
    return {
      card: 'rounded-lg border bg-white text-gray-900 shadow-sm',
      header: 'flex flex-col space-y-1.5 p-6',
      title: 'text-2xl font-semibold leading-none tracking-tight',
      description: 'text-sm text-gray-600',
      content: 'p-6 pt-0',
      footer: 'flex items-center p-6 pt-0'
    };
  },

  // Generate card with form content
  generateFormCard(options = {}) {
    const {
      title = '',
      description = '',
      formHTML = '',
      className = ''
    } = options;

    return this.generateHTML({
      className,
      header: { title, description },
      content: { html: formHTML }
    });
  },

  // Generate stats card
  generateStatsCard(options = {}) {
    const {
      title = '',
      value = '',
      description = '',
      icon = '',
      className = ''
    } = options;

    const contentHTML = `
      <div class="flex items-center justify-between">
        <div>
          <div class="text-2xl font-bold">${value}</div>
          <p class="text-sm text-gray-600">${description}</p>
        </div>
        ${icon ? `<div class="text-gray-400">${icon}</div>` : ''}
      </div>
    `;

    return this.generateHTML({
      className,
      header: { title },
      content: { html: contentHTML }
    });
  },

  // Generate action card with buttons
  generateActionCard(options = {}) {
    const {
      title = '',
      description = '',
      actions = [],
      className = ''
    } = options;

    const actionsHTML = actions.map(action => {
      const Button = require('./button');
      return Button.generateHTML(action);
    }).join(' ');

    return this.generateHTML({
      className,
      header: { title, description },
      footer: { html: actionsHTML }
    });
  },

  // Validate card configuration
  validateConfig(config) {
    const errors = [];

    if (config.header && typeof config.header !== 'string' && typeof config.header !== 'object') {
      errors.push('Header must be a string or object');
    }

    if (config.content && typeof config.content !== 'string' && typeof config.content !== 'object') {
      errors.push('Content must be a string or object');
    }

    if (config.footer && typeof config.footer !== 'string' && typeof config.footer !== 'object') {
      errors.push('Footer must be a string or object');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

module.exports = Card;
