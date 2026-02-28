import sys, os
sys.path.insert(0, os.path.dirname(__file__))  # ensure backend package path
from app import create_app, haversine
from db import db
from models import User, Donor, Receiver

app = create_app()
with app.app_context():
    print('dropping and recreating schema')
    db.drop_all()
    db.create_all()
    u = User(email='donor@example.com', password='pw', fullName='Donor', role='donor')
    db.session.add(u); db.session.commit()
    d = Donor(userId=u.id, fullName='Donor', bloodGroup='A+', city='Delhi', latitude=28.6139, longitude=77.2090)
    db.session.add(d); db.session.commit()
    ruser = User(email='rec@example.com', password='pw', fullName='Rec', role='receiver')
    db.session.add(ruser); db.session.commit()
    r = Receiver(userId=ruser.id, name='Pat', bloodGroup='A+', units=1, city='Mumbai', latitude=19.0760, longitude=72.8777)
    db.session.add(r); db.session.commit()
    dist = haversine(d.latitude, d.longitude, r.latitude, r.longitude)
    print('distance Delhi-Mumbai:', dist)
    client = app.test_client()
    resp = client.get('/api/donors/search', query_string={'bloodGroup':'A+','lat':19.0760,'lon':72.8777})
    print('search result payload', resp.get_json())
    print('updating receiver to matched')
    client.put(f'/api/receivers/{r.id}', json={'status':'matched','donorId':d.id})
    print('updating receiver to donated')
    client.put(f'/api/receivers/{r.id}', json={'status':'donated'})
    print('donor after donation', Donor.query.get(d.id).to_dict())
