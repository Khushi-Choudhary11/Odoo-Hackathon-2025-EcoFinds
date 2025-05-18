from extensions import db
from datetime import datetime

class CartItem(db.Model):
    __tablename__ = 'cart_items'
    
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Foreign keys
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    
    # Relationships - using strings instead of back_populates
    user = db.relationship('User')
    product = db.relationship('Product')
    
    def to_dict(self):
        product_data = None
        try:
            if self.product:
                product_data = self.product.to_dict()
        except Exception as e:
            product_data = {
                "id": self.product_id,
                "error": "Failed to load product data"
            }
            
        return {
            'id': self.id,
            'user_id': self.user_id,
            'product_id': self.product_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'product': product_data
        }
    
    def __repr__(self):
        return f'<CartItem {self.id}>'