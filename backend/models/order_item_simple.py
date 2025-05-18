from extensions import db
from datetime import datetime

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    price = db.Column(db.Float, nullable=False)  # Store price at time of purchase
    
    # Foreign keys
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    
    # Relationships - using strings instead of back_populates
    order = db.relationship('Order')
    product = db.relationship('Product')
    
    def to_dict(self):
        product_data = None
        try:
            if self.product:
                product_data = self.product.to_dict()
        except Exception as e:
            product_data = {
                "id": self.product_id,
                "error": "Failed to load product data",
                "details": str(e)
            }
            
        return {
            'id': self.id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'price': self.price,
            'order_id': self.order_id,
            'product_id': self.product_id,
            'product': product_data
        }
    
    def __repr__(self):
        return f'<OrderItem {self.id}>'