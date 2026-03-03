from app import create_app, db
from models import User, Donor, Receiver, Notification

app = create_app()
with app.app_context():
    print("=" * 60)
    print("📊 DATABASE SUMMARY")
    print("=" * 60)
    
    users = User.query.count()
    print(f"\n👥 Users: {users}")
    for user in User.query.all()[:5]:
        print(f"   - {user.fullName} ({user.role}) - {user.email}")
    if users > 5:
        print(f"   ... and {users - 5} more")
    
    donors = Donor.query.count()
    print(f"\n🩸 Donors: {donors}")
    for donor in Donor.query.all()[:5]:
        print(f"   - {donor.fullName} ({donor.bloodGroup}) - {donor.city}")
    if donors > 5:
        print(f"   ... and {donors - 5} more")
    
    receivers = Receiver.query.count()
    print(f"\n🏥 Receivers: {receivers}")
    for receiver in Receiver.query.all()[:5]:
        print(f"   - {receiver.name} ({receiver.bloodGroup}) - {receiver.city}")
    if receivers > 5:
        print(f"   ... and {receivers - 5} more")
    
    notifs = Notification.query.count()
    print(f"\n📧 Notifications: {notifs}")
    for notif in Notification.query.all()[:3]:
        print(f"   - {notif.type}: {notif.message}")
    if notifs > 3:
        print(f"   ... and {notifs - 3} more")
    
    print("\n" + "=" * 60)
    print("⚠️  NEW TABLES NOT YET CREATED:")
    print("   - Feedback Records (ratings, comments)")
    print("   - Saved Donors (favorites)")
    print("   - Saved Receivers (favorites)")
    print("   - Search History (tracking)")
    print("   - Donor Stats (ML features)")
    print("\n✨ To create these tables, run:")
    print("   cd backend")
    print("   flask db migrate -m 'Add new feature tables'")
    print("   flask db upgrade")
    print("=" * 60)
