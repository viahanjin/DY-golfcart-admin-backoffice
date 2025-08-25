# API Documentation

## Version History

### v0.4 (Current)
- **Date**: 2024-08
- **File**: [v0.4/openapi.yml](./v0.4/openapi.yml)
- **Changes**:
  - Initial API specification
  - Complete CRUD operations for Golf Courses, Carts, Maps
  - User authentication and management
  - Real-time cart tracking endpoints

## Structure

```
docs/api/
├── README.md           # This file
├── v0.4/              # Version 0.4 (current)
│   └── openapi.yml    # OpenAPI 3.0.3 specification
└── (future versions)
```

## Usage

The root `openapi.yml` file is a symbolic link to the current API version.

### Viewing the API Documentation

1. **Swagger UI**: Open the OpenAPI specification in [Swagger Editor](https://editor.swagger.io/)
2. **Redoc**: Use [Redoc](https://redocly.github.io/redoc/) for better documentation viewing
3. **Local Server**: Use tools like `swagger-ui-serve` to serve locally

### Version Management

When creating a new API version:

1. Create new version directory: `docs/api/v{major}.{minor}/`
2. Copy and modify the OpenAPI specification
3. Update the symlink: `ln -sf docs/api/v{major}.{minor}/openapi.yml openapi.yml`
4. Update this README with change notes

## API Base URL

- **Development**: `http://localhost:8000`
- **Production**: `https://your-domain.com/api`