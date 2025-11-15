const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate daily sales summary
const generateDailySummary = async (ordersData, productsData, customersData) => {
  try {
    const prompt = `
You are an AI assistant for a wholesale inventory management system. Analyze the following data and provide a comprehensive daily sales summary with actionable insights.

Today's Orders Data:
${JSON.stringify(ordersData, null, 2)}

Products Data:
${JSON.stringify(productsData, null, 2)}

Customer Data:
${JSON.stringify(customersData, null, 2)}

Please provide:
1. Executive Summary (2-3 sentences)
2. Key Metrics Analysis
3. Top Performing Products
4. Revenue Insights
5. Customer Behavior Patterns
6. Actionable Recommendations
7. Alerts or Concerns

Format the response in a clear, professional manner suitable for business stakeholders.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a business intelligence analyst specializing in wholesale inventory and sales analysis.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to generate AI summary');
  }
};

// Analyze inventory and predict low stock
const analyzeLowStock = async (inventoryData) => {
  try {
    const prompt = `
Analyze the following inventory data and predict which items may run out of stock soon based on current levels and typical usage patterns.

Inventory Data:
${JSON.stringify(inventoryData, null, 2)}

Provide:
1. Critical Stock Items (immediate action needed)
2. Low Stock Items (reorder soon)
3. Recommended Reorder Quantities
4. Priority Level for each item
5. Estimated days until stock-out

Format as a structured JSON response.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an inventory management specialist with expertise in demand forecasting.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 1000,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to analyze inventory');
  }
};

// Generate comprehensive business report
const generateBusinessReport = async (reportData) => {
  try {
    const { orders, products, customers, suppliers, dateRange } = reportData;

    const prompt = `
Generate a comprehensive business intelligence report for a wholesale inventory management system.

Date Range: ${dateRange.start} to ${dateRange.end}

Orders Summary:
${JSON.stringify(orders, null, 2)}

Products Performance:
${JSON.stringify(products, null, 2)}

Customer Analytics:
${JSON.stringify(customers, null, 2)}

Supplier Performance:
${JSON.stringify(suppliers, null, 2)}

Create a detailed report with:
1. Executive Summary
2. Sales Performance Analysis
3. Product Category Insights
4. Customer Segmentation & Behavior
5. Supplier Reliability Assessment
6. Profitability Analysis
7. Trend Predictions
8. Strategic Recommendations
9. Risk Factors & Mitigation

Make it professional and actionable for C-level executives.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a senior business analyst creating executive reports for wholesale businesses.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.6,
      max_tokens: 2500,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to generate business report');
  }
};

// Smart order insights
const getOrderInsights = async (orderDetails) => {
  try {
    const prompt = `
Analyze this specific order and provide intelligent insights:

Order Details:
${JSON.stringify(orderDetails, null, 2)}

Provide:
1. Order Pattern Analysis
2. Unusual Items or Quantities (if any)
3. Revenue Optimization Suggestions
4. Customer Buying Behavior Insights
5. Cross-selling Opportunities

Keep it concise and actionable.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a sales optimization expert analyzing customer orders.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to get order insights');
  }
};

// Predict demand for products
const predictDemand = async (productHistory) => {
  try {
    const prompt = `
Based on the following product sales history, predict future demand and provide recommendations:

Product History:
${JSON.stringify(productHistory, null, 2)}

Provide:
1. Demand Forecast for next 30 days
2. Seasonal Patterns (if any)
3. Recommended Stock Levels
4. Pricing Strategy Suggestions
5. Marketing Opportunities

Format as structured insights.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a demand forecasting specialist for wholesale inventory.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.6,
      max_tokens: 1000,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to predict demand');
  }
};

module.exports = {
  generateDailySummary,
  analyzeLowStock,
  generateBusinessReport,
  getOrderInsights,
  predictDemand,
};