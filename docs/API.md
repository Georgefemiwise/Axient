# API Documentation

## Authentication

All API endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Authentication Endpoints

#### POST /api/auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "admin",
      "name": "John Doe"
    }
  }
}
```

#### POST /api/auth/logout
Logout and invalidate token.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## License Plates

### GET /api/plates
Get all detected license plates with pagination and filtering.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `camera_id` (string): Filter by camera ID
- `status` (string): Filter by status (pending, verified, flagged)
- `date_from` (string): Filter from date (ISO format)
- `date_to` (string): Filter to date (ISO format)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "plate_number": "ABC-1234",
      "confidence": 0.95,
      "image_url": "https://example.com/image.jpg",
      "detected_at": "2024-01-15T10:30:00Z",
      "camera_id": "uuid",
      "location": {
        "latitude": 40.7128,
        "longitude": -74.0060
      },
      "vehicle_info": {
        "make": "Toyota",
        "model": "Camry",
        "color": "White"
      },
      "status": "verified",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### GET /api/plates/:id
Get a specific license plate by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "plate_number": "ABC-1234",
    "confidence": 0.95,
    "image_url": "https://example.com/image.jpg",
    "detected_at": "2024-01-15T10:30:00Z",
    "camera_id": "uuid",
    "status": "verified"
  }
}
```

### PUT /api/plates/:id
Update a license plate's status or information.

**Request Body:**
```json
{
  "status": "verified",
  "vehicle_info": {
    "make": "Toyota",
    "model": "Camry",
    "color": "White"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "verified",
    "updated_at": "2024-01-15T10:35:00Z"
  }
}
```

### DELETE /api/plates/:id
Delete a license plate record.

**Response:**
```json
{
  "success": true,
  "message": "License plate deleted successfully"
}
```

## Registered Plates

### GET /api/registered-plates
Get all registered plates.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by status
- `search` (string): Search by plate number or owner name

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "plate_number": "ABC-1234",
      "owner_name": "John Doe",
      "owner_phone": "+1234567890",
      "vehicle_make": "Toyota",
      "vehicle_model": "Camry",
      "vehicle_color": "White",
      "registration_date": "2024-01-01",
      "expiry_date": "2025-01-01",
      "status": "active",
      "alert_enabled": true,
      "notes": "VIP customer",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /api/registered-plates
Register a new plate.

**Request Body:**
```json
{
  "plate_number": "ABC-1234",
  "owner_name": "John Doe",
  "owner_phone": "+1234567890",
  "vehicle_make": "Toyota",
  "vehicle_model": "Camry",
  "vehicle_color": "White",
  "expiry_date": "2025-01-01",
  "alert_enabled": true,
  "notes": "VIP customer"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "plate_number": "ABC-1234",
    "owner_name": "John Doe",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### PUT /api/registered-plates/:id
Update a registered plate.

**Request Body:**
```json
{
  "owner_phone": "+1234567891",
  "status": "inactive",
  "alert_enabled": false
}
```

### DELETE /api/registered-plates/:id
Delete a registered plate.

## Cameras

### GET /api/cameras
Get all cameras.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Main Entrance",
      "location": "Building A - Main Gate",
      "ip_address": "192.168.1.100",
      "port": 554,
      "stream_url": "rtsp://192.168.1.100:554/stream1",
      "status": "online",
      "last_heartbeat": "2024-01-15T10:30:00Z",
      "settings": {
        "resolution": "1920x1080",
        "fps": 30,
        "detection_zone": [
          {
            "x": 100,
            "y": 100,
            "width": 800,
            "height": 600
          }
        ]
      },
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### POST /api/cameras
Add a new camera.

**Request Body:**
```json
{
  "name": "Side Entrance",
  "location": "Building B - Side Gate",
  "ip_address": "192.168.1.104",
  "port": 554,
  "username": "admin",
  "password": "password123",
  "stream_url": "rtsp://192.168.1.104:554/stream1",
  "settings": {
    "resolution": "1920x1080",
    "fps": 25
  }
}
```

### PUT /api/cameras/:id
Update camera configuration.

### DELETE /api/cameras/:id
Remove a camera.

## Detections

### GET /api/detections
Get detection history with detailed information.

**Query Parameters:**
- `page`, `limit`: Pagination
- `camera_id`: Filter by camera
- `date_from`, `date_to`: Date range
- `confidence_min`: Minimum confidence threshold

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "camera_id": "uuid",
      "plate_id": "uuid",
      "registered_plate_id": "uuid",
      "confidence": 0.95,
      "bounding_box": {
        "x": 100,
        "y": 150,
        "width": 200,
        "height": 80
      },
      "processing_time": 0.25,
      "notification_sent": true,
      "created_at": "2024-01-15T10:30:00Z",
      "camera": {
        "name": "Main Entrance",
        "location": "Building A"
      },
      "plate": {
        "plate_number": "ABC-1234",
        "image_url": "https://example.com/image.jpg"
      },
      "registered_plate": {
        "owner_name": "John Doe",
        "owner_phone": "+1234567890"
      }
    }
  ]
}
```

## Analytics

### GET /api/analytics/stats
Get system statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "total_detections": 1247,
    "total_registered_plates": 89,
    "active_cameras": 12,
    "detections_today": 156,
    "accuracy_rate": 94.2,
    "avg_processing_time": 0.3,
    "system_uptime": 99.8
  }
}
```

### GET /api/analytics/detections-by-hour
Get detection counts by hour for the last 24 hours.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "hour": "2024-01-15T00:00:00Z",
      "count": 12
    },
    {
      "hour": "2024-01-15T01:00:00Z",
      "count": 8
    }
  ]
}
```

### GET /api/analytics/top-cameras
Get cameras with most detections.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "camera_id": "uuid",
      "camera_name": "Main Entrance",
      "detection_count": 245
    }
  ]
}
```

## Notifications

### GET /api/notifications
Get notification history.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "detection_id": "uuid",
      "phone_number": "+1234567890",
      "message": "Vehicle ABC-1234 detected at Main Entrance",
      "status": "sent",
      "provider": "twilio",
      "sent_at": "2024-01-15T10:30:00Z",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### POST /api/notifications/test
Send a test notification.

**Request Body:**
```json
{
  "phone_number": "+1234567890",
  "message": "Test notification from Axient ALPR"
}
```

## Users

### GET /api/users
Get all users (admin only).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "role": "operator",
      "name": "Jane Smith",
      "phone": "+1234567890",
      "permissions": ["view_detections", "manage_plates"],
      "last_login": "2024-01-15T09:00:00Z",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /api/users
Create a new user (admin only).

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "role": "operator",
  "name": "New User",
  "phone": "+1234567890",
  "permissions": ["view_detections", "manage_plates"]
}
```

### PUT /api/users/:id
Update user information.

### DELETE /api/users/:id
Delete a user.

## System

### GET /api/system/health
Get system health status.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00Z",
    "services": {
      "database": "connected",
      "ml_service": "active",
      "sms_service": "operational",
      "websocket": "connected"
    },
    "performance": {
      "cpu_usage": 45.2,
      "memory_usage": 67.8,
      "disk_usage": 23.1
    }
  }
}
```

### GET /api/system/logs
Get system logs (admin only).

**Query Parameters:**
- `level`: Filter by log level (error, warn, info, debug)
- `limit`: Number of logs to return
- `date_from`, `date_to`: Date range

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "level": "info",
      "message": "New detection processed",
      "metadata": {
        "plate_number": "ABC-1234",
        "camera_id": "uuid",
        "processing_time": 0.25
      },
      "user_id": "uuid",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## WebSocket Events

### Client to Server Events

#### authenticate
Authenticate WebSocket connection.
```json
{
  "token": "jwt-token"
}
```

#### join_room
Join a specific room for targeted updates.
```json
{
  "room": "detections"
}
```

### Server to Client Events

#### new_detection
New license plate detection.
```json
{
  "id": "uuid",
  "plate_number": "ABC-1234",
  "camera_id": "uuid",
  "confidence": 0.95,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### camera_status
Camera status update.
```json
{
  "camera_id": "uuid",
  "status": "offline",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### system_alert
System-wide alert.
```json
{
  "type": "error",
  "message": "Database connection lost",
  "severity": "high",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Error Responses

All API endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "validation error details"
  }
}
```

### Common Error Codes
- `UNAUTHORIZED`: Invalid or missing authentication
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid request data
- `RATE_LIMITED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Rate Limits

- General API: 100 requests per minute
- Authentication: 5 requests per 15 minutes
- SMS notifications: 10 per hour per user

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset timestamp