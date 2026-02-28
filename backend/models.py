from db import db
from datetime import datetime
import bcrypt
import jwt
import os


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    fullName = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(200), unique=True, nullable=False)
    passwordHash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False)  # 'donor', 'receiver', 'admin'
    emailVerified = db.Column(db.Boolean, default=False)
    createdAt = db.Column(db.DateTime, default=datetime.utcnow)
    updatedAt = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def set_password(self, plain_password: str):
        """Hash and store password."""
        self.passwordHash = bcrypt.hashpw(plain_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, plain_password: str) -> bool:
        """Verify password against hash."""
        return bcrypt.checkpw(plain_password.encode('utf-8'), self.passwordHash.encode('utf-8'))

    def generate_token(self, expires_in=86400) -> str:
        """Generate JWT token valid for expires_in seconds (default 24h)."""
        secret = os.environ.get('JWT_SECRET', 'dev-secret-change-in-production')
        payload = {'id': self.id, 'email': self.email, 'role': self.role}
        return jwt.encode(payload, secret, algorithm='HS256')

    @staticmethod
    def verify_token(token: str):
        """Decode JWT token and return user dict or None."""
        try:
            secret = os.environ.get('JWT_SECRET', 'dev-secret-change-in-production')
            return jwt.decode(token, secret, algorithms=['HS256'])
        except jwt.InvalidTokenError:
            return None

    def to_dict(self):
        return {
            "id": self.id,
            "fullName": self.fullName,
            "email": self.email,
            "role": self.role,
            "emailVerified": self.emailVerified,
            "createdAt": self.createdAt.isoformat() if self.createdAt else None,
        }

    @staticmethod
    def from_dict(data: dict):
        user = User(
            fullName=data.get("fullName"),
            email=data.get("email"),
            role=data.get("role"),
        )
        if data.get("password"):
            user.set_password(data.get("password"))
        return user


class Donor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    userId = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    fullName = db.Column(db.String(200))
    age = db.Column(db.String(10))
    gender = db.Column(db.String(20))
    bloodGroup = db.Column(db.String(10))
    weight = db.Column(db.String(10))
    city = db.Column(db.String(100))
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    phone = db.Column(db.String(20))
    lastDonationDate = db.Column(db.String(50))
    availabilityStatus = db.Column(db.String(50), default="available")
    chronicIllness = db.Column(db.String(20))
    recentSurgery = db.Column(db.String(20))
    medication = db.Column(db.String(20))
    infectionHistory = db.Column(db.String(20))
    doctorAdvised = db.Column(db.String(20))
    consent = db.Column(db.Boolean, default=False)
    createdAt = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.userId,
            "fullName": self.fullName,
            "age": self.age,
            "gender": self.gender,
            "bloodGroup": self.bloodGroup,
            "weight": self.weight,
            "city": self.city,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "phone": self.phone,
            "lastDonationDate": self.lastDonationDate,
            "availabilityStatus": self.availabilityStatus,
            "chronicIllness": self.chronicIllness,
            "recentSurgery": self.recentSurgery,
            "medication": self.medication,
            "infectionHistory": self.infectionHistory,
            "doctorAdvised": self.doctorAdvised,
            "consent": self.consent,
            "createdAt": self.createdAt.isoformat() if self.createdAt else None,
        }

    @staticmethod
    def from_dict(data: dict):
        return Donor(
            userId=data.get("userId"),
            fullName=data.get("fullName"),
            age=data.get("age"),
            gender=data.get("gender"),
            bloodGroup=data.get("bloodGroup"),
            weight=data.get("weight"),
            city=data.get("city"),
            latitude=data.get("latitude"),
            longitude=data.get("longitude"),
            phone=data.get("phone"),
            lastDonationDate=data.get("lastDonationDate"),
            availabilityStatus=data.get("availabilityStatus", "available"),
            chronicIllness=data.get("chronicIllness"),
            recentSurgery=data.get("recentSurgery"),
            medication=data.get("medication"),
            infectionHistory=data.get("infectionHistory"),
            doctorAdvised=data.get("doctorAdvised"),
            consent=bool(data.get("consent")),
        )


class Receiver(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    userId = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    donorId = db.Column(db.Integer, db.ForeignKey("donor.id"), nullable=True)  # donor who responded
    name = db.Column(db.String(200))
    bloodGroup = db.Column(db.String(10))
    units = db.Column(db.Integer)
    city = db.Column(db.String(100))
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    contact = db.Column(db.String(200))
    status = db.Column(db.String(50), default="pending")  # pending, matched, donated
    createdAt = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.userId,
            "donorId": self.donorId,
            "name": self.name,
            "bloodGroup": self.bloodGroup,
            "units": self.units,
            "city": self.city,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "contact": self.contact,
            "status": self.status,
            "createdAt": self.createdAt.isoformat() if self.createdAt else None,
        }

    @staticmethod
    def from_dict(data: dict):
        return Receiver(
            userId=data.get("userId"),
            donorId=data.get("donorId"),
            name=data.get("name") or data.get("patientName"),
            bloodGroup=data.get("bloodGroup"),
            units=int(data.get("units") or 0),
            city=data.get("city") or data.get("location"),
            latitude=data.get("latitude"),
            longitude=data.get("longitude"),
            contact=data.get("contact") or data.get("hospitalName"),
            status=data.get("status", "pending"),
        )


# new Camp model
class BloodBank(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    userId = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)
    name = db.Column(db.String(200))
    city = db.Column(db.String(100))
    address = db.Column(db.String(200))
    phone = db.Column(db.String(50))
    verified = db.Column(db.Boolean, default=True)
    createdAt = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.userId,
            "name": self.name,
            "city": self.city,
            "address": self.address,
            "phone": self.phone,
            "verified": self.verified,
            "createdAt": self.createdAt.isoformat() if self.createdAt else None,
        }

    @staticmethod
    def from_dict(data: dict):
        return BloodBank(
            userId=data.get("userId"),
            name=data.get("name"),
            city=data.get("city"),
            address=data.get("address"),
            phone=data.get("phone"),
            verified=data.get("verified", True),
        )


class Camp(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    userId = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)
    name = db.Column(db.String(200))
    city = db.Column(db.String(100))
    address = db.Column(db.String(200))
    date = db.Column(db.String(50))
    verified = db.Column(db.Boolean, default=True)
    createdAt = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "userId": self.userId,
            "name": self.name,
            "city": self.city,
            "address": self.address,
            "date": self.date,
            "verified": self.verified,
            "createdAt": self.createdAt.isoformat() if self.createdAt else None,
        }

    @staticmethod
    def from_dict(data: dict):
        return Camp(
            userId=data.get("userId"),
            name=data.get("name"),
            city=data.get("city"),
            address=data.get("address"),
            date=data.get("date"),
            verified=data.get("verified", True),
        )

