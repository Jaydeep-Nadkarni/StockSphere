/**
 * Calculate total price from quantity and unit price
 * @param {number} quantity - The quantity
 * @param {number} unitPrice - The unit price
 * @returns {number} Total price
 */
export const calculateTotal = (quantity, unitPrice) => {
  return quantity * unitPrice;
};

/**
 * Calculate total from array of items
 * @param {Array} items - Array of items with price and quantity
 * @param {string} priceKey - Key for price field (default: 'price')
 * @param {string} quantityKey - Key for quantity field (default: 'quantity')
 * @returns {number} Total sum
 */
export const calculateSum = (items, priceKey = 'price', quantityKey = 'quantity') => {
  return items.reduce((sum, item) => {
    return sum + (item[priceKey] * (item[quantityKey] || 1));
  }, 0);
};

/**
 * Calculate average from array
 * @param {Array} items - Array of items
 * @param {string} key - Key to calculate average for
 * @returns {number} Average value
 */
export const calculateAverage = (items, key) => {
  if (items.length === 0) return 0;
  const sum = items.reduce((acc, item) => acc + item[key], 0);
  return sum / items.length;
};

/**
 * Calculate percentage of total
 * @param {number} value - The value
 * @param {number} total - The total
 * @returns {number} Percentage (0-1)
 */
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return (value / total);
};

/**
 * Calculate inventory value
 * @param {Array} products - Array of products with price and currentStock
 * @returns {number} Total inventory value
 */
export const calculateInventoryValue = (products) => {
  return products.reduce((total, product) => {
    return total + (product.price * product.currentStock);
  }, 0);
};

/**
 * Calculate stock statistics
 * @param {Array} products - Array of products
 * @returns {Object} Stock statistics
 */
export const calculateStockStats = (products) => {
  const stocks = products.map((p) => p.currentStock);
  const totalStock = stocks.reduce((sum, stock) => sum + stock, 0);
  const avgStock = totalStock / products.length;
  const minStock = Math.min(...stocks);
  const maxStock = Math.max(...stocks);

  return {
    totalStock,
    avgStock: avgStock.toFixed(2),
    minStock,
    maxStock,
    lowStockCount: products.filter((p) => p.currentStock < 10).length,
    outOfStockCount: products.filter((p) => p.currentStock === 0).length,
  };
};

/**
 * Calculate discount amount
 * @param {number} originalPrice - Original price
 * @param {number} discountPercent - Discount percentage (0-100)
 * @returns {number} Discount amount
 */
export const calculateDiscount = (originalPrice, discountPercent) => {
  return originalPrice * (discountPercent / 100);
};

/**
 * Calculate final price after discount
 * @param {number} originalPrice - Original price
 * @param {number} discountPercent - Discount percentage
 * @returns {number} Final price
 */
export const calculateFinalPrice = (originalPrice, discountPercent) => {
  const discount = calculateDiscount(originalPrice, discountPercent);
  return originalPrice - discount;
};

/**
 * Calculate growth rate
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {number} Growth rate as percentage (0-1)
 */
export const calculateGrowthRate = (current, previous) => {
  if (previous === 0) return current > 0 ? 1 : 0;
  return (current - previous) / previous;
};

/**
 * Calculate margin
 * @param {number} revenue - Revenue amount
 * @param {number} cost - Cost amount
 * @returns {number} Margin percentage (0-1)
 */
export const calculateMargin = (revenue, cost) => {
  if (revenue === 0) return 0;
  return (revenue - cost) / revenue;
};
