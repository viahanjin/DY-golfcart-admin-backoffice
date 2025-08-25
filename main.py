from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from routers import auth, golf_courses, carts, maps, address, users
from routers import cart_models

app = FastAPI(
    title="골프카트 관리 백오피스 API",
    description="""
DY 골프카트 관리 백오피스 시스템의 REST API 명세서입니다.

## 주요 기능
- 사용자 인증 및 권한 관리
- 골프장 정보 관리 (CRUD)
- 골프카트 모니터링 및 관리
- 맵 관리 및 파일 업로드
- 실시간 카트 위치 추적

## 인증
모든 API 요청은 JWT Bearer 토큰이 필요합니다.

## 실시간 데이터
- 카트 위치 및 배터리 상태 실시간 모니터링
- WebSocket 연결을 통한 실시간 알림
    """,
    version="1.0.0",
    contact={
        "name": "DY Golf Cart API Support",
        "email": "api-support@dygolfcart.com"
    },
    license_info={
        "name": "Private"
    },
    servers=[
        {"url": "http://localhost:8080/api", "description": "Development server"},
        {"url": "https://staging-api.dygolfcart.com/api", "description": "Staging server"},
        {"url": "https://api.dygolfcart.com/api", "description": "Production server"}
    ]
)

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 실제 프로덕션 환경에서는 허용할 출처를 명시해야 합니다.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 정적 파일 제공 설정 (업로드된 파일들을 제공)
uploads_path = Path("uploads")
if uploads_path.exists():
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# 라우터 포함
app.include_router(auth.router, prefix="/api")
app.include_router(golf_courses.router, prefix="/api")
app.include_router(carts.router, prefix="/api")
app.include_router(cart_models.router, prefix="/api")
print(f"🚗 Cart models router included with routes: {[route.path for route in cart_models.router.routes]}")
# 골프장 카트 API는 carts 라우터에 통합됨
app.include_router(maps.router, prefix="/api")
app.include_router(address.router, prefix="/api")
app.include_router(users.router, prefix="/api")

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to the Golf Cart Management Mock API Server. Visit /docs for API documentation."}
