import { useState, useEffect } from 'react';
import axios from '../api/axios';
import DataTable from '../components/DataTable';
import RoleGuard from '../components/RoleGuard';
import { toast } from 'react-toastify';
import { formatCurrency, formatDate } from '../utils/formatCurrency';
import { useNavigate } from 'react-router-dom';

function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [page, search, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/orders', {
        params: {
          page,
          limit: 10,
          search,
          status: statusFilter || undefined,
        },
      });
      if (data.success) {
        setOrders(data.data.orders);
        setTotal(data.data.total);
      }
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    try {
      const { data } = await axios.patch(`/api/orders/${selectedOrder._id}/status`, {
        status: newStatus,
      });
      if (data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        setShowStatusModal(false);
        setSelectedOrder(null);
        setNewStatus('');
        fetchOrders();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this order? Stock will be restored.')) {
      try {
        await axios.delete(`/api/orders/${id}`);
        toast.success('Order deleted and stock restored');
        fetchOrders();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error deleting order');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const columns = [
    { key: 'orderNo', label: 'Order No.' },
    {
      key: 'customerId',
      label: 'Customer',
      render: (value) => value?.name || 'Unknown',
    },
    {
      key: 'netAmount',
      label: 'Amount',
      render: (value) => formatCurrency(value),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(value)}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (value) => formatDate(value),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedOrder(row);
              setNewStatus(row.status);
            }}
            className="px-3 py-1 bg-primary text-white rounded hover:bg-blue-700 text-sm"
          >
            View
          </button>
          <RoleGuard allowedRoles={['admin', 'manager']}>
            {row.status === 'Pending' && (
              <button
                onClick={() => {
                  setSelectedOrder(row);
                  setNewStatus('');
                  setShowStatusModal(true);
                }}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
              >
                Update Status
              </button>
            )}
          </RoleGuard>
          <RoleGuard allowedRoles={['admin']}>
            <button
              onClick={() => handleDelete(row._id)}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            >
              Delete
            </button>
          </RoleGuard>
        </div>
      ),
    },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Orders</h1>
        <button
          onClick={() => navigate('/orders/create')}
          className="px-6 py-2 bg-primary text-white rounded hover:bg-blue-700"
        >
          + New Order
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by order no or customer..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <DataTable columns={columns} data={orders} loading={loading} />

      {/* Pagination */}
      <div className="mt-6 flex justify-center items-center gap-2">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">
          Page {page} of {Math.ceil(total / 10)}
        </span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page >= Math.ceil(total / 10)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && !showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-2xl max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Order Details - {selectedOrder.orderNo}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-semibold">{selectedOrder.customerId?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      selectedOrder.status
                    )}`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold">{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="font-semibold">{formatCurrency(selectedOrder.netAmount)}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Order Items</h3>
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left">Product</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                      <th className="px-3 py-2 text-right">Price</th>
                      <th className="px-3 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-3 py-2">
                          {item.productId?.name || 'Unknown Product'}
                        </td>
                        <td className="px-3 py-2 text-right">{item.quantity}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(item.price)}</td>
                        <td className="px-3 py-2 text-right font-semibold">
                          {formatCurrency(item.quantity * item.price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-end gap-8">
                  <div>
                    <p className="text-sm text-gray-600">Subtotal</p>
                    <p className="font-semibold">{formatCurrency(selectedOrder.subtotal)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tax (18%)</p>
                    <p className="font-semibold">{formatCurrency(selectedOrder.tax)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Net Amount</p>
                    <p className="font-bold text-lg">{formatCurrency(selectedOrder.netAmount)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <RoleGuard allowedRoles={['admin', 'manager']}>
                {selectedOrder.status === 'Pending' && (
                  <button
                    onClick={() => {
                      setShowStatusModal(true);
                      setNewStatus('');
                    }}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Update Status
                  </button>
                )}
              </RoleGuard>
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Update Order Status</h2>
            <p className="text-gray-600 mb-4">Current Status: {selectedOrder.status}</p>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">New Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Status</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleStatusChange}
                className="flex-1 px-4 py-2 bg-primary text-white rounded hover:bg-blue-700"
              >
                Update
              </button>
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedOrder(null);
                  setNewStatus('');
                }}
                className="flex-1 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
