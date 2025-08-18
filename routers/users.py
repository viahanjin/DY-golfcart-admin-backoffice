from fastapi import APIRouter
from typing import Optional

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)

@router.get("")
async def get_users(page: int = 1, limit: int = 20, role: Optional[str] = None, status: Optional[str] = None, search: Optional[str] = None):
    return {
      "success": True,
      "data": {
        "items": [
          {
            "id": "USER-001",
            "email": "admin@example.com",
            "name": "관리자",
            "role": "ADMIN",
            "status": "ACTIVE",
            "phone": "010-1234-5678",
            "department": "시스템관리팀",
            "golfCourseId": None,
            "lastLoginAt": "2024-01-15T09:00:00Z",
            "createdAt": "2024-01-01T09:00:00Z"
          }
        ],
        "pagination": {
          "page": page,
          "limit": limit,
          "total": 35,
          "totalPages": (35 // limit) + 1
        }
      }
    }
