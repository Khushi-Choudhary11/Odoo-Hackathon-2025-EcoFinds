from extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    avatar_url = db.Column(db.String(255), nullable=True)
    
    # Foreign keys
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'))
    
    # Relationships
    role = db.relationship('Role', back_populates='users')
    products = db.relationship('Product', back_populates='seller')
    orders = db.relationship('Order', back_populates='user')
    cart_items = db.relationship('CartItem', back_populates='user')
    
    def set_password(self, password):
        # Handle both bytes and string return types from generate_password_hash
        hashed = generate_password_hash(password)
        if isinstance(hashed, bytes):
            self.password_hash = hashed.decode('utf-8')
        else:
            self.password_hash = hashed
        
    def check_password(self, password):
        if not self.password_hash:
            return False
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'role': self.role.name if self.role else 'user',
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'avatar_url': self.avatar_url
        }
        
    def __repr__(self):
        return f'<User {self.username}>'