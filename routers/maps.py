from fastapi import APIRouter, File, UploadFile, Form
from typing import Optional, List, Dict, Any
import copy
import os
import shutil
import datetime
from pathlib import Path

router = APIRouter(
    prefix="/maps",
    tags=["Maps"],
)

# 메모리에 저장할 맵 데이터 (실제 DB 대신)
maps_storage: List[Dict[Any, Any]] = []

@router.get("")
async def get_maps(page: int = 1, limit: int = 20, golfCourseId: Optional[str] = None, type: Optional[str] = None, search: Optional[str] = None):
    print(f"\n📋 맵 목록 조회 요청")
    print(f"📄 페이지: {page}, 개수: {limit}")
    print(f"💾 저장된 맵 개수: {len(maps_storage)}")
    if search:
        print(f"🔍 검색어: {search}")
    if type:
        print(f"🗺️  타입 필터: {type}")
    if golfCourseId:
        print(f"🏌️  골프장 필터: {golfCourseId}")
    
    # 기본 목 데이터
    default_maps = [
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
        ]
    
    # 저장된 맵들을 기본 맵들에 추가
    all_maps = default_maps + copy.deepcopy(maps_storage)
    
    # 필터링 적용
    filtered_maps = all_maps
    
    if search:
        filtered_maps = [m for m in filtered_maps if 
                        search.lower() in m.get("name", "").lower() or 
                        search.lower() in m.get("description", "").lower()]
    
    if type:
        filtered_maps = [m for m in filtered_maps if m.get("type") == type]
        
    if golfCourseId:
        filtered_maps = [m for m in filtered_maps if m.get("golfCourseId") == golfCourseId]
    
    # 페이지네이션
    total = len(filtered_maps)
    total_pages = (total + limit - 1) // limit
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    items = filtered_maps[start_idx:end_idx]
    
    print(f"✅ 응답: 총 {total}개 맵, {len(items)}개 반환")
    
    return {
      "success": True,
      "data": {
        "items": items,
        "pagination": {
          "page": page,
          "limit": limit,
          "total": total,
          "totalPages": total_pages
        }
      }
    }

@router.post("", status_code=201)
async def create_map(body: Dict[Any, Any]):
    global maps_storage  # 전역 변수임을 선언
    print("\n" + "="*50)
    print("🗺️  새 맵 등록 요청 수신!")
    print("="*50)
    print(f"📅 시간: {__import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🏷️  맵 ID: {body.get('id', '없음')}")
    print(f"📝 맵 이름: {body.get('name', '없음')}")
    print(f"🏌️  골프장 ID: {body.get('golfCourseId', '없음')}")
    print(f"🗺️  맵 타입: {body.get('type', '없음')}")
    print(f"📦 버전: {body.get('version', '없음')}")
    print(f"🖼️  이미지 URL: {body.get('imageUrl', '없음')}")
    print(f"📁 메타데이터 URL: {body.get('metadataUrl', '없음')}")
    print(f"📏 해상도: {body.get('resolution', '없음')}")
    print(f"💾 파일 크기: {body.get('fileSize', 0)} bytes")
    print(f"📄 설명: {body.get('description', '없음')}")
    
    if 'bounds' in body and body['bounds']:
        bounds = body['bounds']
        print(f"🌍 경계 좌표:")
        print(f"   🧭 북쪽: {bounds.get('north', '없음')}")
        print(f"   🧭 남쪽: {bounds.get('south', '없음')}")
        print(f"   🧭 동쪽: {bounds.get('east', '없음')}")
        print(f"   🧭 서쪽: {bounds.get('west', '없음')}")
        
        # 경계가 유효한지 확인
        if bounds.get('north') and bounds.get('south'):
            center_lat = (bounds['north'] + bounds['south']) / 2
            center_lng = (bounds['east'] + bounds['west']) / 2
            print(f"   📍 중심점: {center_lat:.6f}, {center_lng:.6f}")
    else:
        print("🌍 경계 좌표: 설정되지 않음")
    
    if 'layers' in body and body['layers']:
        print(f"🎨 레이어: {len(body['layers'])}개")
        for i, layer in enumerate(body['layers'][:3]):  # 최대 3개만 표시
            print(f"   Layer {i+1}: {layer.get('name', '없음')}")
    else:
        print("🎨 레이어: 없음")
    
    print("-" * 50)
    
    # 새 맵 데이터 생성
    new_map = {
        **body,
        "id": body.get('id', f"MAP-NEW-{len(maps_storage) + 1}"),
        "createdAt": __import__('datetime').datetime.now().isoformat() + "Z",
        "updatedAt": __import__('datetime').datetime.now().isoformat() + "Z"
    }
    
    # 골프장 이름 설정
    golf_course_names = {
        "1": "서울 컨트리클럽",
        "2": "부산 오션뷰 골프장"
    }
    new_map["golfCourseName"] = golf_course_names.get(new_map.get("golfCourseId", ""), "알 수 없는 골프장")
    
    # 중복 ID 체크 및 제거
    map_id = new_map["id"]
    maps_storage = [m for m in maps_storage if m.get("id") != map_id]
    
    # 메모리에 저장
    maps_storage.append(new_map)
    
    print(f"✅ 새 맵이 저장됨! (총 {len(maps_storage)}개)")
    print("="*50 + "\n")
    
    return {
      "success": True,
      "data": new_map,
      "message": "맵이 성공적으로 생성되었습니다."
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
async def upload_map_image(image: UploadFile = File(...), mapId: Optional[str] = Form(None)):
    print("\n" + "="*60)
    print("🖼️  이미지 파일 업로드 요청 수신!")
    print("="*60)
    print(f"📅 시간: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"📁 파일명: {image.filename}")
    print(f"📦 파일 크기: {image.size} bytes ({image.size / 1024 / 1024:.2f} MB)")
    print(f"🏷️  MIME 타입: {image.content_type}")
    print(f"🗺️  연결 맵 ID: {mapId or '없음'}")
    
    # 업로드 디렉토리 생성
    upload_dir = Path("uploads/maps/images")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # 파일명 중복 방지를 위해 타임스탬프 추가
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    file_extension = Path(image.filename).suffix
    safe_filename = f"{mapId or 'unknown'}_{timestamp}{file_extension}"
    file_path = upload_dir / safe_filename
    
    # 실제 파일 저장
    try:
        content = await image.read()
        print(f"📊 실제 읽은 크기: {len(content)} bytes")
        
        # 파일 시스템에 저장
        with open(file_path, "wb") as f:
            f.write(content)
        print(f"💾 파일 저장됨: {file_path}")
        
        # 썸네일 생성 시뮬레이션 (실제로는 이미지 처리 라이브러리 필요)
        thumb_dir = Path("uploads/maps/thumbnails")
        thumb_dir.mkdir(parents=True, exist_ok=True)
        thumb_path = thumb_dir / f"{safe_filename}-thumb.jpg"
        # 간단히 같은 파일을 복사 (실제로는 리사이즈 필요)
        shutil.copy(file_path, thumb_path)
        print(f"🖼️  썸네일 생성됨: {thumb_path}")
        
    except Exception as e:
        print(f"❌ 파일 저장 오류: {e}")
        return {
            "success": False,
            "error": {
                "code": "FILE_SAVE_ERROR",
                "message": f"파일 저장 중 오류가 발생했습니다: {str(e)}"
            }
        }
    
    print(f"✅ 업로드 처리 완료!")
    print("="*60 + "\n")
    
    return {
      "success": True,
      "data": {
        "url": f"/uploads/maps/images/{safe_filename}",
        "thumbnailUrl": f"/uploads/maps/thumbnails/{safe_filename}-thumb.jpg",
        "filename": safe_filename,
        "originalName": image.filename,
        "size": len(content),
        "mimeType": image.content_type,
        "resolution": "4096x4096"
      },
      "message": "이미지가 업로드되었습니다."
    }

@router.post("/upload-metadata")
async def upload_map_metadata(metadata_files: List[UploadFile] = File(...), mapId: Optional[str] = Form(None)):
    print("\n" + "="*60)
    print("📁 메타데이터 파일 업로드 요청 수신!")
    print("="*60)
    print(f"📅 시간: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"📦 총 파일 개수: {len(metadata_files)}")
    print(f"🗺️  연결 맵 ID: {mapId or '없음'}")
    
    # 메타데이터 폴더 생성
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    folder_name = f"{mapId or 'unknown'}_{timestamp}"
    metadata_dir = Path("uploads/maps/metadata") / folder_name
    metadata_dir.mkdir(parents=True, exist_ok=True)
    
    total_size = 0
    json_count = 0
    geojson_count = 0
    saved_files = []
    
    # 파일들의 상대 경로를 추출하여 폴더 구조 유지
    for i, file in enumerate(metadata_files):
        file_size = file.size or 0
        total_size += file_size
        
        if file.filename.endswith('.json'):
            json_count += 1
        if file.filename.lower().endswith('.geojson'):
            geojson_count += 1
        
        # 원본 파일명에서 경로 정보 추출 (webkitRelativePath가 있는 경우)
        relative_path = file.filename
        print(f"   📄 파일 {i+1}: {relative_path} ({file_size} bytes, {file.content_type})")
        
        # 파일 저장
        try:
            content = await file.read()
            
            # 폴더 구조를 유지하면서 파일 저장
            if '/' in relative_path:
                # 폴더 구조가 있는 경우
                file_path = metadata_dir / relative_path
            else:
                # 단일 파일인 경우
                file_path = metadata_dir / relative_path
            
            # 하위 디렉토리가 있으면 생성
            file_path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(file_path, "wb") as f:
                f.write(content)
            
            saved_files.append({
                "name": relative_path,
                "path": str(file_path.relative_to("uploads/maps/metadata")),
                "size": len(content)
            })
            
            # 처음 몇 개 파일만 내용 미리보기
            if i < 3:
                if file.filename.lower().endswith(('.json', '.geojson')):
                    # JSON 파일인 경우 처음 200자 미리보기
                    preview = content[:200].decode('utf-8', errors='ignore')
                    print(f"      🔍 미리보기: {preview[:100]}...")
                else:
                    print(f"      📊 실제 저장 크기: {len(content)} bytes")
                    print(f"      💾 저장 위치: {file_path}")
                    
        except Exception as e:
            print(f"      ❌ 파일 저장 오류: {e}")
    
    print(f"📊 총 크기: {total_size} bytes ({total_size / 1024 / 1024:.2f} MB)")
    print(f"📄 JSON 파일: {json_count}개")
    print(f"🗺️  GeoJSON 파일: {geojson_count}개")
    print(f"💾 저장된 폴더: {metadata_dir}")
    print(f"✅ 메타데이터 업로드 처리 완료!")
    print("="*60 + "\n")
    
    return {
      "success": True,
      "data": {
        "folderPath": f"/uploads/maps/metadata/{folder_name}",
        "fileCount": len(metadata_files),
        "jsonFileCount": json_count,
        "geoJsonFileCount": geojson_count,
        "totalSize": total_size,
        "files": saved_files
      },
      "message": "메타데이터가 업로드되었습니다."
    }
