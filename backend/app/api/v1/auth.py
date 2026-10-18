from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.notification import Notification
from app.schemas.user import (
    UserCreate, UserLogin, UserResponse, UserUpdate,
    PasswordChangeRequest, Token
)
from app.core.security import (
    verify_password, get_password_hash, create_access_token,
    validate_password_rules
)
from app.core.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Registers a new user account.
    Enforces strict UTF-8 byte length validation (<= 72 bytes) for bcrypt security.
    """
    # Check existing email
    existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists"
        )
    
    # Hash password with bcrypt after validating rules
    hashed_pwd = get_password_hash(user_in.password)

    new_user = User(
        email=user_in.email.lower(),
        hashed_password=hashed_pwd,
        full_name=user_in.full_name,
        role="USER",
        is_active=True,
        sustainability_score=0,
        eco_tier="Seedling",
        current_streak=0
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Add welcome notification
    welcome_notif = Notification(
        user_id=new_user.id,
        title="Welcome to WasteWise AI! 🌱",
        message="Your account is active. Scan waste items to identify recyclables and track your environmental impact.",
        notification_type="achievement"
    )
    db.add(welcome_notif)
    db.commit()

    token = create_access_token(subject=new_user.id, role=new_user.role)
    return Token(access_token=token, token_type="bearer", user=UserResponse.model_validate(new_user))


@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticates a user with email and password.
    Returns a JWT access token upon successful verification.
    """
    user = db.query(User).filter(User.email == login_in.email.lower()).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated"
        )
    
    token = create_access_token(subject=user.id, role=user.role)
    return Token(access_token=token, token_type="bearer", user=UserResponse.model_validate(user))


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    """
    Logs out the authenticated user.
    Stateless JWT logout confirmation.
    """
    return {
        "success": True,
        "message": f"Successfully logged out user {current_user.email}"
    }


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns the authenticated user's current profile and metrics.
    """
    return UserResponse.model_validate(current_user)


@router.put("/profile", response_model=UserResponse)
def update_profile(
    update_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Updates user personal profile information (name, avatar).
    """
    if update_in.full_name is not None:
        current_user.full_name = update_in.full_name
    if update_in.avatar_url is not None:
        current_user.avatar_url = update_in.avatar_url
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.post("/change-password")
def change_password(
    req: PasswordChangeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Changes the authenticated user's password.
    Requires current password verification and enforces UTF-8 byte validation.
    """
    if not verify_password(req.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password verification failed"
        )
    
    # Validate rules for new password (byte length <= 72, min length >= 8)
    try:
        validate_password_rules(req.new_password)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    
    current_user.hashed_password = get_password_hash(req.new_password)
    db.add(current_user)
    db.commit()

    return {
        "success": True,
        "message": "Password changed successfully"
    }
