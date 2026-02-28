import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from app import create_app
from db import db
from models import User

app = create_app()
with app.app_context():
    # reset database
    db.drop_all()
    db.create_all()
    print("Database reset and tables created")
    
    # Test registration via client
    client = app.test_client()
    
    # Test 1: Valid registration
    resp = client.post('/api/auth/register', json={
        'email': 'test@prod.com',
        'password': 'TestPass123',
        'fullName': 'Test User',
        'role': 'donor'
    })
    print(f"Registration response: {resp.status_code}")
    print(f"Response body: {resp.get_json()}")
    
    if resp.status_code == 201:
        user_data = resp.get_json()
        token = user_data.get('token')
        print(f"Token generated: {token[:20]}...")
        
        # Test 2: Login with hashed password
        resp2 = client.post('/api/auth/login', json={
            'email': 'test@prod.com',
            'password': 'TestPass123'
        })
        print(f"\nLogin response: {resp2.status_code}")
        print(f"Login body: {resp2.get_json()}")
        
        # Test 3: Protected endpoint (requires token)
        resp3 = client.get('/api/auth/user/1', headers={
            'Authorization': f'Bearer {token}'
        })
        print(f"\nProtected endpoint response: {resp3.status_code}")
        print(f"Protected response: {resp3.get_json()}")
