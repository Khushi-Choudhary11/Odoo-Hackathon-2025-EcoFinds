from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS

from extensions import db, migrate, jwt, cors

def create_app():
    app = Flask(__name__)

    # Configure app
    app.config.from_mapping(
        SQLALCHEMY_DATABASE_URI='sqlite:///ecofinds.db',
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JWT_SECRET_KEY='humansaresocialanimals',
        JWT_TOKEN_LOCATION=['headers'],
        JWT_HEADER_NAME='Authorization',
        JWT_HEADER_TYPE='Bearer',
        JWT_ERROR_MESSAGE_KEY='msg'
    )
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Configure CORS with better support for preflight requests
    cors.init_app(app, 
                 resources={r"/api/*": {
                     "origins": ["http://localhost:3000"],
                     "supports_credentials": True,
                     "allow_headers": ["Content-Type", "Authorization"],
                     "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                     "expose_headers": ["Content-Type", "Authorization"]
                 }})
    
    # Import models
    from models.user import User
    from models.roles import Role
    from models.product import Product
    from models.cart_item import CartItem
    from models.order import Order
    from models.order_item import OrderItem

    # Import and register blueprints
    # Try to use improved authentication first
    try:
        from routes.auth_fix import auth_bp
        print("Using fixed authentication routes")
    except ImportError:
        from routes.auth import auth_bp
        print("Using original authentication routes")
        
    # Try to use improved users routes first
    try:
        from routes.users_fix import users_bp
        print("Using fixed users routes")
    except ImportError:
        from routes.users import users_bp
        print("Using original users routes")
    from routes.products import products_bp
    
    # Try to import the fixed cart routes first
    try:
        from routes.cart_fix import cart_bp
        print("Using fixed cart routes")
    except ImportError:
        from routes.cart import cart_bp
        print("Using original cart routes")
    
    # Try to import the fixed orders routes first    
    try:
        from routes.orders_fix import orders_bp
        print("Using fixed orders routes")
    except ImportError:
        from routes.orders import orders_bp
        print("Using original orders routes")

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(products_bp, url_prefix='/api/products')
    app.register_blueprint(cart_bp, url_prefix='/api/cart')
    app.register_blueprint(orders_bp, url_prefix='/api/orders')
    
    # Add error handlers for common API errors
    @app.errorhandler(422)
    def handle_unprocessable_entity(error):
        return {
            "error": "Unprocessable Entity",
            "message": "The request was well-formed but was unable to be followed due to semantic errors.",
            "details": str(error)
        }, 422
        
    @app.errorhandler(400)
    def handle_bad_request(error):
        return {
            "error": "Bad Request",
            "message": "The server could not understand the request due to invalid syntax.",
            "details": str(error)
        }, 400

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
        try:
            db.create_all()
            print("Tables created")
            seed_roles_and_admin()
            print("Database initialization completed successfully")
        except Exception as e:
            print(f"Error during database initialization: {str(e)}")
            import traceback
            traceback.print_exc()
    app.run(debug=True)