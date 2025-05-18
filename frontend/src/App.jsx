import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/globals.css';

// Pages
import HomePageFixed from './pages/HomePageFixed';
import ProductDetailPageFixed from './pages/ProductDetailPageFixed';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import PurchaseHistoryPage from './pages/PurchaseHistoryPage';
import MyListingsPage from './pages/MyListingsPage';
import EditProductPage from './pages/EditProductPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import UserDashboardPage from './pages/UserDashboardPage';
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePageFixed />} />
          <Route path="/product/:id" element={<ProductDetailPageFixed />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/purchases" element={<PurchaseHistoryPage />} />
          <Route path="/my-listings" element={<MyListingsPage />} />
          <Route path="/add-product" element={<EditProductPage />} />
          <Route path="/edit-product/:id" element={<EditProductPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<UserDashboardPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
