"""
PyTorch Dataset and Data Augmentation Pipeline for WasteWise AI.
"""
from pathlib import Path
from typing import List, Tuple, Optional
from PIL import Image

try:
    import torch
    from torch.utils.data import Dataset
    import torchvision.transforms as transforms
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False


def get_waste_transforms(is_train: bool = True):
    if not HAS_TORCH:
        return None
    
    if is_train:
        return transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.RandomHorizontalFlip(p=0.5),
            transforms.RandomRotation(degrees=15),
            transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
    else:
        return transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])


if HAS_TORCH:
    class WasteDataset(Dataset):
        def __init__(self, samples: List[Tuple[str, int]], transform=None):
            self.samples = samples
            self.transform = transform

        def __len__(self):
            return len(self.samples)

        def __getitem__(self, idx):
            img_path, label = self.samples[idx]
            image = Image.open(img_path).convert("RGB")
            if self.transform:
                image = self.transform(image)
            return image, torch.tensor(label, dtype=torch.long)
else:
    class WasteDataset:
        def __init__(self, *args, **kwargs):
            pass
