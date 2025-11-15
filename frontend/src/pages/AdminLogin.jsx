import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { adminLogin } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await adminLogin(email, password);

      // Verify user is admin
      if (user.role !== 'admin') {
        toast.error('❌ Only administrators can access this portal');
        setLoading(false);
        return;
      }

      toast.success(`✅ Welcome back, ${user.name}!`);
      navigate('/admin/dashboard');
    } catch (error) {
      const message = error.message || 'Login failed';
      toast.error(`❌ ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-lg mb-4">
            <span className="text-2xl">🔐</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-purple-300">Administrator Access Only</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg shadow-2xl p-8 space-y-6">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition"
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-semibold rounded-lg transition duration-200 flex items-center justify-center"
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin mr-2">⚙</span>
                Authenticating...
              </>
            ) : (
              <>
                <span className="mr-2">🔓</span>
                Sign In as Admin
              </>
            )}
          </button>

          {/* Info Box */}
          <div className="bg-purple-900/50 border border-purple-700 rounded-lg p-4 text-sm text-purple-200">
            <p className="font-semibold mb-1">🛡 Secure Admin Access</p>
            <p>This portal is restricted to administrators only. Unauthorized access attempts are logged.</p>
          </div>

          {/* Link to User Login */}
          <div className="text-center pt-4 border-t border-slate-700">
            <p className="text-gray-400 mb-2">Are you a Clerk or Sales Manager?</p>
            <Link
              to="/login"
              className="text-purple-400 hover:text-purple-300 font-semibold transition"
            >
              👤 Go to User Login
            </Link>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400 text-sm">
          <p>StockSphere Admin Console</p>
          <p className="text-xs text-gray-500 mt-2">v5.0 - Enterprise Edition</p>
        </div>
      </div>
    </div>
  );
}