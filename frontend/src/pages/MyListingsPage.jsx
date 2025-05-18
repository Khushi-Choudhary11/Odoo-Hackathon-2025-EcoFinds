import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiAlertCircle, FiTag, FiUser, FiTrendingUp, FiShoppingBag } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';
import { isAuthenticated, getAuthHeader } from '../utils/auth';
import { get } from '../utils/api';

const MyListingsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: '/my-listings', message: 'Please log in to view your listings' } });
      return;
    }
    
    fetchUserProducts();
  }, [navigate]);

  const fetchUserProducts = async () => {
    setLoading(true);
    try {
      console.log("Fetching user products...");
      // Use the correct endpoint - /api/users/products not /api/user/products
      const response = await get('users/products', true);
      console.log("User products response:", response);
      setProducts(Array.isArray(response) ? response : []);
      setError(null);
    } catch (err) {
      console.error("Error fetching user products:", err);
      setError(err.message || 'Failed to load your product listings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="ml-64 p-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Listings</h1>
          <Link 
            to="/new-listing" 
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <FiPlus className="mr-2" /> Add New Listing
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiAlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {products.length === 0 && !error ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <FiShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No listings yet</h3>
            <p className="text-gray-500 mb-4">Start selling your sustainable products today!</p>
            <Link 
              to="/new-listing" 
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <FiPlus className="-ml-1 mr-2 h-5 w-5" /> Create Your First Listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-48 w-full overflow-hidden">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <FiShoppingBag className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h2 className="text-lg font-medium text-gray-900 truncate">{product.title}</h2>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
                  <div className="mt-4 flex items-center text-sm text-gray-600">
                    <FiTag className="mr-1" /> 
                    <span>{product.category || 'Uncategorized'}</span>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-600">
                    <FiTrendingUp className="mr-1" /> 
                    <span>Status: {product.is_sold ? 'Sold' : 'Available'}</span>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <Link 
                      to={`/product/${product.id}`}
                      className="text-green-600 hover:text-green-800 font-medium"
                    >
                      View Details
                    </Link>
                    <Link 
                      to={`/edit-listing/${product.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListingsPage;