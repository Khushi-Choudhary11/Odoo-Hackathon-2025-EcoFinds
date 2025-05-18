from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models.product import Product
from models.user import User
from extensions import db

products_bp = Blueprint('products', __name__)

@products_bp.route('', methods=['GET'])
def get_products():
    try:
        # Query parameters
        category = request.args.get('category')
        condition = request.args.get('condition')
        search = request.args.get('search')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 12, type=int)
        
        # Base query
        query = Product.query.filter_by(is_sold=False)
        
        # Apply filters
        if category and category != 'all':
            query = query.filter_by(category=category)
        if condition:
            query = query.filter_by(condition=condition)
        if search:
            query = query.filter(Product.title.ilike(f'%{search}%') | 
                                Product.description.ilike(f'%{search}%'))
        
        # Apply pagination
        products = query.order_by(Product.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False)
        
        # Return products as a list, not inside an object
        # This makes it compatible with frontend that expects an array directly
        return jsonify([product.to_dict() for product in products.items]), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching products: {str(e)}")
        return jsonify({
            "message": "Error retrieving products",
            "details": str(e)
        }), 500

@products_bp.route('/<int:id>', methods=['GET'])
def get_product(id):
    product = Product.query.get(id)
    
    if not product:
        return jsonify({"message": "Product not found"}), 404
    
    return jsonify(product.to_dict()), 200

@products_bp.route('', methods=['POST'])
@jwt_required()
def create_product():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"message": "User not found"}), 404
    
    data = request.get_json()
    
    if not data:
        return jsonify({"message": "No input data provided"}), 400
    
    # Validate required fields
    required_fields = ['title', 'description', 'price', 'category', 'condition']
    for field in required_fields:
        if field not in data:
            return jsonify({"message": f"{field} is required"}), 400
    
    # Create new product
    product = Product(
        title=data['title'],
        description=data['description'],
        price=float(data['price']),
        category=data['category'],
        condition=data['condition'],
        image_url=data.get('image_url'),
        seller=user
    )
    
    db.session.add(product)
    db.session.commit()
    
    return jsonify({
        "message": "Product created successfully",
        "product": product.to_dict()
    }), 201

@products_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def update_product(id):
    current_user_id = get_jwt_identity()
    
    product = Product.query.get(id)
    
    if not product:
        return jsonify({"message": "Product not found"}), 404
    
    # Check if current user owns the product
    if product.seller_id != current_user_id:
        return jsonify({"message": "You don't have permission to update this product"}), 403
    
    data = request.get_json()
    
    if not data:
        return jsonify({"message": "No input data provided"}), 400
    
    # Update product fields
    if 'title' in data:
        product.title = data['title']
    if 'description' in data:
        product.description = data['description']
    if 'price' in data:
        product.price = float(data['price'])
    if 'category' in data:
        product.category = data['category']
    if 'condition' in data:
        product.condition = data['condition']
    if 'image_url' in data:
        product.image_url = data['image_url']
    
    db.session.commit()
    
    return jsonify({
        "message": "Product updated successfully",
        "product": product.to_dict()
    }), 200

@products_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_product(id):
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    
    product = Product.query.get(id)
    
    if not product:
        return jsonify({"message": "Product not found"}), 404
    
    # Check if current user owns the product or is an admin
    if product.seller_id != current_user_id and claims.get('role') != 'admin':
        return jsonify({"message": "You don't have permission to delete this product"}), 403
    
    # Delete associated cart items first
    for cart_item in product.cart_items:
        db.session.delete(cart_item)
    
    db.session.delete(product)
    db.session.commit()
    
    return jsonify({
        "message": "Product deleted successfully"
    }), 200