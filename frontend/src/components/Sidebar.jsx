import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FiHome, FiShoppingBag, FiPlusCircle, FiList, 
  FiUser, FiPackage, FiLogIn, FiLogOut, FiHeart, 
  FiShoppingCart, FiMenu, FiX
} from 'react-icons/fi';
import { RiPlantLine, RiRecycleFill } from 'react-icons/ri';

const Sidebar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is logged in by looking for token
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token) {
      setIsLoggedIn(true);
      if (user) {
        try {
          const userData = JSON.parse(user);
          setUserName(userData.name || 'User');
        } catch (err) {
          console.error('Error parsing user data:', err);
          setUserName('User');
        }
      }
    } else {
      setIsLoggedIn(false);
    }
  }, [location]); // Re-check when location changes

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'bg-green-600' : '';
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-green-700 text-white rounded-md"
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        {showMobileMenu ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`w-64 h-screen bg-green-800 text-white fixed top-0 left-0 z-40 transition-transform duration-300 ease-in-out transform ${showMobileMenu ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} overflow-y-auto`}>
        <div className="p-6">
          {/* Logo and branding */}
          <Link to="/" className="flex items-center gap-2 mb-10">
            <RiRecycleFill className="h-8 w-8 text-green-300" />
            <h2 className="text-2xl font-bold text-white">EcoFinds</h2>
          </Link>

          {/* User information */}
          {isLoggedIn && (
            <div className="mb-8 pb-6 border-b border-green-700">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
                  <span className="text-lg font-semibold">{userName.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-green-100 font-medium">{userName}</p>
                  <Link to="/dashboard" className="text-xs text-green-300 hover:text-white">
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Navigation links */}
          <nav>
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/" 
                  className={`flex items-center gap-3 p-3 rounded-lg hover:bg-green-700 transition-all ${isActive('/')}`}
                >
                  <FiHome className="h-5 w-5" />
                  <span>Home</span>
                </Link>
              </li>

              <li>
                <Link 
                  to="/cart" 
                  className={`flex items-center gap-3 p-3 rounded-lg hover:bg-green-700 transition-all ${isActive('/cart')}`}
                >
                  <FiShoppingCart className="h-5 w-5" />
                  <span>Cart</span>
                </Link>
              </li>
              
              <li>
                <Link 
                  to="/my-listings" 
                  className={`flex items-center gap-3 p-3 rounded-lg hover:bg-green-700 transition-all ${isActive('/my-listings')}`}
                >
                  <FiList className="h-5 w-5" />
                  <span>My Listings</span>
                </Link>
              </li>
              
              <li>
                <Link 
                  to="/purchases" 
                  className={`flex items-center gap-3 p-3 rounded-lg hover:bg-green-700 transition-all ${isActive('/purchases')}`}
                >
                  <FiPackage className="h-5 w-5" />
                  <span>Purchase History</span>
                </Link>
              </li>

              {isLoggedIn && (
                <>
                  <li>
                    <Link 
                      to="/add-product" 
                      className={`flex items-center gap-3 p-3 rounded-lg hover:bg-green-700 transition-all ${isActive('/add-product')}`}
                    >
                      <FiPlusCircle className="h-5 w-5" />
                      <span>Add Product</span>
                    </Link>
                  </li>

                  <li>
                    <Link 
                      to="/dashboard" 
                      className={`flex items-center gap-3 p-3 rounded-lg hover:bg-green-700 transition-all ${isActive('/dashboard')}`}
                    >
                      <FiUser className="h-5 w-5" />
                      <span>User Dashboard</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>

            <div className="mt-8 pt-6 border-t border-green-700">
              {isLoggedIn ? (
                <button 
                  onClick={handleLogout} 
                  className="flex items-center w-full gap-3 p-3 text-red-300 hover:bg-red-900/30 rounded-lg transition-all"
                >
                  <FiLogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="flex items-center gap-3 p-3 text-green-200 hover:bg-green-700 rounded-lg transition-all"
                  >
                    <FiLogIn className="h-5 w-5" />
                    <span>Login</span>
                  </Link>
                  <Link 
                    to="/signup" 
                    className="flex items-center gap-3 p-3 text-green-200 hover:bg-green-700 rounded-lg transition-all mt-2"
                  >
                    <FiUser className="h-5 w-5" />
                    <span>Sign Up</span>
                  </Link>
                </>
              )}
            </div>
          </nav>

          {/* Eco-friendly badge */}
          <div className="mt-10 pt-6 border-t border-green-700">
            <div className="bg-green-700/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <RiPlantLine className="h-5 w-5 text-green-300" />
                <p className="text-sm font-medium text-green-300">Eco Impact</p>
              </div>
              <p className="text-xs text-green-100">
                By buying second-hand, you've helped reduce waste and saved valuable resources.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Overlay for mobile */}
      {showMobileMenu && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleMobileMenu}
        ></div>
      )}
    </>
  );
};

export default Sidebar;