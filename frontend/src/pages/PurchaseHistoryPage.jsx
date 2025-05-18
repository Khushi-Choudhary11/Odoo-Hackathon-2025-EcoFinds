import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPackage, FiAlertCircle } from 'react-icons/fi';
import { RiRecycleFill, RiWaterFlashLine, RiPlantLine } from 'react-icons/ri';
import Sidebar from '../components/Sidebar';

const PurchaseHistoryPage = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPurchases = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          navigate('/login', { state: { redirectTo: '/purchases' } });
          return;
        }

        // Validate token format before sending
        if (typeof token !== 'string' || token.trim() === '') {
          throw new Error('Invalid authentication token');
        }

        const response = await fetch('http://localhost:5000/api/user/purchases', {
          headers: {
            'Authorization': `Bearer ${token.trim()}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        // Enhanced error handling
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          const errorMessage = errorData?.msg || 'Failed to fetch purchase history';
          throw new Error(errorMessage);
        }

        const data = await response.json();
        setPurchases(data);
      } catch (err) {
        console.error('Error fetching purchases:', err);
        setError(err.message);
        // Use sample data for demo
        setPurchases([
          {
            id: 1,
            title: 'Reclaimed Wood Chair',
            price: 30,
            image: 'https://images.unsplash.com/photo-1519947486511-46149fa0a254?q=80&w=300',
            date: '2023-05-15',
            impact: 'Saved 5kg of wood from landfill'
          },
          {
            id: 2,
            title: 'Upcycled Bookshelf',
            price: 25,
            image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?q=80&w=300',
            date: '2023-04-22',
            impact: 'Reduced furniture waste'
          },
          {
            id: 3,
            title: 'Organic Cotton T-shirt (Set of 2)',
            price: 18,
            image: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?q=80&w=300',
            date: '2023-03-10',
            impact: 'Grown without harmful pesticides'
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPurchases();
  }, [navigate]);

  // Calculate environmental impact
  const calculateImpact = () => {
    return {
      itemsReused: purchases.length,
      wasteAvoided: `${purchases.length * 4}kg`,
      waterSaved: `${purchases.length * 1200}L`
    };
  };

  const impact = calculateImpact();

  const formatPrice = (price) => {
    return `$${price}`;
  };

  const handleBuyAgain = async (productId) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          quantity: 1
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }

      navigate('/cart');
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError(err.message);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 p-8 w-full">
        <h2 className="text-2xl font-bold text-green-700 mb-6">Your Sustainable Purchases</h2>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <FiAlertCircle className="text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-green-50 p-6 rounded-xl mb-8 border border-green-200">
          <h3 className="text-xl font-bold text-green-800 mb-3 flex items-center">
            <RiRecycleFill className="mr-2" /> Your Environmental Impact
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg text-center">
              <RiRecycleFill className="w-8 h-8 mx-auto text-green-600 mb-1" />
              <span className="text-2xl font-bold text-green-700">{impact.itemsReused}</span>
              <p className="text-sm text-gray-600">Items Reused</p>
            </div>
            <div className="bg-white p-4 rounded-lg text-center">
              <RiPlantLine className="w-8 h-8 mx-auto text-green-600 mb-1" />
              <span className="text-2xl font-bold text-green-700">{impact.wasteAvoided}</span>
              <p className="text-sm text-gray-600">Waste Avoided</p>
            </div>
            <div className="bg-white p-4 rounded-lg text-center">
              <RiWaterFlashLine className="w-8 h-8 mx-auto text-green-600 mb-1" />
              <span className="text-2xl font-bold text-green-700">{impact.waterSaved}</span>
              <p className="text-sm text-gray-600">Water Saved</p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-600"></div>
          </div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <FiPackage className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No purchases yet</h3>
            <p className="mt-2 text-sm text-gray-500">Your purchase history will appear here.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {purchases.map(purchase => (
              <li key={purchase.id} className="p-4 bg-white border border-green-100 rounded-lg shadow-sm hover:shadow-md transition duration-300">
                <div className="flex flex-col sm:flex-row items-start sm:items-center">
                  <img
                    src={purchase.image}
                    alt={purchase.title}
                    className="w-full sm:w-24 h-24 object-cover rounded-lg mb-4 sm:mb-0 sm:mr-4"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                    }}
                  />
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg">{purchase.title}</h3>
                    <p className="text-green-600 font-bold">{formatPrice(purchase.price)}</p>
                    <p className="text-gray-500 text-sm">Purchased on {new Date(purchase.date).toLocaleDateString()}</p>
                    <div className="flex items-center mt-1">
                      <RiRecycleFill className="text-green-600 mr-1 h-4 w-4" />
                      <p className="text-xs text-green-600">{purchase.impact || 'Eco-friendly purchase'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBuyAgain(purchase.id)}
                    className="px-4 py-2 mt-4 sm:mt-0 bg-green-50 text-green-700 rounded-lg border border-green-200 hover:bg-green-100 transition duration-300 flex items-center"
                  >
                    <FiPackage className="mr-1" />
                    Buy Again
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PurchaseHistoryPage;