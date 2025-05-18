import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiShoppingBag, FiHeart, FiShare2, FiArrowLeft, FiStar } from 'react-icons/fi';
import { RiLeafLine, RiRecycleLine, RiPlantLine, RiThumbUpLine } from 'react-icons/ri';

const ProductDetailPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  
  // Fallback product data if API fails
  const fallbackProduct = {
    id,
    title: 'Vintage Art Deco Lamp',
    price: 20,
    originalPrice: 35,
    seller: {
      id: 1,
      username: 'GreenLiving'
    },
    sellerRating: 4.8,
    description: 'A beautiful vintage lamp in great condition with a rustic bronze finish. This lamp has been carefully restored with energy-efficient LED technology while preserving its original Art Deco charm.',
    category: 'Home Decor',
    condition: 'Excellent',
    material: 'Recycled Metal & Glass',
    image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=500',
    sustainabilityFeatures: [
      'Upcycled materials',
      'Energy efficient LED bulb included',
      'Refurbished with eco-friendly processes',
      'Reduces electronic waste'
    ]
  };
  
  useEffect(() => {
    const fetchProductDetails = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/products/${id}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch product details');
        }
        
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details. Using sample data instead.');
        // Use fallback product if API fails
        setProduct(fallbackProduct);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  const [relatedProducts, setRelatedProducts] = useState([
    { id: 2, title: 'Recycled Paper Notebook', price: 8, image: 'https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=300' },
    { id: 3, title: 'Bamboo Picture Frame', price: 12, image: 'https://images.unsplash.com/photo-1605265622937-bb7c273093c4?q=80&w=300' },
    { id: 4, title: 'Cork Coasters (Set of 4)', price: 6, image: 'https://images.unsplash.com/photo-1632811744797-3cf99c9c1775?q=80&w=300' }
  ]);

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login', { state: { redirectTo: `/product/${product.id}` } });
        return;
      }

      // Validate product ID exists
      if (!product?.id) {
        throw new Error('Product ID is required');
      }

      const response = await fetch('http://localhost:5000/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: product.id, // Make sure this matches your API expectation
          quantity: quantity || 1
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add item to cart');
      }

      setAddedToCart(true);
      // Show success message
      setSuccess('Item added to cart successfully!');
      
      // Reset after 3 seconds
      setTimeout(() => {
        setAddedToCart(false);
        setSuccess('');
      }, 3000);

    } catch (err) {
      console.error('Error adding to cart:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price) => {
    return `$${price}`;
  };

  const fallbackImageUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNnB4IiBmaWxsPSIjYWFhIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgTm90IEF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=';

  if (isLoading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="ml-64 p-8 w-full flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="ml-64 p-8 w-full">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-red-700">{error}</p>
                <button 
                  onClick={() => navigate(-1)} 
                  className="mt-2 text-red-700 hover:underline flex items-center"
                >
                  <FiArrowLeft className="mr-1" /> Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 p-8 w-full">
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link to="/" className="text-gray-600 hover:text-green-600 flex items-center">
                <FiArrowLeft className="mr-2" /> Back to Products
              </Link>
            </li>
          </ol>
        </nav>
        
        {error && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <p className="text-yellow-700">{error}</p>
          </div>
        )}
        
        <div className="flex flex-col lg:flex-row gap-8 mb-12">
          {/* Product Image */}
          <div className="lg:w-1/2">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100">
              <img 
                src={product.image_url || fallbackImageUrl}
                alt={product.title}
                className="w-full h-96 object-contain rounded-lg"
                onError={(e) => {
                  e.target.onerror = null; // Prevent infinite loop
                  e.target.src = fallbackImageUrl;
                }}
              />
              <div className="flex justify-center mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <RiLeafLine className="h-4 w-4 mr-1" />
                  Eco-Friendly Product
                </span>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-start">
                  <RiRecycleLine className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-800">Sustainable Materials</h4>
                    <p className="text-xs text-gray-600">This product uses eco-friendly materials</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-start">
                  <RiPlantLine className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-800">Reduced Impact</h4>
                    <p className="text-xs text-gray-600">Lower carbon footprint than conventional products</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Product Details */}
          <div className="lg:w-1/2">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.title}</h1>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold text-green-700">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </span>
                </>
              )}
            </div>
            
            <div className="flex items-center mb-4">
              <span className="text-gray-600 mr-2">
                Sold by: {typeof product.seller === 'object' ? product.seller.username : product.seller || 'Unknown Seller'}
              </span>
              {product.sellerRating && (
                <div className="flex items-center">
                  <div className="flex text-yellow-400 mr-1">
                    <FiStar className="fill-current" />
                  </div>
                  <span className="text-sm font-medium">{product.sellerRating}</span>
                </div>
              )}
            </div>
            
            {product.sustainabilityFeatures && product.sustainabilityFeatures.length > 0 && (
              <div className="bg-green-50 p-4 rounded-lg mb-6 border border-green-200">
                <h3 className="font-bold text-green-800 mb-2 flex items-center">
                  <RiLeafLine className="mr-2" />
                  Sustainability Features
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  {product.sustainabilityFeatures.map((feature, index) => (
                    <li key={index} className="text-gray-700">{feature}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="mb-6">
              <h3 className="font-bold text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {product.condition && (
                <div>
                  <span className="block text-gray-500 text-sm">Condition</span>
                  <span className="font-medium">{product.condition}</span>
                </div>
              )}
              {product.material && (
                <div>
                  <span className="block text-gray-500 text-sm">Material</span>
                  <span className="font-medium">{product.material}</span>
                </div>
              )}
              {product.category && (
                <div>
                  <span className="block text-gray-500 text-sm">Category</span>
                  <span className="font-medium">{product.category}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center mb-6">
              <label htmlFor="quantity" className="mr-3 font-medium">Quantity:</label>
              <div className="flex border border-gray-300 rounded">
                <button 
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                  className="px-3 py-1 border-r border-gray-300 hover:bg-gray-100"
                >
                  -
                </button>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  min="1"
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-12 p-1 text-center focus:outline-none"
                />
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1 border-l border-gray-300 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>
            
            <div className="flex gap-4 mb-6">
              <button 
                onClick={handleAddToCart}
                disabled={isLoading}
                className={`flex-grow px-6 py-3 rounded-lg transition duration-300 font-semibold flex items-center justify-center ${
                  addedToCart 
                    ? 'bg-green-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : addedToCart ? (
                  <RiThumbUpLine className="mr-2" />
                ) : (
                  <FiShoppingBag className="mr-2" />
                )}
                {isLoading ? 'Adding...' : addedToCart ? 'Added to Cart!' : 'Add to Cart'}
              </button>
              
              <button className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition duration-300">
                <FiHeart className="h-6 w-6" />
              </button>
              
              <button className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition duration-300">
                <FiShare2 className="h-6 w-6" />
              </button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-2">Secure Payment Options</h4>
              <div className="flex space-x-3">
                <div className="bg-white p-1 rounded border border-gray-300">
                  <span className="text-xs">Visa</span>
                </div>
                <div className="bg-white p-1 rounded border border-gray-300">
                  <span className="text-xs">Mastercard</span>
                </div>
                <div className="bg-white p-1 rounded border border-gray-300">
                  <span className="text-xs">PayPal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Products Section */}
        <div>
          <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center">
            <FiStar className="mr-2" />
            Similar Eco-Friendly Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map(product => (
              <div key={product.id} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition duration-300 border border-green-100">
                <img 
                  src={product.image} 
                  alt={product.title} 
                  className="w-full h-40 object-cover rounded-md mb-2"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
                  }}
                />
                <h3 className="text-lg font-semibold text-gray-800">{product.title}</h3>
                <p className="text-green-700 font-bold">{formatPrice(product.price)}</p>
                <Link to={`/product/${product.id}`}>
                  <button className="mt-2 w-full py-2 bg-white border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition duration-300">
                    View Details
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;