const { cn } = require('../../lib/utils');

/**
 * Dialog/Modal component for overlays and modals
 */
class Dialog {
  /**
   * Create dialog overlay
   * @param {Object} options - Dialog options
   * @param {string} options.id - Dialog ID
   * @param {string} options.className - Additional CSS classes
   * @param {string} options.content - Dialog content HTML
   * @param {boolean} options.open - Whether dialog is open
   * @param {Function} options.onClose - Close callback function
   * @param {Object} options.attributes - Additional HTML attributes
   * @returns {string} Dialog overlay HTML
   */
  static create(options = {}) {
    const {
      id = '',
      className = '',
      content = '',
      open = false,
      onClose = null,
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

    const closeHandler = onClose ? `onclick="(${onClose.toString()})()"` : '';

    return `
      <div 
        ${id ? `id="${id}"` : ''}
        class="${classes}"
        role="dialog"
        aria-modal="true"
        ${closeHandler}
        ${attrs}
      >
        ${content}
      </div>
    `;
  }

  /**
   * Create dialog content container
   * @param {Object} options - Dialog content options
   * @param {string} options.className - Additional CSS classes
   * @param {string} options.content - Content HTML
   * @param {string} options.size - Content size (sm, md, lg, xl)
   * @param {boolean} options.closeButton - Whether to show close button
   * @returns {string} Dialog content HTML
   */
  static createContent(options = {}) {
    const {
      className = '',
      content = '',
      size = 'md',
      closeButton = true
    } = options;

    const sizeClasses = {
      sm: 'max-w-sm',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
      full: 'max-w-7xl'
    };

    const classes = cn(
      'fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg',
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
   * Create dialog header
   * @param {Object} options - Header options
   * @param {string} options.className - Additional CSS classes
   * @param {string} options.content - Header content HTML
   * @returns {string} Dialog header HTML
   */
  static createHeader(options = {}) {
    const {
      className = '',
      content = ''
    } = options;

    const classes = cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className
    );

    return `
      <div class="${classes}">
        ${content}
      </div>
    `;
  }

  /**
   * Create dialog title
   * @param {Object} options - Title options
   * @param {string} options.text - Title text
   * @param {string} options.className - Additional CSS classes
   * @returns {string} Dialog title HTML
   */
  static createTitle(options = {}) {
    const {
      text = '',
      className = ''
    } = options;

    const classes = cn(
      'text-lg font-semibold leading-none tracking-tight',
      className
    );

    return `
      <h2 class="${classes}">
        ${text}
      </h2>
    `;
  }

  /**
   * Create dialog description
   * @param {Object} options - Description options
   * @param {string} options.text - Description text
   * @param {string} options.className - Additional CSS classes
   * @returns {string} Dialog description HTML
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
   * Create dialog footer with actions
   * @param {Object} options - Footer options
   * @param {Array} options.actions - Array of action button configs
   * @param {string} options.className - Additional CSS classes
   * @returns {string} Dialog footer HTML
   */
  static createFooter(options = {}) {
    const {
      actions = [],
      className = ''
    } = options;

    const classes = cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
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
   * Create complete dialog
   * @param {Object} options - Complete dialog options
   * @param {string} options.title - Dialog title
   * @param {string} options.description - Dialog description
   * @param {string} options.content - Main content HTML
   * @param {Array} options.actions - Footer actions
   * @param {boolean} options.open - Whether dialog is open
   * @param {string} options.size - Dialog size
   * @returns {string} Complete dialog HTML
   */
  static createComplete(options = {}) {
    const {
      title = '',
      description = '',
      content = '',
      actions = [],
      open = false,
      size = 'md'
    } = options;

    const headerContent = [
      title ? this.createTitle({ text: title }) : '',
      description ? this.createDescription({ text: description }) : ''
    ].filter(Boolean).join('\n');

    const header = headerContent ? this.createHeader({ content: headerContent }) : '';
    const footer = actions.length > 0 ? this.createFooter({ actions }) : '';

    const dialogContent = [header, content, footer].filter(Boolean).join('\n');

    const contentHtml = this.createContent({
      content: dialogContent,
      size
    });

    return this.create({
      content: contentHtml,
      open
    });
  }

  /**
   * Create confirmation dialog
   * @param {Object} options - Confirmation dialog options
   * @param {string} options.title - Confirmation title
   * @param {string} options.message - Confirmation message
   * @param {Function} options.onConfirm - Confirm callback
   * @param {Function} options.onCancel - Cancel callback
   * @returns {string} Confirmation dialog HTML
   */
  static createConfirmation(options = {}) {
    const {
      title = 'Confirm Action',
      message = 'Are you sure you want to continue?',
      onConfirm = null,
      onCancel = null
    } = options;

    const actions = [
      {
        text: 'Cancel',
        variant: 'outline',
        onclick: onCancel ? onCancel.toString() : "this.closest('[role=dialog]').style.display='none'"
      },
      {
        text: 'Confirm',
        variant: 'destructive',
        onclick: onConfirm ? onConfirm.toString() : "this.closest('[role=dialog]').style.display='none'"
      }
    ];

    return this.createComplete({
      title,
      description: message,
      actions,
      size: 'sm'
    });
  }

  /**
   * Show dialog programmatically
   * @param {string} dialogId - Dialog element ID
   */
  static show(dialogId) {
    return `
      document.getElementById('${dialogId}').style.display = 'block';
      document.getElementById('${dialogId}').classList.remove('opacity-0', 'pointer-events-none');
      document.getElementById('${dialogId}').classList.add('opacity-100');
    `;
  }

  /**
   * Hide dialog programmatically
   * @param {string} dialogId - Dialog element ID
   */
  static hide(dialogId) {
    return `
      document.getElementById('${dialogId}').classList.remove('opacity-100');
      document.getElementById('${dialogId}').classList.add('opacity-0', 'pointer-events-none');
      setTimeout(() => {
        document.getElementById('${dialogId}').style.display = 'none';
      }, 200);
    `;
  }
}

module.exports = { Dialog };
