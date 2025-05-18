from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS

from extensions import db, migrate, jwt, cors

def create_app():
    app = Flask(__name__, static_folder='../frontend', template_folder='../frontend')

    # Configure app
    app.config.from_mapping(
        SQLALCHEMY_DATABASE_URI='sqlite:///ecofinds.db',
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JWT_SECRET_KEY='humansaresocialanimals',
        JWT_VERIFY_SUB= False
    )
    
    # Add JWT error handlers for better debugging
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"msg": f"Invalid token: {error}"}), 422

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"msg": f"Authorization required: {error}"}), 401


    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/*": {"origins": ["http://localhost:3000"], "supports_credentials": True}})
    
    # Import models
    from models.user import User
    from models.roles import Role
    from models.product import Product
    from models.cart_item import CartItem
    from models.order import Order
    from models.order_item import OrderItem

    # Import and register blueprints
    from routes.auth import auth_bp
    from routes.users import users_bp
    from routes.products import products_bp
    from routes.cart import cart_bp
    from routes.orders import orders_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/user')
    app.register_blueprint(products_bp, url_prefix='/api/products')
    app.register_blueprint(cart_bp, url_prefix='/api/cart')
    app.register_blueprint(orders_bp, url_prefix='/api/orders')

    # Setup static routes for SPA
    @app.route('/')
    def index():
        return app.send_static_file('index.html')
    
    # Catch-all route to support SPA routing
    @app.route('/<path:path>')
    def catch_all(path):
        try:
            return app.send_static_file(path)
        except:
            return app.send_static_file('index.html')

    return app

def seed_roles_and_admin():
    from models.roles import Role
    from models.user import User
    from extensions import db

    # Create roles
    for name in ('admin', 'user'):
        if not Role.query.filter_by(name=name).first():
            db.session.add(Role(name=name))
    db.session.commit()

    # Create admin user
    if not User.query.filter_by(email='admin@ecofinds.local').first():
        admin_role = Role.query.filter_by(name='admin').one()
        admin = User(email='admin@ecofinds.local', username='Administrator', role=admin_role)
        admin.set_password('ChangeMe123!')
        db.session.add(admin)
        db.session.commit()
        print("Created default admin")

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        db.create_all()
        print("Tables created")
        seed_roles_and_admin()
    app.run(debug=True)