from extensions import db
from datetime import datetime

class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False)
    condition = db.Column(db.String(50), nullable=False)
    category = db.Column(db.String(100), nullable=True)
    image_url = db.Column(db.String(255), nullable=True)
    is_sold = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    seller_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Relationships - using strings instead of back_populates to avoid circular references
    seller = db.relationship('User')
    
    # Define a property for accessing cart_items and order_items without explicit relationships
    @property
    def cart_items(self):
        from models.cart_item import CartItem
        return CartItem.query.filter_by(product_id=self.id).all()
    
    @property
    def order_items(self):
        from models.order_item import OrderItem
        return OrderItem.query.filter_by(product_id=self.id).all()
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'price': self.price,
            'condition': self.condition,
            'category': self.category,
            'image_url': self.image_url,
            'is_sold': self.is_sold,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'seller_id': self.seller_id,
            'seller': self.seller.to_dict() if self.seller else None
        }
        
    def __repr__(self):
        return f'<Product {self.id}: {self.title}>'