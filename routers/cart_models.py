from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/cart-models", tags=["cart-models"])

print("🚗 Cart Models router loaded!")

# Cart Model Data Models
class CartModelSpecs(BaseModel):
    maxSpeed: int
    batteryType: str
    seats: int

class CartModelBase(BaseModel):
    modelName: str
    modelCode: str
    year: int
    specs: CartModelSpecs
    features: List[str]
    status: str = "active"

class CartModelCreate(CartModelBase):
    pass

class CartModelUpdate(BaseModel):
    modelName: Optional[str] = None
    modelCode: Optional[str] = None
    year: Optional[int] = None
    specs: Optional[CartModelSpecs] = None
    features: Optional[List[str]] = None
    status: Optional[str] = None

class CartModel(CartModelBase):
    id: str
    createdAt: str
    updatedAt: str

class CartModelListResponse(BaseModel):
    items: List[CartModel]
    total: int
    page: int
    totalPages: int

# Mock data storage (in production, this would be a database)
cart_models_db = [
    {
        "id": "MODEL-001",
        "modelName": "DY-CART-2024",
        "modelCode": "DYC2024",
        "year": 2024,
        "specs": {
            "maxSpeed": 25,
            "batteryType": "72V 리튬",
            "seats": 4
        },
        "features": ["자율주행", "GPS", "원격제어", "LiDAR"],
        "status": "active",
        "createdAt": "2024-01-15T09:00:00Z",
        "updatedAt": "2024-01-15T09:00:00Z"
    },
    {
        "id": "MODEL-002",
        "modelName": "DY-CART-2023",
        "modelCode": "DYC2023",
        "year": 2023,
        "specs": {
            "maxSpeed": 20,
            "batteryType": "72V 납산",
            "seats": 4
        },
        "features": ["GPS", "원격제어"],
        "status": "active",
        "createdAt": "2023-03-10T09:00:00Z",
        "updatedAt": "2023-03-10T09:00:00Z"
    },
    {
        "id": "MODEL-003",
        "modelName": "DY-CART-2022",
        "modelCode": "DYC2022",
        "year": 2022,
        "specs": {
            "maxSpeed": 18,
            "batteryType": "48V 납산",
            "seats": 2
        },
        "features": ["기본 운행"],
        "status": "discontinued",
        "createdAt": "2022-05-20T09:00:00Z",
        "updatedAt": "2022-05-20T09:00:00Z"
    }
]

def filter_cart_models(
    search: Optional[str] = None,
    status: Optional[str] = None,
    sort_by: str = "createdAt",
    sort_order: str = "desc"
):
    """Filter and sort cart models based on parameters"""
    filtered = cart_models_db.copy()
    
    # Apply search filter
    if search:
        search_lower = search.lower()
        filtered = [
            model for model in filtered
            if search_lower in model["modelName"].lower() or 
               search_lower in model["modelCode"].lower()
        ]
    
    # Apply status filter
    if status and status != "all":
        filtered = [model for model in filtered if model["status"] == status]
    
    # Apply sorting
    reverse = sort_order == "desc"
    if sort_by in ["modelName", "modelCode", "year", "status", "createdAt", "updatedAt"]:
        filtered.sort(key=lambda x: x.get(sort_by, ""), reverse=reverse)
    
    return filtered

@router.get("/")
async def get_cart_models(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    sortBy: str = Query("createdAt"),
    sortOrder: str = Query("desc")
):
    """Get cart models with pagination and filtering"""
    try:
        # Filter cart models
        filtered_models = filter_cart_models(search, status, sortBy, sortOrder)
        
        # Apply pagination
        total = len(filtered_models)
        total_pages = (total + limit - 1) // limit
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        items = filtered_models[start_idx:end_idx]
        
        return {
            "success": True,
            "data": {
                "items": items,
                "total": total,
                "page": page,
                "totalPages": total_pages
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch cart models: {str(e)}")

@router.get("/{model_id}")
async def get_cart_model(model_id: str):
    """Get a specific cart model by ID"""
    model = next((m for m in cart_models_db if m["id"] == model_id), None)
    if not model:
        raise HTTPException(status_code=404, detail="Cart model not found")
    return {
        "success": True,
        "data": model
    }

@router.post("/")
async def create_cart_model(cart_model: CartModelCreate):
    """Create a new cart model"""
    try:
        # Generate new ID
        new_id = f"MODEL-{len(cart_models_db) + 1:03d}"
        
        # Check if model code already exists
        if any(m["modelCode"] == cart_model.modelCode for m in cart_models_db):
            raise HTTPException(status_code=400, detail="Model code already exists")
        
        # Create new cart model
        now = datetime.utcnow().isoformat() + "Z"
        new_model = {
            "id": new_id,
            **cart_model.dict(),
            "createdAt": now,
            "updatedAt": now
        }
        
        cart_models_db.append(new_model)
        return {
            "success": True,
            "data": new_model,
            "message": "카트 모델이 생성되었습니다."
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create cart model: {str(e)}")

@router.put("/{model_id}")
async def update_cart_model(model_id: str, update_data: CartModelUpdate):
    """Update a cart model"""
    try:
        # Find the model
        model_idx = next((i for i, m in enumerate(cart_models_db) if m["id"] == model_id), None)
        if model_idx is None:
            raise HTTPException(status_code=404, detail="Cart model not found")
        
        # Check if new model code conflicts (if provided)
        if update_data.modelCode:
            existing = next((m for m in cart_models_db if m["modelCode"] == update_data.modelCode and m["id"] != model_id), None)
            if existing:
                raise HTTPException(status_code=400, detail="Model code already exists")
        
        # Update the model
        current_model = cart_models_db[model_idx]
        update_dict = update_data.dict(exclude_unset=True)
        
        for key, value in update_dict.items():
            current_model[key] = value
        
        current_model["updatedAt"] = datetime.utcnow().isoformat() + "Z"
        
        return {
            "success": True,
            "data": current_model,
            "message": "카트 모델이 수정되었습니다."
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update cart model: {str(e)}")

@router.delete("/{model_id}")
async def delete_cart_model(model_id: str):
    """Delete a cart model"""
    try:
        model_idx = next((i for i, m in enumerate(cart_models_db) if m["id"] == model_id), None)
        if model_idx is None:
            raise HTTPException(status_code=404, detail="Cart model not found")
        
        cart_models_db.pop(model_idx)
        return {
            "success": True,
            "message": "카트 모델이 삭제되었습니다."
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete cart model: {str(e)}")

@router.post("/bulk-delete")
async def bulk_delete_cart_models(request: dict):
    """Bulk delete cart models"""
    try:
        ids = request.get("ids", [])
        if not ids:
            raise HTTPException(status_code=400, detail="No IDs provided")
        
        # Remove models with matching IDs
        global cart_models_db
        cart_models_db = [m for m in cart_models_db if m["id"] not in ids]
        
        return {
            "success": True,
            "message": f"{len(ids)}개의 카트 모델이 삭제되었습니다."
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to bulk delete cart models: {str(e)}")