"""
Get real statistics from the database to update the frontend
"""
import sys
sys.path.insert(0, 'c:\\Smart BloodBank\\backend')

from app import create_app, db
from models import User, Donor, Receiver

app = create_app()

with app.app_context():
    # Count registered donors (users with role='donor' who have donor profile)
    registered_donors = db.session.query(Donor).count()
    
    # Count requests served (completed receiver requests)
    requests_served = db.session.query(Receiver).filter(
        Receiver.status == 'donated'
    ).count()
    
    # Calculate lives impacted (assuming 3 lives per blood unit, 2 units per request)
    total_units_donated = db.session.query(Receiver).filter(
        Receiver.status == 'donated'
    ).with_entities(db.func.sum(Receiver.units)).scalar() or 0
    
    lives_impacted = int(total_units_donated * 3)  # 3 lives per unit
    
    # Total users
    total_users = db.session.query(User).count()
    total_donors = db.session.query(User).filter(User.role == 'donor').count()
    total_receivers = db.session.query(User).filter(User.role == 'receiver').count()
    
    print("\n" + "="*60)
    print("SMARTBLOODBANK - REAL STATISTICS FROM DATABASE")
    print("="*60)
    print(f"\n✅ Registered Donors: {registered_donors:,}")
    print(f"✅ Requests Served: {requests_served:,}")
    print(f"✅ Lives Impacted: {lives_impacted:,}")
    
    print(f"\n📊 Detailed Breakdown:")
    print(f"   Total Users: {total_users:,}")
    print(f"   - Donors: {total_donors:,}")
    print(f"   - Receivers: {total_receivers:,}")
    print(f"   Total Units Donated: {total_units_donated:,}")
    
    print("\n" + "="*60)
    print(f"Update these values in LandingPage.tsx and About.tsx:")
    print("="*60)
    print(f"Registered Donors: {registered_donors:,}+")
    print(f"Requests Served: {requests_served:,}+")
    print(f"Lives Impacted: {lives_impacted:,}+")
    print("="*60 + "\n")
