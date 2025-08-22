from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from dependencies.auth import (
    authenticate_user, 
    create_access_token, 
    create_refresh_token,
    verify_token,
    get_user_by_email
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

security = HTTPBearer()

class LoginRequest(BaseModel):
    email: str
    password: str

class RefreshRequest(BaseModel):
    refresh_token: str

@router.post("/login")
async def login(request: LoginRequest):
    """사용자 로그인"""
    user = authenticate_user(request.email, request.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 올바르지 않습니다"
        )
    
    # JWT 토큰 생성
    token_data = {"sub": user["email"], "user_id": user["id"]}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    return {
        "success": True,
        "data": {
            "accessToken": access_token,
            "refreshToken": refresh_token,
            "user": {
                "id": user["id"],
                "email": user["email"],
                "name": user["name"],
                "role": user["role"]
            }
        }
    }

@router.post("/refresh")
async def refresh_token(request: RefreshRequest):
    """토큰 갱신"""
    try:
        # Refresh Token 검증
        payload = verify_token(request.refresh_token, token_type="refresh")
        email = payload.get("sub")
        
        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        # 사용자 정보 조회
        user = get_user_by_email(email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        # 새 Access Token 생성
        token_data = {"sub": user["email"], "user_id": user["id"]}
        new_access_token = create_access_token(token_data)
        
        return {
            "success": True,
            "data": {
                "accessToken": new_access_token,
                "refreshToken": request.refresh_token  # Refresh Token은 재사용
            }
        }
        
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

@router.post("/logout")
async def logout():
    """로그아웃 (클라이언트에서 토큰 삭제)"""
    return {
        "success": True,
        "message": "로그아웃되었습니다."
    }

@router.get("/me")
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """현재 사용자 정보 조회"""
    try:
        payload = verify_token(credentials.credentials)
        email = payload.get("sub")
        
        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        user = get_user_by_email(email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        return {
            "success": True,
            "data": {
                "id": user["id"],
                "email": user["email"],
                "name": user["name"],
                "role": user["role"]
            }
        }
        
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
