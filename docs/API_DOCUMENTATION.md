# WasteWise AI — REST API Documentation

Base URL: `http://127.0.0.1:8000/api/v1`

All protected endpoints require the HTTP Header:
`Authorization: Bearer <access_token>`

---

## 1. Authentication Endpoints

### Register User
- **POST** `/auth/register`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "full_name": "Jane Doe"
  }
  ```
- **Validation**: Enforces 8 to 72 UTF-8 bytes for password.
- **Response**: `201 Created` with Token and User object.

### Login
- **POST** `/auth/login`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response**: `200 OK` with JWT Token and User object.

### Current User Profile
- **GET** `/auth/me`
- **Response**: User profile with sustainability score, tier, and metrics.

### Update Profile
- **PUT** `/auth/profile`
- **Body**: `{"full_name": "Jane Doe Updated"}`

### Change Password
- **POST** `/auth/change-password`
- **Body**:
  ```json
  {
    "current_password": "OldPassword123!",
    "new_password": "NewSecurePassword2026!"
  }
  ```

---

## 2. Waste Scanning & AI Endpoints

### Classify Image (Guest or Preview)
- **POST** `/scan/classify`
- **Content-Type**: `multipart/form-data`
- **Form Param**: `file` (Image: JPEG, PNG, WebP)
- **Response**: `WastePredictionResponse` with category, confidence, recyclability, bin color, and step-by-step preparation checklist.

### Upload & Save Scan (Authenticated)
- **POST** `/scan/upload-and-save`
- **Content-Type**: `multipart/form-data`
- **Form Params**: `file` (Image), `notes` (Optional String)
- **Action**: Persists image to storage, saves scan record, increments user streak and metrics, triggers achievement notifications.

---

## 3. Scan History Endpoints

### List User Scans
- **GET** `/history?category={cat}&is_recyclable={bool}&search={query}&limit=50&offset=0`
- **Response**: Paginated list of user scans with timestamps and carbon metrics.

### Submit Scan Accuracy Feedback
- **POST** `/history/{scan_id}/feedback`
- **Body**: `{"user_feedback_correct": true, "notes": "Confirmed PET bottle"}`

### Delete Scan Record
- **DELETE** `/history/{scan_id}`
- **Response**: `204 No Content`

---

## 4. Recycling Centers & OpenStreetMap Endpoints

### Nearby Centers
- **GET** `/centers/nearby?lat={lat}&lng={lng}&radius_km=50&material={mat}&search={str}`
- **Response**: List of centers sorted by geographic distance (Haversine formula in km), including accepted materials and operating hours.

### Material Filter List
- **GET** `/centers/materials`
- **Response**: `["Plastic", "Paper & Cardboard", "Glass", "Metal", "Organic / Compost", "E-Waste", "Hazardous"]`

---

## 5. Dashboard & Analytics Endpoints

### User Dashboard Stats
- **GET** `/stats/dashboard`
- **Response**: Aggregated sustainability score, tier progress, category breakdown, 7-day activity, monthly trends, and personalized eco recommendations.

---

## 6. Administration & AI Model Management

### Platform Metrics
- **GET** `/admin/stats` (Requires role == ADMIN)
- **Response**: System-wide totals: users, scans, diverted kg, CO2 saved, recycling rate.

### AI Model Status
- **GET** `/admin/model/status`
- **Response**: Model status, version, confidence threshold, and class distribution.

### Update Confidence Threshold
- **PUT** `/admin/model/threshold?threshold=0.75`

### Trigger Model Recalibration
- **POST** `/admin/model/retrain`

### Add New Recycling Depot
- **POST** `/admin/centers`
