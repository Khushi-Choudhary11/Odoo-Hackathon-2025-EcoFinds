import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiAlertCircle, FiBarChart2, FiDollarSign, FiEye } from 'react-icons/fi';
import { RiPlantLine } from 'react-icons/ri';
import Sidebar from '../components/Sidebar';

const MyListingsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteProductId, setDeleteProductId] = useState(null);

  useEffect(() => {
    const fetchUserProducts = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/login', { state: { redirectTo: '/my-listings' } });
          return;
        }
        
        const response = await fetch('http://localhost:5000/api/user/products', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch your products');
        }
        
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        console.error('Error fetching user products:', err);
        setError(err.message);
        
        // Use sample data for demonstration
        setProducts([
          { 
            id: 1, 
            title: 'Handmade Bamboo Utensil Set', 
            price: 15, 
            image: 'https://images.unsplash.com/photo-1583852446096-ea5ea63f308b?q=80&w=300',
            createdAt: '2023-10-15T12:30:00Z',
            status: 'active',
            views: 45,
            likes: 12
          },
          { 
            id: 2, 
            title: 'Recycled Glass Vase', 
            price: 28, 
            image: 'https://images.unsplash.com/photo-1589365278144-c9e705f843ba?q=80&w=300',
            createdAt: '2023-09-22T10:15:00Z',
            status: 'active',
            views: 32,
            likes: 8
          },
          { 
            id: 3, 
            title: 'Vintage Wooden Clock', 
            price: 40, 
            image: 'https://images.unsplash.com/photo-1488861859915-4b5a5e57649f?q=80&w=300',
            createdAt: '2023-11-05T15:45:00Z',
            status: 'active',
            views: 67,
            likes: 21
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProducts();
  }, [navigate]);

  const handleDelete = async (id) => {
    setDeleteProductId(id);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      
      // Update the UI by filtering out the deleted product
      setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
      
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.message);
    } finally {
      setDeleteProductId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatPrice = (price) => {
    return `$${price}`;
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 p-8 w-full">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">My Products</h2>
          
          <Link 
            to="/add-product" 
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
          >
            <FiPlus className="h-5 w-5" />
            <span>Add New Product</span>
          </Link>
        </div>
        
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 flex items-center">
            <FiAlertCircle className="text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-600"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <FiPlus className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Products Listed Yet</h3>
            <p className="text-gray-600 mb-6">Start selling your eco-friendly products today!</p>
            <Link 
              to="/add-product"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
            >
              <FiPlus className="mr-2" />
              Add Your First Product
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Quick stats */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-green-800 mb-2 flex items-center">
                  <FiBarChart2 className="mr-2" />
                  Listing Stats
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white p-3 rounded text-center">
                    <p className="font-semibold text-2xl text-gray-800">{products.length}</p>
                    <p className="text-xs text-gray-600">Products</p>
                  </div>
                  <div className="bg-white p-3 rounded text-center">
                    <p className="font-semibold text-2xl text-gray-800">
                      {products.reduce((sum, product) => sum + (product.views || 0), 0)}
                    </p>
                    <p className="text-xs text-gray-600">Total Views</p>
                  </div>
                  <div className="bg-white p-3 rounded text-center">
                    <p className="font-semibold text-2xl text-green-600">
                      {products.reduce((sum, product) => sum + product.price, 0)}
                    </p>
                    <p className="text-xs text-gray-600">Value ($)</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Quick Actions</h3>
                <div className="flex flex-wrap gap-2">
                  <Link 
                    to="/add-product" 
                    className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-all flex items-center"
                  >
                    <FiPlus className="mr-1" />
                    New Product
                  </Link>
                  <button 
                    className="px-3 py-2 bg-blue-50 text-blue-700 text-sm rounded hover:bg-blue-100 transition-all border border-blue-200"
                  >
                    <FiEye className="inline mr-1" />
                    View Analytics
                  </button>
                  <button 
                    className="px-3 py-2 bg-amber-50 text-amber-700 text-sm rounded hover:bg-amber-100 transition-all border border-amber-200"
                  >
                    <FiDollarSign className="inline mr-1" />
                    Sales Report
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Your Products</h3>
              </div>
              
              <ul className="divide-y divide-gray-200">
                {products.map(product => (
                  <li key={product.id} className="p-4 hover:bg-gray-50 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <img 
                        src={product.image} 
                        alt={product.title} 
                        className="w-full sm:w-24 h-24 object-cover rounded-lg mb-4 sm:mb-0 sm:mr-4" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                        }}
                      />
                      <div className="flex-grow">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-800">{product.title}</h4>
                            <p className="text-green-600 font-medium">{formatPrice(product.price)}</p>
                            <div className="flex items-center mt-1">
                              <div className="flex items-center text-xs text-gray-500 mr-3">
                                <FiEye className="mr-1" />
                                <span>{product.views || 0} views</span>
                              </div>
                              <div className="text-xs text-gray-500 flex items-center">
                                <RiPlantLine className="mr-1 text-green-500" />
                                <span>{formatDate(product.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Link 
                              to={`/edit-product/${product.id}`} 
                              className="p-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-all"
                              title="Edit Product"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </Link>
                            <button 
                              onClick={() => handleDelete(product.id)} 
                              className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-all"
                              title="Delete Product"
                              disabled={deleteProductId === product.id}
                            >
                              {deleteProductId === product.id ? (
                                <div className="w-4 h-4 border-t-2 border-b-2 border-red-600 rounded-full animate-spin"></div>
                              ) : (
                                <FiTrash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListingsPage;