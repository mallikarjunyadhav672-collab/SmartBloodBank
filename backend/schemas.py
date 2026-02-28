"""Input validation schemas and helpers."""
import re
from marshmallow import Schema, fields, ValidationError, validates


class EmailField(fields.Email):
    """Custom email field with additional validation."""
    def _deserialize(self, value, attr, data, **kwargs):
        if not value:
            return None
        if len(value) > 200:
            raise ValidationError("Email too long")
        return super()._deserialize(value, attr, data, **kwargs)


class PasswordField(fields.String):
    """Password with strength validation."""
    def _deserialize(self, value, attr, data, **kwargs):
        if len(value) < 8:
            raise ValidationError("Password must be at least 8 characters")
        if not re.search(r'[A-Z]', value):
            raise ValidationError("Password must contain uppercase letter")
        if not re.search(r'[a-z]', value):
            raise ValidationError("Password must contain lowercase letter")
        if not re.search(r'[0-9]', value):
            raise ValidationError("Password must contain digit")
        return value


class PhoneField(fields.String):
    """Phone number validation."""
    def _deserialize(self, value, attr, data, **kwargs):
        if not value:
            return None
        cleaned = re.sub(r'\D', '', value)
        if len(cleaned) < 10 or len(cleaned) > 15:
            raise ValidationError("Invalid phone number")
        return value


class UserRegisterSchema(Schema):
    email = EmailField(required=True)
    password = PasswordField(required=True)
    fullName = fields.String(required=True, validate=lambda x: 2 <= len(x) <= 200)
    role = fields.String(required=True, validate=lambda x: x in ['donor', 'receiver', 'admin'])


class UserLoginSchema(Schema):
    email = EmailField(required=True)
    password = fields.String(required=True)


class DonorSchema(Schema):
    userId = fields.Integer(required=True)
    fullName = fields.String(validate=lambda x: len(x) <= 200)
    age = fields.String(validate=lambda x: x in ['18-25', '25-35', '35-45', '45-55', '55+'])
    gender = fields.String(validate=lambda x: x in ['Male', 'Female', 'Other'])
    bloodGroup = fields.String(validate=lambda x: x in ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    weight = fields.String()
    city = fields.String(validate=lambda x: len(x) <= 100)
    latitude = fields.Float(allow_none=True)
    longitude = fields.Float(allow_none=True)
    phone = PhoneField()
    lastDonationDate = fields.Date(allow_none=True)
    availabilityStatus = fields.String(validate=lambda x: x in ['available', 'unavailable'])
    chronicIllness = fields.String(validate=lambda x: x in ['yes', 'no'])
    recentSurgery = fields.String(validate=lambda x: x in ['yes', 'no'])
    medication = fields.String(validate=lambda x: x in ['yes', 'no'])
    infectionHistory = fields.String(validate=lambda x: x in ['yes', 'no'])
    doctorAdvised = fields.String(validate=lambda x: x in ['yes', 'no'])
    consent = fields.Boolean()


class ReceiverSchema(Schema):
    userId = fields.Integer(required=True)
    name = fields.String(required=True, validate=lambda x: 2 <= len(x) <= 200)
    bloodGroup = fields.String(required=True, validate=lambda x: x in ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    units = fields.Integer(required=True, validate=lambda x: 1 <= x <= 10)
    city = fields.String(required=True, validate=lambda x: len(x) <= 100)
    latitude = fields.Float(allow_none=True)
    longitude = fields.Float(allow_none=True)
    contact = fields.String(required=True, validate=lambda x: len(x) <= 200)
    status = fields.String(validate=lambda x: x in ['pending', 'matched', 'donated'])


def validate_schema(schema_class, data):
    """Validate data against schema, raise ValidationError if invalid."""
    schema = schema_class()
    return schema.load(data)
