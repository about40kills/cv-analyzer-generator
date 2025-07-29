const { cn } = require('../../lib/utils');

/**
 * Sheet component for slide-out panels and drawers
 */
class Sheet {
  /**
   * Create sheet overlay
   * @param {Object} options - Sheet options
   * @param {string} options.id - Sheet ID
   * @param {string} options.className - Additional CSS classes
   * @param {string} options.content - Sheet content HTML
   * @param {boolean} options.open - Whether sheet is open
   * @param {string} options.side - Sheet side (top, right, bottom, left)
   * @param {Object} options.attributes - Additional HTML attributes
   * @returns {string} Sheet overlay HTML
   */
  static create(options = {}) {
    const {
      id = '',
      className = '',
      content = '',
      open = false,
      side = 'right',
      attributes = {}
    } = options;

    const classes = cn(
      'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-opacity duration-200',
      open ? 'opacity-100' : 'opacity-0 pointer-events-none',
      className
    );

    const attrs = Object.entries(attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');

    return `
      <div 
        ${id ? `id="${id}"` : ''}
        class="${classes}"
        role="dialog"
        aria-modal="true"
        onclick="this.style.display='none'"
        ${attrs}
      >
        ${content}
      </div>
    `;
  }

  /**
   * Create sheet content container
   * @param {Object} options - Sheet content options
   * @param {string} options.className - Additional CSS classes
   * @param {string} options.content - Content HTML
   * @param {string} options.side - Sheet side (top, right, bottom, left)
   * @param {string} options.size - Sheet size (sm, md, lg, xl)
   * @param {boolean} options.closeButton - Whether to show close button
   * @returns {string} Sheet content HTML
   */
  static createContent(options = {}) {
    const {
      className = '',
      content = '',
      side = 'right',
      size = 'md',
      closeButton = true
    } = options;

    const sideClasses = {
      top: 'inset-x-0 top-0 border-b',
      right: 'inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm',
      bottom: 'inset-x-0 bottom-0 border-t',
      left: 'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm'
    };

    const sizeClasses = {
      sm: side === 'top' || side === 'bottom' ? 'h-1/3' : 'sm:max-w-xs',
      md: side === 'top' || side === 'bottom' ? 'h-1/2' : 'sm:max-w-sm',
      lg: side === 'top' || side === 'bottom' ? 'h-2/3' : 'sm:max-w-lg',
      xl: side === 'top' || side === 'bottom' ? 'h-5/6' : 'sm:max-w-xl'
    };

    const classes = cn(
      'fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out duration-300',
      sideClasses[side] || sideClasses.right,
      sizeClasses[size] || sizeClasses.md,
      className
    );

    const closeButtonHtml = closeButton ? `
      <button 
        class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        onclick="this.closest('[role=dialog]').style.display='none'"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    ` : '';

    return `
      <div class="${classes}" onclick="event.stopPropagation()">
        ${closeButtonHtml}
        ${content}
      </div>
    `;
  }

  /**
   * Create sheet header
   * @param {Object} options - Header options
   * @param {string} options.className - Additional CSS classes
   * @param {string} options.content - Header content HTML
   * @returns {string} Sheet header HTML
   */
  static createHeader(options = {}) {
    const {
      className = '',
      content = ''
    } = options;

    const classes = cn(
      'flex flex-col space-y-2 text-center sm:text-left',
      className
    );

    return `
      <div class="${classes}">
        ${content}
      </div>
    `;
  }

  /**
   * Create sheet title
   * @param {Object} options - Title options
   * @param {string} options.text - Title text
   * @param {string} options.className - Additional CSS classes
   * @returns {string} Sheet title HTML
   */
  static createTitle(options = {}) {
    const {
      text = '',
      className = ''
    } = options;

    const classes = cn(
      'text-lg font-semibold text-foreground',
      className
    );

    return `
      <h2 class="${classes}">
        ${text}
      </h2>
    `;
  }

  /**
   * Create sheet description
   * @param {Object} options - Description options
   * @param {string} options.text - Description text
   * @param {string} options.className - Additional CSS classes
   * @returns {string} Sheet description HTML
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
   * Create sheet footer
   * @param {Object} options - Footer options
   * @param {Array} options.actions - Array of action button configs
   * @param {string} options.className - Additional CSS classes
   * @returns {string} Sheet footer HTML
   */
  static createFooter(options = {}) {
    const {
      actions = [],
      className = ''
    } = options;

    const classes = cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4 border-t',
      className
    );

    const actionsHtml = actions.map(action => {
      const buttonClasses = cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'h-10 px-4 py-2',
        action.variant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' :
        action.variant === 'outline' ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground' :
        'bg-primary text-primary-foreground hover:bg-primary/90'
      );

      return `
        <button 
          class="${buttonClasses}"
          ${action.onclick ? `onclick="${action.onclick}"` : ''}
          ${action.type ? `type="${action.type}"` : ''}
        >
          ${action.text || 'Button'}
        </button>
      `;
    }).join('\n');

    return `
      <div class="${classes}">
        ${actionsHtml}
      </div>
    `;
  }

  /**
   * Create complete sheet
   * @param {Object} options - Complete sheet options
   * @param {string} options.title - Sheet title
   * @param {string} options.description - Sheet description
   * @param {string} options.content - Main content HTML
   * @param {Array} options.actions - Footer actions
   * @param {boolean} options.open - Whether sheet is open
   * @param {string} options.side - Sheet side
   * @param {string} options.size - Sheet size
   * @returns {string} Complete sheet HTML
   */
  static createComplete(options = {}) {
    const {
      title = '',
      description = '',
      content = '',
      actions = [],
      open = false,
      side = 'right',
      size = 'md'
    } = options;

    const headerContent = [
      title ? this.createTitle({ text: title }) : '',
      description ? this.createDescription({ text: description }) : ''
    ].filter(Boolean).join('\n');

    const header = headerContent ? this.createHeader({ content: headerContent }) : '';
    const footer = actions.length > 0 ? this.createFooter({ actions }) : '';

    const sheetContent = [header, content, footer].filter(Boolean).join('\n');

    const contentHtml = this.createContent({
      content: sheetContent,
      side,
      size
    });

    return this.create({
      content: contentHtml,
      open,
      side
    });
  }

  /**
   * Create navigation sheet
   * @param {Object} options - Navigation sheet options
   * @param {Array} options.navigation - Array of nav items {text, href, active}
   * @param {string} options.title - Navigation title
   * @param {string} options.side - Sheet side
   * @returns {string} Navigation sheet HTML
   */
  static createNavigation(options = {}) {
    const {
      navigation = [],
      title = 'Navigation',
      side = 'left'
    } = options;

    const navHtml = navigation.map(item => {
      const isActive = item.active;
      const linkClasses = cn(
        'block px-3 py-2 rounded-md text-sm font-medium transition-colors',
        isActive 
          ? 'bg-primary text-primary-foreground' 
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      );

      return `
        <a href="${item.href || '#'}" class="${linkClasses}">
          ${item.text}
        </a>
      `;
    }).join('\n');

    const content = `
      <nav class="space-y-1">
        ${navHtml}
      </nav>
    `;

    return this.createComplete({
      title,
      content,
      side,
      size: 'sm'
    });
  }

  /**
   * Create settings sheet
   * @param {Object} options - Settings sheet options
   * @param {string} options.content - Settings form HTML
   * @param {string} options.title - Settings title
   * @returns {string} Settings sheet HTML
   */
  static createSettings(options = {}) {
    const {
      content = '',
      title = 'Settings'
    } = options;

    const actions = [
      {
        text: 'Cancel',
        variant: 'outline',
        onclick: "this.closest('[role=dialog]').style.display='none'"
      },
      {
        text: 'Save Changes',
        onclick: "console.log('Save settings'); this.closest('[role=dialog]').style.display='none'"
      }
    ];

    return this.createComplete({
      title,
      content,
      actions,
      side: 'right',
      size: 'md'
    });
  }

  /**
   * Show sheet programmatically
   * @param {string} sheetId - Sheet element ID
   */
  static show(sheetId) {
    return `
      document.getElementById('${sheetId}').style.display = 'block';
      document.getElementById('${sheetId}').classList.remove('opacity-0', 'pointer-events-none');
      document.getElementById('${sheetId}').classList.add('opacity-100');
    `;
  }

  /**
   * Hide sheet programmatically
   * @param {string} sheetId - Sheet element ID
   */
  static hide(sheetId) {
    return `
      document.getElementById('${sheetId}').classList.remove('opacity-100');
      document.getElementById('${sheetId}').classList.add('opacity-0', 'pointer-events-none');
      setTimeout(() => {
        document.getElementById('${sheetId}').style.display = 'none';
      }, 300);
    `;
  }
}

module.exports = { Sheet };
