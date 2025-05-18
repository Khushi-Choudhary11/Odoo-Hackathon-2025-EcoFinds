from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS

# Initialize extensions without application
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
cors = CORS()

# Set up JWT error handlers
@jwt.invalid_token_loader
def invalid_token_callback(error_string):
    return {
        'message': 'Invalid token',
        'error': error_string
    }, 401

@jwt.unauthorized_loader
def unauthorized_callback(error_string):
    return {
        'message': 'Missing authorization token',
        'error': error_string
    }, 401

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_data):
    return {
        'message': 'Token has expired',
        'error': 'token_expired'
    }, 401