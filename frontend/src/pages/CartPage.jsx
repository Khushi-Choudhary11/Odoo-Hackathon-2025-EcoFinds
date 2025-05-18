import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiTrash2, FiArrowRight, FiAlertCircle } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';
import { getAuthHeader, isAuthenticated, removeToken } from '../utils/auth';

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [unavailableItems, setUnavailableItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [removingItem, setRemovingItem] = useState(null);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { from: '/cart', message: 'Please log in to view your cart' } });
    }
  }, [navigate]);

  // Fetch cart items
  useEffect(() => {
    const fetchCart = async () => {
      // Check if authenticated
      if (!isAuthenticated()) {
        navigate('/login', { state: { from: '/cart', message: 'Please log in to view your cart' } });
        return;
      }
      
      setLoading(true);
      try {
        console.log("Fetching cart items...");
        
        const response = await fetch('http://localhost:5000/api/cart', {
          headers: getAuthHeader()
        });
        
        console.log("Cart response status:", response.status);
        
        // Try to parse JSON even if response is not OK
        const data = await response.json().catch(e => {
          console.error("Failed to parse JSON response:", e);
          return {};
        });
        
        console.log("Cart API response:", data);
        
        if (!response.ok) {
          if (response.status === 401 || response.status === 422 || data.msg === 'Subject must be a string') {
            // Authentication error
            console.error("Authentication error. Redirecting to login");
            removeToken(); // Clear invalid token
            navigate('/login', { state: { from: '/cart', message: 'Your session has expired. Please log in again.' } });
            return;
          }
          throw new Error(data.message || data.msg || `Failed to fetch cart items (${response.status})`);
        }
        
        // Debug cart items received
        if (Array.isArray(data.cartItems)) {
          console.log(`Received ${data.cartItems.length} cart items`);
        } else {
          console.log("cartItems is not an array:", data.cartItems);
        }
        
        setCartItems(Array.isArray(data.cartItems) ? data.cartItems : []);
        setUnavailableItems(Array.isArray(data.unavailableItems) ? data.unavailableItems : []);
        setTotal(typeof data.total === 'number' ? data.total : 0);
      } catch (err) {
        console.error('Error fetching cart:', err);
        setError(err.message || 'Failed to load cart items');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCart();
  }, [navigate]);

  const handleRemoveItem = async (itemId) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    setRemovingItem(itemId);
    try {
      const response = await fetch(`http://localhost:5000/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to remove item');
      }
      
      // Update cart items locally
      setCartItems(cartItems.filter(item => item.id !== itemId));
      
      // Recalculate total
      const updatedTotal = cartItems
        .filter(item => item.id !== itemId)
        .reduce((sum, item) => sum + (item.product?.price || 0), 0);
      setTotal(updatedTotal);
      
    } catch (err) {
      console.error('Error removing item:', err);
      setError(err.message || 'Failed to remove item');
    } finally {
      setRemovingItem(null);
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }
    
    navigate('/checkout');
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 p-8 w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <FiShoppingCart className="mr-3" /> Your Cart
        </h1>
        
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
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center shadow-md">
            <FiShoppingCart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't added any items to your cart yet.</p>
            <Link to="/" className="inline-block bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items - Left Column */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {cartItems.map(item => (
                    <li key={item.id} className="p-6 flex flex-col sm:flex-row items-center">
                      <div className="sm:w-20 sm:h-20 h-32 w-32 flex-shrink-0 mb-4 sm:mb-0">
                        <img 
                          className="w-full h-full object-cover rounded" 
                          src={item.product?.image_url || 'https://via.placeholder.com/100?text=No+Image'} 
                          alt={item.product?.title || 'Product'}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                          }}
                        />
                      </div>
                      
                      <div className="ml-0 sm:ml-6 flex-1 flex flex-col sm:flex-row sm:items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-800">
                            {item.product?.title || 'Unknown Product'}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">
                            {item.product?.condition || 'N/A'} • {item.product?.category || 'Unknown Category'}
                          </p>
                          <p className="font-semibold text-green-600">
                            ${item.product?.price?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                        
                        <button 
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={removingItem === item.id}
                          className="mt-4 sm:mt-0 inline-flex items-center px-3 py-2 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none"
                        >
                          {removingItem === item.id ? (
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-red-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <FiTrash2 className="mr-2 h-4 w-4" />
                          )}
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              {unavailableItems.length > 0 && (
                <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FiAlertCircle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Some items in your cart are no longer available
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <ul className="list-disc pl-5 space-y-1">
                          {unavailableItems.map(item => (
                            <li key={item.id}>
                              The item {item.product_id ? `#${item.product_id}` : ''} is {item.reason === 'sold' ? 'already sold' : 'no longer available'}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Order Summary - Right Column */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between mb-2">
                    <p className="text-sm text-gray-600">Subtotal</p>
                    <p className="text-sm font-medium text-gray-900">${total.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between mb-2">
                    <p className="text-sm text-gray-600">Shipping</p>
                    <p className="text-sm font-medium text-gray-900">FREE</p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between">
                    <p className="text-base font-medium text-gray-900">Total</p>
                    <p className="text-base font-bold text-green-700">${total.toFixed(2)}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Including all applicable taxes</p>
                </div>
                
                <button 
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0}
                  className={`mt-6 w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white 
                    ${cartItems.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  Checkout <FiArrowRight className="ml-2" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;