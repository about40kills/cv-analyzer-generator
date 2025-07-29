const { cn } = require('../../lib/utils');

/**
 * Progress component for showing completion status
 */
class Progress {
  /**
   * Create progress bar
   * @param {Object} options - Progress options
   * @param {number} options.value - Progress value (0-100)
   * @param {number} options.max - Maximum value (default 100)
   * @param {string} options.className - Additional CSS classes
   * @param {string} options.id - Progress element ID
   * @param {string} options.color - Progress bar color variant
   * @param {boolean} options.showLabel - Whether to show progress label
   * @param {string} options.labelFormat - Label format ('percentage' or 'fraction')
   * @param {Object} options.attributes - Additional HTML attributes
   * @returns {string} Progress HTML
   */
  static create(options = {}) {
    const {
      value = 0,
      max = 100,
      className = '',
      id = '',
      color = 'primary',
      showLabel = false,
      labelFormat = 'percentage',
      attributes = {}
    } = options;

    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    
    const containerClasses = cn(
      'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
      className
    );

    const barColorClasses = {
      primary: 'bg-primary',
      secondary: 'bg-secondary',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      danger: 'bg-red-500',
      info: 'bg-blue-500'
    };

    const barClasses = cn(
      'h-full w-full flex-1 transition-all duration-300 ease-in-out',
      barColorClasses[color] || barColorClasses.primary
    );

    const attrs = Object.entries(attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');

    const labelText = labelFormat === 'fraction' 
      ? `${value}/${max}` 
      : `${Math.round(percentage)}%`;

    const labelHtml = showLabel ? `
      <div class="absolute inset-0 flex items-center justify-center">
        <span class="text-xs font-medium text-primary-foreground">${labelText}</span>
      </div>
    ` : '';

    return `
      <div 
        ${id ? `id="${id}"` : ''}
        class="${containerClasses}"
        role="progressbar"
        aria-valuenow="${value}"
        aria-valuemin="0"
        aria-valuemax="${max}"
        ${attrs}
      >
        <div
          class="${barClasses}"
          style="transform: translateX(-${100 - percentage}%)"
        ></div>
        ${labelHtml}
      </div>
    `;
  }

  /**
   * Create circular progress
   * @param {Object} options - Circular progress options
   * @param {number} options.value - Progress value (0-100)
   * @param {number} options.size - Circle size in pixels
   * @param {number} options.strokeWidth - Stroke width
   * @param {string} options.color - Progress color
   * @param {boolean} options.showLabel - Whether to show center label
   * @returns {string} Circular progress HTML
   */
  static createCircular(options = {}) {
    const {
      value = 0,
      size = 100,
      strokeWidth = 8,
      color = '#3b82f6',
      showLabel = true
    } = options;

    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    const labelHtml = showLabel ? `
      <text 
        x="50%" 
        y="50%" 
        text-anchor="middle" 
        dy="0.3em" 
        class="text-sm font-medium fill-current"
      >
        ${Math.round(value)}%
      </text>
    ` : '';

    return `
      <div class="relative inline-flex items-center justify-center">
        <svg
          width="${size}"
          height="${size}"
          class="transform -rotate-90"
        >
          <circle
            cx="50%"
            cy="50%"
            r="${radius}"
            stroke="currentColor"
            stroke-width="${strokeWidth}"
            fill="transparent"
            class="text-muted"
            opacity="0.2"
          />
          <circle
            cx="50%"
            cy="50%"
            r="${radius}"
            stroke="${color}"
            stroke-width="${strokeWidth}"
            fill="transparent"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${offset}"
            stroke-linecap="round"
            class="transition-all duration-300 ease-in-out"
          />
          ${labelHtml}
        </svg>
      </div>
    `;
  }

  /**
   * Create stepped progress
   * @param {Object} options - Stepped progress options
   * @param {number} options.currentStep - Current active step (1-based)
   * @param {number} options.totalSteps - Total number of steps
   * @param {Array} options.stepLabels - Optional labels for each step
   * @param {string} options.className - Additional CSS classes
   * @returns {string} Stepped progress HTML
   */
  static createStepped(options = {}) {
    const {
      currentStep = 1,
      totalSteps = 3,
      stepLabels = [],
      className = ''
    } = options;

    const stepsHtml = Array.from({ length: totalSteps }, (_, index) => {
      const stepNumber = index + 1;
      const isActive = stepNumber === currentStep;
      const isCompleted = stepNumber < currentStep;
      const isUpcoming = stepNumber > currentStep;

      const stepClasses = cn(
        'flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors',
        {
          'bg-primary text-primary-foreground': isActive,
          'bg-primary/20 text-primary': isCompleted,
          'bg-muted text-muted-foreground': isUpcoming
        }
      );

      const connectorHtml = index < totalSteps - 1 ? `
        <div class="flex-1 h-1 mx-2 ${isCompleted ? 'bg-primary' : 'bg-muted'}"></div>
      ` : '';

      const labelHtml = stepLabels[index] ? `
        <div class="mt-2 text-xs text-center ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}">
          ${stepLabels[index]}
        </div>
      ` : '';

      return `
        <div class="flex flex-col items-center">
          <div class="flex items-center">
            <div class="${stepClasses}">
              ${isCompleted ? '✓' : stepNumber}
            </div>
            ${connectorHtml}
          </div>
          ${labelHtml}
        </div>
      `;
    }).join('');

    return `
      <div class="flex items-start justify-between w-full ${className}">
        ${stepsHtml}
      </div>
    `;
  }

  /**
   * Create indeterminate progress (loading)
   * @param {Object} options - Indeterminate progress options
   * @param {string} options.className - Additional CSS classes
   * @param {string} options.color - Progress color
   * @returns {string} Indeterminate progress HTML
   */
  static createIndeterminate(options = {}) {
    const {
      className = '',
      color = 'primary'
    } = options;

    const containerClasses = cn(
      'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
      className
    );

    const barColorClasses = {
      primary: 'bg-primary',
      secondary: 'bg-secondary',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      danger: 'bg-red-500'
    };

    return `
      <div class="${containerClasses}">
        <div class="h-full ${barColorClasses[color] || barColorClasses.primary} animate-pulse"></div>
      </div>
      <style>
        @keyframes indeterminate {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-indeterminate {
          animation: indeterminate 1.5s infinite linear;
        }
      </style>
    `;
  }

  /**
   * Create multi-step progress with descriptions
   * @param {Object} options - Multi-step progress options
   * @param {Array} options.steps - Array of step objects {title, description, completed}
   * @param {number} options.currentStep - Current active step index
   * @returns {string} Multi-step progress HTML
   */
  static createMultiStep(options = {}) {
    const {
      steps = [],
      currentStep = 0
    } = options;

    const stepsHtml = steps.map((step, index) => {
      const isActive = index === currentStep;
      const isCompleted = index < currentStep;
      const isUpcoming = index > currentStep;

      const stepClasses = cn(
        'flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-colors border-2',
        {
          'bg-primary border-primary text-primary-foreground': isActive,
          'bg-primary/10 border-primary text-primary': isCompleted,
          'bg-background border-muted text-muted-foreground': isUpcoming
        }
      );

      const connectorHtml = index < steps.length - 1 ? `
        <div class="flex-1 h-px mx-4 ${isCompleted ? 'bg-primary' : 'bg-muted'}"></div>
      ` : '';

      return `
        <div class="flex flex-col items-center text-center">
          <div class="flex items-center w-full">
            <div class="${stepClasses}">
              ${isCompleted ? '✓' : index + 1}
            </div>
            ${connectorHtml}
          </div>
          <div class="mt-3">
            <div class="text-sm font-medium ${isActive ? 'text-primary' : 'text-foreground'}">
              ${step.title || `Step ${index + 1}`}
            </div>
            ${step.description ? `
              <div class="text-xs text-muted-foreground mt-1">
                ${step.description}
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="w-full">
        <div class="flex items-start justify-between">
          ${stepsHtml}
        </div>
      </div>
    `;
  }

  /**
   * Get progress percentage
   * @param {number} value - Current value
   * @param {number} max - Maximum value
   * @returns {number} Percentage (0-100)
   */
  static getPercentage(value, max = 100) {
    return Math.min(100, Math.max(0, (value / max) * 100));
  }

  /**
   * Get progress CSS classes
   * @param {string} className - Additional classes
   * @returns {string} Combined CSS classes
   */
  static getClasses(className = '') {
    return cn(
      'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
      className
    );
  }
}

module.exports = { Progress };
