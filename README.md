Link for the demo video : https://drive.google.com/drive/folders/11MDgqPUCBOPMf827NDmQ22Oy1wyy4OWG?usp=sharing
# 🌱 EcoFinds - Sustainable Second-Hand Marketplace


## 📋 Project Overview

EcoFinds is a sustainable second-hand marketplace platform that enables users to buy and sell pre-owned items to extend their lifecycle, reduce waste, and promote eco-friendly consumption. This project was developed during the Odoo Hackathon 2025.

## 🎯 Features

- *🔐 User Authentication*
  - Secure registration and login system
  - JWT-based authentication
  - User profile management
  
- *🛒 Product Management*
  - Create, view, update, and delete product listings
  - Rich product details with images, description, pricing
  - Category-based organization
  
- *🔍 Search & Discovery*
  - Search functionality by title and description
  - Filter products by category
  - Browse all available listings
  
- *💳 Shopping Experience*
  - Cart functionality for adding and removing products
  - Checkout process
  - Order history tracking
  
- *👤 User Dashboard*
  - Personal user information display
  - Manage your product listings
  - View purchase history

## 🛠 Technology Stack

### Frontend
- *React.js*: Frontend library for building the user interface
- *React Router*: Client-side routing
- *Tailwind CSS*: Utility-first CSS framework for styling
- *React Icons*: Icon library (using Feather Icons)
- *JWT Decode*: For handling authentication tokens

### Backend
- *Flask*: Python web framework
- *SQLAlchemy*: ORM for database interactions
- *Flask-JWT-Extended*: JWT token handling for authentication
- *Flask-CORS*: Cross-Origin Resource Sharing support
- *SQLite*: Database (for development)

### Development & Deployment
- *npm/yarn*: Package management for frontend
- *pip*: Package management for backend
- *Git*: Version control

## 📂 Project Structure

```
ecofinds/
├── backend/              # Flask backend
│   ├── models/           # Database models
│   ├── routes/           # API endpoints
│   ├── extensions.py     # Flask extensions
│   └── app.py            # Main application entry
│
└── frontend/             # React frontend
    ├── public/           # Static files
    └── src/
        ├── components/   # Reusable UI components
        ├── pages/        # Page components
        ├── utils/        # Utility functions
        └── App.js        # Main component
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- Python (v3.8+)
- npm or yarn

### Running the Backend

1. Navigate to the backend directory:
   bash
   cd backend
   

2. Create and activate a virtual environment:
   bash
   python -m venv venv
   source venv/bin/activate   # On Windows: venv\Scripts\activate
   

3. Install dependencies:
   bash
   pip install -r requirements.txt
   

4. Run the Flask application:
   bash
   python app.py
   

The backend API will be available at http://localhost:5000

### Running the Frontend

1. Navigate to the frontend directory:
   bash
   cd frontend
   

2. Install dependencies:
   bash
   npm install
   # or
   yarn install
   

3. Start the development server:
   bash
   npm start
   # or
   yarn start
   

The frontend will be accessible at http://localhost:3000

## 📱 Application Flow

1. *User Authentication*:
   - Users can register with email and password
   - Login to access personalized features
   - JWT tokens are used for maintaining authenticated sessions

2. *Product Browsing*:
   - Browse all available products on the homepage
   - Use search functionality to find specific items
   - Filter by categories for targeted browsing

3. *Product Details*:
   - View comprehensive information about a product
   - See seller information and product condition
   - Add products to cart if interested

4. *Shopping Cart*:
   - Add/remove items from the cart
   - Review selected items before checkout
   - Proceed to checkout when ready

5. *Checkout Process*:
   - Enter shipping information
   - Review order details
   - Complete purchase

6. *User Dashboard*:
   - View personal profile information
   - Manage product listings (add, edit, delete)
   - View purchase history

## 🔧 API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Log in and get JWT token

### Products
- GET /api/products - List all products
- GET /api/products/:id - Get product details
- POST /api/products - Create a new product listing
- PUT /api/products/:id - Update product details
- DELETE /api/products/:id - Delete a product

### User
- GET /api/users/profile - Get current user profile
- GET /api/users/products - Get products listed by current user

### Cart & Orders
- GET /api/cart - Get cart contents
- POST /api/cart - Add item to cart
- DELETE /api/cart/:id - Remove item from cart
- POST /api/cart/checkout - Complete checkout
- GET /api/orders - Get order history

## 📝 Development Roadmap

### Implemented Features (MVP)
- ✅ User authentication system
- ✅ Product CRUD operations
- ✅ Search and filter functionality 
- ✅ Shopping cart management
- ✅ Checkout process
- ✅ Order history tracking
- ✅ User dashboard

### Future Enhancements
- 🔲 User ratings and reviews
- 🔲 Chat functionality for buyer-seller communication
- 🔲 Advanced search filters (price range, condition)
- 🔲 Wishlist functionality
- 🔲 Push notifications for order status and messages
- 🔲 Payment gateway integration
- 🔲 Social media sharing
- 🔲 Admin dashboard for platform management


## 👥 Team

- Team 333 - Odoo Hackathon 2025
