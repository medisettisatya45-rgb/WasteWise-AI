from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.scan import router as scan_router
from app.api.v1.history import router as history_router
from app.api.v1.centers import router as centers_router
from app.api.v1.stats import router as stats_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.admin import router as admin_router

api_router = APIRouter(prefix="/v1")
api_router.include_router(auth_router)
api_router.include_router(scan_router)
api_router.include_router(history_router)
api_router.include_router(centers_router)
api_router.include_router(stats_router)
api_router.include_router(notifications_router)
api_router.include_router(admin_router)
