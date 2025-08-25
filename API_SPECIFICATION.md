# 골프카트 관리 백오피스 API 명세서

## 기본 정보

### Base URL
```
Development: http://localhost:8080/api
Production: https://api.golfcart.example.com/api
```

### 인증
모든 API 요청에는 JWT 토큰이 필요합니다.
```
Authorization: Bearer {access_token}
```

### 공통 응답 형식

#### 성공 응답
```json
{
  "success": true,
  "data": {}, // 응답 데이터
  "message": "Success message"
}
```

#### 에러 응답
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {} // 추가 에러 정보 (optional)
  }
}
```

### HTTP 상태 코드
- `200 OK` - 요청 성공
- `201 Created` - 리소스 생성 성공
- `400 Bad Request` - 잘못된 요청
- `401 Unauthorized` - 인증 실패
- `403 Forbidden` - 권한 없음
- `404 Not Found` - 리소스를 찾을 수 없음
- `409 Conflict` - 중복된 데이터
- `422 Unprocessable Entity` - 유효성 검사 실패
- `500 Internal Server Error` - 서버 오류

---

## 1. 인증 (Authentication)

### 1.1 로그인
**POST** `/auth/login`

#### Request Body
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_123",
      "email": "admin@example.com",
      "name": "관리자",
      "role": "ADMIN"
    }
  }
}
```

### 1.2 토큰 갱신
**POST** `/auth/refresh`

#### Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 1.3 로그아웃
**POST** `/auth/logout`

#### Request Header
```
Authorization: Bearer {access_token}
```

#### Response
```json
{
  "success": true,
  "message": "로그아웃되었습니다."
}
```

---

## 2. 골프장 관리 (Golf Courses)

### 2.1 골프장 목록 조회
**GET** `/golf-courses`

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | 페이지 번호 (기본값: 1) |
| limit | number | No | 페이지당 항목 수 (기본값: 20) |
| search | string | No | 검색어 (골프장명, 주소) |
| status | string | No | 상태 필터 (ACTIVE, INACTIVE) |
| sortBy | string | No | 정렬 기준 (name, createdAt) |
| sortOrder | string | No | 정렬 순서 (asc, desc) |

#### Response
```json
{
  "success": true,
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
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

### 2.2 골프장 상세 조회
**GET** `/golf-courses/{id}`

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | 골프장 ID |

#### Response
```json
{
  "success": true,
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
```

### 2.3 골프장 생성
**POST** `/golf-courses`

#### Request Body
```json
{
  "name": "그린필드 골프클럽",
  "description": "서울 도심에 위치한 프리미엄 골프클럽",
  "address": "서울특별시 강남구 테헤란로 123",
  "detailAddress": "골프빌딩 1층",
  "postalCode": "06234",
  "phone": "02-1234-5678",
  "fax": "02-1234-5679",
  "email": "info@greenfield.com",
  "website": "https://www.greenfield.com",
  "location": {
    "latitude": 37.5065,
    "longitude": 127.0539
  },
  "operatingHours": {
    "weekday": "06:00-18:00",
    "weekend": "05:00-19:00",
    "holiday": "05:00-19:00"
  },
  "facilities": ["프로샵", "레스토랑", "사우나", "연습장"]
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "GC-002",
    "name": "그린필드 골프클럽",
    // ... 생성된 골프장 정보
  },
  "message": "골프장이 생성되었습니다."
}
```

### 2.4 골프장 수정
**PUT** `/golf-courses/{id}`

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | 골프장 ID |

#### Request Body
```json
{
  "name": "그린필드 골프클럽 (수정)",
  "description": "수정된 설명",
  "phone": "02-9876-5432",
  // ... 수정할 필드들
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "GC-001",
    // ... 수정된 골프장 정보
  },
  "message": "골프장 정보가 수정되었습니다."
}
```

### 2.5 골프장 삭제
**DELETE** `/golf-courses/{id}`

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | 골프장 ID |

#### Response
```json
{
  "success": true,
  "message": "골프장이 삭제되었습니다."
}
```

### 2.6 골프장명 중복 확인
**GET** `/golf-courses/check-duplicate`

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | 확인할 골프장명 |
| excludeId | string | No | 제외할 골프장 ID (수정 시) |

#### Response
```json
{
  "success": true,
  "data": {
    "isDuplicate": false
  }
}
```

---

## 3. 카트 관리 (Carts)

### 3.1 카트 목록 조회
**GET** `/carts`

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | 페이지 번호 (기본값: 1) |
| limit | number | No | 페이지당 항목 수 (기본값: 20) |
| golfCourseId | string | No | 골프장 ID 필터 |
| status | string | No | 상태 필터 (AVAILABLE, IN_USE, MAINTENANCE, CHARGING) |
| batteryLevel | string | No | 배터리 레벨 필터 (LOW, MEDIUM, HIGH) |
| search | string | No | 검색어 (카트 번호, 모델명) |

#### Response
```json
{
  "success": true,
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
        "isCharging": false,
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
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

### 3.2 카트 상세 조회
**GET** `/carts/{id}`

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | 카트 ID |

#### Response
```json
{
  "success": true,
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
      "isCharging": false,
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
```

### 3.3 카트 생성
**POST** `/carts`

#### Request Body
```json
{
  "cartNumber": "A-002",
  "modelName": "EZ-GO RXV",
  "manufacturer": "E-Z-GO",
  "manufacturingDate": "2024-01-01",
  "purchaseDate": "2024-01-15",
  "golfCourseId": "GC-001",
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
    "voltage": 48,
    "capacity": 150
  }
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "CART-002",
    // ... 생성된 카트 정보
  },
  "message": "카트가 등록되었습니다."
}
```

### 3.4 카트 수정
**PUT** `/carts/{id}`

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | 카트 ID |

#### Request Body
```json
{
  "cartNumber": "A-002-MOD",
  "status": "MAINTENANCE",
  // ... 수정할 필드들
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "CART-001",
    // ... 수정된 카트 정보
  },
  "message": "카트 정보가 수정되었습니다."
}
```

### 3.5 카트 삭제
**DELETE** `/carts/{id}`

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | 카트 ID |

#### Response
```json
{
  "success": true,
  "message": "카트가 삭제되었습니다."
}
```

### 3.6 카트 상태 업데이트
**PATCH** `/carts/{id}/status`

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | 카트 ID |

#### Request Body
```json
{
  "status": "IN_USE",
  "note": "홀 9번에서 사용 중"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "CART-001",
    "status": "IN_USE",
    "statusChangedAt": "2024-01-15T15:00:00Z"
  },
  "message": "카트 상태가 업데이트되었습니다."
}
```

### 3.7 카트 배터리 상태 조회
**GET** `/carts/{id}/battery`

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | 카트 ID |

#### Response
```json
{
  "success": true,
  "data": {
    "cartId": "CART-001",
    "level": 85,
    "voltage": 47.8,
    "current": 0,
    "temperature": 25.5,
    "status": "NORMAL",
    "isCharging": false,
    "estimatedRange": 35,
    "estimatedTime": 6.5,
    "cycles": 125,
    "health": 95,
    "lastUpdate": "2024-01-15T15:00:00Z"
  }
}
```

### 3.8 카트 위치 조회
**GET** `/carts/{id}/location`

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | 카트 ID |

#### Response
```json
{
  "success": true,
  "data": {
    "cartId": "CART-001",
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
```

---

## 4. 맵 관리 (Maps)

### 4.1 맵 목록 조회
**GET** `/maps`

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | 페이지 번호 (기본값: 1) |
| limit | number | No | 페이지당 항목 수 (기본값: 20) |
| golfCourseId | string | No | 골프장 ID 필터 |
| type | string | No | 맵 타입 (2D, 3D, SATELLITE) |
| search | string | No | 검색어 (맵 이름) |

#### Response
```json
{
  "success": true,
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
            "visible": true,
            "type": "polygon"
          },
          {
            "name": "green",
            "visible": true,
            "type": "polygon"
          },
          {
            "name": "hazard",
            "visible": true,
            "type": "polygon"
          }
        ],
        "fileSize": 15728640,
        "resolution": "4096x4096",
        "createdAt": "2024-01-10T09:00:00Z",
        "updatedAt": "2024-01-12T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 12,
      "totalPages": 1
    }
  }
}
```

### 4.2 맵 상세 조회
**GET** `/maps/{id}`

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | 맵 ID |

#### Response
```json
{
  "success": true,
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
        "visible": true,
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
```

### 4.3 맵 생성
**POST** `/maps`

#### Request Body
```json
{
  "name": "새로운 코스 맵",
  "description": "새로 추가된 코스의 상세 맵",
  "golfCourseId": "GC-001",
  "type": "3D",
  "bounds": {
    "north": 37.5165,
    "south": 37.4965,
    "east": 127.0639,
    "west": 127.0439
  }
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "MAP-002",
    // ... 생성된 맵 정보
  },
  "message": "맵이 생성되었습니다."
}
```

### 4.4 맵 수정
**PUT** `/maps/{id}`

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | 맵 ID |

#### Request Body
```json
{
  "name": "수정된 맵 이름",
  "description": "수정된 설명",
  "version": "1.3.0",
  // ... 수정할 필드들
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "MAP-001",
    // ... 수정된 맵 정보
  },
  "message": "맵 정보가 수정되었습니다."
}
```

### 4.5 맵 삭제
**DELETE** `/maps/{id}`

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | 맵 ID |

#### Response
```json
{
  "success": true,
  "message": "맵이 삭제되었습니다."
}
```

### 4.6 이미지 파일 업로드
**POST** `/maps/upload-image`

#### Request Body (multipart/form-data)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| image | file | Yes | 업로드할 이미지 파일 |
| mapId | string | No | 연결할 맵 ID |

#### Response
```json
{
  "success": true,
  "data": {
    "url": "/uploads/maps/images/map-image-12345.jpg",
    "thumbnailUrl": "/uploads/maps/thumbnails/map-image-12345-thumb.jpg",
    "filename": "map-image-12345.jpg",
    "size": 5242880,
    "mimeType": "image/jpeg",
    "resolution": "4096x4096"
  },
  "message": "이미지가 업로드되었습니다."
}
```

### 4.7 메타데이터 폴더 업로드
**POST** `/maps/upload-metadata`

#### Request Body (multipart/form-data)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| metadata_files | file[] | Yes | 메타데이터 파일들 |
| file_paths_{n} | string | Yes | 각 파일의 상대 경로 |
| mapId | string | No | 연결할 맵 ID |

#### Response
```json
{
  "success": true,
  "data": {
    "folderPath": "/uploads/maps/metadata/folder-12345",
    "fileCount": 25,
    "jsonFileCount": 20,
    "totalSize": 10485760,
    "files": [
      {
        "name": "hole1.json",
        "path": "holes/hole1.json",
        "size": 524288
      }
    ]
  },
  "message": "메타데이터가 업로드되었습니다."
}
```

---

## 5. 주소 관련 (Address)

### 5.1 우편번호 검색
**GET** `/address/search`

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| postalCode | string | Yes | 우편번호 |

#### Response
```json
{
  "success": true,
  "data": {
    "postalCode": "06234",
    "address": "서울특별시 강남구 테헤란로",
    "englishAddress": "Teheran-ro, Gangnam-gu, Seoul",
    "addressType": "ROAD",
    "latitude": 37.5065,
    "longitude": 127.0539
  }
}
```

### 5.2 역지오코딩
**GET** `/address/reverse-geocode`

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| lat | number | Yes | 위도 |
| lng | number | Yes | 경도 |

#### Response
```json
{
  "success": true,
  "data": {
    "address": "서울특별시 강남구 테헤란로 123",
    "postalCode": "06234",
    "addressType": "ROAD",
    "building": "골프빌딩",
    "coordinates": {
      "latitude": 37.5065,
      "longitude": 127.0539
    }
  }
}
```

---

## 6. 사용자 관리 (Users)

### 6.1 사용자 목록 조회
**GET** `/users`

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | 페이지 번호 (기본값: 1) |
| limit | number | No | 페이지당 항목 수 (기본값: 20) |
| role | string | No | 역할 필터 (ADMIN, MANAGER, USER) |
| status | string | No | 상태 필터 (ACTIVE, INACTIVE, BLOCKED) |
| search | string | No | 검색어 (이름, 이메일) |

#### Response
```json
{
  "success": true,
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
        "golfCourseId": null,
        "lastLoginAt": "2024-01-15T09:00:00Z",
        "createdAt": "2024-01-01T09:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 35,
      "totalPages": 2
    }
  }
}
```

---

## 에러 코드 목록

| Code | HTTP Status | Description |
|------|-------------|-------------|
| AUTH_INVALID_CREDENTIALS | 401 | 잘못된 로그인 정보 |
| AUTH_TOKEN_EXPIRED | 401 | 토큰 만료 |
| AUTH_TOKEN_INVALID | 401 | 유효하지 않은 토큰 |
| AUTH_INSUFFICIENT_PERMISSION | 403 | 권한 부족 |
| VALIDATION_ERROR | 422 | 유효성 검사 실패 |
| DUPLICATE_ENTRY | 409 | 중복된 데이터 |
| RESOURCE_NOT_FOUND | 404 | 리소스를 찾을 수 없음 |
| FILE_UPLOAD_ERROR | 400 | 파일 업로드 실패 |
| FILE_SIZE_EXCEEDED | 413 | 파일 크기 초과 |
| INVALID_FILE_FORMAT | 415 | 지원하지 않는 파일 형식 |
| DATABASE_ERROR | 500 | 데이터베이스 오류 |
| EXTERNAL_API_ERROR | 502 | 외부 API 오류 |
| RATE_LIMIT_EXCEEDED | 429 | 요청 한도 초과 |

---

## 파일 업로드 제한

- **이미지 파일**: JPG, PNG, GIF, WebP
- **최대 파일 크기**: 10MB (이미지), 100MB (메타데이터 폴더)
- **메타데이터 형식**: JSON, GeoJSON, KML, GPX

---

## Rate Limiting

- **인증 API**: 5 requests/minute
- **일반 API**: 100 requests/minute
- **파일 업로드**: 10 requests/minute

초과 시 `429 Too Many Requests` 응답과 함께 `Retry-After` 헤더가 반환됩니다.

---

## Webhook Events (Optional)

백엔드에서 특정 이벤트 발생 시 등록된 URL로 알림을 전송할 수 있습니다.

### 이벤트 타입
- `cart.status_changed` - 카트 상태 변경
- `cart.battery_low` - 카트 배터리 부족 (20% 이하)
- `cart.maintenance_due` - 카트 정비 예정
- `map.uploaded` - 새 맵 업로드
- `golfcourse.created` - 골프장 생성

### Webhook Payload
```json
{
  "event": "cart.battery_low",
  "timestamp": "2024-01-15T15:00:00Z",
  "data": {
    "cartId": "CART-001",
    "batteryLevel": 15,
    "golfCourseId": "GC-001"
  }
}
```

---

## 개발 참고사항

1. **페이지네이션**: 모든 목록 조회 API는 페이지네이션을 지원해야 합니다.
2. **정렬**: sortBy와 sortOrder 파라미터를 통한 정렬을 지원해야 합니다.
3. **필터링**: 각 리소스의 주요 속성에 대한 필터링을 지원해야 합니다.
4. **검색**: search 파라미터를 통한 텍스트 검색을 지원해야 합니다.
5. **Soft Delete**: 데이터 삭제 시 실제 삭제 대신 deletedAt 플래그 사용을 권장합니다.
6. **감사 로그**: 모든 CUD 작업에 대한 감사 로그를 기록해야 합니다.
7. **트랜잭션**: 연관된 데이터 변경은 트랜잭션으로 처리해야 합니다.

---

## 보안 고려사항

1. **HTTPS**: 모든 API 통신은 HTTPS를 사용해야 합니다.
2. **CORS**: 허용된 도메인만 API에 접근할 수 있도록 설정해야 합니다.
3. **입력 검증**: 모든 입력값에 대한 철저한 검증이 필요합니다.
4. **SQL Injection**: Prepared statements를 사용하여 SQL 인젝션을 방지해야 합니다.
5. **XSS**: 사용자 입력값은 적절히 이스케이프 처리해야 합니다.
6. **Rate Limiting**: DDoS 공격 방지를 위한 요청 제한이 필요합니다.

---

## 연락처

API 관련 문의사항이 있으시면 아래로 연락 주세요:
- Email: api-support@golfcart.example.com
- Slack: #api-support