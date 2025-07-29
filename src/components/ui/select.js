const { cn } = require('../../lib/utils');

/**
 * Select component for dropdown selections
 */
class Select {
  /**
   * Create select element
   * @param {Object} options - Select options
   * @param {Array} options.options - Array of option objects {value, label, selected, disabled}
   * @param {string} options.name - Select name attribute
   * @param {string} options.id - Select ID
   * @param {string} options.className - Additional CSS classes
   * @param {string} options.placeholder - Placeholder text
   * @param {boolean} options.required - Whether select is required
   * @param {boolean} options.disabled - Whether select is disabled
   * @param {boolean} options.multiple - Whether multiple selection is allowed
   * @param {Object} options.attributes - Additional HTML attributes
   * @returns {string} Select HTML
   */
  static create(options = {}) {
    const {
      options: selectOptions = [],
      name = '',
      id = '',
      className = '',
      placeholder = '',
      required = false,
      disabled = false,
      multiple = false,
      attributes = {}
    } = options;

    const classes = cn(
      'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      className
    );

    const attrs = Object.entries(attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');

    const optionsHtml = selectOptions.map(option => {
      const optionValue = typeof option === 'string' ? option : option.value;
      const optionLabel = typeof option === 'string' ? option : option.label || option.value;
      const isSelected = typeof option === 'object' && option.selected;
      const isDisabled = typeof option === 'object' && option.disabled;

      return `
        <option 
          value="${optionValue}" 
          ${isSelected ? 'selected' : ''}
          ${isDisabled ? 'disabled' : ''}
        >
          ${optionLabel}
        </option>
      `;
    }).join('\n');

    const placeholderOption = placeholder ? `
      <option value="" disabled ${selectOptions.length === 0 || !selectOptions.some(opt => typeof opt === 'object' && opt.selected) ? 'selected' : ''}>
        ${placeholder}
      </option>
    ` : '';

    return `
      <select 
        ${id ? `id="${id}"` : ''}
        ${name ? `name="${name}"` : ''}
        class="${classes}"
        ${required ? 'required' : ''}
        ${disabled ? 'disabled' : ''}
        ${multiple ? 'multiple' : ''}
        ${attrs}
      >
        ${placeholderOption}
        ${optionsHtml}
      </select>
    `;
  }

  /**
   * Create select with optgroups
   * @param {Object} options - Select options with groups
   * @param {Array} options.groups - Array of group objects {label, options}
   * @param {string} options.name - Select name
   * @param {string} options.id - Select ID
   * @param {string} options.placeholder - Placeholder text
   * @returns {string} Select with optgroups HTML
   */
  static createWithGroups(options = {}) {
    const {
      groups = [],
      name = '',
      id = '',
      placeholder = '',
      className = ''
    } = options;

    const classes = cn(
      'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      className
    );

    const placeholderOption = placeholder ? `
      <option value="" disabled selected>${placeholder}</option>
    ` : '';

    const groupsHtml = groups.map(group => {
      const optionsHtml = group.options.map(option => {
        const optionValue = typeof option === 'string' ? option : option.value;
        const optionLabel = typeof option === 'string' ? option : option.label || option.value;
        const isSelected = typeof option === 'object' && option.selected;
        const isDisabled = typeof option === 'object' && option.disabled;

        return `
          <option 
            value="${optionValue}" 
            ${isSelected ? 'selected' : ''}
            ${isDisabled ? 'disabled' : ''}
          >
            ${optionLabel}
          </option>
        `;
      }).join('\n');

      return `
        <optgroup label="${group.label}">
          ${optionsHtml}
        </optgroup>
      `;
    }).join('\n');

    return `
      <select 
        ${id ? `id="${id}"` : ''}
        ${name ? `name="${name}"` : ''}
        class="${classes}"
      >
        ${placeholderOption}
        ${groupsHtml}
      </select>
    `;
  }

  /**
   * Create multi-select with checkboxes (custom implementation)
   * @param {Object} options - Multi-select options
   * @param {Array} options.options - Array of option objects
   * @param {string} options.name - Field name
   * @param {string} options.id - Container ID
   * @param {string} options.placeholder - Placeholder text
   * @returns {string} Multi-select HTML
   */
  static createMultiSelect(options = {}) {
    const {
      options: selectOptions = [],
      name = '',
      id = '',
      placeholder = 'Select options...'
    } = options;

    const optionsHtml = selectOptions.map((option, index) => {
      const optionValue = typeof option === 'string' ? option : option.value;
      const optionLabel = typeof option === 'string' ? option : option.label || option.value;
      const isSelected = typeof option === 'object' && option.selected;
      const optionId = `${id || name}_option_${index}`;

      return `
        <label class="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer">
          <input 
            type="checkbox" 
            id="${optionId}"
            name="${name}[]" 
            value="${optionValue}"
            ${isSelected ? 'checked' : ''}
            class="rounded border-input"
          />
          <span class="text-sm">${optionLabel}</span>
        </label>
      `;
    }).join('\n');

    return `
      <div ${id ? `id="${id}"` : ''} class="relative">
        <button 
          type="button" 
          class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          onclick="this.nextElementSibling.classList.toggle('hidden')"
        >
          <span class="multiselect-placeholder">${placeholder}</span>
          <svg class="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        <div class="absolute z-10 w-full mt-1 bg-background border border-input rounded-md shadow-lg hidden max-h-60 overflow-auto">
          ${optionsHtml}
        </div>
      </div>
    `;
  }

  /**
   * Create searchable select
   * @param {Object} options - Searchable select options
   * @param {Array} options.options - Array of options
   * @param {string} options.name - Field name
   * @param {string} options.id - Select ID
   * @param {string} options.placeholder - Placeholder text
   * @returns {string} Searchable select HTML
   */
  static createSearchable(options = {}) {
    const {
      options: selectOptions = [],
      name = '',
      id = '',
      placeholder = 'Search and select...'
    } = options;

    const optionsHtml = selectOptions.map(option => {
      const optionValue = typeof option === 'string' ? option : option.value;
      const optionLabel = typeof option === 'string' ? option : option.label || option.value;

      return `
        <div 
          class="p-2 hover:bg-muted cursor-pointer option-item" 
          data-value="${optionValue}"
          onclick="selectSearchableOption(this)"
        >
          ${optionLabel}
        </div>
      `;
    }).join('\n');

    return `
      <div ${id ? `id="${id}"` : ''} class="relative searchable-select">
        <input 
          type="text" 
          ${name ? `name="${name}_search"` : ''}
          placeholder="${placeholder}"
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          oninput="filterSearchableOptions(this)"
          onfocus="this.nextElementSibling.nextElementSibling.classList.remove('hidden')"
        />
        <input type="hidden" ${name ? `name="${name}"` : ''} />
        <div class="absolute z-10 w-full mt-1 bg-background border border-input rounded-md shadow-lg hidden max-h-60 overflow-auto options-container">
          ${optionsHtml}
        </div>
      </div>
      <script>
        function filterSearchableOptions(input) {
          const query = input.value.toLowerCase();
          const container = input.parentElement.querySelector('.options-container');
          const options = container.querySelectorAll('.option-item');
          
          options.forEach(option => {
            const text = option.textContent.toLowerCase();
            option.style.display = text.includes(query) ? 'block' : 'none';
          });
        }
        
        function selectSearchableOption(option) {
          const container = option.parentElement;
          const selectDiv = container.parentElement;
          const input = selectDiv.querySelector('input[type="text"]');
          const hiddenInput = selectDiv.querySelector('input[type="hidden"]');
          
          input.value = option.textContent;
          hiddenInput.value = option.dataset.value;
          container.classList.add('hidden');
        }
      </script>
    `;
  }

  /**
   * Generate options HTML from array
   * @param {Array} options - Array of options
   * @returns {string} Options HTML
   */
  static generateOptions(options = []) {
    return options.map(option => {
      const optionValue = typeof option === 'string' ? option : option.value;
      const optionLabel = typeof option === 'string' ? option : option.label || option.value;
      const isSelected = typeof option === 'object' && option.selected;
      const isDisabled = typeof option === 'object' && option.disabled;

      return `
        <option 
          value="${optionValue}" 
          ${isSelected ? 'selected' : ''}
          ${isDisabled ? 'disabled' : ''}
        >
          ${optionLabel}
        </option>
      `;
    }).join('\n');
  }

  /**
   * Get select CSS classes
   * @param {string} className - Additional classes
   * @returns {string} Combined CSS classes
   */
  static getClasses(className = '') {
    return cn(
      'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      className
    );
  }
}

module.exports = { Select };
