from fastapi import APIRouter, HTTPException
from typing import Optional, Dict, Any, List
from pydantic import BaseModel

router = APIRouter(
    tags=["Golf Course Carts"],
)

# Pydantic models
class AddCartToGolfCourseRequest(BaseModel):
    cartNumber: str
    serialNumber: str
    modelId: str
    notes: Optional[str] = None

class UpdateCartStatusRequest(BaseModel):
    status: str  # 'active' | 'maintenance' | 'broken' | 'inactive'

# Mock data for golf course carts
mock_cart_models = [
    {
        "id": "model-1",
        "modelName": "DY-GOLF-STANDARD",
        "modelCode": "DGS-2024",
        "year": 2024,
        "specs": {
            "maxSpeed": 25,
            "batteryType": "48V 100Ah",
            "seats": 2
        },
        "features": ["GPS 네비게이션", "전자 브레이크"],
        "status": "active"
    },
    {
        "id": "model-2", 
        "modelName": "DY-GOLF-PREMIUM",
        "modelCode": "DGP-2024",
        "year": 2024,
        "specs": {
            "maxSpeed": 30,
            "batteryType": "60V 120Ah",
            "seats": 4
        },
        "features": ["GPS 네비게이션", "전자 브레이크", "에어컨", "USB 충전"],
        "status": "active"
    }
]

mock_golf_course_carts = {
    "GC-001": [
        {
            "id": "cart-1",
            "golfCourseId": "GC-001",
            "cartNumber": "CART-001",
            "serialNumber": "DY-2024-001", 
            "modelId": "model-1",
            "modelName": "DY-GOLF-STANDARD",
            "status": "active",
            "deployedAt": "2024-01-15",
            "lastMaintenanceAt": "2024-01-10",
            "notes": "",
            "createdAt": "2024-01-15T09:00:00Z",
            "updatedAt": "2024-01-15T09:00:00Z"
        },
        {
            "id": "cart-2",
            "golfCourseId": "GC-001", 
            "cartNumber": "CART-002",
            "serialNumber": "DY-2024-002",
            "modelId": "model-2",
            "modelName": "DY-GOLF-PREMIUM",
            "status": "maintenance",
            "deployedAt": "2024-02-01",
            "lastMaintenanceAt": "2024-02-15",
            "notes": "정기점검 중",
            "createdAt": "2024-02-01T09:00:00Z",
            "updatedAt": "2024-02-15T14:30:00Z"
        }
    ]
}

@router.get("/golf-courses/{golf_course_id}/carts")
async def get_golf_course_carts(golf_course_id: str, status: Optional[str] = None, modelId: Optional[str] = None):
    """골프장별 카트 목록 조회"""
    carts = mock_golf_course_carts.get(golf_course_id, [])
    
    # 필터링
    if status and status != 'all':
        carts = [cart for cart in carts if cart['status'] == status]
    
    if modelId:
        carts = [cart for cart in carts if cart['modelId'] == modelId]
    
    return {
        "success": True,
        "data": {
            "items": carts,
            "total": len(carts),
            "stats": {
                "total": len(mock_golf_course_carts.get(golf_course_id, [])),
                "active": len([c for c in mock_golf_course_carts.get(golf_course_id, []) if c['status'] == 'active']),
                "maintenance": len([c for c in mock_golf_course_carts.get(golf_course_id, []) if c['status'] == 'maintenance']),
                "broken": len([c for c in mock_golf_course_carts.get(golf_course_id, []) if c['status'] == 'broken']),
                "inactive": len([c for c in mock_golf_course_carts.get(golf_course_id, []) if c['status'] == 'inactive'])
            }
        }
    }

@router.post("/golf-courses/{golf_course_id}/carts", status_code=201)
async def add_cart_to_golf_course(golf_course_id: str, cart_data: AddCartToGolfCourseRequest):
    """골프장에 카트 추가"""
    # 모델 정보 조회
    model = next((m for m in mock_cart_models if m['id'] == cart_data.modelId), None)
    if not model:
        raise HTTPException(status_code=400, detail="유효하지 않은 카트 모델입니다.")
    
    # 카트 번호 중복 검사
    existing_carts = mock_golf_course_carts.get(golf_course_id, [])
    if any(cart['cartNumber'] == cart_data.cartNumber for cart in existing_carts):
        raise HTTPException(status_code=400, detail="이미 존재하는 카트 번호입니다.")
    
    # 일련번호 중복 검사
    if any(cart['serialNumber'] == cart_data.serialNumber for cart in existing_carts):
        raise HTTPException(status_code=400, detail="이미 존재하는 일련번호입니다.")
    
    # 새 카트 생성
    new_cart = {
        "id": f"cart-{len(existing_carts) + 1}",
        "golfCourseId": golf_course_id,
        "cartNumber": cart_data.cartNumber,
        "serialNumber": cart_data.serialNumber,
        "modelId": cart_data.modelId,
        "modelName": model['modelName'],
        "status": "active",
        "deployedAt": "2024-01-15",
        "lastMaintenanceAt": None,
        "notes": cart_data.notes or "",
        "createdAt": "2024-01-15T09:00:00Z",
        "updatedAt": "2024-01-15T09:00:00Z"
    }
    
    # 목록에 추가
    if golf_course_id not in mock_golf_course_carts:
        mock_golf_course_carts[golf_course_id] = []
    mock_golf_course_carts[golf_course_id].append(new_cart)
    
    return {
        "success": True,
        "data": new_cart,
        "message": "카트가 골프장에 추가되었습니다."
    }

@router.patch("/golf-courses/{golf_course_id}/carts/{cart_id}/status")
async def update_cart_status(golf_course_id: str, cart_id: str, status_data: UpdateCartStatusRequest):
    """카트 상태 업데이트"""
    carts = mock_golf_course_carts.get(golf_course_id, [])
    cart_index = next((i for i, cart in enumerate(carts) if cart['id'] == cart_id), None)
    
    if cart_index is None:
        raise HTTPException(status_code=404, detail="카트를 찾을 수 없습니다.")
    
    # 상태 업데이트
    carts[cart_index]['status'] = status_data.status
    carts[cart_index]['updatedAt'] = "2024-01-15T15:00:00Z"
    
    return {
        "success": True,
        "data": carts[cart_index],
        "message": "카트 상태가 업데이트되었습니다."
    }

@router.delete("/golf-courses/{golf_course_id}/carts/{cart_id}")
async def remove_cart_from_golf_course(golf_course_id: str, cart_id: str):
    """골프장에서 카트 제거"""
    carts = mock_golf_course_carts.get(golf_course_id, [])
    cart_index = next((i for i, cart in enumerate(carts) if cart['id'] == cart_id), None)
    
    if cart_index is None:
        raise HTTPException(status_code=404, detail="카트를 찾을 수 없습니다.")
    
    # 카트 제거
    removed_cart = carts.pop(cart_index)
    
    return {
        "success": True,
        "data": removed_cart,
        "message": "카트가 골프장에서 제거되었습니다."
    }

@router.get("/cart-models")
async def get_available_cart_models():
    """사용 가능한 카트 모델 목록 조회"""
    return {
        "success": True,
        "data": {
            "items": mock_cart_models,
            "total": len(mock_cart_models)
        }
    }