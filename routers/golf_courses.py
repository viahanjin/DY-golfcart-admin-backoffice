from fastapi import APIRouter
from typing import Optional, Dict, Any
from datetime import datetime

router = APIRouter(
    prefix="/golf-courses",
    tags=["Golf Courses"],
)

# 샘플 데이터 - 프론트엔드 타입에 맞는 형식
sample_golf_courses = [
    {
        "id": "GC-001",
        "courseName": "그린필드 골프클럽",
        "courseNameEn": "Green Field Golf Club",
        "courseCode": "GF001",
        "address": {
            "zipcode": "06234",
            "address1": "서울특별시 강남구 테헤란로 123",
            "address2": "골프빌딩 1층"
        },
        "contact": {
            "phone": "02-1234-5678",
            "fax": "02-1234-5679",
            "email": "info@greenfield.com"
        },
        "location": {
            "latitude": 37.5065,
            "longitude": 127.0539,
            "altitude": 100,
            "coordinateSystem": "WGS84",
            "rtk": {
                "baseLatitude": 37.5065,
                "baseLongitude": 127.0539,
                "provider": "DY RTK"
            }
        },
        "operation": {
            "totalHoles": 18,
            "operatingHours": {
                "summer": "06:00 - 19:00",
                "winter": "07:00 - 17:00"
            },
            "closedDays": "매주 월요일",
            "cartPolicy": {
                "fairwayAccess": True,
                "rainPolicy": "우천시 운행 중지",
                "maxSpeed": 15
            }
        },
        "environment": {
            "terrain": ["hilly"],
            "gpsShadedAreas": {
                "count": 3,
                "locations": "16번홀, 17번홀, 클럽하우스 주변"
            },
            "specialNotes": "산지형 코스로 경사가 급한 구간이 있음"
        },
        "totalCarts": 50,
        "activeCarts": 47,
        "status": "active",
        "lastModified": "2024-01-15T09:00:00.000Z",
        "createdAt": "2024-01-15T09:00:00.000Z"
    },
    {
        "id": "GC-002", 
        "courseName": "블루오션 컨트리클럽",
        "courseNameEn": "Blue Ocean Country Club",
        "courseCode": "BO002",
        "address": {
            "zipcode": "13579",
            "address1": "부산광역시 해운대구 해운대해변로 264",
            "address2": "오션타워 5층"
        },
        "contact": {
            "phone": "051-987-6543",
            "fax": "051-987-6544",
            "email": "contact@blueocean.co.kr"
        },
        "location": {
            "latitude": 35.1595,
            "longitude": 129.1603,
            "altitude": 50,
            "coordinateSystem": "WGS84"
        },
        "operation": {
            "totalHoles": 27,
            "operatingHours": {
                "summer": "05:30 - 20:00",
                "winter": "06:30 - 18:00"
            },
            "closedDays": "매월 첫째주 화요일",
            "cartPolicy": {
                "fairwayAccess": True,
                "rainPolicy": "소나기 시에만 운행 중지",
                "maxSpeed": 18
            }
        },
        "environment": {
            "terrain": ["flat", "hilly"],
            "gpsShadedAreas": {
                "count": 1,
                "locations": "클럽하우스 뒤편"
            },
            "specialNotes": "해변가 인접으로 바람의 영향을 받음"
        },
        "totalCarts": 80,
        "activeCarts": 75,
        "status": "active",
        "lastModified": "2024-01-20T14:30:00.000Z",
        "createdAt": "2024-01-10T08:00:00.000Z"
    }
]

@router.get("")
async def get_golf_courses(page: int = 1, limit: int = 20, search: Optional[str] = None, status: Optional[str] = None, sortBy: Optional[str] = None, sortOrder: Optional[str] = None):
    # 필터링 로직
    filtered_courses = sample_golf_courses.copy()
    
    # 상태 필터
    if status and status != 'all':
        filtered_courses = [course for course in filtered_courses if course['status'] == status]
    
    # 검색 필터
    if search:
        search_lower = search.lower()
        filtered_courses = [
            course for course in filtered_courses 
            if search_lower in course['courseName'].lower() or 
               search_lower in course['courseCode'].lower() or
               search_lower in course['address']['address1'].lower()
        ]
    
    # 전체 개수
    total = len(filtered_courses)
    total_pages = (total + limit - 1) // limit
    
    # 페이지네이션
    start = (page - 1) * limit
    end = start + limit
    items = filtered_courses[start:end]
    
    return {
        "success": True,
        "data": {
            "items": items,
            "total": total,
            "page": page,
            "limit": limit,
            "totalPages": total_pages
        }
    }

@router.post("", status_code=201)
async def create_golf_course(body: Dict[Any, Any]):
    # 새로운 ID 생성
    import uuid
    new_id = f"GC-{str(uuid.uuid4())[:8].upper()}"
    
    # 기본값으로 채워진 새로운 골프장 데이터 생성
    new_course = {
        "id": new_id,
        "courseName": body.get("courseName", ""),
        "courseNameEn": body.get("courseNameEn", ""),
        "courseCode": body.get("courseCode", ""),
        "address": body.get("address", {
            "zipcode": "",
            "address1": "",
            "address2": ""
        }),
        "contact": body.get("contact", {
            "phone": "",
            "fax": "",
            "email": ""
        }),
        "location": body.get("location", {
            "latitude": 0,
            "longitude": 0,
            "altitude": 0,
            "coordinateSystem": "WGS84",
            "rtk": {
                "baseLatitude": 0,
                "baseLongitude": 0,
                "provider": ""
            }
        }),
        "operation": body.get("operation", {
            "totalHoles": 18,
            "operatingHours": {
                "summer": "06:00 - 19:00",
                "winter": "07:00 - 17:00"
            },
            "closedDays": "매주 월요일",
            "cartPolicy": {
                "fairwayAccess": False,
                "rainPolicy": "상황에 따라 결정",
                "maxSpeed": 15
            }
        }),
        "environment": body.get("environment", {
            "terrain": [],
            "gpsShadedAreas": {
                "count": 0,
                "locations": ""
            },
            "specialNotes": ""
        }),
        "totalCarts": body.get("totalCarts", 0),
        "activeCarts": body.get("activeCarts", 0),
        "status": body.get("status", "active"),
        "lastModified": datetime.now().isoformat() + "Z",
        "createdAt": datetime.now().isoformat() + "Z"
    }
    
    # 실제로는 데이터베이스에 저장
    sample_golf_courses.append(new_course)
    
    return {
        "success": True,
        "data": new_course,
        "message": "골프장이 생성되었습니다."
    }

# 중복 확인 엔드포인트들
@router.get("/check-name")
async def check_name_duplicate(name: str, excludeId: Optional[str] = None):
    is_duplicate = any(
        course["courseName"] == name and course["id"] != excludeId
        for course in sample_golf_courses
    )
    return {
        "success": True,
        "data": {
            "isDuplicate": is_duplicate
        }
    }

@router.get("/check-code")
async def check_code_duplicate(code: str, excludeId: Optional[str] = None):
    is_duplicate = any(
        course["courseCode"] == code and course["id"] != excludeId
        for course in sample_golf_courses
    )
    return {
        "success": True,
        "data": {
            "isDuplicate": is_duplicate
        }
    }

@router.get("/generate-code")
async def generate_code():
    import random
    import string
    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return {
        "success": True,
        "data": {
            "code": f"GC{code}"
        }
    }

@router.get("/{id}")
async def get_golf_course_details(id: str):
    # 해당 ID의 골프장 찾기
    course = next((course for course in sample_golf_courses if course["id"] == id), None)
    
    if not course:
        return {
            "success": False,
            "error": {
                "code": "NOT_FOUND",
                "message": "골프장을 찾을 수 없습니다."
            }
        }
    
    return {
        "success": True,
        "data": course
    }

@router.put("/{id}")
async def update_golf_course(id: str, body: Dict[Any, Any]):
    # 해당 ID의 골프장 찾기 및 업데이트
    for i, course in enumerate(sample_golf_courses):
        if course["id"] == id:
            # 기존 데이터와 새 데이터 병합
            updated_course = course.copy()
            updated_course.update(body)
            updated_course["lastModified"] = datetime.now().isoformat() + "Z"
            
            sample_golf_courses[i] = updated_course
            
            return {
                "success": True,
                "data": updated_course,
                "message": "골프장 정보가 수정되었습니다."
            }
    
    return {
        "success": False,
        "error": {
            "code": "NOT_FOUND",
            "message": "골프장을 찾을 수 없습니다."
        }
    }

@router.delete("/{id}")
async def delete_golf_course(id: str):
    # 해당 ID의 골프장 삭제
    for i, course in enumerate(sample_golf_courses):
        if course["id"] == id:
            sample_golf_courses.pop(i)
            return {
                "success": True,
                "message": "골프장이 삭제되었습니다."
            }
    
    return {
        "success": False,
        "error": {
            "code": "NOT_FOUND",
            "message": "골프장을 찾을 수 없습니다."
        }
    }

@router.post("/bulk-delete")
async def bulk_delete_golf_courses(body: Dict[str, list]):
    ids = body.get("ids", [])
    deleted_count = 0
    
    # 역순으로 삭제 (인덱스 변경 방지)
    for i in range(len(sample_golf_courses) - 1, -1, -1):
        if sample_golf_courses[i]["id"] in ids:
            sample_golf_courses.pop(i)
            deleted_count += 1
    
    return {
        "success": True,
        "message": f"{deleted_count}개의 골프장이 삭제되었습니다."
    }

@router.patch("/{id}/status")
async def update_golf_course_status(id: str, body: Dict[str, str]):
    status = body.get("status")
    
    for i, course in enumerate(sample_golf_courses):
        if course["id"] == id:
            sample_golf_courses[i]["status"] = status
            sample_golf_courses[i]["lastModified"] = datetime.now().isoformat() + "Z"
            
            return {
                "success": True,
                "data": sample_golf_courses[i],
                "message": "골프장 상태가 변경되었습니다."
            }
    
    return {
        "success": False,
        "error": {
            "code": "NOT_FOUND",
            "message": "골프장을 찾을 수 없습니다."
        }
    }
