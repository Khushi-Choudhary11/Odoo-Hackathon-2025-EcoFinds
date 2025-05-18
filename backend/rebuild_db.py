"""
This script rebuilds the database from scratch, dropping all tables first.
Run with: python rebuild_db.py
"""

import os
import sys
from pathlib import Path

# Ensure we're in the right directory
os.chdir(str(Path(__file__).parent))

print("="*50)
print("DATABASE REBUILD SCRIPT")
print("="*50)

print("\nThis script will DROP ALL TABLES and recreate the database.")
confirmation = input("Are you sure you want to proceed? (y/n): ")

if confirmation.lower() != 'y':
    print("Aborted.")
    sys.exit(0)

print("\nRebuilding database...")

# Delete the database file if it exists
db_file = Path("ecofinds.db")
if db_file.exists():
    print(f"Deleting existing database file: {db_file}")
    try:
        db_file.unlink()
        print("✅ Database file deleted")
    except Exception as e:
        print(f"❌ Error deleting database file: {e}")

# Import and run the app with database creation
print("\nCreating new database...")
try:
    from app import create_app
    from extensions import db
    from models.roles import Role
    from models.user import User
    
    app = create_app()
    
    with app.app_context():
        # Create tables
        db.create_all()
        print("✅ Tables created")
        
        # Create roles
        admin_role = Role(name='admin')
        user_role = Role(name='user')
        db.session.add(admin_role)
        db.session.add(user_role)
        db.session.commit()
        print("✅ Roles created")
        
        # Create admin user
        admin = User(
            email='admin@ecofinds.local', 
            username='Administrator', 
            role=admin_role
        )
        admin.set_password('ChangeMe123!')
        db.session.add(admin)
        db.session.commit()
        print("✅ Admin user created")
        
    print("\n✅ Database rebuild complete!")
except Exception as e:
    print(f"\n❌ Error rebuilding database: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)