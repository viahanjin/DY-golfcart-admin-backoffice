from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import auth, golf_courses, carts, maps, address, users

app = FastAPI(
    title="Golf Cart Management API Mock Server",
    description="This is a mock API server for the Golf Cart Management Backoffice, based on the provided specification.",
    version="1.0.0",
)

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 실제 프로덕션 환경에서는 허용할 출처를 명시해야 합니다.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 포함
app.include_router(auth.router, prefix="/api")
app.include_router(golf_courses.router, prefix="/api")
app.include_router(carts.router, prefix="/api")
app.include_router(maps.router, prefix="/api")
app.include_router(address.router, prefix="/api")
app.include_router(users.router, prefix="/api")

@app.get("/", tags=["Root"])
async def read_root():
    return {"message": "Welcome to the Golf Cart Management Mock API Server. Visit /docs for API documentation."}
