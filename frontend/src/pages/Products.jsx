import { useState, useEffect } from 'react';
import axios from '../api/axios';
import DataTable from '../components/DataTable';
import RoleGuard from '../components/RoleGuard';
import { toast } from 'react-toastify';
import { formatCurrency } from '../utils/formatCurrency';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    category: '',
    supplierId: '',
  });

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, [page, search]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/products', {
        params: { page, limit: 10, search },
      });
      if (data.success) {
        setProducts(data.data.products);
        setTotal(data.data.total);
      }
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const { data } = await axios.get('/suppliers', { params: { limit: 100 } });
      if (data.success) {
        setSuppliers(data.data.suppliers);
      }
    } catch (error) {
      console.error('Failed to load suppliers');
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingId(product._id);
      setFormData({
        name: product.name,
        sku: product.sku,
        price: product.price,
        category: product.category,
        supplierId: product.supplierId?._id || '',
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', sku: '', price: '', category: '', supplierId: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: '', sku: '', price: '', category: '', supplierId: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name || !formData.sku || !formData.price || !formData.category) {
        toast.error('Please fill all required fields');
        return;
      }

      if (editingId) {
        const { data } = await axios.put(`/products/${editingId}`, formData);
        if (data.success) {
          toast.success('Product updated successfully');
        }
      } else {
        const { data } = await axios.post('/products', formData);
        if (data.success) {
          toast.success('Product created successfully');
        }
      }
      handleCloseModal();
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving product');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`/products/${id}`);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error deleting product');
      }
    }
  };

  const columns = [
    { key: 'name', label: 'Product Name' },
    { key: 'sku', label: 'SKU' },
    {
      key: 'price',
      label: 'Price',
      render: (value) => formatCurrency(value),
    },
    { key: 'category', label: 'Category' },
    {
      key: 'currentStock',
      label: 'Stock',
      render: (value) => (
        <span className={value < 10 ? 'text-red-600 font-bold' : 'text-green-600'}>
          {value}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <RoleGuard allowedRoles={['admin', 'manager']}>
            <button
              onClick={() => handleOpenModal(row)}
              className="px-3 py-1 bg-primary text-white rounded hover:bg-blue-700 text-sm"
            >
              Edit
            </button>
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
    <div className="p-8 dark:bg-gray-900 dark:text-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <RoleGuard allowedRoles={['manager']}>
          <button
            onClick={() => handleOpenModal()}
            className="px-6 py-2 bg-primary text-white rounded hover:bg-blue-700"
          >
            + Add Product
          </button>
        </RoleGuard>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
        />
      </div>

      <DataTable columns={columns} data={products} loading={loading} />

      {/* Pagination */}
      <div className="mt-6 flex justify-center items-center gap-2">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-4 py-2">
          Page {page} of {Math.ceil(total / 10)}
        </span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page >= Math.ceil(total / 10)}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">
              {editingId ? 'Edit Product' : 'Add Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">SKU</label>
                <input
                  name="sku"
                  type="text"
                  value={formData.sku}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Price</label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <input
                  name="category"
                  type="text"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Supplier</label>
                <select
                  name="supplierId"
                  value={formData.supplierId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                >
                  <option value="">Select supplier</option>
                  {suppliers.map((s) => (
                    <option key={s._id || s.id} value={s._id || s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4">
                <button type="submit" className="flex-1 px-4 py-2 bg-primary text-white rounded">
                  {editingId ? 'Save Changes' : 'Create'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductsPage;
