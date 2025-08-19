from fastapi import APIRouter, File, UploadFile
from typing import Optional, List, Dict, Any

router = APIRouter(
    prefix="/maps",
    tags=["Maps"],
)

@router.get("")
async def get_maps(page: int = 1, limit: int = 20, golfCourseId: Optional[str] = None, type: Optional[str] = None, search: Optional[str] = None):
    return {
      "success": True,
      "data": {
        "items": [
          {
            "id": "MAP-001",
            "name": "그린필드 전체 맵",
            "description": "그린필드 골프클럽 전체 코스 맵",
            "golfCourseId": "GC-001",
            "golfCourseName": "그린필드 골프클럽",
            "type": "3D",
            "version": "1.2.0",
            "imageUrl": "/uploads/maps/images/greenfield-full.jpg",
            "thumbnailUrl": "/uploads/maps/thumbnails/greenfield-full-thumb.jpg",
            "metadataUrl": "/uploads/maps/metadata/greenfield",
            "bounds": {
              "north": 37.5165,
              "south": 37.4965,
              "east": 127.0639,
              "west": 127.0439
            },
            "layers": [
              {
                "name": "fairway",
                "visible": True,
                "type": "polygon"
              },
              {
                "name": "green",
                "visible": True,
                "type": "polygon"
              },
              {
                "name": "hazard",
                "visible": True,
                "type": "polygon"
              }
            ],
            "fileSize": 15728640,
            "resolution": "4096x4096",
            "createdAt": "2024-01-10T09:00:00Z",
            "updatedAt": "2024-01-12T10:00:00Z"
          },
          {
            "id": "MAP-002",
            "name": "오션뷰 코스 맵",
            "description": "오션뷰 골프클럽 해안 코스 맵",
            "golfCourseId": "GC-002",
            "golfCourseName": "오션뷰 골프클럽",
            "type": "2D",
            "version": "1.0.0",
            "imageUrl": "/uploads/maps/images/oceanview-course.jpg",
            "thumbnailUrl": "/uploads/maps/thumbnails/oceanview-course-thumb.jpg",
            "metadataUrl": "/uploads/maps/metadata/oceanview",
            "bounds": {
              "north": 35.1896,
              "south": 35.1696,
              "east": 129.0856,
              "west": 129.0656
            },
            "layers": [
              {
                "name": "fairway",
                "visible": True,
                "type": "polygon"
              },
              {
                "name": "water",
                "visible": True,
                "type": "polygon"
              },
              {
                "name": "sand",
                "visible": True,
                "type": "polygon"
              }
            ],
            "fileSize": 8456320,
            "resolution": "2048x2048",
            "createdAt": "2024-01-08T09:00:00Z",
            "updatedAt": "2024-01-08T09:00:00Z"
          },
          {
            "id": "MAP-003",
            "name": "마운틴 골프클럽 위성 맵",
            "description": "마운틴 골프클럽 산악 코스 위성 이미지",
            "golfCourseId": "GC-003",
            "golfCourseName": "마운틴 골프클럽",
            "type": "SATELLITE",
            "version": "2.1.0",
            "imageUrl": "/uploads/maps/images/mountain-satellite.jpg",
            "thumbnailUrl": "/uploads/maps/thumbnails/mountain-satellite-thumb.jpg",
            "metadataUrl": "/uploads/maps/metadata/mountain",
            "bounds": {
              "north": 37.8412,
              "south": 37.8212,
              "east": 127.5147,
              "west": 127.4947
            },
            "layers": [
              {
                "name": "terrain",
                "visible": True,
                "type": "raster"
              },
              {
                "name": "trees",
                "visible": True,
                "type": "polygon"
              },
              {
                "name": "paths",
                "visible": True,
                "type": "line"
              }
            ],
            "fileSize": 25165824,
            "resolution": "8192x8192",
            "createdAt": "2024-01-05T09:00:00Z",
            "updatedAt": "2024-01-11T14:00:00Z"
          }
        ],
        "pagination": {
          "page": page,
          "limit": limit,
          "total": 12,
          "totalPages": 1
        }
      }
    }

@router.post("", status_code=201)
async def create_map(body: Dict[Any, Any]):
    return {
      "success": True,
      "data": {
        "id": "MAP-002",
        **body
      },
      "message": "맵이 생성되었습니다."
    }

@router.get("/{id}")
async def get_map_details(id: str):
    return {
      "success": True,
      "data": {
        "id": "MAP-001",
        "name": "그린필드 전체 맵",
        "description": "그린필드 골프클럽 전체 코스 맵",
        "golfCourseId": "GC-001",
        "golfCourseName": "그린필드 골프클럽",
        "type": "3D",
        "version": "1.2.0",
        "imageUrl": "/uploads/maps/images/greenfield-full.jpg",
        "thumbnailUrl": "/uploads/maps/thumbnails/greenfield-full-thumb.jpg",
        "metadataUrl": "/uploads/maps/metadata/greenfield",
        "metadata": {
          "format": "geojson",
          "projection": "EPSG:4326",
          "accuracy": 0.5,
          "captureDate": "2024-01-05",
          "source": "Drone Survey"
        },
        "bounds": {
          "north": 37.5165,
          "south": 37.4965,
          "east": 127.0639,
          "west": 127.0439,
          "center": {
            "latitude": 37.5065,
            "longitude": 127.0539
          }
        },
        "layers": [
          {
            "id": "layer-001",
            "name": "fairway",
            "type": "polygon",
            "visible": True,
            "style": {
              "fillColor": "#90EE90",
              "strokeColor": "#228B22",
              "strokeWidth": 2
            },
            "features": 18
          }
        ],
        "waypoints": [
          {
            "id": "wp-001",
            "name": "Hole 1 Tee",
            "type": "tee",
            "coordinates": {
              "latitude": 37.5075,
              "longitude": 127.0549
            }
          }
        ],
        "statistics": {
          "totalArea": 850000,
          "totalDistance": 6850,
          "holes": 18,
          "par": 72
        },
        "files": {
          "image": {
            "url": "/uploads/maps/images/greenfield-full.jpg",
            "size": 5242880,
            "mimeType": "image/jpeg",
            "resolution": "4096x4096"
          },
          "metadata": {
            "url": "/uploads/maps/metadata/greenfield",
            "size": 10485760,
            "fileCount": 25,
            "format": "geojson"
          }
        },
        "createdAt": "2024-01-10T09:00:00Z",
        "updatedAt": "2024-01-12T10:00:00Z",
        "createdBy": {
          "id": "USER-001",
          "name": "관리자"
        },
        "updatedBy": {
          "id": "USER-001",
          "name": "관리자"
        }
      }
    }

@router.put("/{id}")
async def update_map(id: str, body: Dict[Any, Any]):
    return {
      "success": True,
      "data": {
        "id": id,
        "name": "수정된 맵 이름",
        "description": "수정된 설명",
        "version": "1.3.0",
      },
      "message": "맵 정보가 수정되었습니다."
    }

@router.delete("/{id}")
async def delete_map(id: str):
    return {
      "success": True,
      "message": "맵이 삭제되었습니다."
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
