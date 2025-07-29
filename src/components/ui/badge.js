const { cn } = require('../../lib/utils');

// Badge variants configuration
const badgeVariants = {
  default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
  secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
  destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
  outline: 'text-foreground'
};

/**
 * Badge component for displaying status, labels, and categories
 */
class Badge {
  /**
   * Generate badge HTML
   * @param {Object} options - Badge options
   * @param {string} options.text - Badge text content
   * @param {string} options.variant - Badge variant (default, secondary, destructive, outline)
   * @param {string} options.className - Additional CSS classes
   * @param {string} options.id - Element ID
   * @param {Object} options.attributes - Additional HTML attributes
   * @returns {string} Badge HTML
   */
  static create(options = {}) {
    const {
      text = '',
      variant = 'default',
      className = '',
      id = '',
      attributes = {}
    } = options;

    const baseClasses = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
    const variantClasses = badgeVariants[variant] || badgeVariants.default;
    
    const classes = cn(baseClasses, variantClasses, className);
    
    const attrs = Object.entries(attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');

    return `
      <div 
        ${id ? `id="${id}"` : ''}
        class="${classes}"
        ${attrs}
      >
        ${text}
      </div>
    `;
  }

  /**
   * Create multiple badges
   * @param {Array} badges - Array of badge options
   * @returns {string} Multiple badge HTML
   */
  static createMultiple(badges = []) {
    return badges.map(badge => this.create(badge)).join('\n');
  }

  /**
   * Create status badge
   * @param {string} status - Status text
   * @param {string} type - Status type for variant selection
   * @returns {string} Status badge HTML
   */
  static createStatus(status, type = 'default') {
    const statusVariants = {
      success: 'default',
      warning: 'secondary',
      error: 'destructive',
      info: 'outline'
    };

    return this.create({
      text: status,
      variant: statusVariants[type] || 'default'
    });
  }

  /**
   * Create skill badge
   * @param {string} skill - Skill name
   * @param {number} level - Skill level (1-5)
   * @returns {string} Skill badge HTML
   */
  static createSkill(skill, level = 0) {
    const levelVariants = {
      1: 'outline',
      2: 'secondary',
      3: 'secondary',
      4: 'default',
      5: 'default'
    };

    return this.create({
      text: `${skill} ${level > 0 ? '★'.repeat(level) : ''}`,
      variant: levelVariants[level] || 'outline'
    });
  }

  /**
   * Get badge CSS classes
   * @param {string} variant - Badge variant
   * @param {string} className - Additional classes
   * @returns {string} Combined CSS classes
   */
  static getClasses(variant = 'default', className = '') {
    const baseClasses = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
    const variantClasses = badgeVariants[variant] || badgeVariants.default;
    
    return cn(baseClasses, variantClasses, className);
  }
}

module.exports = { Badge, badgeVariants };
