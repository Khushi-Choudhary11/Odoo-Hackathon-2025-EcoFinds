import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiShoppingBag, FiAlertCircle, FiPlus, FiMinus } from 'react-icons/fi';
import { RiLeafLine, RiRecycleLine } from 'react-icons/ri';
import Sidebar from '../components/Sidebar';

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Add a safety check function
  const safeCartItems = () => {
    return Array.isArray(cartItems) ? cartItems : [];
  };

  // Eco impact calculations
  const calculateEcoImpact = () => {
    // Check if cartItems is an array and not empty
    if (!Array.isArray(cartItems)) {
      return {
        waterSaved: 0,
        wasteSaved: 0,
        carbonReduced: 0
      };
    }

    return {
      waterSaved: Math.round(cartItems.length * 500), // liters
      wasteSaved: Math.round(cartItems.reduce((total, item) => 
        total + (item?.quantity || 0) * 0.5, 0
      )), // kg
      carbonReduced: Math.round(cartItems.reduce((total, item) => 
        total + (item?.quantity || 0) * 2.3, 0
      )) // kg CO2e
    };
  };

  useEffect(() => {
    const fetchCartItems = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          // Save fallback items for demo
          const fallbackItems = [
            { 
              id: 1, 
              title: 'Upcycled Denim Jacket', 
              price: 15, 
              quantity: 1,
              image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=300',
              eco: 'Saves 2000L of water compared to new denim' 
            },
            { 
              id: 2, 
              title: 'Vintage Lamp', 
              price: 20, 
              quantity: 1,
              image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=300',
              eco: 'Reduces electronic waste by reusing' 
            },
            { 
              id: 3, 
              title: 'Bamboo Toothbrushes (Set of 4)', 
              price: 8, 
              quantity: 1,
              image: 'https://images.unsplash.com/photo-1632811744797-3cf99c9c1775?q=80&w=300',
              eco: 'Biodegradable alternative to plastic' 
            }
          ];
          setCartItems(fallbackItems);
          return;
        }
        
        const response = await fetch('http://localhost:5000/api/cart', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch cart items');
        }
        
        const data = await response.json();
        setCartItems(data);
      } catch (err) {
        console.error('Error fetching cart:', err);
        setError(err.message);
        // Use fallback data in case API fails
        const fallbackItems = [
          { 
            id: 1, 
            title: 'Upcycled Denim Jacket', 
            price: 15, 
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=300',
            eco: 'Saves 2000L of water compared to new denim' 
          },
          { 
            id: 2, 
            title: 'Vintage Lamp', 
            price: 20, 
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=300',
            eco: 'Reduces electronic waste by reusing' 
          },
          { 
            id: 3, 
            title: 'Bamboo Toothbrushes (Set of 4)', 
            price: 8, 
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1632811744797-3cf99c9c1775?q=80&w=300',
            eco: 'Biodegradable alternative to plastic' 
          }
        ];
        setCartItems(fallbackItems);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const handleRemoveItem = async (itemId) => {
    setIsRemoving(itemId);
    
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        const response = await fetch(`http://localhost:5000/api/cart/${itemId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to remove item from cart');
        }
      }
      
      // Update local state regardless of API call (for demo purposes)
      setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    } catch (err) {
      console.error('Error removing item from cart:', err);
      setError('Failed to remove item. Please try again.');
      // Still update local state for demo purposes
      setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    } finally {
      setIsRemoving(false);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(itemId);
    
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        const response = await fetch(`http://localhost:5000/api/cart/${itemId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ quantity: newQuantity })
        });
        
        if (!response.ok) {
          throw new Error('Failed to update quantity');
        }
      }
      
      // Update local state regardless of API call (for demo purposes)
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError('Failed to update quantity. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const formatPrice = (price) => {
    return `$${price.toFixed(2)}`;
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const ecoImpact = calculateEcoImpact();

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 p-8 w-full">
        <h2 className="text-2xl font-bold text-green-700 mb-4">Your Eco-Friendly Cart</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <FiAlertCircle className="text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        <div className="bg-green-50 p-4 rounded-lg mb-6 border border-green-200">
          <div className="flex items-center">
            <RiLeafLine className="text-green-600 text-xl mr-2" />
            <p className="text-green-800">
              <span className="font-bold">Your Impact:</span> By purchasing pre-loved and eco-friendly products, 
              you're helping reduce waste and supporting sustainable practices.
            </p>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-600"></div>
          </div>
        ) : safeCartItems().length === 0 ? (
          <div className="text-center py-16">
            <FiShoppingBag className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Your cart is empty</h3>
            <p className="mt-1 text-sm text-gray-500">Start shopping for eco-friendly products!</p>
            <div className="mt-6">
              <Link 
                to="/" 
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <div className="space-y-4 mb-8">
              {safeCartItems().map(item => (
                <div key={item.id} className="p-4 border border-green-100 rounded-lg bg-white shadow-sm hover:shadow-md transition duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full sm:w-24 h-24 object-cover rounded-lg mb-4 sm:mb-0 sm:mr-4"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                      }}
                    />
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                      <p className="text-green-700 font-bold">{formatPrice(item.price)}</p>
                      {item.eco && <p className="text-xs text-green-600 mt-1">{item.eco}</p>}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-center mt-4 sm:mt-0">
                      <div className="flex border border-gray-300 rounded-md mb-3 sm:mb-0 sm:mr-4">
                        <button 
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} 
                          disabled={item.quantity <= 1 || isUpdating === item.id}
                          className="px-2 py-1 border-r border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                          aria-label="Decrease quantity"
                        >
                          <FiMinus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-1 flex items-center justify-center min-w-[40px]">
                          {isUpdating === item.id ? (
                            <div className="w-4 h-4 border-t-2 border-b-2 border-green-600 rounded-full animate-spin"></div>
                          ) : (
                            item.quantity
                          )}
                        </span>
                        <button 
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={isUpdating === item.id}
                          className="px-2 py-1 border-l border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                          aria-label="Increase quantity"
                        >
                          <FiPlus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => handleRemoveItem(item.id)} 
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300 flex items-center"
                        disabled={isRemoving === item.id}
                      >
                        {isRemoving === item.id ? (
                          <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-1"></div>
                        ) : (
                          <FiTrash2 className="mr-1" />
                        )}
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Environmental Impact Card */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-bold text-green-800 mb-3 flex items-center">
                  <RiRecycleLine className="mr-2" />
                  Your Environmental Impact
                </h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white p-3 rounded-md">
                    <p className="text-lg font-bold text-green-700">{ecoImpact.waterSaved}L</p>
                    <p className="text-xs text-gray-600">Water Saved</p>
                  </div>
                  <div className="bg-white p-3 rounded-md">
                    <p className="text-lg font-bold text-green-700">{ecoImpact.wasteSaved}kg</p>
                    <p className="text-xs text-gray-600">Waste Reduced</p>
                  </div>
                  <div className="bg-white p-3 rounded-md">
                    <p className="text-lg font-bold text-green-700">{ecoImpact.carbonReduced}kg</p>
                    <p className="text-xs text-gray-600">CO2 Reduced</p>
                  </div>
                </div>
              </div>
              
              {/* Order Summary Card */}
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4">Order Summary</h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatPrice(calculateSubtotal())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>{formatPrice(5.99)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span>{formatPrice(calculateSubtotal() * 0.08)}</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-lg font-bold text-green-700">
                      {formatPrice(calculateSubtotal() + 5.99 + (calculateSubtotal() * 0.08))}
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={handleCheckout}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 font-bold flex items-center justify-center"
                >
                  <FiShoppingBag className="mr-2" />
                  Proceed to Checkout
                </button>
              </div>
            </div>
            
            <div className="text-center">
              <Link to="/" className="text-green-600 hover:underline">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;