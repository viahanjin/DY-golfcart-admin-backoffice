from fastapi import APIRouter, File, UploadFile
from typing import Optional, List, Dict, Any
import json
import os
from datetime import datetime

router = APIRouter(
    prefix="/maps",
    tags=["Maps"],
)

# 데이터 파일 경로
DATA_FILE = 'maps_data.json'
GOLF_COURSES_FILE = 'golf_courses_data.json'

# 초기 샘플 데이터
initial_maps = [
          {
            "mapId": "MAP-001",
            "mapName": "그린필드 전체 맵",
            "connectedGolfCourseId": "GC-001",
            "version": "1.2.0",
            "createdAt": "2024-01-10T09:00:00Z",
            "updatedAt": "2024-01-12T10:00:00Z",
            "mapStatus": {
              "status": "active",
              "validationStatus": "verified"
            },
            "mapData": {
              "resolution": "4096x4096",
              "size": "15.0MB",
              "originGps": {
                "latitude": 37.5065,
                "longitude": 127.0539
              },
              "rotation": 0
            },
            "mapFiles": {
              "imageFile": "/uploads/maps/images/greenfield-full.jpg",
              "metadataFile": "/uploads/maps/metadata/greenfield"
            },
            "courseInfo": {
              "totalCourses": 18,
              "defaultMode": "auto",
              "defaultSpeedLimit": 15
            }
          },
          {
            "mapId": "MAP-002",
            "mapName": "오션뷰 골프코스",
            "connectedGolfCourseId": "GC-002",
            "version": "2.1.0",
            "createdAt": "2024-02-15T14:30:00Z",
            "updatedAt": "2024-02-20T09:15:00Z",
            "mapStatus": {
              "status": "testing",
              "validationStatus": "pending"
            },
            "mapData": {
              "resolution": "2048x2048",
              "size": "8.5MB",
              "originGps": {
                "latitude": 35.1796,
                "longitude": 129.0756
              },
              "rotation": 15
            },
            "mapFiles": {
              "imageFile": "/uploads/maps/images/oceanview-full.jpg",
              "metadataFile": "/uploads/maps/metadata/oceanview"
            },
            "courseInfo": {
              "totalCourses": 27,
              "defaultMode": "manual",
              "defaultSpeedLimit": 12
            }
          },
          {
            "mapId": "MAP-003",
            "mapName": "마운틴뷰 컨트리클럽",
            "connectedGolfCourseId": "GC-003",
            "version": "1.0.0",
            "createdAt": "2024-03-01T11:00:00Z",
            "updatedAt": "2024-03-01T11:00:00Z",
            "mapStatus": {
              "status": "inactive",
              "validationStatus": "failed"
            },
            "mapData": {
              "resolution": "1024x1024",
              "size": "3.2MB",
              "originGps": {
                "latitude": 37.8813,
                "longitude": 127.7298
              },
              "rotation": -10
            },
            "mapFiles": {
              "imageFile": "/uploads/maps/images/mountainview-full.jpg",
              "metadataFile": "/uploads/maps/metadata/mountainview"
            },
            "courseInfo": {
              "totalCourses": 9,
              "defaultMode": "auto",
              "defaultSpeedLimit": 18
            }
          }
]

# 데이터 로드/저장 함수들
def load_maps():
    """파일에서 맵 데이터 로드"""
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            print(f"⚠️ {DATA_FILE} 파일 읽기 실패, 초기 데이터로 복원")
    
    # 파일이 없거나 읽기 실패 시 초기 데이터 생성
    save_maps(initial_maps)
    return initial_maps

def save_maps(maps):
    """파일에 맵 데이터 저장"""
    try:
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(maps, f, ensure_ascii=False, indent=2)
        print(f"💾 맵 데이터를 {DATA_FILE}에 저장했습니다.")
    except IOError as e:
        print(f"❌ 데이터 저장 실패: {e}")

def load_golf_courses():
    """골프장 데이터 로드"""
    if os.path.exists(GOLF_COURSES_FILE):
        try:
            with open(GOLF_COURSES_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            print(f"⚠️ {GOLF_COURSES_FILE} 파일 읽기 실패")
    return []

def get_golf_course_name(golf_course_id: str) -> str:
    """골프장 ID로 골프장 이름 조회"""
    golf_courses = load_golf_courses()
    for course in golf_courses:
        if course.get('id') == golf_course_id:
            return course.get('courseName', golf_course_id)
    return golf_course_id

# 전역 데이터 (서버 시작시 로드)
sample_maps = load_maps()

@router.get("")
async def get_maps(page: int = 1, limit: int = 20, golfCourseId: Optional[str] = None, status: Optional[str] = None, search: Optional[str] = None, sortBy: Optional[str] = None, sortOrder: Optional[str] = None):
    # 필터링 로직
    filtered_maps = sample_maps.copy()
    
    # 골프장 필터
    if golfCourseId and golfCourseId != 'all':
        filtered_maps = [map_item for map_item in filtered_maps if map_item['connectedGolfCourseId'] == golfCourseId]
    
    # 상태 필터
    if status and status != 'all':
        filtered_maps = [map_item for map_item in filtered_maps if map_item['mapStatus']['status'] == status]
    
    # 검색 필터
    if search:
        search_lower = search.lower()
        filtered_maps = [
            map_item for map_item in filtered_maps 
            if search_lower in map_item['mapName'].lower() or 
               search_lower in map_item['mapId'].lower()
        ]
    
    # 전체 개수
    total = len(filtered_maps)
    total_pages = (total + limit - 1) // limit
    
    # 페이지네이션
    start = (page - 1) * limit
    end = start + limit
    items = filtered_maps[start:end]
    
    # 각 맵에 골프장 이름 추가
    for item in items:
        item['golfCourseName'] = get_golf_course_name(item.get('connectedGolfCourseId', ''))
    
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

@router.post("")
async def create_map(body: Dict[Any, Any]):
    import uuid
    
    # Generate new map ID
    new_map_id = f"MAP-{str(uuid.uuid4())[:8].upper()}"
    current_time = datetime.utcnow().isoformat() + "Z"
    
    new_map = {
        "mapId": new_map_id,
        "mapName": body.get("name", "새 맵"),
        "connectedGolfCourseId": body.get("golfCourseId", ""),
        "version": "1.0.0",
        "createdAt": current_time,
        "updatedAt": current_time,
        "mapStatus": {
          "status": body.get("mapStatus", {}).get("status", "testing"),
          "validationStatus": body.get("mapStatus", {}).get("validationStatus", "pending")
        },
        "mapData": {
          "resolution": "2048x2048",
          "size": "0MB",
          "originGps": {
            "latitude": body.get("bounds", {}).get("north", 37.5) - 0.005,
            "longitude": body.get("bounds", {}).get("east", 127.0) - 0.005
          },
          "rotation": 0
        },
        "mapFiles": {
          "imageFile": "",
          "metadataFile": ""
        },
        "courseInfo": {
          "totalCourses": 18,
          "defaultMode": "auto",
          "defaultSpeedLimit": 15
        }
    }
    
    # 메모리와 파일에 저장
    sample_maps.append(new_map)
    save_maps(sample_maps)
    
    return {
        "success": True,
        "data": new_map,
        "message": "맵이 생성되었습니다."
    }

@router.get("/{id}")
async def get_map_details(id: str):
    # 해당 ID의 맵 찾기
    map_item = next((m for m in sample_maps if m["mapId"] == id), None)
    
    if not map_item:
        return {
            "success": False,
            "error": {
                "code": "NOT_FOUND",
                "message": "맵을 찾을 수 없습니다."
            }
        }
    
    # 골프장 이름 추가
    map_item_with_name = map_item.copy()
    map_item_with_name['golfCourseName'] = get_golf_course_name(map_item.get('connectedGolfCourseId', ''))
    
    return {
        "success": True,
        "data": map_item_with_name
    }

@router.put("/{id}")
async def update_map(id: str, body: Dict[Any, Any]):
    # 해당 ID의 맵 찾기 및 업데이트
    for i, map_item in enumerate(sample_maps):
        if map_item["mapId"] == id:
            # 기존 데이터와 새 데이터 병합
            updated_map = map_item.copy()
            updated_map.update(body)
            updated_map["updatedAt"] = datetime.utcnow().isoformat() + "Z"
            
            sample_maps[i] = updated_map
            save_maps(sample_maps)
            
            return {
                "success": True,
                "data": updated_map,
                "message": "맵 정보가 수정되었습니다."
            }
    
    return {
        "success": False,
        "error": {
            "code": "NOT_FOUND",
            "message": "맵을 찾을 수 없습니다."
        }
    }

@router.delete("/{id}")
async def delete_map(id: str):
    # 해당 ID의 맵 삭제
    for i, map_item in enumerate(sample_maps):
        if map_item["mapId"] == id:
            sample_maps.pop(i)
            save_maps(sample_maps)
            return {
                "success": True,
                "message": "맵이 삭제되었습니다."
            }
    
    return {
        "success": False,
        "error": {
            "code": "NOT_FOUND",
            "message": "맵을 찾을 수 없습니다."
        }
    }

@router.post("/upload-image")
async def upload_map_image(image: UploadFile = File(...), mapId: Optional[str] = None):
    return {
      "success": True,
      "data": {
        "url": f"/uploads/maps/images/{image.filename}",
        "thumbnailUrl": f"/uploads/maps/thumbnails/{image.filename}-thumb.jpg",
        "filename": image.filename,
        "size": image.size,
        "mimeType": image.content_type,
        "resolution": "4096x4096"
      },
      "message": "이미지가 업로드되었습니다."
    }

@router.post("/upload-metadata")
async def upload_map_metadata(metadata_files: List[UploadFile] = File(...), mapId: Optional[str] = None):
    return {
      "success": True,
      "data": {
        "folderPath": "/uploads/maps/metadata/folder-12345",
        "fileCount": len(metadata_files),
        "jsonFileCount": len([f for f in metadata_files if f.filename.endswith('.json')]),
        "totalSize": sum(f.size for f in metadata_files),
        "files": [
          {
            "name": f.filename,
            "path": f"holes/{f.filename}",
            "size": f.size
          } for f in metadata_files
        ]
      },
      "message": "메타데이터가 업로드되었습니다."
    }
