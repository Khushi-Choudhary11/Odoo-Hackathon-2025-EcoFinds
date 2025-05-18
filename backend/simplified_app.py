"""
A simplified version of the app using models without problematic relationships.
Run this instead of app.py to avoid the relationship errors.
"""

import os
from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required
from flask_cors import CORS
import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)

# Create Flask app
app = Flask(__name__)

# Configure app
app.config.from_mapping(
    SQLALCHEMY_DATABASE_URI='sqlite:///ecofinds_simple.db',
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
    JWT_SECRET_KEY='humansaresocialanimals',
    JWT_TOKEN_LOCATION=['headers'],
    JWT_HEADER_NAME='Authorization',
    JWT_HEADER_TYPE='Bearer',
    JWT_ERROR_MESSAGE_KEY='msg'
)

# Initialize extensions
from extensions import db, jwt, cors
db.init_app(app)
jwt.init_app(app)
cors.init_app(app)

# Import simplified models
from models.roles import Role
from models.user import User
from models.product_simple import Product
from models.cart_item_simple import CartItem
from models.order_simple import Order
from models.order_item_simple import OrderItem

# Set up JWT error handlers
@jwt.invalid_token_loader
def invalid_token_callback(error_string):
    return jsonify({
        'message': 'Invalid token',
        'error': error_string
    }), 401

@jwt.unauthorized_loader
def unauthorized_callback(error_string):
    return jsonify({
        'message': 'Missing authorization token',
        'error': error_string
    }), 401

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_data):
    return jsonify({
        'message': 'Token has expired',
        'error': 'token_expired'
    }), 401

# Import routes
from routes.auth_fix import auth_bp
from routes.users import users_bp
from routes.products import products_bp
from routes.cart_fix import cart_bp
from routes.orders_fix import orders_bp

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(users_bp, url_prefix='/api/users')
app.register_blueprint(products_bp, url_prefix='/api/products')
app.register_blueprint(cart_bp, url_prefix='/api/cart')
app.register_blueprint(orders_bp, url_prefix='/api/orders')

# Root route
@app.route('/')
def index():
    return jsonify({
        "message": "EcoFinds API is running",
        "version": "1.0.0-simplified"
    })

# Health check route
@app.route('/health')
def health():
    return jsonify({
        "status": "ok",
        "timestamp": datetime.datetime.now().isoformat()
    })

# Seed the database with initial data
def seed_roles_and_admin():
    try:
        # Create roles if they don't exist
        roles = ['admin', 'user']
        for name in roles:
            role = Role.query.filter_by(name=name).first()
            if not role:
                role = Role(name=name)
                db.session.add(role)
                print(f"Created role: {name}")
        
        db.session.commit()
        
        # Create admin user if it doesn't exist
        admin = User.query.filter_by(email='admin@ecofinds.local').first()
        if not admin:
            admin_role = Role.query.filter_by(name='admin').first()
            admin = User(email='admin@ecofinds.local', username='Administrator', role=admin_role)
            admin.set_password('ChangeMe123!')
            db.session.add(admin)
            db.session.commit()
            print("Created default admin")
    except Exception as e:
        db.session.rollback()
        print(f"Error in seed_roles_and_admin: {str(e)}")
        raise

# Main function
if __name__ == '__main__':
    with app.app_context():
        try:
            # Create tables
            db.create_all()
            print("Tables created")
            
            # Seed initial data
            seed_roles_and_admin()
            print("Database initialization completed successfully")
        except Exception as e:
            print(f"Error during database initialization: {str(e)}")
            import traceback
            traceback.print_exc()
    
    # Run the app
    app.run(debug=True)