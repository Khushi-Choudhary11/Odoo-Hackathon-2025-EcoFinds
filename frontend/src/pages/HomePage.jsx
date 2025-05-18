import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Link } from 'react-router-dom';
import { FiSearch, FiFilter, FiShoppingBag, FiTrendingUp, FiStar } from 'react-icons/fi';
import { RiPlantLine, RiRecycleLine, RiLeafLine } from 'react-icons/ri';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'clothing', name: 'Clothing' },
    { id: 'furniture', name: 'Furniture' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'home-decor', name: 'Home Decor' },
    { id: 'books', name: 'Books' },
    { id: 'accessories', name: 'Accessories' },
  ];

  // Fallback products if API fails
  const fallbackProducts = [
    { id: 1, title: 'Eco Mug', price: 5, image: 'https://images.unsplash.com/photo-1577937333847-204d28276332?q=80&w=300', description: 'Handcrafted ceramic mug made from recycled materials', category: 'home-decor' },
    { id: 2, title: 'Reusable Bottle', price: 12, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=300', description: 'Stainless steel water bottle, plastic-free and long-lasting', category: 'accessories' },
    { id: 3, title: 'Second-hand Book Collection', price: 7, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=300', description: 'Collection of pre-loved books in excellent condition', category: 'books' },
    { id: 4, title: 'Bamboo Utensils', price: 9, image: 'https://images.unsplash.com/photo-1583852446096-ea5ea63f308b?q=80&w=300', description: 'Eco-friendly bamboo utensil set, perfect for travel', category: 'home-decor' },
    { id: 5, title: 'Recycled Paper Journal', price: 6, image: 'https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=300', description: '100% post-consumer recycled paper journal with cotton cover', category: 'accessories' },
    { id: 6, title: 'Solar Powered Charger', price: 25, image: 'https://images.unsplash.com/photo-1617802690992-15d93263d3a9?q=80&w=300', description: 'Portable solar charger for all your devices', category: 'electronics' },
    { id: 7, title: 'Upcycled Denim Jacket', price: 35, image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=300', description: 'Unique jacket made from upcycled denim materials', category: 'clothing' },
    { id: 8, title: 'Reclaimed Wood Side Table', price: 45, image: 'https://images.unsplash.com/photo-1533090368676-1fd25485db88?q=80&w=300', description: 'Handcrafted side table made from reclaimed wood', category: 'furniture' },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        let url = 'http://localhost:5000/api/products';
        
        // Add query params for filtering
        if (searchTerm || category) {
          url += '?';
          if (searchTerm) {
            url += `search=${encodeURIComponent(searchTerm)}`;
          }
          if (category && category !== 'all') {
            url += `${searchTerm ? '&' : ''}category=${encodeURIComponent(category)}`;
          }
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        // Ensure data is an array before setting state
        setProducts(Array.isArray(data) ? data : []);
        console.log('Products data:', data); // For debugging
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Using sample data instead.');
        // Use fallback products if API fails
        setProducts(fallbackProducts);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [searchTerm, category]);

  const handleSearch = (e) => {
    e.preventDefault();
    // The useEffect will trigger the API call
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const formatPrice = (price) => {
    return `$${price}`;
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 p-8 w-full">
        <div className="mb-8 bg-gradient-to-r from-green-700 to-green-500 rounded-xl p-8 text-white">
          <h1 className="text-4xl font-bold mb-4">Welcome to EcoFinds</h1>
          <p className="text-xl mb-6">Discover sustainable and pre-loved products that make a difference</p>
          
          <form onSubmit={handleSearch} className="relative max-w-2xl">
            <input
              type="text"
              placeholder="Search for eco-friendly products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-3 pl-12 pr-4 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-300"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-500" />
            </div>
            <button type="submit" className="absolute inset-y-0 right-0 px-4 bg-green-800 rounded-r-lg hover:bg-green-900 transition duration-300">
              Search
            </button>
          </form>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-2xl font-bold text-green-700">Browse Products</h2>
          
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <div className="flex items-center space-x-2">
              <FiFilter className="text-gray-500" />
              <select
                value={category}
                onChange={handleCategoryChange}
                className="bg-white border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
          </div>
        ) : (
          <>
            {products.length === 0 ? (
              <div className="text-center py-12">
                <RiLeafLine className="mx-auto h-16 w-16 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No products found</h3>
                <p className="mt-2 text-sm text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map(product => (
                  <div key={product.id} className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition duration-300 border border-green-100 flex flex-col">
                    <div className="relative">
                      <img 
                        src={product.image} 
                        alt={product.title} 
                        className="w-full h-48 object-cover rounded-md mb-4"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
                        }}
                      />
                      <span className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center">
                        <RiRecycleLine className="mr-1" /> Eco-Friendly
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.title}</h3>
                    <p className="text-sm text-gray-600 mb-2 flex-grow">{product.description ? product.description.substring(0, 100) + (product.description.length > 100 ? '...' : '') : 'No description available'}</p>
                    
                    <div className="mt-auto">
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-green-700 font-bold">{formatPrice(product.price)}</p>
                        <span className="text-xs text-gray-500 flex items-center">
                          <FiStar className="text-yellow-500 mr-1" /> 4.5 (12)
                        </span>
                      </div>
                      <Link to={`/product/${product.id}`} className="block">
                        <button className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 flex items-center justify-center">
                          <FiShoppingBag className="mr-2" />
                          View Details
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        
        {/* Featured Categories Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-green-700 mb-6 flex items-center">
            <FiTrendingUp className="mr-2" /> Featured Categories
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(1).map(cat => (
              <div 
                key={cat.id}
                className="bg-white rounded-xl p-4 border border-green-100 hover:border-green-300 hover:shadow-md transition duration-300 flex flex-col items-center cursor-pointer"
                onClick={() => setCategory(cat.id)}
              >
                {cat.id === 'clothing' && <RiRecycleLine className="h-8 w-8 text-green-600 mb-2" />}
                {cat.id === 'furniture' && <RiPlantLine className="h-8 w-8 text-green-600 mb-2" />}
                {cat.id === 'electronics' && <FiStar className="h-8 w-8 text-green-600 mb-2" />}
                {cat.id === 'home-decor' && <RiLeafLine className="h-8 w-8 text-green-600 mb-2" />}
                {cat.id === 'books' && <FiStar className="h-8 w-8 text-green-600 mb-2" />}
                {cat.id === 'accessories' && <RiPlantLine className="h-8 w-8 text-green-600 mb-2" />}
                <h3 className="font-medium text-gray-800 text-center">{cat.name}</h3>
              </div>
            ))}
          </div>
        </div>
        
        {/* Impact Section */}
        <div className="mt-16 bg-green-50 rounded-xl p-6 border border-green-200">
          <h2 className="text-2xl font-bold text-green-800 mb-6">Your Impact with EcoFinds</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-lg text-center">
              <RiRecycleLine className="h-12 w-12 mx-auto text-green-600 mb-2" />
              <h3 className="font-bold text-gray-800 mb-1">Reduce Waste</h3>
              <p className="text-gray-600 text-sm">Every pre-loved item purchased helps keep items out of landfills</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg text-center">
              <RiLeafLine className="h-12 w-12 mx-auto text-green-600 mb-2" />
              <h3 className="font-bold text-gray-800 mb-1">Support Sustainability</h3>
              <p className="text-gray-600 text-sm">Eco-friendly products that are better for our planet</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg text-center">
              <RiPlantLine className="h-12 w-12 mx-auto text-green-600 mb-2" />
              <h3 className="font-bold text-gray-800 mb-1">Build Community</h3>
              <p className="text-gray-600 text-sm">Connect with like-minded individuals who care about the environment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = 'http://localhost:5000/api/products';
      const queryParams = [];
      
      if (filters.category) queryParams.push(`category=${filters.category}`);
      if (filters.condition) queryParams.push(`condition=${filters.condition}`);
      if (searchQuery) queryParams.push(`search=${encodeURIComponent(searchQuery)}`);
      
      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      
      // Ensure data is an array before setting state
      setProducts(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to load products');
      setProducts([]);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Product card component
  const ProductCard = ({ product }) => (
    <Link to={`/product/${product.id}`} className="group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 xl:aspect-w-7 xl:aspect-h-8">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.title}
              className="h-48 w-full object-cover object-center group-hover:opacity-75"
            />
          ) : (
            <div className="h-48 w-full flex items-center justify-center bg-gray-200">
              <RiRecycleFill className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-sm text-gray-700 font-medium">{product.title}</h3>
          <div className="mt-1 flex items-center justify-between">
            <p className="text-lg font-bold text-green-600">${product.price.toFixed(2)}</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {product.condition}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-500 line-clamp-2">{product.description}</p>
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <FiTag className="mr-1" />
            <span>{product.category}</span>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <div className="bg-green-700 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <h1 className="text-3xl font-bold text-center mb-6">Find Sustainable Products</h1>
          <p className="text-lg text-center mb-8 max-w-3xl">
            Discover eco-friendly items from our community of conscious sellers. Every purchase helps reduce waste and protect our planet.
          </p>
          
          {/* Search form */}
          <form onSubmit={handleSearch} className="w-full max-w-2xl">
            <div className="flex items-center">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 border border-transparent rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  placeholder="Search for sustainable items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="flex items-center justify-center px-6 py-3 border border-transparent rounded-r-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="mb-6">
          <button
            onClick={toggleFilters}
            className="flex items-center text-gray-700 hover:text-green-600"
          >
            <FiFilter className="mr-2" />
            Filters
            {showFilters ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />}
          </button>
          
          {showFilters && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                >
                  <option value="">All Categories</option>
                  <option value="clothing">Clothing</option>
                  <option value="furniture">Furniture</option>
                  <option value="electronics">Electronics</option>
                  <option value="home">Home & Garden</option>
                  <option value="accessories">Accessories</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
                  Condition
                </label>
                <select
                  id="condition"
                  name="condition"
                  value={filters.condition}
                  onChange={handleFilterChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                >
                  <option value="">All Conditions</option>
                  <option value="new">New</option>
                  <option value="like-new">Like New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
            </div>
          )}
        </div>
        
        {/* Loading, error states or products grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading products...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-red-100 border-l-4 border-red-500 p-4 mx-auto max-w-md">
              <p className="text-red-700">{error}</p>
              <button 
                onClick={fetchProducts} 
                className="mt-3 text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <FiShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-gray-500">
              Try changing your search or filter settings.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;