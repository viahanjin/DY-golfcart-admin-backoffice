from fastapi import APIRouter
from typing import Optional, Dict, Any
import time

router = APIRouter(
    prefix="/carts",
    tags=["Carts"],
)

@router.get("")
async def get_carts(page: int = 1, limit: int = 20, golfCourseId: Optional[str] = None, status: Optional[str] = None, batteryLevel: Optional[str] = None, search: Optional[str] = None):
    return {
      "success": True,
      "data": {
        "items": [
          {
            "id": "CART-001",
            "cartNumber": "A-001",
            "modelName": "EZ-GO RXV",
            "manufacturer": "E-Z-GO",
            "golfCourseId": "GC-001",
            "golfCourseName": "그린필드 골프클럽",
            "status": "AVAILABLE",
            "batteryLevel": 85,
            "batteryStatus": "NORMAL",
            "isCharging": False,
            "lastMaintenance": "2024-01-10",
            "nextMaintenance": "2024-02-10",
            "currentLocation": {
              "latitude": 37.5065,
              "longitude": 127.0539,
              "course": "챔피언십 코스",
              "hole": 9
            },
            "usageStats": {
              "totalDistance": 15420.5,
              "totalHours": 342.5,
              "todayDistance": 45.2,
              "todayHours": 4.5
            },
            "createdAt": "2024-01-01T09:00:00Z",
            "updatedAt": "2024-01-15T14:30:00Z"
          }
        ],
        "pagination": {
          "page": page,
          "limit": limit,
          "total": 150,
          "totalPages": (150 // limit) + 1
        }
      }
    }

@router.post("", status_code=201)
async def create_cart(body: Dict[Any, Any]):
    return {
      "success": True,
      "data": {
        "id": "CART-002",
        **body
      },
      "message": "카트가 등록되었습니다."
    }

@router.get("/{id}")
async def get_cart_details(id: str):
    return {
      "success": True,
      "data": {
        "id": "CART-001",
        "cartNumber": "A-001",
        "modelName": "EZ-GO RXV",
        "manufacturer": "E-Z-GO",
        "manufacturingDate": "2023-01-15",
        "purchaseDate": "2023-02-01",
        "golfCourseId": "GC-001",
        "golfCourseName": "그린필드 골프클럽",
        "status": "AVAILABLE",
        "specifications": {
          "seatingCapacity": 4,
          "maxSpeed": 25,
          "weight": 450,
          "dimensions": {
            "length": 2400,
            "width": 1200,
            "height": 1800
          }
        },
        "battery": {
          "level": 85,
          "status": "NORMAL",
          "voltage": 48,
          "isCharging": False,
          "lastChargeTime": "2024-01-15T06:00:00Z",
          "estimatedRange": 35,
          "cycles": 125
        },
        "maintenance": {
          "lastDate": "2024-01-10",
          "nextDate": "2024-02-10",
          "history": [
            {
              "date": "2024-01-10",
              "type": "REGULAR",
              "description": "정기 점검",
              "technician": "김기술",
              "cost": 50000
            }
          ]
        },
        "location": {
          "latitude": 37.5065,
          "longitude": 127.0539,
          "course": "챔피언십 코스",
          "hole": 9,
          "lastUpdate": "2024-01-15T14:30:00Z"
        },
        "usageStats": {
          "totalDistance": 15420.5,
          "totalHours": 342.5,
          "averageDistancePerDay": 42.5,
          "averageHoursPerDay": 0.94
        },
        "createdAt": "2024-01-01T09:00:00Z",
        "updatedAt": "2024-01-15T14:30:00Z"
      }
    }

@router.put("/{id}")
async def update_cart(id: str, body: Dict[Any, Any]):
    return {
      "success": True,
      "data": {
        "id": "CART-001",
        "cartNumber": "A-002-MOD",
        "status": "MAINTENANCE",
      },
      "message": "카트 정보가 수정되었습니다."
    }

@router.delete("/{id}")
async def delete_cart(id: str):
    return {
      "success": True,
      "message": "카트가 삭제되었습니다."
    }

@router.patch("/{id}/status")
async def update_cart_status(id: str, body: Dict[Any, Any]):
    return {
      "success": True,
      "data": {
        "id": id,
        "status": body.get("status", "IN_USE"),
        "statusChangedAt": "2024-01-15T15:00:00Z"
      },
      "message": "카트 상태가 업데이트되었습니다."
    }

@router.get("/{id}/battery")
async def get_cart_battery(id: str):
    return {
      "success": True,
      "data": {
        "cartId": id,
        "level": 85,
        "voltage": 47.8,
        "current": 0,
        "temperature": 25.5,
        "status": "NORMAL",
        "isCharging": False,
        "estimatedRange": 35,
        "estimatedTime": 6.5,
        "cycles": 125,
        "health": 95,
        "lastUpdate": "2024-01-15T15:00:00Z"
      }
    }

@router.get("/{id}/location")
async def get_cart_location(id: str):
    return {
      "success": True,
      "data": {
        "cartId": id,
        "latitude": 37.5065,
        "longitude": 127.0539,
        "altitude": 45,
        "speed": 15.5,
        "heading": 180,
        "course": "챔피언십 코스",
        "hole": 9,
        "accuracy": 5,
        "lastUpdate": "2024-01-15T15:00:00Z"
      }
    }

# 골프장별 카트 관리 API
@router.get("/golf-courses/{golf_course_id}/carts")
async def get_golf_course_carts(golf_course_id: str, status: Optional[str] = None, modelId: Optional[str] = None):
    """골프장별 카트 목록 조회"""
    mock_carts = [
        {
            "id": "cart-1",
            "golfCourseId": golf_course_id,
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
            "golfCourseId": golf_course_id, 
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
    
    # 필터링
    if status and status != 'all':
        mock_carts = [cart for cart in mock_carts if cart['status'] == status]
    
    if modelId:
        mock_carts = [cart for cart in mock_carts if cart['modelId'] == modelId]
    
    return {
        "success": True,
        "data": {
            "items": mock_carts,
            "total": len(mock_carts),
            "stats": {
                "total": 2,
                "active": 1,
                "maintenance": 1,
                "broken": 0,
                "inactive": 0
            }
        }
    }

@router.post("/golf-courses/{golf_course_id}/carts", status_code=201)
async def add_cart_to_golf_course(golf_course_id: str, body: Dict[Any, Any]):
    """골프장에 카트 추가"""
    new_cart = {
        "id": f"cart-{int(time.time())}",
        "golfCourseId": golf_course_id,
        "cartNumber": body.get("cartNumber"),
        "serialNumber": body.get("serialNumber"),
        "modelId": body.get("modelId"),
        "modelName": "DY-GOLF-STANDARD",
        "status": "active",
        "deployedAt": "2024-01-15",
        "lastMaintenanceAt": None,
        "notes": body.get("notes", ""),
        "createdAt": "2024-01-15T09:00:00Z",
        "updatedAt": "2024-01-15T09:00:00Z"
    }
    
    return {
        "success": True,
        "data": new_cart,
        "message": "카트가 골프장에 추가되었습니다."
    }

@router.patch("/golf-courses/{golf_course_id}/carts/{cart_id}/status")
async def update_golf_course_cart_status(golf_course_id: str, cart_id: str, body: Dict[Any, Any]):
    """골프장별 카트 상태 업데이트"""
    return {
        "success": True,
        "data": {
            "id": cart_id,
            "golfCourseId": golf_course_id,
            "status": body.get("status"),
            "updatedAt": "2024-01-15T15:00:00Z"
        },
        "message": "카트 상태가 업데이트되었습니다."
    }

@router.delete("/golf-courses/{golf_course_id}/carts/{cart_id}")
async def remove_cart_from_golf_course(golf_course_id: str, cart_id: str):
    """골프장에서 카트 제거"""
    return {
        "success": True,
        "message": "카트가 골프장에서 제거되었습니다."
    }

