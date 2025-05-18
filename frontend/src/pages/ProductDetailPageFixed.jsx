import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiShoppingCart, FiUser, FiTag, FiCalendar, FiInfo, FiPackage, FiAlertCircle } from 'react-icons/fi';
import { isAuthenticated } from '../utils/auth';
import { get, post } from '../utils/api';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addToCartStatus, setAddToCartStatus] = useState({ loading: false, error: null, success: false });

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        // Use our get utility function from api.js
        const data = await get(`products/${id}`);
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError(err.message || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    // Check if user is logged in
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: `/product/${id}`, message: 'Please log in to add items to cart' } });
      return;
    }
    
    try {
      setAddToCartStatus({ loading: true, error: null, success: false });
      
      console.log("Adding product to cart:", {
        product_id: product.id
      });
      
      // Handle authentication error by redirecting to login
      const onAuthError = () => {
        navigate('/login', { state: { from: `/product/${id}`, message: 'Your session has expired. Please log in again.' } });
      };
      
      // Use our post utility function
      await post('cart', { 
        product_id: parseInt(product.id, 10) 
      }, true, onAuthError);
      
      setAddToCartStatus({ loading: false, error: null, success: true });
      setTimeout(() => {
        setAddToCartStatus(prev => ({ ...prev, success: false }));
      }, 3000);
      
    } catch (err) {
      console.error('Error adding to cart:', err);
      
      // Handle authentication errors
      if (err.code === 'AUTH_REQUIRED' || err.code === 'AUTH_FAILED') {
        navigate('/login', { state: { from: `/product/${id}`, message: 'Please log in to add items to cart' } });
        return;
      }
      
      setAddToCartStatus({ loading: false, error: err.message || 'Failed to add item to cart', success: false });
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

  if (error) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="ml-64 p-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiAlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
          <Link to="/" className="mt-4 inline-flex items-center text-green-600 hover:text-green-800">
            <FiArrowLeft className="mr-2" /> Back to Products
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="ml-64 p-8">
          <div className="text-center">
            <h2 className="text-xl font-bold">Product not found</h2>
            <Link to="/" className="mt-4 inline-flex items-center text-green-600 hover:text-green-800">
              <FiArrowLeft className="mr-2" /> Back to Products
            </Link>
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
          <FiArrowLeft className="mr-2" /> Back to Products
        </Link>
        
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2">
              {product.image_url ? (
                <img 
                  className="h-96 w-full object-cover" 
                  src={product.image_url} 
                  alt={product.title} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                  }}
                />
              ) : (
                <div className="h-96 w-full bg-gray-200 flex items-center justify-center">
                  <FiPackage className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="p-8 md:w-1/2">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.title}</h1>
                  <p className="text-3xl font-bold text-green-600 mb-4">${product.price.toFixed(2)}</p>
                </div>
                <div className="px-2 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  {product.condition}
                </div>
              </div>
              
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-gray-600">{product.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center">
                  <FiTag className="text-gray-500 mr-2" />
                  <span className="text-gray-700">Category: <span className="font-medium">{product.category}</span></span>
                </div>
                
                <div className="flex items-center">
                  <FiCalendar className="text-gray-500 mr-2" />
                  <span className="text-gray-700">Listed: <span className="font-medium">
                    {new Date(product.created_at).toLocaleDateString()}
                  </span></span>
                </div>
                
                <div className="flex items-center">
                  <FiUser className="text-gray-500 mr-2" />
                  <span className="text-gray-700">Seller: <span className="font-medium">
                    {product.seller ? product.seller.username : "Unknown"}
                  </span></span>
                </div>
                
                <div className="flex items-center">
                  <FiInfo className="text-gray-500 mr-2" />
                  <span className="text-gray-700">Condition: <span className="font-medium">{product.condition}</span></span>
                </div>
              </div>
              
              {addToCartStatus.success && (
                <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-green-700">Item added to cart successfully!</p>
                    </div>
                  </div>
                </div>
              )}
              
              {addToCartStatus.error && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{addToCartStatus.error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <button
                onClick={handleAddToCart}
                disabled={addToCartStatus.loading || product.is_sold}
                className={`w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white 
                  ${product.is_sold ? 
                    'bg-gray-400 cursor-not-allowed' : 
                    'bg-green-600 hover:bg-green-700'}`}
              >
                {addToCartStatus.loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding to Cart...
                  </>
                ) : product.is_sold ? (
                  'Item Sold Out'
                ) : (
                  <>
                    <FiShoppingCart className="mr-2" /> Add to Cart
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;