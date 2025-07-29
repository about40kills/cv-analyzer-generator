// Button utilities for Node.js
const Button = {
  // Generate button HTML with proper styling
  generateHTML(options = {}) {
    const {
      text = 'Button',
      variant = 'default',
      size = 'default',
      className = '',
      id = '',
      onclick = '',
      disabled = false,
      type = 'button'
    } = options;

    const baseClasses = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
    
    const variantClasses = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline'
    };

    const sizeClasses = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      icon: 'h-9 w-9'
    };

    const allClasses = [
      baseClasses,
      variantClasses[variant] || variantClasses.default,
      sizeClasses[size] || sizeClasses.default,
      className
    ].filter(Boolean).join(' ');

    const attributes = [
      `type="${type}"`,
      `class="${allClasses}"`,
      id ? `id="${id}"` : '',
      onclick ? `onclick="${onclick}"` : '',
      disabled ? 'disabled' : ''
    ].filter(Boolean).join(' ');

    return `<button ${attributes}>${text}</button>`;
  },

  // Generate button CSS classes
  getClasses(variant = 'default', size = 'default', additionalClasses = '') {
    const baseClasses = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
    
    const variantClasses = {
      default: 'bg-blue-600 text-white hover:bg-blue-700',
      destructive: 'bg-red-600 text-white hover:bg-red-700',
      outline: 'border border-gray-300 bg-white hover:bg-gray-50',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
      ghost: 'hover:bg-gray-100',
      link: 'text-blue-600 underline-offset-4 hover:underline'
    };

    const sizeClasses = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      icon: 'h-9 w-9'
    };

    return [
      baseClasses,
      variantClasses[variant] || variantClasses.default,
      sizeClasses[size] || sizeClasses.default,
      additionalClasses
    ].filter(Boolean).join(' ');
  },

  // Validate button configuration
  validateConfig(config) {
    const validVariants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'];
    const validSizes = ['default', 'sm', 'lg', 'icon'];
    const validTypes = ['button', 'submit', 'reset'];

    const errors = [];

    if (config.variant && !validVariants.includes(config.variant)) {
      errors.push(`Invalid variant: ${config.variant}. Valid options: ${validVariants.join(', ')}`);
    }

    if (config.size && !validSizes.includes(config.size)) {
      errors.push(`Invalid size: ${config.size}. Valid options: ${validSizes.join(', ')}`);
    }

    if (config.type && !validTypes.includes(config.type)) {
      errors.push(`Invalid type: ${config.type}. Valid options: ${validTypes.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

module.exports = Button;
