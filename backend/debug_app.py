import sys, os
sys.path.insert(0, os.path.dirname(__file__))
try:
    from app import create_app
    print("App imported successfully")
    app = create_app()
    print("App created successfully")
    with app.app_context():
        print("App context established")
        from db import db
        from models import User
        # Try to create a user
        test_user = User(email="test@example.com", fullName="Test", role="donor")
        test_user.set_password("TestPass123")
        print("User password hashed successfully")
        print("User object created:", test_user.to_dict())
except Exception as e:
    import traceback
    print("ERROR:", e)
    traceback.print_exc()
