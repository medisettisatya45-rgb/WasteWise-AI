# WasteWise AI — AI Model & Classification Guide

## 1. Modular AI Architecture Overview

WasteWise AI is architected with a decoupled model pipeline designed to run both on lightweight servers (without GPU dependencies) and high-performance deep learning clusters with PyTorch.

```
Incoming Waste Image (JPEG/PNG/WebP)
                  │
                  ▼
┌───────────────────────────────────────────────┐
│           Image Pre-Processing               │
│ - Format verification & dimensions check     │
│ - Normalized RGB downsampling (128x128 / 224) │
│ - Pixel luminance and color space extraction │
└──────────────────────┬────────────────────────┘
                       │
                       ▼
┌───────────────────────────────────────────────┐
│     Modular Classification Engine             │
│                                               │
│  [Branch A: PyTorch Deep Learning Head]       │
│  - MobileNetV2 / ResNet Backbone              │
│  - Deep feature representation layers        │
│  - 8-class softmax prediction                 │
│                                               │
│  [Branch B: Computer Vision Feature Analyzer] │
│  - Specular gloss & transparency gradients    │
│  - Fibrous texture & edge density entropy     │
│  - Spectral color distribution clusters       │
└──────────────────────┬────────────────────────┘
                       │
                       ▼
┌───────────────────────────────────────────────┐
│     Taxonomy & Post-Processing                │
│ - Confidence score threshold comparison       │
│ - Environmental diversion impact calculation  │
│ - Bin color & step-by-step preparation mapping│
└───────────────────────────────────────────────┘
```

## 2. Waste Classification Categories

The model recognizes 8 physical waste streams:
1. **Plastic**: High-specular reflections, clear/blue polymer tinting, cylindrical bottle geometry. (Recyclable, Blue bin)
2. **Paper & Cardboard**: High luminance white/kraft fibers, low-variance edge patterns, matte texture. (Recyclable, Blue bin)
3. **Glass**: Caustic refraction edges, bottle silhouettes, transparent boundaries. (Recyclable, Green/Blue bin)
4. **Metal & Aluminum**: High metallic gray specular peaks, uniform luster. (Recyclable, Blue bin)
5. **Organic / Compost**: Earthy pigments, chlorophyll green, carotenoid hues. (Compostable, Green bin)
6. **E-Waste**: Circuit board patterns, high edge density, dark substrate. (Special Recycling Depot)
7. **Hazardous**: Chemical containers, corrosive markers, batteries. (Municipal Special Depot)
8. **Landfill / Residual**: Multi-layer laminates, soiled composite wraps. (General Waste, Black/Gray bin)

## 3. Training a Custom PyTorch Model

To train or fine-tune a model with custom datasets:
```bash
cd backend
python -m training.train --data_dir ./data/waste_images --epochs 10 --batch_size 32
```
Trained `.pt` weights can be placed in `backend/app/models/weights/wastewise_weights.pt`. The backend will automatically detect and load them.

## 4. Confidence Threshold Tuning

Administrators can dynamically calibrate the model's confidence threshold via the Admin Dashboard or API:
- **0.20 - 0.50**: Permissive mode (suggests nearest category even with ambiguous angles)
- **0.60**: Balanced default
- **0.80 - 0.95**: High certainty mode (flags low confidence items for manual review)
