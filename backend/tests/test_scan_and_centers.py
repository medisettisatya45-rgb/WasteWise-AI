import io
import pytest
from PIL import Image


def create_test_image_bytes(color=(30, 144, 255), size=(100, 100)) -> bytes:
    img = Image.new("RGB", size, color=color)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


class TestScanAndCenters:
    def test_classify_image_endpoint(self, client):
        img_bytes = create_test_image_bytes()
        files = {"file": ("plastic_bottle.jpg", img_bytes, "image/jpeg")}
        resp = client.post("/api/v1/scan/classify", files=files)
        assert resp.status_code == 200
        data = resp.json()
        assert "category" in data
        assert "confidence" in data
        assert "is_recyclable" in data
        assert "disposal_instructions" in data
        assert data["confidence"] > 0

    def test_upload_and_save_scan(self, client, user_token):
        img_bytes = create_test_image_bytes()
        files = {"file": ("cereal_box.jpg", img_bytes, "image/jpeg")}
        resp = client.post(
            "/api/v1/scan/upload-and-save",
            headers={"Authorization": f"Bearer {user_token}"},
            files=files,
            data={"notes": "Scanned after breakfast"}
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["category"] is not None
        assert data["notes"] == "Scanned after breakfast"
        assert "image_path" in data

    def test_get_scan_history(self, client, user_token):
        # Retrieve history
        resp = client.get("/api/v1/history", headers={"Authorization": f"Bearer {user_token}"})
        assert resp.status_code == 200
        data = resp.json()
        assert "total" in data
        assert "items" in data

    def test_get_nearby_centers(self, client):
        resp = client.get("/api/v1/centers/nearby?lat=17.3850&lng=78.4867&radius_km=25")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) >= 1
        assert "name" in data[0]
        assert "distance_km" in data[0]
        assert data[0]["distance_km"] is not None

    def test_get_center_materials(self, client):
        resp = client.get("/api/v1/centers/materials")
        assert resp.status_code == 200
        mats = resp.json()
        assert "Plastic" in mats
        assert "Glass" in mats

    def test_get_dashboard_stats(self, client, user_token):
        resp = client.get("/api/v1/stats/dashboard", headers={"Authorization": f"Bearer {user_token}"})
        assert resp.status_code == 200
        data = resp.json()
        assert "sustainability" in data
        assert "category_breakdown" in data
        assert "monthly_trends" in data
        assert "recommendations" in data

    def test_admin_dashboard_protected(self, client, user_token, admin_token):
        # Normal user should be rejected (403)
        resp_user = client.get("/api/v1/admin/stats", headers={"Authorization": f"Bearer {user_token}"})
        assert resp_user.status_code == 403

        # Admin user should succeed (200)
        resp_admin = client.get("/api/v1/admin/stats", headers={"Authorization": f"Bearer {admin_token}"})
        assert resp_admin.status_code == 200
        data = resp_admin.json()
        assert "total_users" in data
        assert "total_scans" in data

    def test_ai_model_status_and_threshold(self, client, admin_token):
        resp = client.get("/api/v1/admin/model/status", headers={"Authorization": f"Bearer {admin_token}"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "operational"

        update_resp = client.put(
            "/api/v1/admin/model/threshold?threshold=0.75",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert update_resp.status_code == 200
        assert update_resp.json()["new_threshold"] == 0.75
