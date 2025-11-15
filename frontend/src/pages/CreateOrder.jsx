import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatCurrency';

function CreateOrderPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [discount, setDiscount] = useState(0);
  const [items, setItems] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      fetchBatches(selectedProductId);
    }
  }, [selectedProductId]);

  const fetchCustomers = async () => {
    try {
      const { data } = await axios.get('/api/customers', { params: { limit: 100 } });
      if (data.success) {
        setCustomers(data.data.customers);
      }
    } catch (error) {
      toast.error('Failed to load customers');
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('/api/products', { params: { limit: 100 } });
      if (data.success) {
        setProducts(data.data.products);
      }
    } catch (error) {
      toast.error('Failed to load products');
    }
  };

  const fetchBatches = async (productId) => {
    try {
      const { data } = await axios.get(`/api/batches/${productId}`);
      if (data.success) {
        setBatches(data.data.batches);
      }
    } catch (error) {
      toast.error('Failed to load batches');
    }
  };

  const handleAddItem = () => {
    if (!selectedProductId || !selectedBatchId || !quantity) {
      toast.error('Please select product, batch, and quantity');
      return;
    }

    const product = products.find(p => p._id === selectedProductId);
    const batch = batches.find(b => b._id === selectedBatchId);

    if (!product || !batch) {
      toast.error('Product or batch not found');
      return;
    }

    if (batch.quantity < parseInt(quantity)) {
      toast.error(`Insufficient quantity. Available: ${batch.quantity}`);
      return;
    }

    const newItem = {
      productId: selectedProductId,
      batchId: selectedBatchId,
      quantity: parseInt(quantity),
      price: product.price,
      productName: product.name,
      batchNo: batch.batchNo,
    };

    setItems([...items, newItem]);
    setSelectedProductId('');
    setSelectedBatchId('');
    setQuantity('');
    toast.success('Item added to order');
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const discountAmount = parseFloat(discount) || 0;
    const taxableAmount = subtotal - discountAmount;
    const tax = taxableAmount * 0.18;
    const netAmount = subtotal - discountAmount + tax;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      discount: parseFloat(discountAmount.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      netAmount: parseFloat(netAmount.toFixed(2)),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customerId) {
      toast.error('Please select a customer');
      return;
    }

    if (items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        customerId,
        items: items.map(item => ({
          productId: item.productId,
          batchId: item.batchId,
          quantity: item.quantity,
        })),
        discount: parseFloat(discount) || 0,
      };

      const { data } = await axios.post('/api/orders', orderData);
      if (data.success) {
        toast.success('Order created successfully!');
        navigate('/orders');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating order');
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Create New Order</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Customer Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Select Customer</h2>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">-- Select Customer --</option>
            {customers.map(customer => (
              <option key={customer._id} value={customer._id}>
                {customer.name} - {customer.email}
              </option>
            ))}
          </select>
        </div>

        {/* Add Items */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Add Items</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select Product</option>
                  {products.map(product => (
                    <option key={product._id} value={product._id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Batch</label>
                <select
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  disabled={!selectedProductId}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
                >
                  <option value="">Select Batch</option>
                  {batches.map(batch => (
                    <option key={batch._id} value={batch._id}>
                      {batch.batchNo} (Available: {batch.quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-blue-700 font-medium"
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        {items.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Product</th>
                  <th className="px-4 py-2 text-left">Batch</th>
                  <th className="px-4 py-2 text-right">Quantity</th>
                  <th className="px-4 py-2 text-right">Price</th>
                  <th className="px-4 py-2 text-right">Total</th>
                  <th className="px-4 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-4 py-2">{item.productName}</td>
                    <td className="px-4 py-2">{item.batchNo}</td>
                    <td className="px-4 py-2 text-right">{item.quantity}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(item.price)}</td>
                    <td className="px-4 py-2 text-right font-semibold">
                      {formatCurrency(item.quantity * item.price)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Discount & Totals */}
        {items.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-4">
              <div className="max-w-md ml-auto space-y-3">
                <div className="flex justify-between">
                  <label className="block text-sm font-medium">Discount (₹)</label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    min="0"
                    className="w-40 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between mb-2">
                    <span>Subtotal:</span>
                    <span className="font-semibold">{formatCurrency(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Discount:</span>
                    <span className="font-semibold">-{formatCurrency(totals.discount)}</span>
                  </div>
                  <div className="flex justify-between mb-3">
                    <span>Tax (18%):</span>
                    <span className="font-semibold">{formatCurrency(totals.tax)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-3 text-lg font-bold">
                    <span>Total Amount:</span>
                    <span className="text-primary">{formatCurrency(totals.netAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || items.length === 0 || !customerId}
            className="flex-1 px-6 py-3 bg-primary text-white rounded hover:bg-blue-700 disabled:opacity-50 font-semibold"
          >
            {loading ? 'Creating Order...' : 'Create Order'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="flex-1 px-6 py-3 bg-gray-300 rounded hover:bg-gray-400 font-semibold"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateOrderPage;
