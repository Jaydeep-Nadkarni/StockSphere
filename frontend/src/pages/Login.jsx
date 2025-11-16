import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await login(email, password);

      // Prevent admin users from using this login
      if (user.role === 'admin') {
        toast.error('❌ Admins must use the Admin Portal');
        setIsLoading(false);
        return;
      }

      toast.success(`✅ Welcome, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(`❌ ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-lg mb-4">
            <span className="text-2xl">👤</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">User Portal</h1>
          <p className="text-gray-400">Clerk & Sales Manager Access</p>
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
              placeholder="you@example.com"
              required
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
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
              placeholder="••••••••"
              required
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-semibold rounded-lg transition duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <span className="inline-block animate-spin mr-2">⚙️</span>
                Authenticating...
              </>
            ) : (
              <>
                <span className="mr-2">🔓</span>
                Sign In
              </>
            )}
          </button>

          {/* Link to Admin Login */}
          <div className="text-center pt-4 border-t border-slate-700">
            <p className="text-gray-400 mb-2">Are you an Administrator?</p>
            <Link
              to="/admin/login"
              className="text-blue-400 hover:text-blue-300 font-semibold transition"
            >
              🔐 Go to Admin Portal
            </Link>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400 text-sm">
          <p>StockSphere - Wholesale Inventory</p>
          <p className="text-xs text-gray-500 mt-2">v5.0 - Enterprise Edition</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
