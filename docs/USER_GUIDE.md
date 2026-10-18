# WasteWise AI — User & Administrator Guide

## 1. Quick Start

### Starting the Backend
```bash
cd backend
python run.py
```
Backend will be live at `http://127.0.0.1:8000` (API Docs: `http://127.0.0.1:8000/docs`).

### Starting the Frontend
```bash
cd frontend
npm run dev
```
Frontend will be accessible at `http://localhost:5173`.

---

## 2. Pre-Configured Demo Credentials

The database is pre-seeded with two accounts:

### Administrator Account
- **Email**: `admin@wastewise.ai`
- **Password**: `AdminPassword123!`
- **Privileges**: Access to Admin Dashboard, User Management, AI Model Tuning, and Recycling Depot Registration.

### Standard User Account
- **Email**: `user@wastewise.ai`
- **Password**: `UserPassword123!`
- **Privileges**: Waste scanning, personal dashboard, history tracking, notifications, and sustainability score.

---

## 3. How to Scan Waste

1. Navigate to **Scan Waste** in the navbar.
2. Choose one of three options:
   - Click **Take Photo** to use your device's camera.
   - Click **Browse File** or drag and drop a waste photo from your computer.
   - Click one of the **Quick Test Samples** (e.g. *Plastic PET Bottle*, *Cardboard Box*, *Aluminum Can*).
3. Optionally add context in the notes field.
4. Click **Classify & Get Disposal Instructions**.
5. View:
   - Material Category & Confidence percentage.
   - Recyclability status & Target Bin color.
   - Preparation checklist (rinse, crush, flatten).
   - Kilograms of carbon saved.
6. Provide model feedback (👍 Yes / 👎 No) to help recalibrate future inferences.

---

## 4. Sustainability Score & Badges

Your sustainability score (0 - 100 points) reflects your environmental commitment:
- **Seedling** (0 - 24 pts)
- **Eco Explorer** (25 - 49 pts)
- **Green Guardian** (50 - 74 pts)
- **Earth Champion** (75 - 100 pts)

Maintain consecutive day streaks and log recyclable items to unlock badges like *First Step*, *Eco Streak*, and *Carbon Offsetter*.

---

## 5. Locating Recycling Centers

1. Navigate to **Recycling Centers** in the navbar.
2. Click **Use My Location** to center the map on your coordinates.
3. Filter by material (e.g., Plastic, E-Waste, Glass).
4. Click any pin on the map or depot card in the list to inspect operating hours, accepted materials, and click **Directions** to open route navigation in OpenStreetMap.
