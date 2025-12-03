# Hakuna Light API Documentation

## Base URL

- Development: `http://localhost:3001`
- Production: `http://your-domain.com` (через Nginx proxy)

## Authentication

Admin endpoints require Basic Authentication:
```
Authorization: Basic base64(admin:ADMIN_PASSWORD)
```

## REST API Endpoints

### Health Check

```http
GET /api/health
```

**Response:**
```json
{
  "ok": true,
  "timestamp": "2024-12-02T10:00:00.000Z",
  "uptime": 3600,
  "database": "connected"
}
```

---

### Get Application State

```http
GET /api/state
```

**Response:**
```json
{
  "totalCounts": {
    "1": 25,
    "2": 30,
    "3": 20,
    "4": 15
  },
  "total": 90,
  "last50": [
    {
      "id": "uuid-here",
      "name": "Имя",
      "choice": 1,
      "created_at": "2024-12-02T10:00:00.000Z"
    }
  ],
  "target": 110,
  "brightnessRange": {
    "min": 0.2,
    "max": 1.10
  },
  "code": "8375"
}
```

---

### Submit Access Code

```http
POST /api/submit
Content-Type: application/json

{
  "name": "Имя пользователя",
  "code": "8375"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Код подтверждён"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Неверный код доступа"
}
```

---

### Submit Choice

```http
POST /api/choice
Content-Type: application/json

{
  "name": "Имя пользователя",
  "choice": 1
}
```

**Choices:**
- `1` - Красный (тфилин, цдака, молитва)
- `2` - Жёлтый (свечи Шаббата)
- `3` - Белый (ханукальные свечи)
- `4` - Оранжевый (привести другого еврея)

**Success Response:**
```json
{
  "success": true,
  "vote": {
    "id": "uuid-here",
    "name": "Имя",
    "choice": 1,
    "color": "#ff4136",
    "created_at": "2024-12-02T10:00:00.000Z"
  }
}
```

---

### Admin: Get Last 50 Votes

```http
GET /api/admin/last50
Authorization: Basic YWRtaW46cGFzc3dvcmQ=
```

**Response:**
```json
[
  {
    "id": "uuid-here",
    "name": "Имя",
    "choice": 1,
    "created_at": "2024-12-02T10:00:00.000Z"
  }
]
```

---

### Admin: Export CSV

```http
GET /api/admin/export
Authorization: Basic YWRtaW46cGFzc3dvcmQ=
```

**Response:** CSV file download

```csv
id,name,choice,created_at
"uuid","Имя",1,"2024-12-02T10:00:00.000Z"
```

---

### Admin: Reset Database

```http
POST /api/admin/reset
Authorization: Basic YWRtaW46cGFzc3dvcmQ=
```

**Response:**
```json
{
  "success": true,
  "message": "Удалено 90 записей",
  "deletedCount": 90
}
```

---

## Socket.IO Events

### Namespace: `/live`

Connect URL: `ws://localhost:3001/live`

### Client → Server Events

#### `handshake`

Sent immediately after connection to identify client role.

```typescript
socket.emit('handshake', {
  role: 'presenter' | 'client' | 'admin'
});
```

#### `submit_choice`

Alternative to REST API for submitting votes.

```typescript
socket.emit('submit_choice', {
  name: 'Имя',
  choice: 1
});
```

#### `test_vote` (Admin only)

Generate test vote for animation testing.

```typescript
socket.emit('test_vote', {
  name: 'Тест',
  choice: 2
});
```

---

### Server → Client Events

#### `sync_state`

Sent after handshake with full current state.

```typescript
socket.on('sync_state', (data) => {
  // data: {
  //   counts: { 1: 25, 2: 30, 3: 20, 4: 15 },
  //   total: 90,
  //   last50: [...],
  //   brightness: 0.56
  // }
});
```

#### `new_vote`

Broadcast when a new vote is submitted.

```typescript
socket.on('new_vote', (vote) => {
  // vote: {
  //   id: 'uuid',
  //   name: 'Имя',
  //   choice: 1,
  //   color: '#ff4136',
  //   created_at: '2024-12-02T10:00:00.000Z'
  // }
});
```

#### `update_counts`

Broadcast with updated statistics after each vote.

```typescript
socket.on('update_counts', (data) => {
  // data: {
  //   counts: { 1: 26, 2: 30, 3: 20, 4: 15 },
  //   total: 91,
  //   brightness: 0.57
  // }
});
```

#### `error`

Sent when an error occurs.

```typescript
socket.on('error', (err) => {
  // err: { message: 'Error description' }
});
```

---

## Brightness Calculation

Brightness is calculated based on total votes:

```
brightness = min + (total / target) * (max - min)
brightness = clamp(brightness, min, max)
```

Default values:
- `min`: 0.2 (20%)
- `max`: 1.10 (110%)
- `target`: 110 votes

---

## Color Mapping

| Choice | Color Name | Hex Code |
|--------|------------|----------|
| 1 | Red | #ff4136 |
| 2 | Yellow | #ffdc00 |
| 3 | White | #fffef0 |
| 4 | Orange | #ff851b |

---

## Error Codes

| Status | Description |
|--------|-------------|
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid code or admin password |
| 404 | Not Found - Endpoint doesn't exist |
| 500 | Internal Server Error |
| 503 | Service Unavailable - Database connection failed |

