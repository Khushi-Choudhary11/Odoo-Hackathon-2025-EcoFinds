"""
This script checks and fixes the model relationships.
Run it with: python model_repair.py
"""

import sys
import inspect
import importlib
from pathlib import Path

# Add the current directory to the Python path
sys.path.insert(0, str(Path(__file__).parent))

def check_models():
    """
    Check all models for relationship consistency
    """
    print("Checking model relationships...")
    
    # Models to check
    models = [
        'models.user.User',
        'models.roles.Role',
        'models.product.Product',
        'models.cart_item.CartItem',
        'models.order.Order',
        'models.order_item.OrderItem'
    ]
    
    loaded_models = {}
    relationship_issues = []
    
    # Load all models
    for model_path in models:
        module_path, class_name = model_path.rsplit('.', 1)
        try:
            module = importlib.import_module(module_path)
            model_class = getattr(module, class_name)
            loaded_models[model_path] = model_class
            print(f"✅ Loaded {model_path}")
        except Exception as e:
            print(f"❌ Failed to load {model_path}: {e}")
            continue
    
    # Check relationships
    for model_path, model_class in loaded_models.items():
        print(f"\nChecking relationships for {model_path}")
        # Get all relationship attributes
        for name, attr in inspect.getmembers(model_class):
            if name.startswith('_'):
                continue
                
            # Check if attribute is a relationship
            if hasattr(attr, 'prop') and hasattr(attr.prop, 'target'):
                print(f"  Found relationship: {name} -> {attr.prop.target}")
                
                # Check for back_populates
                if hasattr(attr.prop, 'back_populates'):
                    back_populates = attr.prop.back_populates
                    target_model = attr.prop.target
                    target_model_name = target_model.__name__
                    
                    print(f"    back_populates: {back_populates} on {target_model_name}")
                    
                    # Verify back_populates exists on target model
                    if not hasattr(target_model, back_populates):
                        issue = f"❌ {model_path}.{name} references back_populates='{back_populates}' but {target_model_name} does not have this attribute"
                        print(f"    {issue}")
                        relationship_issues.append(issue)
                        continue
                    
                    # Verify back_populates points back to this model
                    back_rel = getattr(target_model, back_populates)
                    if back_rel.prop.target != model_class:
                        issue = f"❌ {model_path}.{name} has back_populates='{back_populates}' but {target_model_name}.{back_populates} points to {back_rel.prop.target.__name__}, not {model_class.__name__}"
                        print(f"    {issue}")
                        relationship_issues.append(issue)
                    else:
                        print(f"    ✅ {target_model_name}.{back_populates} correctly references {model_class.__name__}")
    
    # Print summary
    print("\n" + "="*50)
    print("RELATIONSHIP CHECK SUMMARY")
    print("="*50)
    
    if relationship_issues:
        print(f"\nFound {len(relationship_issues)} relationship issues:")
        for i, issue in enumerate(relationship_issues, 1):
            print(f"{i}. {issue}")
    else:
        print("\n✅ No relationship issues found!")
    
    return relationship_issues

def fix_cart_item_relationships():
    """
    Fix the CartItem model relationships
    """
    from models.cart_item import CartItem
    from models.product import Product
    from models.user import User
    from extensions import db
    
    print("\nFixing CartItem relationships...")
    
    # Check if Product has cart_items relationship
    if not hasattr(Product, 'cart_items'):
        print("Adding cart_items relationship to Product model")
        Product.cart_items = db.relationship('CartItem', back_populates='product')
        print("✅ Added cart_items relationship to Product")
    
    # Check if User has cart_items relationship
    if not hasattr(User, 'cart_items'):
        print("Adding cart_items relationship to User model")
        User.cart_items = db.relationship('CartItem', back_populates='user')
        print("✅ Added cart_items relationship to User")
    
    print("\nCartItem relationships fixed!")

def fix_order_item_relationships():
    """
    Fix the OrderItem model relationships
    """
    from models.order_item import OrderItem
    from models.product import Product
    from models.order import Order
    from extensions import db
    
    print("\nFixing OrderItem relationships...")
    
    # Check if Product has order_items relationship
    if not hasattr(Product, 'order_items'):
        print("Adding order_items relationship to Product model")
        Product.order_items = db.relationship('OrderItem', back_populates='product')
        print("✅ Added order_items relationship to Product")
    
    # Check if Order has the right relationship name
    if hasattr(Order, 'items') and not hasattr(Order, 'order_items'):
        print("Renaming Order.items to Order.order_items")
        Order.order_items = Order.items
        delattr(Order, 'items')
        print("✅ Renamed Order.items to Order.order_items")
    
    print("\nOrderItem relationships fixed!")

if __name__ == '__main__':
    # Create a Flask app context for database operations
    from app import create_app
    from extensions import db
    
    app = create_app()
    
    with app.app_context():
        issues = check_models()
        
        if issues:
            try:
                fix_cart_item_relationships()
                fix_order_item_relationships()
                
                # Re-check models after fixes
                print("\nRe-checking models after fixes...")
                issues = check_models()
                if not issues:
                    print("\n✅ All relationship issues fixed!")
            except Exception as e:
                print(f"\n❌ Failed to fix relationships: {e}")
        else:
            print("\n✅ All models have consistent relationships.")