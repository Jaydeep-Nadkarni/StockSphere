/**
 * Database Index Optimization Guide
 * 
 * This file documents all indexes created for performance optimization
 * across the reporting and inventory management system.
 */

// User Collection Indexes
// - email: unique index for fast login lookups
// - role: index for role-based filtering

// Product Collection Indexes
// Already defined in Product.js schema:
// - sku: unique index for fast SKU lookups
// - supplierId: index for supplier-based queries
// - category: index for category filtering
// - currentStock: (recommended to add) for low-stock queries
// - createdAt: (recommended to add) for date-range queries
// - price: (recommended to add) for price-based sorting

// Additional recommended indexes for Product:
// db.products.createIndex({ currentStock: 1 })
// db.products.createIndex({ createdAt: 1 })
// db.products.createIndex({ price: 1 })
// db.products.createIndex({ category: 1, currentStock: 1 }) - compound index

// Batch Collection Indexes
// Already defined in Batch.js schema:
// - productId + batchNo: compound index for unique batch identification
// - expiryDate: index for expiry tracking
// - productId: index for fetching batches by product

// Additional recommended indexes for Batch:
// db.batches.createIndex({ expiryDate: 1, productId: 1 }) - compound for near-expiry queries
// db.batches.createIndex({ createdAt: 1 })
// db.batches.createIndex({ productId: 1, expiryDate: 1 }) - compound for product batch queries

// Query Performance Tips:
// 1. Aggregation pipelines use indexes in $match stages (first stage best)
// 2. Compound indexes help when filtering on multiple fields
// 3. Indexes on foreign keys (_id fields) speed up $lookup operations
// 4. TTL indexes can auto-delete expired batches if implemented later

// Example index creation in MongoDB shell:
/*
db.products.createIndex({ currentStock: 1 });
db.products.createIndex({ createdAt: 1 });
db.products.createIndex({ price: 1 });
db.products.createIndex({ category: 1, currentStock: 1 });

db.batches.createIndex({ expiryDate: 1, productId: 1 });
db.batches.createIndex({ createdAt: 1 });
db.batches.createIndex({ productId: 1, expiryDate: 1 });
*/

module.exports = {
  productIndexes: [
    { sku: 1 }, // Already created
    { supplierId: 1 }, // Already created
    { category: 1 }, // Already created
    { currentStock: 1 }, // Recommended
    { createdAt: 1 }, // Recommended
    { price: 1 }, // Recommended
    { category: 1, currentStock: 1 }, // Recommended compound
  ],
  batchIndexes: [
    { productId: 1, batchNo: 1 }, // Already created (compound)
    { expiryDate: 1 }, // Already created
    { productId: 1 }, // Already created
    { expiryDate: 1, productId: 1 }, // Recommended compound
    { createdAt: 1 }, // Recommended
    { productId: 1, expiryDate: 1 }, // Recommended compound
  ],
};
