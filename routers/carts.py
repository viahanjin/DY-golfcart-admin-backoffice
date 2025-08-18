from fastapi import APIRouter
from typing import Optional, Dict, Any

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
