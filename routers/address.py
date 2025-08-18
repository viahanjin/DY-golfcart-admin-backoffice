from fastapi import APIRouter

router = APIRouter(
    prefix="/address",
    tags=["Address"],
)

@router.get("/search")
async def search_address_by_postal_code(postalCode: str):
    return {
      "success": True,
      "data": {
        "postalCode": postalCode,
        "address": "서울특별시 강남구 테헤란로",
        "englishAddress": "Teheran-ro, Gangnam-gu, Seoul",
        "addressType": "ROAD",
        "latitude": 37.5065,
        "longitude": 127.0539
      }
    }

@router.get("/reverse-geocode")
async def reverse_geocode(lat: float, lng: float):
    return {
      "success": True,
      "data": {
        "address": "서울특별시 강남구 테헤란로 123",
        "postalCode": "06234",
        "addressType": "ROAD",
        "building": "골프빌딩",
        "coordinates": {
          "latitude": lat,
          "longitude": lng
        }
      }
    }
