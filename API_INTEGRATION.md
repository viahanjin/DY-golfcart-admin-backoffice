# API 연동 가이드

이 프로젝트는 API 서버와의 연동을 위한 구조가 준비되어 있습니다. 현재는 mock 데이터를 사용하며, 실제 API 엔드포인트가 준비되면 쉽게 연결할 수 있도록 설계되었습니다.

## 📁 API 서비스 구조

```
src/lib/services/
├── api.ts                 # 공통 API 요청 헬퍼
├── mapService.ts         # 맵 관련 API
├── golfCourseService.ts  # 골프장 관련 API
└── cartService.ts        # 카트 관련 API
```

## 🔧 환경 설정

### 1. 환경 변수 설정
`.env.example`을 복사해서 `.env` 파일을 생성하고 API URL을 설정하세요.

```bash
cp .env.example .env
```

`.env` 파일 내용:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 2. API 서버 URL 변경
개발/운영 환경에 맞게 `VITE_API_BASE_URL`을 수정하세요.

## 🚀 API 연동 방법

### 1. 골프장 관리 API

**파일**: `src/lib/services/golfCourseService.ts`

```typescript
// 현재 상태 (mock 데이터)
async getGolfCourses() {
    const mockGolfCourses = await import('$lib/mock/golf-courses.json');
    return mockGolfCourses.default;
}

// API 연동 후 (주석 해제)
async getGolfCourses() {
    return await apiRequest('/golf-courses');
}
```

**필요한 엔드포인트**:
- `GET /golf-courses` - 골프장 목록 조회
- `GET /golf-courses/:id` - 골프장 상세 조회
- `POST /golf-courses` - 골프장 생성
- `PUT /golf-courses/:id` - 골프장 수정
- `DELETE /golf-courses/:id` - 골프장 삭제
- `GET /golf-courses/check-duplicate?name=:name` - 이름 중복 확인
- `GET /address/search?postalCode=:code` - 우편번호 검색
- `GET /address/reverse-geocode?lat=:lat&lng=:lng` - 역지오코딩

### 2. 카트 관리 API

**파일**: `src/lib/services/cartService.ts`

**필요한 엔드포인트**:
- `GET /carts` - 카트 목록 조회
- `GET /carts/:id` - 카트 상세 조회
- `POST /carts` - 카트 생성
- `PUT /carts/:id` - 카트 수정
- `DELETE /carts/:id` - 카트 삭제
- `PATCH /carts/:id/status` - 카트 상태 업데이트
- `GET /carts/:id/battery` - 배터리 상태 조회
- `GET /carts/:id/location` - 카트 위치 조회

### 3. 맵 관리 API

**파일**: `src/lib/services/mapService.ts`

**필요한 엔드포인트**:
- `GET /maps` - 맵 목록 조회
- `GET /maps/:id` - 맵 상세 조회
- `POST /maps` - 맵 생성
- `PUT /maps/:id` - 맵 수정
- `DELETE /maps/:id` - 맵 삭제
- `POST /maps/upload-image` - 이미지 파일 업로드
- `POST /maps/upload-metadata` - 메타데이터 폴더 업로드

## 📝 API 연동 체크리스트

### 골프장 관리
- [ ] `GET /golf-courses` 엔드포인트 연결
- [ ] `POST /golf-courses` 엔드포인트 연결
- [ ] `PUT /golf-courses/:id` 엔드포인트 연결
- [ ] `DELETE /golf-courses/:id` 엔드포인트 연결
- [ ] 골프장명 중복 확인 API 연결
- [ ] 우편번호 검색 API 연결
- [ ] 지도 위치 선택 API 연결

### 카트 관리
- [ ] `GET /carts` 엔드포인트 연결
- [ ] `POST /carts` 엔드포인트 연결
- [ ] `PUT /carts/:id` 엔드포인트 연결
- [ ] `DELETE /carts/:id` 엔드포인트 연결
- [ ] 카트 상태 업데이트 API 연결
- [ ] 실시간 배터리/위치 추적 API 연결

### 맵 관리
- [ ] `GET /maps` 엔드포인트 연결
- [ ] `POST /maps` 엔드포인트 연결
- [ ] `PUT /maps/:id` 엔드포인트 연결
- [ ] `DELETE /maps/:id` 엔드포인트 연결
- [ ] 이미지 파일 업로드 API 연결
- [ ] 메타데이터 폴더 업로드 API 연결

## 🔒 인증 추가

API 서버에 인증이 필요한 경우 `src/lib/services/api.ts`에서 인증 토큰을 추가하세요:

```typescript
// TODO 주석을 해제하고 인증 로직 추가
headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`
}
```

## 🧪 테스트

각 API 연동 후 다음을 확인하세요:

1. **네트워크 탭**에서 올바른 요청이 발송되는지 확인
2. **콘솔 로그**에서 응답 데이터 구조 확인
3. **에러 처리**가 올바르게 동작하는지 확인
4. **로딩 상태** 표시가 적절한지 확인

## 📞 문의

API 연동 과정에서 문제가 발생하면 개발팀에 문의하세요.