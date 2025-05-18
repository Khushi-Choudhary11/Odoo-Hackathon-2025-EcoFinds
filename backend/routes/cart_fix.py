from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from models.user import User
from models.product import Product
from models.cart_item import CartItem
from models.order import Order
from models.order_item import OrderItem
from extensions import db
from werkzeug.exceptions import BadRequest, NotFound, Unauthorized, UnprocessableEntity

cart_bp = Blueprint('cart', __name__)

@cart_bp.route('', methods=['GET'])
@jwt_required()
def get_cart():
    try:
        current_user_id = get_jwt_identity()
        print(f"GET cart request from user ID: {current_user_id}, type: {type(current_user_id)}")
        
        # Handle string user ID (convert to int if needed)
        if isinstance(current_user_id, str) and current_user_id.isdigit():
            current_user_id = int(current_user_id)
            
        user = User.query.get(current_user_id)
        
        if not user:
            print(f"User not found: {current_user_id}")
            return jsonify({"message": "User not found"}), 404
        
        cart_items = CartItem.query.filter_by(user_id=current_user_id).all()
        print(f"Found {len(cart_items)} cart items for user {current_user_id}")
        
        # Safely calculate total and check for missing/sold products
        valid_items = []
        unavailable_items = []
        total = 0
        
        for item in cart_items:
            print(f"Processing cart item {item.id}, product_id: {item.product_id}")
            if item.product:
                print(f"Product exists, is_sold: {item.product.is_sold}")
                if not item.product.is_sold:
                    total += item.product.price
                    valid_items.append(item.to_dict())
                else:
                    unavailable_items.append({
                        "id": item.id,
                        "product_id": item.product_id,
                        "reason": "sold"
                    })
            else:
                print(f"Product with ID {item.product_id} not found for cart item {item.id}")
                unavailable_items.append({
                    "id": item.id,
                    "product_id": item.product_id,
                    "reason": "missing"
                })
        
        print(f"Returning {len(valid_items)} valid items, {len(unavailable_items)} unavailable")
        return jsonify({
            "cartItems": valid_items,
            "total": total,
            "unavailableItems": unavailable_items
        }), 200
    except Exception as e:
        print(f"Error fetching cart: {str(e)}")
        return jsonify({
            "message": "Error fetching cart items",
            "details": str(e)
        }), 500

@cart_bp.route('', methods=['POST'])
@jwt_required()
def add_to_cart():
    try:
        current_user_id = get_jwt_identity()
        print(f"Add to cart request from user {current_user_id}, type: {type(current_user_id)}")
        
        # Handle string user ID (convert to int if needed)
        if isinstance(current_user_id, str) and current_user_id.isdigit():
            current_user_id = int(current_user_id)
        
        user = User.query.get(current_user_id)
        
        if not user:
            print(f"User {current_user_id} not found")
            return jsonify({"message": "User not found"}), 404
        
        # Print request details for debugging
        print(f"Headers: {dict(request.headers)}")
        print(f"Request data: {request.data}")
        
        # Parse JSON with silent=True to prevent exceptions on invalid JSON
        data = request.get_json(silent=True)
        print(f"Parsed JSON data: {data}")
        
        if not data:
            print("No valid JSON data provided")
            return jsonify({"message": "No JSON data provided", "details": "Request body is empty or invalid JSON"}), 400
        
        if 'product_id' not in data:
            print("Missing product_id in request")
            return jsonify({"message": "Product ID is required", "details": "Missing product_id field in request"}), 400
        
        # Convert product_id to integer
        try:
            product_id = int(data['product_id'])
            print(f"Product ID: {product_id}")
        except (ValueError, TypeError):
            print(f"Invalid product ID format: {data['product_id']}")
            return jsonify({"message": "Invalid product ID", "details": f"Product ID must be a number, received: {data['product_id']}"}), 400
        
        # Check if product exists
        product = Product.query.get(product_id)
        
        if not product:
            print(f"Product {product_id} not found")
            return jsonify({"message": "Product not found", "details": f"No product found with ID {product_id}"}), 404
        
        print(f"Product found: {product.title}, is_sold: {product.is_sold}")
        
        if product.is_sold:
            print(f"Product {product_id} is already sold")
            return jsonify({"message": "Product is no longer available", "details": "This item has already been sold"}), 400
        
        # Check if product is already in cart
        existing_item = CartItem.query.filter_by(user_id=current_user_id, product_id=product_id).first()
        if existing_item:
            print(f"Product {product_id} already in user's cart")
            # Return success (200) instead of error (400)
            return jsonify({
                "message": "Product is already in your cart", 
                "details": "This item is already in your shopping cart",
                "cartItem": existing_item.to_dict()
            }), 200  # Changed from 400 to 200
        
        # Prevent adding own products to cart
        if product.seller_id == current_user_id:
            print(f"User {current_user_id} tried to add their own product to cart")
            return jsonify({"message": "You cannot add your own products to cart", "details": "You are the seller of this item"}), 400
        
        # Add to cart
        cart_item = CartItem(user_id=current_user_id, product_id=product_id)
        db.session.add(cart_item)
        db.session.commit()
        
        print(f"Product {product_id} added to cart successfully")
        return jsonify({
            "message": "Product added to cart successfully",
            "cartItem": cart_item.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        print(f"Error adding product to cart: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "message": "Error processing your request",
            "details": str(e)
        }), 500

@cart_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def remove_from_cart(id):
    current_user_id = get_jwt_identity()
    
    cart_item = CartItem.query.get(id)
    
    if not cart_item:
        return jsonify({"message": "Cart item not found"}), 404
    
    if cart_item.user_id != current_user_id:
        return jsonify({"message": "You don't have permission to remove this item"}), 403
    
    db.session.delete(cart_item)
    db.session.commit()
    
    return jsonify({
        "message": "Item removed from cart"
    }), 200

@cart_bp.route('/checkout', methods=['POST'])
@jwt_required()
def checkout():
    try:
        current_user_id = get_jwt_identity()
        print(f"Checkout request from user ID: {current_user_id}")
        
        # Handle string user ID (convert to int if needed)
        if isinstance(current_user_id, str) and current_user_id.isdigit():
            current_user_id = int(current_user_id)
            
        user = User.query.get(current_user_id)
        
        if not user:
            print(f"User not found for checkout: {current_user_id}")
            return jsonify({"message": "User not found"}), 404
        
        # Parse input data with proper error handling
        try:
            data = request.get_json(silent=True)
            print(f"Checkout request data: {data}")
            
            if not data:
                data = {}  # Use an empty dict if no data provided
        except Exception as e:
            print(f"Error parsing checkout data: {e}")
            return jsonify({"message": "Invalid request data", "details": str(e)}), 400
            
        shipping_address = data.get('shipping_address', '')
        
        # Get cart items
        cart_items = CartItem.query.filter_by(user_id=current_user_id).all()
        print(f"Found {len(cart_items)} items in cart for checkout")
        
        if not cart_items:
            print("Cart is empty for checkout")
            return jsonify({
                "message": "Your cart is empty",
                "details": "Add items to your cart before checkout"
            }), 400
        
        # Check if all products are available
        unavailable_products = []
        for item in cart_items:
            if not item.product or item.product.is_sold:
                product_name = item.product.title if item.product else "Unknown product"
                print(f"Product unavailable: {product_name}")
                unavailable_products.append({
                    "id": item.product_id if item.product else item.id,
                    "name": product_name
                })
        
        if unavailable_products:
            print(f"{len(unavailable_products)} products are unavailable")
            return jsonify({
                "message": "Some products are no longer available",
                "details": "The following items are no longer available for purchase",
                "unavailableProducts": unavailable_products
            }), 400
        
        # Calculate total
        total_amount = sum(item.product.price for item in cart_items)
        print(f"Total order amount: {total_amount}")
        
        # Create order
        order = Order(
            user_id=current_user_id,
            total_amount=total_amount,
            shipping_address=shipping_address
        )
        db.session.add(order)
        
        # We need to flush the session to get the order ID
        db.session.flush()
        
        print(f"Created order with ID: {order.id}")
        
        # Create order items and mark products as sold
        for cart_item in cart_items:
            print(f"Processing cart item {cart_item.id} for checkout with order_id: {order.id}")
            # Create order item
            order_item = OrderItem(
                order_id=order.id,
                product_id=cart_item.product_id,
                price=cart_item.product.price
            )
            db.session.add(order_item)
            
            # Mark product as sold
            cart_item.product.is_sold = True
            
            # Remove from cart
            db.session.delete(cart_item)
        
        db.session.commit()
        print(f"Checkout successful, created order ID: {order.id}")
        
        return jsonify({
            "message": "Order placed successfully",
            "order": order.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f"Checkout error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "message": "Error processing your order",
            "details": str(e)
        }), 500