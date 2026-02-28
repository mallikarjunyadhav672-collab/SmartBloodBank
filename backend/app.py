import os
from functools import wraps
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_migrate import Migrate
from dotenv import load_dotenv

from db import db
from models import User, Donor, Receiver, Camp, BloodBank
from mail import mail, send_verification_email, send_request_notification, send_donation_confirmation
from schemas import validate_schema, UserRegisterSchema, UserLoginSchema, DonorSchema, ReceiverSchema, ValidationError

from sqlalchemy import text
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderServiceError
import math
from datetime import datetime, timedelta

# initialize geocoder once
geolocator = Nominatim(user_agent="smartblood_app")

def geocode_location(location: str):
    if not location:
        return None, None
    try:
        loc = geolocator.geocode(location)
        if loc:
            return loc.latitude, loc.longitude
    except GeocoderServiceError as e:
        # geocoding failures shouldn't crash the API
        # app may not exist yet if called at import-time, so use print
        print(f"Geocoding error: {e}")
    return None, None


def haversine(lat1, lon1, lat2, lon2):
    """Return distance between two points in kilometers."""
    # earth radius in km
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def token_required(f):
    """Decorator to require JWT token in Authorization header."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            try:
                token = request.headers['Authorization'].split(" ")[1]
            except IndexError:
                return jsonify({"error": "Invalid token format"}), 401
        if not token:
            return jsonify({"error": "Token missing"}), 401
        user_data = User.verify_token(token)
        if not user_data:
            return jsonify({"error": "Invalid or expired token"}), 401
        request.user_id = user_data.get('id')
        request.user_role = user_data.get('role')
        return f(*args, **kwargs)
    return decorated


def role_required(*roles):
    """Decorator to require specific roles."""
    def decorator(f):
        @wraps(f)
        @token_required
        def decorated(*args, **kwargs):
            if request.user_role not in roles:
                return jsonify({"error": "Insufficient permissions"}), 403
            return f(*args, **kwargs)
        return decorated
    return decorator

# load .env file
load_dotenv()


def create_app():
    app = Flask(__name__)
    # allow requests from any origin (for development); restrict in production
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Database configuration (SQLite for development) - read from .env if present
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URL", "sqlite:///smartblood.db"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Email configuration
    app.config["MAIL_SERVER"] = os.environ.get("MAIL_SERVER")
    app.config["MAIL_PORT"] = int(os.environ.get("MAIL_PORT", 587))
    app.config["MAIL_USE_TLS"] = os.environ.get("MAIL_USE_TLS", True)
    app.config["MAIL_USERNAME"] = os.environ.get("MAIL_USERNAME")
    app.config["MAIL_PASSWORD"] = os.environ.get("MAIL_PASSWORD")
    app.config["MAIL_DEFAULT_SENDER"] = os.environ.get("MAIL_DEFAULT_SENDER", "noreply@smartbloodbank.com")

    db.init_app(app)
    Migrate(app, db)
    mail.init_app(app)

    # ensure necessary schema columns are present before serving requests
    # this block runs early during app creation so subsequent hits see correct
    # structure. we handle donorId + latitude/longitude columns for donors &
    # receivers.
    with app.app_context():
        cols_to_check = [
            ("receiver", "donorId", "INTEGER"),
            ("donor", "latitude", "REAL"),
            ("donor", "longitude", "REAL"),
            ("receiver", "latitude", "REAL"),
            ("receiver", "longitude", "REAL"),
        ]
        for table, column, col_type in cols_to_check:
            try:
                db.session.execute(f"SELECT {column} FROM {table} LIMIT 1")
            except Exception:
                app.logger.info(f"Adding missing {column} column to {table} at startup")
                try:
                    db.session.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {col_type}"))
                    db.session.commit()
                except Exception as e:
                    app.logger.error(f"Failed to add column {column} to {table}: {e}")
            finally:
                db.session.rollback()

    @app.route("/favicon.ico")
    def favicon():
        """Serve empty favicon to prevent 404 errors."""
        return "", 204

    @app.route("/api/ping", methods=["GET"])
    def ping():
        """Basic health check endpoint."""
        return jsonify({"message": "pong"})

    # ==================== AUTH ENDPOINTS ====================
    
    @app.route("/api/auth/register", methods=["POST"])
    def register():
        """Register a new user (donor or receiver)."""
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "invalid JSON"}), 400

            # Validate input
            validated = validate_schema(UserRegisterSchema, data)

            # Check if user exists
            existing = User.query.filter_by(email=validated['email']).first()
            if existing:
                return jsonify({"error": "Email already registered"}), 409

            # Create user with hashed password
            user = User(
                email=validated['email'],
                fullName=validated['fullName'],
                role=validated['role'],
            )
            user.set_password(validated['password'])
            db.session.add(user)
            db.session.commit()

            # Send verification email (async in production)
            send_verification_email(user)

            return jsonify({
                "message": "Registration successful. Check your email to verify.",
                "user": user.to_dict(),
                "token": user.generate_token()
            }), 201

        except ValidationError as e:
            return jsonify({"error": e.messages}), 400
        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Registration error: {e}")
            return jsonify({"error": "Registration failed"}), 500

    @app.route("/api/auth/login", methods=["POST"])
    def login():
        """Login user and return JWT token."""
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "invalid JSON"}), 400

            validated = validate_schema(UserLoginSchema, data)

            user = User.query.filter_by(email=validated['email']).first()
            if not user:
                return jsonify({"error": "Email not registered"}), 404
            
            if not user.check_password(validated['password']):
                return jsonify({"error": "Incorrect password"}), 401

            return jsonify({
                "message": "Login successful",
                "user": user.to_dict(),
                "token": user.generate_token()
            }), 200

        except ValidationError as e:
            return jsonify({"error": e.messages}), 400
        except Exception as e:
            app.logger.error(f"Login error: {e}")
            return jsonify({"error": "Login failed"}), 500

    @app.route("/api/auth/user/<int:user_id>", methods=["GET"])
    @token_required
    def get_user(user_id):
        """Get user by ID (requires token)."""
        if request.user_id != user_id and request.user_role != 'admin':
            return jsonify({"error": "Forbidden"}), 403
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify(user.to_dict()), 200

    @app.route("/api/auth/verify-email", methods=["POST"])
    def verify_email():
        """Verify email using token."""
        try:
            data = request.get_json()
            token = data.get('token')
            if not token:
                return jsonify({"error": "Token required"}), 400
            user_data = User.verify_token(token)
            if not user_data:
                return jsonify({"error": "Invalid or expired token"}), 401
            user = User.query.get(user_data['id'])
            if not user:
                return jsonify({"error": "User not found"}), 404
            user.emailVerified = True
            db.session.commit()
            return jsonify({"message": "Email verified"}), 200
        except Exception as e:
            app.logger.error(f"Email verification error: {e}")
            return jsonify({"error": "Verification failed"}), 500


    # ==================== DONOR ENDPOINTS ====================

    @app.route("/api/donors", methods=["GET", "POST"])
    def donors_route():
        if request.method == "POST":
            try:
                data = request.get_json()
                if not data:
                    return jsonify({"error": "invalid JSON"}), 400

                # Validate input
                validated = validate_schema(DonorSchema, data)

                # check if donor profile already exists for this user
                existing = Donor.query.filter_by(userId=validated['userId']).first()
                if existing:
                    # update existing record
                    for key, value in validated.items():
                        if hasattr(existing, key) and key != 'userId':
                            setattr(existing, key, value)
                    # try geocoding if coordinates missing but city provided
                    if (not existing.latitude or not existing.longitude) and existing.city:
                        lat, lon = geocode_location(existing.city)
                        if lat and lon:
                            existing.latitude = existing.latitude or lat
                            existing.longitude = existing.longitude or lon
                    db.session.commit()
                    return jsonify({"donor": existing.to_dict(), "updated": True}), 200

                donor = Donor.from_dict(validated)
                # geocode city if lat/lon not supplied
                if (donor.latitude is None or donor.longitude is None) and donor.city:
                    lat, lon = geocode_location(donor.city)
                    if lat and lon:
                        donor.latitude = donor.latitude or lat
                        donor.longitude = donor.longitude or lon
                db.session.add(donor)
                db.session.commit()
                return jsonify({"donor": donor.to_dict(), "updated": False}), 201
            except ValidationError as e:
                return jsonify({"error": e.messages}), 400
            except Exception as e:
                db.session.rollback()
                app.logger.error(f"Donor creation error: {e}")
                return jsonify({"error": f"Failed to create donor: {str(e)}"}), 400
        # GET
        donors = Donor.query.all()
        return jsonify([d.to_dict() for d in donors])


    @app.route("/api/donors/by-user/<int:user_id>", methods=["GET"])
    def donor_by_user(user_id):
        """Get donor profile for a user."""
        donor = Donor.query.filter_by(userId=user_id).first()
        if not donor:
            return jsonify({"error": "Donor not found"}), 404
        return jsonify(donor.to_dict()), 200

    @app.route("/api/receivers", methods=["GET", "POST"])
    def receivers_route():
        if request.method == "POST":
            data = request.get_json()
            if not data:
                return jsonify({"error": "invalid JSON"}), 400
            try:
                # Validate input
                validated = validate_schema(ReceiverSchema, data)
                
                receiver = Receiver.from_dict(validated)
                # geocode if coordinates missing
                if (receiver.latitude is None or receiver.longitude is None) and receiver.city:
                    lat, lon = geocode_location(receiver.city)
                    if lat and lon:
                        receiver.latitude = receiver.latitude or lat
                        receiver.longitude = receiver.longitude or lon
                db.session.add(receiver)
                db.session.commit()
                return jsonify(receiver.to_dict()), 201
            except ValidationError as e:
                return jsonify({"error": e.messages}), 400
            except Exception as e:
                db.session.rollback()
                # handle case where SQLite table lacks donorId column
                msg = str(e)
                if ("no such column" in msg or "has no column" in msg) and "donorId" in msg:
                    try:
                        app.logger.info("Adding missing donorId column to receiver table")
                        from sqlalchemy import text
                        db.session.execute(text("ALTER TABLE receiver ADD COLUMN donorId INTEGER"))
                        db.session.commit()
                        receiver = Receiver.from_dict(validated)
                        db.session.add(receiver)
                        db.session.commit()
                        return jsonify(receiver.to_dict()), 201
                    except Exception as inner:
                        db.session.rollback()
                        return jsonify({"error": f"Migration failed: {inner}"}), 500
                app.logger.error(f"Receiver creation error: {e}")
                return jsonify({"error": f"Failed to create receiver: {msg}"}), 400
        receivers = Receiver.query.all()
        return jsonify([r.to_dict() for r in receivers])


    @app.route("/api/receivers/by-user/<int:user_id>", methods=["GET"])
    def receiver_by_user(user_id):
        """Get receiver requests for a user."""
        try:
            receivers = Receiver.query.filter_by(userId=user_id).all()
        except Exception as e:
            msg = str(e)
            if ("no such column" in msg or "has no column" in msg) and "donorId" in msg:
                from sqlalchemy import text
                app.logger.info("Adding missing donorId column inside receiver_by_user")
                db.session.execute(text("ALTER TABLE receiver ADD COLUMN donorId INTEGER"))
                db.session.commit()
                receivers = Receiver.query.filter_by(userId=user_id).all()
            else:
                raise
        return jsonify([r.to_dict() for r in receivers])

    def send_notification(to_email: str, subject: str, body: str):
        # stub function - in production integrate with SMTP or SMS service
        app.logger.info(f"Notification to {to_email}: {subject} - {body}")

    @app.route("/api/receivers/<int:request_id>", methods=["GET", "PUT"])
    def receiver_detail(request_id):
        """Get or update a receiver request.
        PUT may include `status` and/or `donorId` to capture a donor response.
        """
        try:
            receiver = Receiver.query.get(request_id)
            if not receiver:
                return jsonify({"error": "Request not found"}), 404
            old_status = receiver.status
            
            if request.method == "PUT":
                data = request.get_json() or {}
                if data.get("status"):
                    receiver.status = data.get("status")
                if data.get("donorId") is not None:
                    receiver.donorId = data.get("donorId")
                db.session.commit()
                
                # if donation completed, update donor's last donation date
                if receiver.status == "donated" and receiver.donorId:
                    donor = Donor.query.get(receiver.donorId)
                    if donor:
                        donor.lastDonationDate = datetime.now().strftime('%Y-%m-%d')
                        db.session.commit()
                        # send thank you email
                        donor_user = User.query.get(donor.userId)
                        if donor_user:
                            send_donation_confirmation(donor_user.email, receiver.name)
                
                # send notifications when status changes
                if old_status != receiver.status and receiver.status == "matched":
                    receiver_user = User.query.get(receiver.userId)
                    donor = Donor.query.get(receiver.donorId) if receiver.donorId else None
                    if receiver_user and donor:
                        send_request_notification(receiver_user.email, donor.fullName, receiver.bloodGroup, receiver.units)
            
            return jsonify(receiver.to_dict()), 200
        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Receiver detail error: {e}")
            return jsonify({"error": f"Failed to update receiver: {str(e)}"}), 400

    # ==================== STATS & PREDICTION ENDPOINTS ====================
    @app.route("/api/stats", methods=["GET"])
    def stats_route():
        """Return dashboard statistics."""
        total_donors = Donor.query.count()
        active_requests = Receiver.query.filter_by(status="pending").count()
        unique_blood_groups = len(set(d.bloodGroup for d in Donor.query.all() if d.bloodGroup))
        return jsonify({
            "totalDonors": total_donors,
            "activeRequests": active_requests,
            "uniqueBloodGroups": unique_blood_groups,
            "emergencyAlerts": 0,
        })

    def _location_matches(donor_loc: str, search_loc: str) -> bool:
        """Loose hierarchical comparison of location strings.
        Treats values as comma/space separated tokens and considers a match when
        any token overlaps. This lets receivers enter village/mandal/district/state
        and still locate nearby donors even if the city name differs.
        """
        if not donor_loc or not search_loc:
            return False
        # normalize and split into tokens
        def tokens(s: str):
            return [p.strip().lower() for p in s.replace(",", " ").split() if p.strip()]
        d_parts = tokens(donor_loc)
        s_parts = tokens(search_loc)
        # match if any search token appears in donor tokens or vice versa
        return any(p in d_parts for p in s_parts) or any(p in s_parts for p in d_parts)

    @app.route("/api/donors/search", methods=["GET"])
    def search_donors():
        """Search donors by blood group and location.
        Supports numeric distance if latitude/longitude or city is provided; falls back
        to fuzzy token matching otherwise.
        Query parameters:
        - bloodGroup
        - city (string to geocode)
        - lat, lon (float) specify explicit coordinates
        """
        blood_group = request.args.get("bloodGroup")
        city = request.args.get("city")
        lat = request.args.get("lat", type=float)
        lon = request.args.get("lon", type=float)

        query = Donor.query
        if blood_group:
            query = query.filter_by(bloodGroup=blood_group)
        donors = query.all()

        # if we have a city but no explicit coords, attempt geocode
        if (lat is None or lon is None) and city:
            g_lat, g_lon = geocode_location(city)
            if g_lat is not None and g_lon is not None:
                lat, lon = g_lat, g_lon

        result = []
        for d in donors:
            dto = d.to_dict()
            # compute distance if we have a base point and donor coordinates
            if lat is not None and lon is not None and d.latitude is not None and d.longitude is not None:
                dto["distance"] = haversine(lat, lon, d.latitude, d.longitude)
            elif city:
                # fallback to fuzzy token score
                dto["distance"] = sum(
                    1
                    for tok in set((d.city or "").lower().split())
                    if tok in city.lower()
                )
            else:
                dto["distance"] = None
            result.append(dto)

        # sort by numeric distance if available
        result.sort(key=lambda x: x.get("distance") if x.get("distance") is not None else float("inf"))
        return jsonify(result)

    @app.route("/api/donors/by-city/<city>", methods=["GET"])
    def donors_by_city(city):
        """Get donors roughly matching a location token; may include distance if
        coordinates are available.
        This is mostly sugar on top of /api/donors/search and preserves backward
        compatibility.
        """
        # simply reuse search logic by calling internally with city parameter
        # note: we cannot call request context directly so replicate minimal logic
        query = Donor.query.filter(Donor.availabilityStatus == "available")
        donors = query.all()
        result = []
        for d in donors:
            if not _location_matches(d.city or "", city):
                continue
            dto = d.to_dict()
            # attempt to geocode city for sorting
            lat, lon = geocode_location(city)
            if lat is not None and lon is not None and d.latitude is not None and d.longitude is not None:
                dto["distance"] = haversine(lat, lon, d.latitude, d.longitude)
            else:
                dto["distance"] = sum(
                    1
                    for tok in set((d.city or "").lower().split())
                    if tok in city.lower()
                )
            result.append(dto)
        result.sort(key=lambda x: x.get("distance") if x.get("distance") is not None else float("inf"))
        return jsonify(result)

    @app.route("/api/blood-inventory", methods=["GET"])
    def blood_inventory():
        """Get blood group inventory (count by blood group)."""
        donors = Donor.query.all()
        inventory = {}
        for donor in donors:
            blood_group = donor.bloodGroup or "Unknown"
            if blood_group not in inventory:
                inventory[blood_group] = 0
            inventory[blood_group] += 1
        return jsonify(inventory)

    # ==================== STATIC DATA: BLOOD BANKS ====================
    # blood banks remain hardcoded for now
    # blood banks stored in database; only verified entries are returned
    @app.route("/api/blood-banks", methods=["GET", "POST"])
    def blood_banks():
        if request.method == "POST":
            try:
                data = request.get_json()
                if not data:
                    return jsonify({"error": "invalid JSON"}), 400
                user_id = data.get("userId")
                user = User.query.get(user_id) if user_id else None
                if not user or user.role != "admin":
                    return jsonify({"error": "Unauthorized"}), 403
                bank = BloodBank.from_dict(data)
                db.session.add(bank)
                db.session.commit()
                return jsonify(bank.to_dict()), 201
            except Exception as e:
                db.session.rollback()
                return jsonify({"error": str(e)}), 400
        city = request.args.get("city")
        query = BloodBank.query.filter_by(verified=True)
        if city:
            query = query.filter_by(city=city)
        banks = query.all()
        return jsonify([b.to_dict() for b in banks])

    # camps are stored in the database and managed by admin
    @app.route("/api/camps", methods=["GET", "POST"])
    def camps_route():
        if request.method == "POST":
            try:
                data = request.get_json()
                if not data:
                    return jsonify({"error": "invalid JSON"}), 400
                # ensure requester is admin (simple check using userId)
                user_id = data.get("userId")
                user = User.query.get(user_id) if user_id else None
                if not user or user.role != "admin":
                    return jsonify({"error": "Unauthorized"}), 403
                camp = Camp.from_dict(data)
                camp.userId = user_id
                db.session.add(camp)
                db.session.commit()
                return jsonify(camp.to_dict()), 201
            except Exception as e:
                db.session.rollback()
                return jsonify({"error": str(e)}), 400
        city = request.args.get("city")
        query = Camp.query.filter_by(verified=True)
        if city:
            query = query.filter_by(city=city)
        camps = query.all()
        return jsonify([c.to_dict() for c in camps])

    # alias for backwards compatibility
    @app.route("/api/donation-camps", methods=["GET"])
    def donation_camps_alias():
        # delegate to camps_route for GET
        return camps_route()

    # ==================== DONOR RESPONSE ROUTES ====================
    @app.route("/api/receivers/by-donor/<int:donor_id>", methods=["GET"])
    def receivers_by_donor(donor_id):
        """Get all receiver requests that a particular donor has responded to."""
        receivers = Receiver.query.filter_by(donorId=donor_id).all()
        return jsonify([r.to_dict() for r in receivers])

    @app.route("/api/camps/<int:camp_id>", methods=["PUT", "DELETE"])
    def camp_detail(camp_id):
        camp = Camp.query.get(camp_id)
        if not camp:
            return jsonify({"error": "Camp not found"}), 404
        if request.method == "PUT":
            data = request.get_json()
            for key, value in data.items():
                if hasattr(camp, key):
                    setattr(camp, key, value)
            db.session.commit()
        elif request.method == "DELETE":
            db.session.delete(camp)
            db.session.commit()
        return jsonify(camp.to_dict()), 200

    @app.route("/api/blood-demand-prediction", methods=["GET"])
    def blood_demand_prediction():
        """Predict blood group demand based on receiver requests."""
        requests = Receiver.query.all()
        demand = {}
        
        for req in requests:
            bg = req.bloodGroup or "Unknown"
            if bg not in demand:
                demand[bg] = {"count": 0, "units": 0}
            demand[bg]["count"] += 1
            demand[bg]["units"] += req.units or 0
        
        # Calculate prediction with inventory
        inventory = {}
        donors = Donor.query.all()
        for donor in donors:
            bg = donor.bloodGroup or "Unknown"
            inventory[bg] = inventory.get(bg, 0) + 1
        
        prediction = {}
        all_blood_groups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
        
        for bg in all_blood_groups:
            demand_count = demand.get(bg, {}).get("count", 0)
            stock = inventory.get(bg, 0)
            
            prediction[bg] = {
                "demand": demand_count,
                "stock": stock,
                "ratio": demand_count / max(stock, 1),
                "priority": "High" if demand_count > stock else ("Medium" if demand_count > 0 else "Low"),
            }
        
        return jsonify(prediction)

    # ==================== ADMIN ENDPOINTS ====================
    
    @app.route("/api/admin/stats", methods=["GET"])
    @role_required('admin')
    def admin_stats():
        """Admin dashboard statistics."""
        try:
            total_users = User.query.count()
            total_donors = Donor.query.count()
            active_requests = Receiver.query.filter_by(status="pending").count()
            matched_requests = Receiver.query.filter_by(status="matched").count()
            completed_donations = Receiver.query.filter_by(status="donated").count()
            
            # Blood group distribution
            blood_groups = {}
            for donor in Donor.query.all():
                bg = donor.bloodGroup or "Unknown"
                blood_groups[bg] = blood_groups.get(bg, 0) + 1
            
            # Recent activity
            recent_reqs = Receiver.query.order_by(Receiver.createdAt.desc()).limit(10).all()
            
            return jsonify({
                "totalUsers": total_users,
                "totalDonors": total_donors,
                "activeRequests": active_requests,
                "matchedRequests": matched_requests,
                "completedDonations": completed_donations,
                "bloodGroupDistribution": blood_groups,
                "recentRequests": [r.to_dict() for r in recent_reqs]
            }), 200
        except Exception as e:
            app.logger.error(f"Admin stats error: {e}")
            return jsonify({"error": "Failed to fetch statistics"}), 500

    @app.route("/api/admin/users", methods=["GET"])
    @role_required('admin')
    def admin_users():
        """List all users with admin filtering."""
        try:
            role = request.args.get('role')
            users = User.query.all()
            if role:
                users = [u for u in users if u.role == role]
            return jsonify([u.to_dict() for u in users]), 200
        except Exception as e:
            app.logger.error(f"Admin users error: {e}")
            return jsonify({"error": "Failed to fetch users"}), 500

    @app.route("/api/admin/user/<int:user_id>/role", methods=["PUT"])
    @role_required('admin')
    def admin_update_role(user_id):
        """Admin can update user role."""
        try:
            data = request.get_json()
            new_role = data.get('role')
            if new_role not in ['donor', 'receiver', 'admin']:
                return jsonify({"error": "Invalid role"}), 400
            user = User.query.get(user_id)
            if not user:
                return jsonify({"error": "User not found"}), 404
            user.role = new_role
            db.session.commit()
            return jsonify({"message": "Role updated", "user": user.to_dict()}), 200
        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Admin role update error: {e}")
            return jsonify({"error": "Failed to update role"}), 500

    @app.route("/api/admin/user/<int:user_id>", methods=["DELETE"])
    @role_required('admin')
    def admin_delete_user(user_id):
        """Admin can delete user and associated data."""
        try:
            user = User.query.get(user_id)
            if not user:
                return jsonify({"error": "User not found"}), 404
            # Delete related records
            Donor.query.filter_by(userId=user_id).delete()
            Receiver.query.filter_by(userId=user_id).delete()
            db.session.delete(user)
            db.session.commit()
            return jsonify({"message": "User deleted"}), 200
        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Admin delete user error: {e}")
            return jsonify({"error": "Failed to delete user"}), 500

    @app.route("/api/admin/user/<int:user_id>/export", methods=["GET"])
    @token_required
    def export_user_data(user_id):
        """User can export their own data."""
        if request.user_id != user_id and request.user_role != 'admin':
            return jsonify({"error": "Forbidden"}), 403
        try:
            user = User.query.get(user_id)
            if not user:
                return jsonify({"error": "User not found"}), 404
            donor = Donor.query.filter_by(userId=user_id).first()
            receivers = Receiver.query.filter_by(userId=user_id).all()
            return jsonify({
                "user": user.to_dict(),
                "donor": donor.to_dict() if donor else None,
                "requests": [r.to_dict() for r in receivers]
            }), 200
        except Exception as e:
            app.logger.error(f"Export user data error: {e}")
            return jsonify({"error": "Failed to export data"}), 500

    return app


if __name__ == "__main__":
    app = create_app()
    # create DB/tables automatically (development only)
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
