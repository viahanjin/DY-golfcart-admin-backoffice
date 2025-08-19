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
          },
          {
            "id": "CART-002",
            "cartNumber": "A-002",
            "modelName": "Club Car Precedent",
            "manufacturer": "Club Car",
            "golfCourseId": "GC-001",
            "golfCourseName": "그린필드 골프클럽",
            "status": "IN_USE",
            "batteryLevel": 62,
            "batteryStatus": "NORMAL",
            "isCharging": False,
            "lastMaintenance": "2024-01-08",
            "nextMaintenance": "2024-02-08",
            "currentLocation": {
              "latitude": 37.5075,
              "longitude": 127.0545,
              "course": "챔피언십 코스",
              "hole": 3
            },
            "usageStats": {
              "totalDistance": 12850.3,
              "totalHours": 285.2,
              "todayDistance": 28.1,
              "todayHours": 2.8
            },
            "createdAt": "2024-01-02T09:00:00Z",
            "updatedAt": "2024-01-15T13:45:00Z"
          },
          {
            "id": "CART-003",
            "cartNumber": "B-001",
            "modelName": "Yamaha Drive2",
            "manufacturer": "Yamaha",
            "golfCourseId": "GC-002",
            "golfCourseName": "오션뷰 골프클럽",
            "status": "CHARGING",
            "batteryLevel": 15,
            "batteryStatus": "LOW",
            "isCharging": True,
            "lastMaintenance": "2024-01-12",
            "nextMaintenance": "2024-02-12",
            "currentLocation": {
              "latitude": 35.1796,
              "longitude": 129.0756,
              "course": "오션 코스",
              "hole": 1
            },
            "usageStats": {
              "totalDistance": 8920.7,
              "totalHours": 198.5,
              "todayDistance": 52.3,
              "todayHours": 5.2
            },
            "createdAt": "2024-01-03T09:00:00Z",
            "updatedAt": "2024-01-15T16:20:00Z"
          },
          {
            "id": "CART-004",
            "cartNumber": "C-001",
            "modelName": "EZ-GO TXT",
            "manufacturer": "E-Z-GO",
            "golfCourseId": "GC-003",
            "golfCourseName": "마운틴 골프클럽",
            "status": "MAINTENANCE",
            "batteryLevel": 0,
            "batteryStatus": "CRITICAL",
            "isCharging": False,
            "lastMaintenance": "2024-01-14",
            "nextMaintenance": "2024-02-14",
            "currentLocation": {
              "latitude": 37.8312,
              "longitude": 127.5047,
              "course": "마운틴 코스",
              "hole": 1
            },
            "usageStats": {
              "totalDistance": 18750.9,
              "totalHours": 412.8,
              "todayDistance": 0,
              "todayHours": 0
            },
            "createdAt": "2024-01-04T09:00:00Z",
            "updatedAt": "2024-01-15T08:30:00Z"
          }
        ],
        "pagination": {
          "page": page,
          "limit": limit,
          "total": 150,
          "totalPages": 8
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
