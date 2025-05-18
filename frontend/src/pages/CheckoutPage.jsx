import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiShoppingBag, FiCreditCard, FiTruck, FiCheck, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import Sidebar from '../components/Sidebar';
import { getAuthHeader, isAuthenticated, removeToken } from '../utils/auth';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [unavailableItems, setUnavailableItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [error, setError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    cardNumber: '',
    cardName: '',
    expiration: '',
    cvv: ''
  });

  // Check authentication and fetch cart items
  useEffect(() => {
    // First check if user is authenticated
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: '/checkout', message: 'Please log in to checkout' } });
      return;
    }

    const fetchCart = async () => {
      setLoading(true);
      try {
        console.log("Fetching cart for checkout...");
        const response = await fetch('http://localhost:5000/api/cart', {
          headers: getAuthHeader()
        });

        console.log("Cart fetch response status:", response.status);
        
        // Handle 401 Unauthorized or token issues
        if (response.status === 401 || response.status === 422) {
          console.error("Authentication error. Redirecting to login");
          removeToken();
          navigate('/login', { state: { from: '/checkout', message: 'Your session has expired. Please log in again.' } });
          return;
        }
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to fetch cart items');
        }
        
        const data = await response.json();
        console.log("Cart data for checkout:", data);
        
        // Check if cart is empty
        if (!data.cartItems || !Array.isArray(data.cartItems) || data.cartItems.length === 0) {
          setError('Your cart is empty. Add items to your cart before checkout.');
          setTimeout(() => navigate('/'), 3000);
          return;
        }
        
        setCartItems(data.cartItems);
        setUnavailableItems(data.unavailableItems || []);
        setTotal(data.total || 0);
        
      } catch (err) {
        console.error('Error fetching cart for checkout:', err);
        setError(err.message || 'Failed to load cart items');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCart();
  }, [navigate]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Process the checkout
  const handleCheckout = async (e) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }
    
    setProcessingOrder(true);
    setError(null);
    
    try {
      console.log("Processing checkout...");
      
      // Extract shipping address from form
      const shippingAddress = `${formData.fullName}\n${formData.address}\n${formData.city}, ${formData.state} ${formData.zipCode}\n${formData.country}`;
      
      const response = await fetch('http://localhost:5000/api/cart/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          shipping_address: shippingAddress
        })
      });
      
      console.log("Checkout response status:", response.status);
      
      const data = await response.json().catch(e => {
        console.error("Failed to parse checkout response:", e);
        return {};
      });
      
      console.log("Checkout response data:", data);
      
      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401 || response.status === 422) {
          removeToken();
          navigate('/login', { state: { from: '/checkout', message: 'Your session has expired. Please log in again.' } });
          return;
        }
        
        throw new Error(data.message || data.details || 'Failed to process checkout');
      }
      
      // Order successful
      setOrderSuccess(true);
      setOrderId(data.order?.id || 'unknown');
      
      // Navigate to success page after short delay
      setTimeout(() => {
        navigate('/purchases', { state: { 
          message: 'Your order has been successfully placed!',
          orderId: data.order?.id
        }});
      }, 3000);
      
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to process your order');
      // Don't redirect on error, let user try again
    } finally {
      setProcessingOrder(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="ml-64 p-8 w-full flex justify-center items-center h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600 mb-4"></div>
            <p className="text-gray-600">Loading your cart information...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render order success
  if (orderSuccess) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="ml-64 p-8 w-full flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full text-center">
            <div className="mx-auto bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
              <FiCheck className="text-green-600 h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h2>
            <p className="text-gray-600 mb-4">Thank you for your purchase. Your order has been placed.</p>
            <p className="text-green-600 font-medium mb-6">Order ID: #{orderId}</p>
            <p className="text-gray-500 mb-6">Redirecting to your purchase history...</p>
            <div className="animate-pulse">
              <div className="h-2 w-24 bg-green-200 rounded mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 p-8 w-full">
        <Link to="/cart" className="inline-flex items-center text-green-600 hover:text-green-800 mb-6">
          <FiArrowLeft className="mr-2" /> Back to Cart
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
          <FiShoppingBag className="mr-3" /> Checkout
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
        
        {unavailableItems && unavailableItems.length > 0 && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiAlertCircle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Some items in your cart are no longer available
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Please return to your cart to review these items.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form - Left and Middle Columns */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FiTruck className="mr-2" /> Shipping Information
              </h2>
              
              <form onSubmit={handleCheckout}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fullName">
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={formData.fullName}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="address">
                      Address
                    </label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      required
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="city">
                      City
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      required
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="state">
                      State / Province
                    </label>
                    <input
                      id="state"
                      name="state"
                      type="text"
                      required
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={formData.state}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="zipCode">
                      ZIP / Postal Code
                    </label>
                    <input
                      id="zipCode"
                      name="zipCode"
                      type="text"
                      required
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={formData.zipCode}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="country">
                      Country
                    </label>
                    <select
                      id="country"
                      name="country"
                      required
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={formData.country}
                      onChange={handleChange}
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                      <option value="Germany">Germany</option>
                      <option value="France">France</option>
                    </select>
                  </div>
                </div>
                
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FiCreditCard className="mr-2" /> Payment Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="cardNumber">
                      Card Number
                    </label>
                    <input
                      id="cardNumber"
                      name="cardNumber"
                      type="text"
                      required
                      placeholder="XXXX XXXX XXXX XXXX"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={formData.cardNumber}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="cardName">
                      Cardholder Name
                    </label>
                    <input
                      id="cardName"
                      name="cardName"
                      type="text"
                      required
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={formData.cardName}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="expiration">
                      Expiration Date
                    </label>
                    <input
                      id="expiration"
                      name="expiration"
                      type="text"
                      required
                      placeholder="MM/YY"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={formData.expiration}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="cvv">
                      CVV
                    </label>
                    <input
                      id="cvv"
                      name="cvv"
                      type="text"
                      required
                      placeholder="XXX"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={formData.cvv}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={processingOrder || cartItems.length === 0}
                  className={`w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white 
                    ${processingOrder || cartItems.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {processingOrder ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing Order...
                    </>
                  ) : (
                    <>
                      Place Order - ${total.toFixed(2)}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
          
          {/* Order Summary - Right Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              
              <div className="max-h-64 overflow-y-auto mb-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center py-4 border-b border-gray-200">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
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
                        <div className="flex justify-between text-base font-medium text-gray-800">
                          <h3>{item.product?.title || 'Unknown Product'}</h3>
                          <p className="ml-4">${item.product?.price?.toFixed(2) || '0.00'}</p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {item.product?.condition || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between mb-2">
                  <p className="text-sm text-gray-600">Subtotal</p>
                  <p className="text-sm font-medium text-gray-900">${total.toFixed(2)}</p>
                </div>
                <div className="flex justify-between mb-2">
                  <p className="text-sm text-gray-600">Shipping</p>
                  <p className="text-sm font-medium text-gray-900">FREE</p>
                </div>
                <div className="flex justify-between mb-2">
                  <p className="text-sm text-gray-600">Tax</p>
                  <p className="text-sm font-medium text-gray-900">${(total * 0.08).toFixed(2)}</p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between">
                  <p className="text-base font-medium text-gray-900">Total</p>
                  <p className="text-base font-bold text-green-700">${(total + (total * 0.08)).toFixed(2)}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">Including all applicable taxes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;