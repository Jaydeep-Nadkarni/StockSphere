import { useState, useEffect } from 'react';
import apiClient from '../api/axios';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function AIDashboard() {
  const [loading, setLoading] = useState(false);
  const [dailySummary, setDailySummary] = useState(null);
  const [lowStockAnalysis, setLowStockAnalysis] = useState(null);
  const [businessReport, setBusinessReport] = useState(null);
  const [demandPrediction, setDemandPrediction] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchDailySummary();
  }, []);

  const fetchDailySummary = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/ai/daily-summary');
      if (response.data.success) {
        setDailySummary(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch daily summary');
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStockAnalysis = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/ai/low-stock-analysis');
      if (response.data.success) {
        setLowStockAnalysis(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch low stock analysis');
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinessReport = async () => {
    try {
      setLoading(true);
      const response = await apiClient.post('/ai/business-report', dateRange);
      if (response.data.success) {
        setBusinessReport(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to generate business report');
    } finally {
      setLoading(false);
    }
  };

  const fetchDemandPrediction = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/ai/demand-prediction');
      if (response.data.success) {
        setDemandPrediction(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch demand prediction');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.setTextColor(139, 92, 246);
    doc.text('StockSphere AI Analytics Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    if (activeTab === 'summary' && dailySummary) {
      // Daily Summary Section
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text('Daily Summary', 14, yPosition);
      yPosition += 10;

      // Metrics
      const metricsData = [
        ['Total Orders', dailySummary.metrics.totalOrders],
        ['Total Revenue', `$${dailySummary.metrics.totalRevenue.toFixed(2)}`],
        ['Avg Order Value', `$${dailySummary.metrics.avgOrderValue.toFixed(2)}`],
      ];

      doc.autoTable({
        startY: yPosition,
        head: [['Metric', 'Value']],
        body: metricsData,
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246] },
      });

      yPosition = doc.lastAutoTable.finalY + 10;

      // AI Summary
      doc.setFontSize(14);
      doc.text('AI Insights', 14, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      const summaryText = doc.splitTextToSize(dailySummary.summary, pageWidth - 28);
      doc.text(summaryText, 14, yPosition);
    }

    if (activeTab === 'report' && businessReport) {
      // Business Report Section
      doc.addPage();
      yPosition = 20;

      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text('Business Intelligence Report', 14, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Period: ${dateRange.startDate} to ${dateRange.endDate}`, 14, yPosition);
      yPosition += 10;

      // Report Content
      const reportText = doc.splitTextToSize(businessReport.report, pageWidth - 28);
      doc.text(reportText, 14, yPosition);
    }

    if (activeTab === 'inventory' && lowStockAnalysis) {
      // Low Stock Analysis
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(16);
      doc.text('Low Stock Analysis', 14, yPosition);
      yPosition += 10;

      const stockData = lowStockAnalysis.lowStockItems.map((item) => [
        item.name,
        item.sku,
        item.currentStock,
        item.reorderLevel,
      ]);

      doc.autoTable({
        startY: yPosition,
        head: [['Product', 'SKU', 'Current Stock', 'Reorder Level']],
        body: stockData,
        theme: 'grid',
        headStyles: { fillColor: [239, 68, 68] },
      });
    }

    // Save PDF
    doc.save(`StockSphere-AI-Report-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('PDF downloaded successfully!');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return (
          <div className="space-y-6">
            {dailySummary ? (
              <>
                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
                    <div className="text-sm opacity-90">Total Orders Today</div>
                    <div className="text-3xl font-bold mt-2">{dailySummary.metrics.totalOrders}</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
                    <div className="text-sm opacity-90">Total Revenue</div>
                    <div className="text-3xl font-bold mt-2">
                      ${dailySummary.metrics.totalRevenue.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
                    <div className="text-sm opacity-90">Avg Order Value</div>
                    <div className="text-3xl font-bold mt-2">
                      ${dailySummary.metrics.avgOrderValue.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* AI Summary */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-2">🤖</span>
                    <h2 className="text-xl font-bold text-gray-800">AI-Generated Insights</h2>
                  </div>
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap text-gray-700 font-sans">
                      {dailySummary.summary}
                    </pre>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Products Chart */}
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Top Products</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dailySummary.topProducts}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="totalSold" fill="#8b5cf6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Top Customers Chart */}
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Top Customers</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={dailySummary.topCustomers}
                          dataKey="totalSpent"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                        >
                          {dailySummary.topCustomers.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <button
                  onClick={fetchDailySummary}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Generate Daily Summary
                </button>
              </div>
            )}
          </div>
        );

      case 'inventory':
        return (
          <div className="space-y-6">
            {lowStockAnalysis ? (
              <>
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-2">📊</span>
                    <h2 className="text-xl font-bold text-gray-800">Low Stock AI Analysis</h2>
                  </div>
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap text-gray-700 font-sans">
                      {lowStockAnalysis.analysis}
                    </pre>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Low Stock Items</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left">Product</th>
                          <th className="px-4 py-2 text-left">SKU</th>
                          <th className="px-4 py-2 text-right">Current Stock</th>
                          <th className="px-4 py-2 text-right">Reorder Level</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lowStockAnalysis.lowStockItems.map((item, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="px-4 py-2">{item.name}</td>
                            <td className="px-4 py-2">{item.sku}</td>
                            <td className="px-4 py-2 text-right">{item.currentStock}</td>
                            <td className="px-4 py-2 text-right">{item.reorderLevel}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <button
                  onClick={fetchLowStockAnalysis}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Analyze Low Stock
                </button>
              </div>
            )}
          </div>
        );

      case 'report':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Generate Business Report</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  className="px-4 py-2 border rounded-lg"
                />
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  className="px-4 py-2 border rounded-lg"
                />
                <button
                  onClick={fetchBusinessReport}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            </div>

            {businessReport && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-2">📈</span>
                  <h2 className="text-xl font-bold text-gray-800">Business Intelligence Report</h2>
                </div>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-gray-700 font-sans">
                    {businessReport.report}
                  </pre>
                </div>
              </div>
            )}
          </div>
        );

      case 'demand':
        return (
          <div className="space-y-6">
            {demandPrediction ? (
              <>
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-2">🔮</span>
                    <h2 className="text-xl font-bold text-gray-800">Demand Prediction</h2>
                  </div>
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap text-gray-700 font-sans">
                      {demandPrediction.prediction}
                    </pre>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <button
                  onClick={fetchDemandPrediction}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Predict Demand
                </button>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🤖 AI Analytics Dashboard</h1>
          <p className="text-gray-600">Powered by OpenAI for intelligent business insights</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="flex flex-wrap border-b">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'summary'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 Daily Summary
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'inventory'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📦 Inventory Analysis
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'report'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📈 Business Report
            </button>
            <button
              onClick={() => setActiveTab('demand')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'demand'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🔮 Demand Forecast
            </button>
            <div className="ml-auto px-6 py-3">
              <button
                onClick={downloadPDF}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
              >
                <span className="mr-2">📄</span>
                Download PDF
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div>{loading ? <div className="text-center py-12">Loading...</div> : renderTabContent()}</div>
      </div>
    </div>
  );
}