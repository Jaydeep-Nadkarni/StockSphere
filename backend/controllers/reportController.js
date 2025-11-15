const Product = require('../models/Product');
const Batch = require('../models/Batch');

// @desc    Get sales analytics (daily, monthly, total)
// @route   GET /api/reports/sales
// @access  Private (Admin, Manager)
exports.getSalesAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'daily' } = req.query;

    // Parse dates
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1)); // First day of current month
    const end = endDate ? new Date(endDate) : new Date(); // Today

    // Set end date to end of day
    end.setHours(23, 59, 59, 999);

    // Determine grouping format
    let dateFormat = '%Y-%m-%d'; // daily
    if (groupBy === 'monthly') {
      dateFormat = '%Y-%m';
    } else if (groupBy === 'yearly') {
      dateFormat = '%Y';
    }

    // Aggregation pipeline for sales analytics
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: dateFormat,
              date: '$createdAt',
            },
          },
          totalValue: {
            $sum: { $multiply: ['$price', '$currentStock'] },
          },
          totalProducts: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          totalStock: { $sum: '$currentStock' },
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $project: {
          _id: 0,
          period: '$_id',
          totalValue: { $round: ['$totalValue', 2] },
          totalProducts: 1,
          avgPrice: { $round: ['$avgPrice', 2] },
          totalStock: 1,
        },
      },
    ];

    const salesData = await Product.aggregate(pipeline);

    // Calculate totals
    const totals = await Product.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          totalValue: {
            $sum: { $multiply: ['$price', '$currentStock'] },
          },
          totalProducts: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          totalStock: { $sum: '$currentStock' },
        },
      },
      {
        $project: {
          _id: 0,
          totalValue: { $round: ['$totalValue', 2] },
          totalProducts: 1,
          avgPrice: { $round: ['$avgPrice', 2] },
          totalStock: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        period: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          groupBy,
        },
        salesData,
        totals: totals[0] || {
          totalValue: 0,
          totalProducts: 0,
          avgPrice: 0,
          totalStock: 0,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get top-selling products
// @route   GET /api/reports/top-products
// @access  Private (Admin, Manager)
exports.getTopProducts = async (req, res) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1));
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    // Aggregation pipeline for top products by value and stock
    const pipeline = [
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $addFields: {
          totalValue: { $multiply: ['$price', '$currentStock'] },
        },
      },
      {
        $lookup: {
          from: 'batches',
          localField: '_id',
          foreignField: 'productId',
          as: 'batchDetails',
        },
      },
      {
        $addFields: {
          batchCount: { $size: '$batchDetails' },
        },
      },
      {
        $sort: { totalValue: -1 },
      },
      {
        $limit: parseInt(limit),
      },
      {
        $project: {
          _id: 1,
          name: 1,
          sku: 1,
          category: 1,
          price: 1,
          currentStock: 1,
          totalValue: { $round: ['$totalValue', 2] },
          batchCount: 1,
          isLowStock: 1,
          supplierId: 1,
        },
      },
    ];

    const topProducts = await Product.aggregate(pipeline);

    res.status(200).json({
      success: true,
      data: {
        period: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        },
        topProducts,
        count: topProducts.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get low stock products report
// @route   GET /api/reports/low-stock
// @access  Private (All roles)
exports.getLowStockReport = async (req, res) => {
  try {
    const { threshold = 10, sortBy = 'stock' } = req.query;

    // Determine sort order
    let sortObj = { currentStock: 1 }; // Default: lowest stock first
    if (sortBy === 'value') {
      sortObj = { totalValue: -1 }; // Most valuable first
    } else if (sortBy === 'category') {
      sortObj = { category: 1, currentStock: 1 };
    }

    // Aggregation pipeline for low stock products
    const pipeline = [
      {
        $match: {
          currentStock: { $lt: parseInt(threshold) },
        },
      },
      {
        $addFields: {
          totalValue: { $multiply: ['$price', '$currentStock'] },
        },
      },
      {
        $lookup: {
          from: 'batches',
          localField: '_id',
          foreignField: 'productId',
          as: 'batchDetails',
        },
      },
      {
        $addFields: {
          batchCount: { $size: '$batchDetails' },
          nearestExpiry: {
            $min: '$batchDetails.expiryDate',
          },
        },
      },
      {
        $sort: sortObj,
      },
      {
        $project: {
          _id: 1,
          name: 1,
          sku: 1,
          category: 1,
          price: 1,
          currentStock: 1,
          totalValue: { $round: ['$totalValue', 2] },
          batchCount: 1,
          nearestExpiry: 1,
          supplierId: 1,
        },
      },
    ];

    const lowStockProducts = await Product.aggregate(pipeline);

    // Calculate summary statistics
    const summary = {
      totalLowStockItems: lowStockProducts.length,
      totalValue: lowStockProducts.reduce((sum, p) => sum + p.totalValue, 0),
      avgStock: lowStockProducts.length > 0
        ? (lowStockProducts.reduce((sum, p) => sum + p.currentStock, 0) /
            lowStockProducts.length).toFixed(2)
        : 0,
      criticalItems: lowStockProducts.filter((p) => p.currentStock === 0).length,
    };

    res.status(200).json({
      success: true,
      data: {
        threshold: parseInt(threshold),
        summary,
        products: lowStockProducts,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get near-expiry batches report
// @route   GET /api/reports/near-expiry
// @access  Private (All roles)
exports.getNearExpiryReport = async (req, res) => {
  try {
    const { days = 30, sortBy = 'expiry' } = req.query;
    const now = new Date();
    const threshold = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    // Determine sort order
    let sortObj = { expiryDate: 1 }; // Default: nearest expiry first
    if (sortBy === 'quantity') {
      sortObj = { quantity: -1 }; // Most quantity first
    } else if (sortBy === 'product') {
      sortObj = { productName: 1, expiryDate: 1 };
    }

    // Aggregation pipeline for near-expiry batches
    const pipeline = [
      {
        $match: {
          expiryDate: { $lte: threshold, $gt: now },
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      {
        $unwind: '$productDetails',
      },
      {
        $addFields: {
          daysUntilExpiry: {
            $divide: [
              { $subtract: ['$expiryDate', now] },
              1000 * 60 * 60 * 24, // Convert ms to days
            ],
          },
          batchValue: { $multiply: ['$quantity', '$productDetails.price'] },
        },
      },
      {
        $sort: sortObj,
      },
      {
        $project: {
          _id: 1,
          batchNo: 1,
          productId: 1,
          productName: '$productDetails.name',
          sku: '$productDetails.sku',
          category: '$productDetails.category',
          quantity: 1,
          price: '$productDetails.price',
          batchValue: { $round: ['$batchValue', 2] },
          manufacturedDate: 1,
          expiryDate: 1,
          daysUntilExpiry: { $round: ['$daysUntilExpiry', 0] },
          createdAt: 1,
        },
      },
    ];

    const nearExpiryBatches = await Batch.aggregate(pipeline);

    // Calculate summary statistics
    const summary = {
      totalBatches: nearExpiryBatches.length,
      totalValue: nearExpiryBatches.reduce((sum, b) => sum + b.batchValue, 0),
      totalQuantity: nearExpiryBatches.reduce((sum, b) => sum + b.quantity, 0),
      criticalBatches: nearExpiryBatches.filter((b) => b.daysUntilExpiry <= 7)
        .length,
    };

    // Categorize by urgency
    const categorized = {
      critical: nearExpiryBatches.filter((b) => b.daysUntilExpiry <= 7),
      urgent: nearExpiryBatches.filter(
        (b) => b.daysUntilExpiry > 7 && b.daysUntilExpiry <= 14
      ),
      warning: nearExpiryBatches.filter((b) => b.daysUntilExpiry > 14),
    };

    res.status(200).json({
      success: true,
      data: {
        threshold: {
          days: parseInt(days),
          startDate: now.toISOString(),
          endDate: threshold.toISOString(),
        },
        summary,
        categorized,
        allBatches: nearExpiryBatches,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get inventory summary report
// @route   GET /api/reports/inventory-summary
// @access  Private (All roles)
exports.getInventorySummary = async (req, res) => {
  try {
    // Overall inventory statistics
    const pipeline = [
      {
        $addFields: {
          totalValue: { $multiply: ['$price', '$currentStock'] },
        },
      },
      {
        $group: {
          _id: '$category',
          categoryCount: { $sum: 1 },
          totalStock: { $sum: '$currentStock' },
          totalValue: { $sum: '$totalValue' },
          avgPrice: { $avg: '$price' },
          avgStock: { $avg: '$currentStock' },
        },
      },
      {
        $sort: { totalValue: -1 },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          productCount: '$categoryCount',
          totalStock: 1,
          totalValue: { $round: ['$totalValue', 2] },
          avgPrice: { $round: ['$avgPrice', 2] },
          avgStock: { $round: ['$avgStock', 2] },
        },
      },
    ];

    const categorySummary = await Product.aggregate(pipeline);

    // Overall totals
    const totals = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$currentStock' },
          totalValue: {
            $sum: { $multiply: ['$price', '$currentStock'] },
          },
          avgPrice: { $avg: '$price' },
          lowStockItems: {
            $sum: {
              $cond: [{ $lt: ['$currentStock', 10] }, 1, 0],
            },
          },
          zeroStockItems: {
            $sum: {
              $cond: [{ $eq: ['$currentStock', 0] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalProducts: 1,
          totalStock: 1,
          totalValue: { $round: ['$totalValue', 2] },
          avgPrice: { $round: ['$avgPrice', 2] },
          lowStockItems: 1,
          zeroStockItems: 1,
        },
      },
    ]);

    // Batch statistics
    const batchStats = await Batch.aggregate([
      {
        $group: {
          _id: null,
          totalBatches: { $sum: 1 },
          totalBatchQuantity: { $sum: '$quantity' },
          avgBatchQuantity: { $avg: '$quantity' },
        },
      },
      {
        $project: {
          _id: 0,
          totalBatches: 1,
          totalBatchQuantity: 1,
          avgBatchQuantity: { $round: ['$avgBatchQuantity', 2] },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        overallTotals: totals[0] || {
          totalProducts: 0,
          totalStock: 0,
          totalValue: 0,
          avgPrice: 0,
          lowStockItems: 0,
          zeroStockItems: 0,
        },
        categoryBreakdown: categorySummary,
        batchStatistics: batchStats[0] || {
          totalBatches: 0,
          totalBatchQuantity: 0,
          avgBatchQuantity: 0,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
