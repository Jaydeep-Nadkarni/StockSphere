const Order = require('../models/Order');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const openaiService = require('../utils/openaiService');

// @desc    Get AI-powered daily summary
// @route   GET /api/ai/daily-summary
// @access  Private (Admin, Manager)
exports.getDailySummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's orders
    const todaysOrders = await Order.find({
      createdAt: { $gte: today, $lt: tomorrow },
    })
      .populate('customer', 'name email')
      .populate('items.product', 'name sku category');

    // Get product performance data
    const products = await Product.find()
      .select('name sku category quantity reorderLevel totalSold')
      .limit(20);

    // Get customer data
    const customers = await Customer.find()
      .select('name totalOrders totalSpent')
      .sort({ totalSpent: -1 })
      .limit(10);

    // Prepare data for AI analysis
    const ordersData = todaysOrders.map((order) => ({
      orderNo: order.orderNo,
      customer: order.customer?.name,
      totalAmount: order.totalAmount,
      items: order.items.length,
      status: order.status,
    }));

    const productsData = products.map((p) => ({
      name: p.name,
      category: p.category,
      stock: p.quantity,
      reorderLevel: p.reorderLevel,
      totalSold: p.totalSold || 0,
    }));

    const customersData = customers.map((c) => ({
      name: c.name,
      totalOrders: c.totalOrders || 0,
      totalSpent: c.totalSpent || 0,
    }));

    // Generate AI summary
    const aiSummary = await openaiService.generateDailySummary(
      ordersData,
      productsData,
      customersData
    );

    // Calculate basic metrics
    const totalRevenue = todaysOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    const totalOrders = todaysOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    res.status(200).json({
      success: true,
      data: {
        summary: aiSummary,
        metrics: {
          totalOrders,
          totalRevenue,
          avgOrderValue,
          date: today.toISOString(),
        },
        ordersData,
        topProducts: productsData.slice(0, 5),
        topCustomers: customersData.slice(0, 5),
      },
    });
  } catch (error) {
    console.error('Error generating daily summary:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate daily summary',
    });
  }
};

// @desc    Get AI low stock analysis
// @route   GET /api/ai/low-stock-analysis
// @access  Private (Admin, Manager)
exports.getLowStockAnalysis = async (req, res) => {
  try {
    // Get products with low stock
    const products = await Product.find({
      $expr: { $lte: ['$quantity', '$reorderLevel'] },
    }).select('name sku category quantity reorderLevel totalSold unit');

    const inventoryData = products.map((p) => ({
      name: p.name,
      sku: p.sku,
      category: p.category,
      currentStock: p.quantity,
      reorderLevel: p.reorderLevel,
      totalSold: p.totalSold || 0,
      unit: p.unit,
    }));

    // Generate AI analysis
    const aiAnalysis = await openaiService.analyzeLowStock(inventoryData);

    res.status(200).json({
      success: true,
      data: {
        analysis: aiAnalysis,
        lowStockItems: inventoryData,
        totalLowStockItems: inventoryData.length,
      },
    });
  } catch (error) {
    console.error('Error analyzing low stock:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to analyze low stock',
    });
  }
};

// @desc    Generate comprehensive AI business report
// @route   POST /api/ai/business-report
// @access  Private (Admin)
exports.generateBusinessReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Fetch all relevant data
    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
    })
      .populate('customer', 'name email')
      .populate('items.product', 'name category');

    const products = await Product.find().select(
      'name category quantity totalSold price'
    );

    const customers = await Customer.find().select(
      'name totalOrders totalSpent'
    );

    const suppliers = await Supplier.find().select(
      'name totalOrders averageDeliveryTime rating'
    );

    // Prepare data summaries
    const ordersSummary = {
      total: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
      avgOrderValue:
        orders.length > 0
          ? orders.reduce((sum, o) => sum + o.totalAmount, 0) / orders.length
          : 0,
      statusBreakdown: orders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
      }, {}),
    };

    const productsSummary = {
      total: products.length,
      lowStock: products.filter((p) => p.quantity <= p.reorderLevel).length,
      topSelling: products
        .sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0))
        .slice(0, 10)
        .map((p) => ({ name: p.name, sold: p.totalSold || 0 })),
    };

    const customersSummary = {
      total: customers.length,
      topCustomers: customers
        .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
        .slice(0, 10)
        .map((c) => ({
          name: c.name,
          orders: c.totalOrders || 0,
          spent: c.totalSpent || 0,
        })),
    };

    const suppliersSummary = {
      total: suppliers.length,
      topRated: suppliers
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 5)
        .map((s) => ({
          name: s.name,
          rating: s.rating || 0,
          avgDelivery: s.averageDeliveryTime || 0,
        })),
    };

    // Generate AI report
    const aiReport = await openaiService.generateBusinessReport({
      orders: ordersSummary,
      products: productsSummary,
      customers: customersSummary,
      suppliers: suppliersSummary,
      dateRange: {
        start: startDate,
        end: endDate,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        report: aiReport,
        dateRange: { start: startDate, end: endDate },
        summaries: {
          orders: ordersSummary,
          products: productsSummary,
          customers: customersSummary,
          suppliers: suppliersSummary,
        },
      },
    });
  } catch (error) {
    console.error('Error generating business report:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate business report',
    });
  }
};

// @desc    Get AI insights for specific order
// @route   GET /api/ai/order-insights/:orderId
// @access  Private
exports.getOrderInsights = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('customer', 'name email totalOrders totalSpent')
      .populate('items.product', 'name category price');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const orderDetails = {
      orderNo: order.orderNo,
      customer: {
        name: order.customer?.name,
        totalOrders: order.customer?.totalOrders || 0,
        totalSpent: order.customer?.totalSpent || 0,
      },
      items: order.items.map((item) => ({
        product: item.product?.name,
        category: item.product?.category,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.quantity * item.price,
      })),
      totalAmount: order.totalAmount,
      status: order.status,
      date: order.createdAt,
    };

    const insights = await openaiService.getOrderInsights(orderDetails);

    res.status(200).json({
      success: true,
      data: {
        insights,
        order: orderDetails,
      },
    });
  } catch (error) {
    console.error('Error getting order insights:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get order insights',
    });
  }
};

// @desc    Get demand prediction for products
// @route   GET /api/ai/demand-prediction
// @access  Private (Admin, Manager)
exports.getDemandPrediction = async (req, res) => {
  try {
    const { productId } = req.query;

    let products;
    if (productId) {
      products = await Product.findById(productId);
      if (!products) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }
      products = [products];
    } else {
      // Get top 10 products by total sold
      products = await Product.find()
        .sort({ totalSold: -1 })
        .limit(10);
    }

    // Get order history for these products (last 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const productHistory = await Promise.all(
      products.map(async (product) => {
        const orders = await Order.find({
          'items.product': product._id,
          createdAt: { $gte: ninetyDaysAgo },
        }).select('items totalAmount createdAt');

        const salesHistory = orders.map((order) => {
          const item = order.items.find(
            (i) => i.product.toString() === product._id.toString()
          );
          return {
            date: order.createdAt,
            quantity: item?.quantity || 0,
            revenue: item ? item.quantity * item.price : 0,
          };
        });

        return {
          name: product.name,
          sku: product.sku,
          category: product.category,
          currentStock: product.quantity,
          reorderLevel: product.reorderLevel,
          totalSold: product.totalSold || 0,
          salesHistory,
        };
      })
    );

    const prediction = await openaiService.predictDemand(productHistory);

    res.status(200).json({
      success: true,
      data: {
        prediction,
        productHistory,
      },
    });
  } catch (error) {
    console.error('Error predicting demand:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to predict demand',
    });
  }
};