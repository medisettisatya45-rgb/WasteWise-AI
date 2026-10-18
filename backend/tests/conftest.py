import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.core.security import get_password_hash, create_access_token
from app.models.user import User
from app.models.recycling_center import RecyclingCenter

# Use StaticPool with in-memory SQLite so all connections share the same memory DB
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()

    # Seed Admin User
    admin = User(
        email="testadmin@wastewise.ai",
        hashed_password=get_password_hash("AdminSecret123!"),
        full_name="Test Administrator",
        role="ADMIN",
        is_active=True
    )
    session.add(admin)

    # Seed Normal User
    user = User(
        email="testuser@wastewise.ai",
        hashed_password=get_password_hash("UserSecret123!"),
        full_name="Test Regular User",
        role="USER",
        is_active=True,
        sustainability_score=15,
        eco_tier="Seedling",
        total_scans_count=2,
        total_recycled_count=2,
        carbon_saved_kg=0.5,
        diverted_weight_kg=0.2
    )
    session.add(user)

    # Seed Recycling Center
    center = RecyclingCenter(
        name="Test Metro Recycling Center",
        address="100 Eco Road",
        city="TestCity",
        latitude=17.3850,
        longitude=78.4867,
        operating_hours="09:00 - 18:00",
        accepted_materials='["Plastic", "Paper & Cardboard", "Glass", "Metal"]',
        is_municipal=True,
        is_active=True,
        rating=4.7
    )
    session.add(center)

    session.commit()

    yield session

    session.close()
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def user_token(db):
    user = db.query(User).filter(User.email == "testuser@wastewise.ai").first()
    return create_access_token(subject=user.id, role=user.role)


@pytest.fixture(scope="function")
def admin_token(db):
    admin = db.query(User).filter(User.email == "testadmin@wastewise.ai").first()
    return create_access_token(subject=admin.id, role=admin.role)
