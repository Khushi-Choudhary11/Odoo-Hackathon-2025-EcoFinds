"""
A minimal version of the app that ignores relationship errors.
Run with: python minimal_app.py
"""

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
import os

app = Flask(__name__)

# Configure app
app.config.from_mapping(
    SQLALCHEMY_DATABASE_URI='sqlite:///ecofinds_minimal.db',
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
    JWT_SECRET_KEY='humansaresocialanimals',
    JWT_TOKEN_LOCATION=['headers'],
    JWT_HEADER_NAME='Authorization',
    JWT_HEADER_TYPE='Bearer',
    JWT_ERROR_MESSAGE_KEY='msg'
)

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)
cors = CORS(app)

# Simple models without complex relationships
class Role(db.Model):
    __tablename__ = 'roles'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True)
    username = db.Column(db.String(80), unique=True)
    password_hash = db.Column(db.String(128))
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'))

# Create a simple route for testing
@app.route('/api/test')
def test_route():
    return {"message": "API is working!"}

# Define minimal error handlers
@app.errorhandler(400)
def handle_bad_request(error):
    return {"message": "Bad request"}, 400

@app.errorhandler(404)
def handle_not_found(error):
    return {"message": "Not found"}, 404

@app.errorhandler(500)
def handle_server_error(error):
    return {"message": "Internal server error"}, 500

def seed_minimal_data():
    # Create roles
    admin_role = Role.query.filter_by(name='admin').first()
    if not admin_role:
        admin_role = Role(name='admin')
        db.session.add(admin_role)
        
    user_role = Role.query.filter_by(name='user').first()
    if not user_role:
        user_role = Role(name='user')
        db.session.add(user_role)
    
    # Create admin user
    admin_user = User.query.filter_by(email='admin@example.com').first()
    if not admin_user:
        admin_user = User(
            email='admin@example.com',
            username='admin',
            role_id=1
        )
        admin_user.password_hash = 'placeholder'  # Not for real use
        db.session.add(admin_user)
    
    db.session.commit()
    print("Minimal data seeded successfully")

if __name__ == '__main__':
    # Create tables
    with app.app_context():
        try:
            # Drop existing tables to avoid relationship issues
            if os.environ.get('RESET_DB') == '1':
                print("Dropping all tables...")
                db.drop_all()
            
            print("Creating tables...")
            db.create_all()
            
            print("Seeding minimal data...")
            seed_minimal_data()
            
            print("\n✅ Minimal app is ready!")
            print("API running at http://localhost:5000/api/test")
        except Exception as e:
            print(f"Error initializing database: {e}")
    
    # Run the app
    app.run(debug=True)