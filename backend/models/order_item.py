from extensions import db

class OrderItem(db.Model):
    __tablename__ = 'order_items'
    
    id = db.Column(db.Integer, primary_key=True)
    price = db.Column(db.Float, nullable=False)  # Store price at time of purchase
    
    # Foreign keys
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    
    # Relationships
    order = db.relationship('Order', back_populates='order_items')
    product = db.relationship('Product', back_populates='order_items')
    
    def to_dict(self):
        return {
            'id': self.id,
            'price': self.price,
            'product': {
                'id': self.product.id,
                'title': self.product.title,
                'image_url': self.product.image_url,
                'seller': {
                    'id': self.product.seller.id,
                    'username': self.product.seller.username
                }
            }
        }
    
    def __repr__(self):
        return f'<OrderItem {self.id}>'