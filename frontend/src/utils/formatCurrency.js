/**
 * Format currency values for display
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format large numbers with abbreviations
 * @param {number} num - The number to format
 * @returns {string} Abbreviated number (e.g., 1.2K, 3.5M)
 */
export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Format date for display
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

/**
 * Format date only (without time)
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDateOnly = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

/**
 * Format percentage
 * @param {number} value - The value (0-1 or 0-100)
 * @param {boolean} isDecimal - Whether value is decimal (0-1)
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, isDecimal = true) => {
  const percentage = isDecimal ? value * 100 : value;
  return percentage.toFixed(2) + '%';
};
