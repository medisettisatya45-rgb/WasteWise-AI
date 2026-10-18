from typing import List, Dict, Any
from app.models.user import User

RECOMMENDATION_CATALOG = {
    "Plastic": [
        {
            "id": "rec_plastic_bottle",
            "title": "Switch to a Stainless Steel Bottle",
            "description": "You scan a significant amount of single-use plastic. Carrying an insulated refillable bottle prevents ~167 plastic bottles per year and saves ~18 kg CO2.",
            "category": "Plastic",
            "impact": "High",
            "estimated_saving": "18 kg CO2 / year"
        },
        {
            "id": "rec_plastic_bags",
            "title": "Carry Foldable Tote Bags",
            "description": "Keep lightweight cloth bags in your backpack or car boot to avoid taking plastic carrier bags during retail and grocery visits.",
            "category": "Plastic",
            "impact": "Medium",
            "estimated_saving": "3 kg plastic avoided"
        }
    ],
    "Paper & Cardboard": [
        {
            "id": "rec_paper_digital",
            "title": "Opt for Paperless Billing & Receipts",
            "description": "Switch utility bills and store receipts to SMS/email to minimize deforestation and conserve water used in pulp processing.",
            "category": "Paper & Cardboard",
            "impact": "Easy Win",
            "estimated_saving": "500 sheets paper saved"
        },
        {
            "id": "rec_cardboard_reuse",
            "title": "Upcycle Delivery Shipping Boxes",
            "description": "Reuse shipping cartons for household storage, organizing closets, or as planters before sending to recycling.",
            "category": "Paper & Cardboard",
            "impact": "Medium",
            "estimated_saving": "2 kg paperboard diverted"
        }
    ],
    "Metal": [
        {
            "id": "rec_aluminum_circular",
            "title": "Always Rinse Aluminum Cans",
            "description": "Recycling aluminum consumes 95% less energy than producing primary aluminum from bauxite ore. Clean cans ensure zero sorting rejection.",
            "category": "Metal",
            "impact": "High",
            "estimated_saving": "95% energy conserved"
        }
    ],
    "Organic / Compost": [
        {
            "id": "rec_compost_balcony",
            "title": "Start Countertop Bokashi or Vermicompost",
            "description": "Composting vegetable and fruit trimmings prevents methane emissions produced when organics decompose anaerobically in landfills.",
            "category": "Organic / Compost",
            "impact": "High",
            "estimated_saving": "40 kg methane avoided"
        }
    ],
    "E-Waste": [
        {
            "id": "rec_ewaste_depot",
            "title": "Consolidate Small Cables & Batteries",
            "description": "Store spent AA/AAA batteries in a dry jar and drop them off at certified municipal collection points to protect groundwater from heavy metals.",
            "category": "E-Waste",
            "impact": "High",
            "estimated_saving": "Zero toxic leachate"
        }
    ],
    "General": [
        {
            "id": "rec_general_rinse",
            "title": "Master the 'Empty, Clean, Dry' Rule",
            "description": "A single unwashed yogurt cup or sauce jar can ruin an entire bale of clean paper and plastic recyclables at sorting plants.",
            "category": "General",
            "impact": "High",
            "estimated_saving": "Eliminates sorting contamination"
        },
        {
            "id": "rec_local_centers",
            "title": "Locate Your Nearest Specialized Drop-Off",
            "description": "Check our Centers Map for local depots that accept hazardous chemicals, glass, and electronic scrap for closed-loop recycling.",
            "category": "General",
            "impact": "Easy Win",
            "estimated_saving": "Proper circular disposal"
        }
    ]
}


def get_personalized_recommendations(user: User, top_categories: List[str]) -> List[Dict[str, Any]]:
    """
    Selects prioritized recommendations tailored to the user's scan history.
    """
    selected: List[Dict[str, Any]] = []

    # Add recommendations for top scanned categories
    for cat in top_categories:
        if cat in RECOMMENDATION_CATALOG:
            for item in RECOMMENDATION_CATALOG[cat]:
                if item not in selected:
                    selected.append(item)
                    if len(selected) >= 3:
                        break

    # Fill up with high-impact general recommendations
    for item in RECOMMENDATION_CATALOG["General"]:
        if len(selected) >= 4:
            break
        if item not in selected:
            selected.append(item)

    return selected
