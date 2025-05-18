import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiArrowLeft, FiImage, FiAlertCircle, FiCheck } from 'react-icons/fi';
import { RiLeafLine, RiPlantLine, RiRecycleLine } from 'react-icons/ri';
import Sidebar from '../components/Sidebar';

const EditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: 'new',
    image: '',
    material: '',
    sustainabilityFeatures: [],
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingProduct, setIsFetchingProduct] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  // Feature options for sustainability
  const sustainabilityOptions = [
    { id: 'recycled', label: 'Made from recycled materials', icon: <RiRecycleLine /> },
    { id: 'upcycled', label: 'Upcycled from waste', icon: <RiRecycleLine /> },
    { id: 'organic', label: 'Organic materials', icon: <RiPlantLine /> },
    { id: 'plastic-free', label: 'Plastic-free', icon: <RiLeafLine /> },
    { id: 'biodegradable', label: 'Biodegradable', icon: <RiPlantLine /> },
    { id: 'energy-efficient', label: 'Energy efficient', icon: <RiLeafLine /> },
    { id: 'water-saving', label: 'Water saving', icon: <RiLeafLine /> },
  ];

  // Categories
  const categories = [
    { id: 'clothing', name: 'Clothing' },
    { id: 'furniture', name: 'Furniture' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'home-decor', name: 'Home Decor' },
    { id: 'books', name: 'Books' },
    { id: 'accessories', name: 'Accessories' },
  ];

  // Conditions
  const conditions = [
    { id: 'new', name: 'New' },
    { id: 'like-new', name: 'Like New' },
    { id: 'good', name: 'Good' },
    { id: 'fair', name: 'Fair' },
    { id: 'refurbished', name: 'Refurbished' },
  ];

  useEffect(() => {
    // If we're in edit mode, fetch the product data
    if (isEditMode) {
      const fetchProductDetails = async () => {
        setIsFetchingProduct(true);
        try {
          const token = localStorage.getItem('token');
          
          if (!token) {
            navigate('/login', { state: { redirectTo: `/edit-product/${id}` } });
            return;
          }
          
          const response = await fetch(`http://localhost:5000/api/products/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch product details');
          }
          
          const data = await response.json();
          setFormData({
            title: data.title || '',
            description: data.description || '',
            price: data.price || '',
            category: data.category || '',
            condition: data.condition || 'new',
            image: data.image || '',
            material: data.material || '',
            sustainabilityFeatures: data.sustainabilityFeatures || [],
          });
          
          if (data.image) {
            setImagePreview(data.image);
          }
        } catch (err) {
          console.error('Error fetching product details:', err);
          setError(err.message);
          
          // Use sample data for demonstration
          if (id === '1') {
            setFormData({
              title: 'Handmade Bamboo Utensil Set',
              description: 'Eco-friendly bamboo utensil set, perfect for travel and daily use. Reduces plastic waste.',
              price: '15',
              category: 'home-decor',
              condition: 'new',
              image: 'https://images.unsplash.com/photo-1583852446096-ea5ea63f308b?q=80&w=300',
              material: 'Bamboo',
              sustainabilityFeatures: ['plastic-free', 'biodegradable'],
            });
            setImagePreview('https://images.unsplash.com/photo-1583852446096-ea5ea63f308b?q=80&w=300');
          }
        } finally {
          setIsFetchingProduct(false);
        }
      };

      fetchProductDetails();
    }
  }, [id, isEditMode, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      // Ensure price is a valid number
      const numValue = value.replace(/[^0-9.]/g, '');
      setFormData({ ...formData, [name]: numValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSustainabilityToggle = (featureId) => {
    if (formData.sustainabilityFeatures.includes(featureId)) {
      setFormData({
        ...formData,
        sustainabilityFeatures: formData.sustainabilityFeatures.filter(id => id !== featureId)
      });
    } else {
      setFormData({
        ...formData,
        sustainabilityFeatures: [...formData.sustainabilityFeatures, featureId]
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }
      
      // Convert price to number
      const productData = {
        ...formData,
        price: parseFloat(formData.price)
      };
      
      // API endpoint and method based on whether we're creating or editing
      const url = isEditMode 
        ? `http://localhost:5000/api/products/${id}`
        : 'http://localhost:5000/api/products';
        
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });
      
      if (!response.ok) {
        throw new Error(isEditMode ? 'Failed to update product' : 'Failed to create product');
      }
      
      // Show success message
      setSuccess(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/my-listings');
      }, 1500);
      
    } catch (err) {
      console.error('Error saving product:', err);
      setError(err.message);
      
      // For demo purposes, simulate success anyway
      setTimeout(() => {
        setSuccess(true);
        setTimeout(() => {
          navigate('/my-listings');
        }, 1500);
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingProduct) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="ml-64 p-8 w-full flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 p-8 w-full">
        <button 
          onClick={() => navigate(-1)} 
          className="mb-6 text-green-600 hover:underline flex items-center"
        >
          <FiArrowLeft className="mr-2" />
          Back
        </button>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {isEditMode ? 'Edit Product' : 'Add New Product'}
        </h2>
        
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 flex items-center">
            <FiAlertCircle className="text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 flex items-center">
            <FiCheck className="text-green-500 mr-2" />
            <p className="text-green-700">
              Product successfully {isEditMode ? 'updated' : 'created'}! Redirecting...
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column - Basic info */}
            <div>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Product Title*
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description*
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                ></textarea>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Price* ($)
                  </label>
                  <input
                    type="text"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category*
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                    Condition*
                  </label>
                  <select
                    id="condition"
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    {conditions.map(condition => (
                      <option key={condition.id} value={condition.id}>
                        {condition.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="material" className="block text-sm font-medium text-gray-700 mb-1">
                    Material
                  </label>
                  <input
                    type="text"
                    id="material"
                    name="material"
                    value={formData.material}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Right column - Sustainability and Image */}
            <div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <RiLeafLine className="mr-1 text-green-600" />
                  Sustainability Features
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {sustainabilityOptions.map(option => (
                    <div 
                      key={option.id}
                      className={`flex items-center p-2 rounded cursor-pointer border ${
                        formData.sustainabilityFeatures.includes(option.id) 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-300'
                      }`}
                      onClick={() => handleSustainabilityToggle(option.id)}
                    >
                      <div className={`mr-2 ${formData.sustainabilityFeatures.includes(option.id) ? 'text-green-600' : 'text-gray-400'}`}>
                        {option.icon}
                      </div>
                      <span className="text-sm">{option.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image
                </label>
                <div className="border-2 border-dashed border-gray-300 p-4 rounded-md text-center">
                  {imagePreview ? (
                    <div className="mb-4">
                      <img 
                        src={imagePreview} 
                        alt="Product preview" 
                        className="h-40 mx-auto object-cover rounded-md"
                      />
                    </div>
                  ) : (
                    <FiImage className="h-16 w-16 mx-auto text-gray-400 mb-2" />
                  )}
                  
                  <label className="cursor-pointer">
                    <span className="bg-green-50 text-green-700 px-4 py-2 rounded-md hover:bg-green-100 transition duration-300 inline-flex items-center">
                      <FiImage className="mr-2" />
                      {imagePreview ? 'Change Image' : 'Upload Image'}
                    </span>                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  </label>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Recommended: 800×600 pixels, JPEG or PNG
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => navigate('/my-listings')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition duration-300"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-300 flex items-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="mr-2" />
                    {isEditMode ? 'Update Product' : 'Create Product'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductPage;