import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiShoppingBag, FiPackage, FiCalendar, FiArrowLeft, FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';
import { getAuthHeader, isAuthenticated, removeToken } from '../utils/auth';

const PurchaseHistoryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(location.state?.message || null);
  const [highlightedOrderId, setHighlightedOrderId] = useState(location.state?.orderId || null);
  
  // Check authentication and fetch orders
  useEffect(() => {
    // Clear location state after reading it
    if (location.state?.message) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        window.history.replaceState({}, document.title);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state?.message]);
  
  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: '/purchases', message: 'Please log in to view your purchases' } });
      return;
    }
    
    const fetchOrders = async () => {
      setLoading(true);
      try {
        console.log("Fetching order history...");
        const response = await fetch('http://localhost:5000/api/orders', {
          headers: getAuthHeader()
        });
        
        console.log("Orders fetch response status:", response.status);
        
        // Handle authentication errors
        if (response.status === 401 || response.status === 422) {
          console.error("Authentication error. Redirecting to login");
          removeToken();
          navigate('/login', { state: { from: '/purchases', message: 'Your session has expired. Please log in again.' } });
          return;
        }
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to fetch your orders');
        }
        
        const data = await response.json();
        console.log("Orders data:", data);
        
        if (!data.orders || !Array.isArray(data.orders)) {
          console.warn("No orders data returned or invalid format");
          setOrders([]);
          return;
        }
        
        // Sort orders by date (newest first)
        const sortedOrders = data.orders.sort((a, b) => {
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        });
        
        console.log(`Processed ${sortedOrders.length} orders`);
        
        // Process each order to ensure items array exists
        const processedOrders = sortedOrders.map(order => {
          return {
            ...order,
            items: Array.isArray(order.items) ? order.items : []
          };
        });
          
        setOrders(processedOrders);
        
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.message || 'Failed to load your purchase history');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [navigate]);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="ml-64 p-8 w-full flex justify-center items-center h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600 mb-4"></div>
            <p className="text-gray-600">Loading your purchase history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 p-8 w-full">
        <Link to="/" className="inline-flex items-center text-green-600 hover:text-green-800 mb-6">
          <FiArrowLeft className="mr-2" /> Back to Shopping
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <FiShoppingBag className="mr-3" /> Purchase History
        </h1>
        
        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiCheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}
        
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
        
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <FiPackage className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No purchases yet</h2>
            <p className="text-gray-500 mb-6">You haven't made any purchases yet. Start shopping to see your orders here.</p>
            <Link to="/" className="inline-block bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className={`bg-white rounded-lg shadow-md overflow-hidden ${
                  highlightedOrderId === order.id ? 'ring-2 ring-green-500' : ''
                }`}
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900 flex items-center">
                        Order #{order.id}
                        {highlightedOrderId === order.id && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <FiCheckCircle className="mr-1" /> Just placed
                          </span>
                        )}
                      </h2>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500 flex items-center">
                        <FiCalendar className="mr-1" /> {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                      <p className="text-sm font-medium text-gray-500">Total</p>
                      <p className="text-xl font-bold text-green-600">${order.total_amount?.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Items</h3>
                  <ul className="divide-y divide-gray-200">
                    {order.items?.map((item) => (
                      <li key={item.id} className="py-4 flex">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                          <img 
                            src={item.product?.image_url || 'https://via.placeholder.com/100?text=No+Image'} 
                            alt={item.product?.title || 'Product'} 
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                            }}
                          />
                        </div>
                        
                        <div className="ml-4 flex-1 flex flex-col">
                          <div>
                            <div className="flex justify-between text-base font-medium text-gray-900">
                              <h4>{item.product?.title || 'Product no longer available'}</h4>
                              <p className="ml-4">${item.price?.toFixed(2)}</p>
                            </div>
                            {item.product && (
                              <p className="mt-1 text-sm text-gray-500">
                                {item.product.category} • {item.product.condition}
                              </p>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                    
                    {!order.items?.length && (
                      <li className="py-4 text-center text-gray-500 italic">
                        Order details are not available
                      </li>
                    )}
                  </ul>
                </div>
                
                <div className="px-6 py-4 bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                    <FiInfo className="mr-1" /> Shipping Information
                  </h3>
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {order.shipping_address || 'No shipping address provided'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseHistoryPage;