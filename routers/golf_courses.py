from fastapi import APIRouter
from typing import Optional, Dict, Any

router = APIRouter(
    prefix="/golf-courses",
    tags=["Golf Courses"],
)

@router.get("")
async def get_golf_courses(page: int = 1, limit: int = 20, search: Optional[str] = None, status: Optional[str] = None, sortBy: Optional[str] = None, sortOrder: Optional[str] = None):
    return {
      "success": True,
      "data": {
        "items": [
          {
            "id": "GC-001",
            "name": "그린필드 골프클럽",
            "address": "서울특별시 강남구 테헤란로 123",
            "postalCode": "06234",
            "phone": "02-1234-5678",
            "email": "info@greenfield.com",
            "status": "ACTIVE",
            "coursesCount": 18,
            "cartsCount": 50,
            "location": {
              "latitude": 37.5065,
              "longitude": 127.0539
            },
            "operatingHours": {
              "weekday": "06:00-18:00",
              "weekend": "05:00-19:00"
            },
            "createdAt": "2024-01-15T09:00:00Z",
            "updatedAt": "2024-01-15T09:00:00Z"
          }
        ],
        "pagination": {
          "page": page,
          "limit": limit,
          "total": 45,
          "totalPages": (45 // limit) + 1
        }
      }
    }

@router.post("", status_code=201)
async def create_golf_course(body: Dict[Any, Any]):
    return {
      "success": True,
      "data": {
        "id": "GC-002",
        **body
      },
      "message": "골프장이 생성되었습니다."
    }

@router.get("/check-duplicate")
async def check_duplicate_name(name: str, excludeId: Optional[str] = None):
    return {
        "success": True,
        "data": {
            "isDuplicate": False
        }
    }

@router.get("/{id}")
async def get_golf_course_details(id: str):
    return {
      "success": True,
      "data": {
        "id": "GC-001",
        "name": "그린필드 골프클럽",
        "description": "서울 도심에 위치한 프리미엄 골프클럽",
        "address": "서울특별시 강남구 테헤란로 123",
        "detailAddress": "골프빌딩 1층",
        "postalCode": "06234",
        "phone": "02-1234-5678",
        "fax": "02-1234-5679",
        "email": "info@greenfield.com",
        "website": "https://www.greenfield.com",
        "status": "ACTIVE",
        "location": {
          "latitude": 37.5065,
          "longitude": 127.0539
        },
        "operatingHours": {
          "weekday": "06:00-18:00",
          "weekend": "05:00-19:00",
          "holiday": "05:00-19:00"
        },
        "facilities": [
          "프로샵",
          "레스토랑",
          "사우나",
          "연습장"
        ],
        "courses": [
          {
            "id": "COURSE-001",
            "name": "챔피언십 코스",
            "holes": 18,
            "par": 72,
            "length": 6850
          }
        ],
        "managers": [
          {
            "id": "USER-001",
            "name": "김매니저",
            "role": "MANAGER",
            "phone": "010-1234-5678"
          }
        ],
        "createdAt": "2024-01-15T09:00:00Z",
        "updatedAt": "2024-01-15T09:00:00Z"
      }
    }

@router.put("/{id}")
async def update_golf_course(id: str, body: Dict[Any, Any]):
    return {
      "success": True,
      "data": {
        "id": id,
        "name": "그린필드 골프클럽 (수정)",
        "description": "수정된 설명",
        "phone": "02-9876-5432",
      },
      "message": "골프장 정보가 수정되었습니다."
    }

@router.delete("/{id}")
async def delete_golf_course(id: str):
    return {
      "success": True,
      "message": "골프장이 삭제되었습니다."
    }
