import json
from sqlalchemy.orm import Session
from app.database import Base, engine, SessionLocal
from app.config import settings
from app.models.user import User
from app.models.recycling_center import RecyclingCenter
from app.models.notification import Notification
from app.models.ai_model_log import AIModelLog
from app.core.security import get_password_hash

INITIAL_CENTERS = [
    {
        "name": "GreenCycle Municipal Resource Recovery Depot",
        "address": "104 Eco Boulevard, Sector 4",
        "city": "Metropolis",
        "state": "State",
        "postal_code": "500001",
        "latitude": 17.385044,
        "longitude": 78.486671,
        "phone": "+1-800-555-0199",
        "website": "https://greencycle-hub.org",
        "operating_hours": "Mon-Sat: 08:00 - 18:00, Sun: Closed",
        "accepted_materials": json.dumps(["Plastic", "Paper & Cardboard", "Glass", "Metal", "E-Waste"]),
        "is_municipal": True,
        "rating": 4.8
    },
    {
        "name": "EcoSmart Community Waste & Composting Center",
        "address": "45 Greenway Avenue",
        "city": "Metropolis",
        "state": "State",
        "postal_code": "500002",
        "latitude": 17.4065,
        "longitude": 78.4772,
        "phone": "+1-800-555-0244",
        "website": "https://ecosmart-waste.org",
        "operating_hours": "Mon-Sun: 07:00 - 19:00",
        "accepted_materials": json.dumps(["Organic / Compost", "Plastic", "Paper & Cardboard"]),
        "is_municipal": True,
        "rating": 4.6
    },
    {
        "name": "TechReclaim Certified E-Waste Facility",
        "address": "88 Silicon Park, Industrial Area",
        "city": "Metropolis",
        "state": "State",
        "postal_code": "500081",
        "latitude": 17.4435,
        "longitude": 78.3772,
        "phone": "+1-800-555-0377",
        "website": "https://techreclaim-ewaste.com",
        "operating_hours": "Mon-Fri: 09:00 - 17:00, Sat: 10:00 - 14:00",
        "accepted_materials": json.dumps(["E-Waste", "Metal", "Hazardous"]),
        "is_municipal": False,
        "rating": 4.9
    },
    {
        "name": "ClearStream Glass & Metal Depository",
        "address": "12 Harbor View Road",
        "city": "Metropolis",
        "state": "State",
        "postal_code": "500016",
        "latitude": 17.4399,
        "longitude": 78.4983,
        "phone": "+1-800-555-0488",
        "website": "https://clearstream-depot.org",
        "operating_hours": "Tue-Sun: 08:30 - 17:30",
        "accepted_materials": json.dumps(["Glass", "Metal", "Plastic"]),
        "is_municipal": True,
        "rating": 4.5
    },
    {
        "name": "SafeHazard Chemical & Battery Drop Depot",
        "address": "210 Civic Depot Ring Road",
        "city": "Metropolis",
        "state": "State",
        "postal_code": "500028",
        "latitude": 17.3912,
        "longitude": 78.4285,
        "phone": "+1-800-555-0599",
        "website": "https://safehazard-depot.gov",
        "operating_hours": "Wed-Sat: 09:00 - 16:00",
        "accepted_materials": json.dumps(["Hazardous", "E-Waste"]),
        "is_municipal": True,
        "rating": 4.7
    }
]


def init_db(db: Session = None):
    """
    Creates all database tables and seeds initial administrative
    and recycling center records if not already existing.
    """
    Base.metadata.create_all(bind=engine)

    close_session = False
    if db is None:
        db = SessionLocal()
        close_session = True

    try:
        # 1. Seed Admin User
        admin = db.query(User).filter(User.email == settings.DEFAULT_ADMIN_EMAIL).first()
        if not admin:
            admin = User(
                email=settings.DEFAULT_ADMIN_EMAIL,
                hashed_password=get_password_hash(settings.DEFAULT_ADMIN_PASSWORD),
                full_name=settings.DEFAULT_ADMIN_NAME,
                role="ADMIN",
                is_active=True,
                sustainability_score=85,
                eco_tier="Earth Champion",
                current_streak=7,
                total_scans_count=18,
                total_recycled_count=16,
                diverted_weight_kg=4.2,
                carbon_saved_kg=9.8
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)

            # Add welcome notification
            welcome_admin_note = Notification(
                user_id=admin.id,
                title="System Initialized",
                message="Welcome to WasteWise AI Admin Dashboard. You have full administrative privileges.",
                notification_type="system"
            )
            db.add(welcome_admin_note)
            db.commit()

        # 2. Seed Standard Demo User
        demo_user = db.query(User).filter(User.email == "user@wastewise.ai").first()
        if not demo_user:
            demo_user = User(
                email="user@wastewise.ai",
                hashed_password=get_password_hash("UserPassword123!"),
                full_name="Alex Green",
                role="USER",
                is_active=True,
                sustainability_score=35,
                eco_tier="Eco Explorer",
                current_streak=3,
                total_scans_count=5,
                total_recycled_count=4,
                diverted_weight_kg=1.1,
                carbon_saved_kg=2.4
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)

            welcome_user_note = Notification(
                user_id=demo_user.id,
                title="Welcome to WasteWise AI! 🌱",
                message="Start scanning waste items to discover correct disposal instructions and earn sustainability points.",
                notification_type="achievement"
            )
            db.add(welcome_user_note)
            db.commit()

        # 3. Seed Recycling Centers
        for c in INITIAL_CENTERS:
            exists = db.query(RecyclingCenter).filter(RecyclingCenter.name == c["name"]).first()
            if not exists:
                center = RecyclingCenter(
                    name=c["name"],
                    address=c["address"],
                    city=c["city"],
                    state=c["state"],
                    postal_code=c["postal_code"],
                    latitude=c["latitude"],
                    longitude=c["longitude"],
                    phone=c["phone"],
                    website=c["website"],
                    operating_hours=c["operating_hours"],
                    accepted_materials=c["accepted_materials"],
                    is_municipal=c["is_municipal"],
                    rating=c["rating"],
                    is_active=True
                )
                db.add(center)
        db.commit()

        # 4. Seed Initial AI Model Log
        ai_log = db.query(AIModelLog).first()
        if not ai_log:
            init_log = AIModelLog(
                model_name="WasteWise-VisionNet",
                model_version="v1.2.0",
                action="system_init",
                confidence_threshold=settings.AI_CONFIDENCE_THRESHOLD,
                status="success",
                details="Initial model service registered and calibrated across 8 waste material classes."
            )
            db.add(init_log)
            db.commit()

    finally:
        if close_session:
            db.close()


if __name__ == "__main__":
    init_db()
    print("Database initialization and seeding completed successfully.")
