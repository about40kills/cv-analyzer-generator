const { cn } = require('../../lib/utils');

/**
 * Tabs component for tabbed navigation and content
 */
class Tabs {
  /**
   * Create tabs container
   * @param {Object} options - Tabs options
   * @param {string} options.id - Tabs container ID
   * @param {string} options.className - Additional CSS classes
   * @param {string} options.defaultValue - Default active tab value
   * @param {string} options.content - Tabs content HTML
   * @param {Object} options.attributes - Additional HTML attributes
   * @returns {string} Tabs container HTML
   */
  static create(options = {}) {
    const {
      id = '',
      className = '',
      defaultValue = '',
      content = '',
      attributes = {}
    } = options;

    const classes = cn('w-full', className);

    const attrs = Object.entries(attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');

    return `
      <div 
        ${id ? `id="${id}"` : ''}
        class="${classes}"
        data-default-value="${defaultValue}"
        ${attrs}
      >
        ${content}
      </div>
    `;
  }

  /**
   * Create tabs list (tab navigation)
   * @param {Object} options - Tabs list options
   * @param {string} options.className - Additional CSS classes
   * @param {Array} options.tabs - Array of tab objects {value, label, disabled}
   * @param {string} options.activeTab - Currently active tab value
   * @returns {string} Tabs list HTML
   */
  static createList(options = {}) {
    const {
      className = '',
      tabs = [],
      activeTab = ''
    } = options;

    const classes = cn(
      'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
      className
    );

    const tabsHtml = tabs.map(tab => {
      const isActive = tab.value === activeTab;
      const triggerClasses = cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        isActive 
          ? 'bg-background text-foreground shadow-sm' 
          : 'hover:bg-background/50'
      );

      return `
        <button
          class="${triggerClasses}"
          data-value="${tab.value}"
          ${tab.disabled ? 'disabled' : ''}
          onclick="switchTab(this)"
          role="tab"
          aria-selected="${isActive}"
        >
          ${tab.label || tab.value}
        </button>
      `;
    }).join('\n');

    return `
      <div class="${classes}" role="tablist">
        ${tabsHtml}
      </div>
    `;
  }

  /**
   * Create individual tab trigger
   * @param {Object} options - Tab trigger options
   * @param {string} options.value - Tab value
   * @param {string} options.text - Tab text
   * @param {boolean} options.active - Whether tab is active
   * @param {boolean} options.disabled - Whether tab is disabled
   * @param {string} options.className - Additional CSS classes
   * @returns {string} Tab trigger HTML
   */
  static createTrigger(options = {}) {
    const {
      value = '',
      text = '',
      active = false,
      disabled = false,
      className = ''
    } = options;

    const classes = cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      active 
        ? 'bg-background text-foreground shadow-sm' 
        : 'hover:bg-background/50',
      className
    );

    return `
      <button
        class="${classes}"
        data-value="${value}"
        ${disabled ? 'disabled' : ''}
        onclick="switchTab(this)"
        role="tab"
        aria-selected="${active}"
      >
        ${text}
      </button>
    `;
  }

  /**
   * Create tab content panel
   * @param {Object} options - Tab content options
   * @param {string} options.value - Tab value
   * @param {string} options.content - Content HTML
   * @param {boolean} options.active - Whether content is active
   * @param {string} options.className - Additional CSS classes
   * @returns {string} Tab content HTML
   */
  static createContent(options = {}) {
    const {
      value = '',
      content = '',
      active = false,
      className = ''
    } = options;

    const classes = cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      active ? 'block' : 'hidden',
      className
    );

    return `
      <div
        class="${classes}"
        data-value="${value}"
        role="tabpanel"
        aria-hidden="${!active}"
      >
        ${content}
      </div>
    `;
  }

  /**
   * Create complete tabs with navigation and content
   * @param {Object} options - Complete tabs options
   * @param {string} options.id - Tabs container ID
   * @param {Array} options.tabs - Array of tab objects {value, label, content, disabled}
   * @param {string} options.defaultValue - Default active tab
   * @param {string} options.className - Additional CSS classes
   * @returns {string} Complete tabs HTML
   */
  static createComplete(options = {}) {
    const {
      id = '',
      tabs = [],
      defaultValue = '',
      className = ''
    } = options;

    const activeTab = defaultValue || (tabs.length > 0 ? tabs[0].value : '');

    const tabsList = this.createList({
      tabs: tabs.map(tab => ({
        value: tab.value,
        label: tab.label,
        disabled: tab.disabled
      })),
      activeTab
    });

    const tabsContent = tabs.map(tab => 
      this.createContent({
        value: tab.value,
        content: tab.content || '',
        active: tab.value === activeTab
      })
    ).join('\n');

    const fullContent = `
      ${tabsList}
      ${tabsContent}
    `;

    return this.create({
      id,
      className,
      defaultValue: activeTab,
      content: fullContent
    });
  }

  /**
   * Create vertical tabs
   * @param {Object} options - Vertical tabs options
   * @param {Array} options.tabs - Array of tab objects
   * @param {string} options.defaultValue - Default active tab
   * @returns {string} Vertical tabs HTML
   */
  static createVertical(options = {}) {
    const {
      tabs = [],
      defaultValue = ''
    } = options;

    const activeTab = defaultValue || (tabs.length > 0 ? tabs[0].value : '');

    const tabsList = tabs.map(tab => {
      const isActive = tab.value === activeTab;
      const triggerClasses = cn(
        'w-full justify-start px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        isActive 
          ? 'bg-primary text-primary-foreground' 
          : 'hover:bg-muted'
      );

      return `
        <button
          class="${triggerClasses}"
          data-value="${tab.value}"
          ${tab.disabled ? 'disabled' : ''}
          onclick="switchTab(this)"
          role="tab"
          aria-selected="${isActive}"
        >
          ${tab.label || tab.value}
        </button>
      `;
    }).join('\n');

    const tabsContent = tabs.map(tab => 
      this.createContent({
        value: tab.value,
        content: tab.content || '',
        active: tab.value === activeTab
      })
    ).join('\n');

    return `
      <div class="flex w-full">
        <div class="flex flex-col w-48 space-y-1 border-r pr-4" role="tablist">
          ${tabsList}
        </div>
        <div class="flex-1 pl-4">
          ${tabsContent}
        </div>
      </div>
    `;
  }

  /**
   * Create card-style tabs
   * @param {Object} options - Card tabs options
   * @param {Array} options.tabs - Array of tab objects
   * @param {string} options.defaultValue - Default active tab
   * @returns {string} Card tabs HTML
   */
  static createCard(options = {}) {
    const {
      tabs = [],
      defaultValue = ''
    } = options;

    const activeTab = defaultValue || (tabs.length > 0 ? tabs[0].value : '');

    const tabsList = tabs.map(tab => {
      const isActive = tab.value === activeTab;
      const triggerClasses = cn(
        'px-4 py-2 border-b-2 text-sm font-medium transition-colors',
        isActive 
          ? 'border-primary text-primary' 
          : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
      );

      return `
        <button
          class="${triggerClasses}"
          data-value="${tab.value}"
          ${tab.disabled ? 'disabled' : ''}
          onclick="switchTab(this)"
          role="tab"
          aria-selected="${isActive}"
        >
          ${tab.label || tab.value}
        </button>
      `;
    }).join('\n');

    const tabsContent = tabs.map(tab => 
      this.createContent({
        value: tab.value,
        content: tab.content || '',
        active: tab.value === activeTab,
        className: 'p-4 border border-t-0 rounded-b-lg'
      })
    ).join('\n');

    return `
      <div class="w-full">
        <div class="flex border-b" role="tablist">
          ${tabsList}
        </div>
        ${tabsContent}
      </div>
    `;
  }

  /**
   * Generate tab switching JavaScript
   * @returns {string} Tab switching script
   */
  static getScript() {
    return `
      <script>
        function switchTab(trigger) {
          const value = trigger.dataset.value;
          const tabsContainer = trigger.closest('[data-default-value]');
          
          // Update trigger states
          const allTriggers = tabsContainer.querySelectorAll('[role="tab"]');
          allTriggers.forEach(t => {
            t.classList.remove('bg-background', 'text-foreground', 'shadow-sm', 'bg-primary', 'text-primary-foreground');
            t.classList.add('hover:bg-background/50', 'hover:bg-muted');
            t.setAttribute('aria-selected', 'false');
          });
          
          // Activate current trigger
          trigger.classList.remove('hover:bg-background/50', 'hover:bg-muted');
          if (trigger.closest('.flex.border-b')) {
            // Card style
            trigger.classList.add('border-primary', 'text-primary');
          } else if (trigger.closest('.flex.flex-col')) {
            // Vertical style
            trigger.classList.add('bg-primary', 'text-primary-foreground');
          } else {
            // Default style
            trigger.classList.add('bg-background', 'text-foreground', 'shadow-sm');
          }
          trigger.setAttribute('aria-selected', 'true');
          
          // Update content panels
          const allPanels = tabsContainer.querySelectorAll('[role="tabpanel"]');
          allPanels.forEach(panel => {
            panel.classList.add('hidden');
            panel.setAttribute('aria-hidden', 'true');
          });
          
          // Show active panel
          const activePanel = tabsContainer.querySelector(\`[role="tabpanel"][data-value="\${value}"]\`);
          if (activePanel) {
            activePanel.classList.remove('hidden');
            activePanel.setAttribute('aria-hidden', 'false');
          }
        }
      </script>
    `;
  }

  /**
   * Get tabs CSS classes
   * @param {string} className - Additional classes
   * @returns {string} Combined CSS classes
   */
  static getClasses(className = '') {
    return cn('w-full', className);
  }
}

module.exports = { Tabs };
