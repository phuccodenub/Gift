# GiftCraft API

## Base assumptions

- Canonical share URLs: `/gift/{slug}`
- Read APIs khong auto-increment view.
- View count chi tang qua beacon endpoint.

## `POST /api/gifts`

Tao gift moi.

Request body:

```json
{
  "templateId": "bouquet",
  "message": "Chuc mung 8/3",
  "senderName": "An",
  "recipientName": "Linh",
  "config": {
    "colors": {
      "primary": "#ec4899",
      "secondary": "#a855f7",
      "accent": "#f43f5e",
      "background": "#fdf2f8"
    },
    "animation": { "speed": "normal", "style": "fade" },
    "decorations": []
  },
  "images": [
    {
      "assetId": "uuid",
      "label": "Ky niem",
      "position": { "x": 20, "y": 30, "width": 80, "height": 80 }
    }
  ]
}
```

Response:

```json
{
  "id": "cuid",
  "slug": "gift-bouquet-linh-an-abc123",
  "shareUrl": "https://your-domain/gift/gift-bouquet-linh-an-abc123",
  "gift": {}
}
```

## `GET /api/gifts`

Lay 20 gift moi nhat (read-only).

## `GET /api/gifts/{id}`

Lay chi tiet gift theo `id` (read-only, khong tang view).

## `PATCH /api/gifts/{id}`

Cap nhat thong tin gift:

- `message`
- `senderName`
- `recipientName`
- `config`

## `DELETE /api/gifts/{id}`

Xoa gift va dua asset lien quan vao cleanup queue (TTL = ngay lap tuc).

## `POST /api/gifts/{id}/view`

Ghi nhan luot xem theo `viewerId`.

Request body:

```json
{
  "viewerId": "viewer-uuid"
}
```

Response:

```json
{
  "tracked": true
}
```

- `tracked=true`: lan dau viewer nay xem gift.
- `tracked=false`: viewer da duoc ghi nhan truoc do.

## `POST /api/upload`

Upload anh personal.

- MIME cho phep: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`
- Max size: `2MB`

Response:

```json
{
  "assetId": "uuid",
  "publicUrl": "/uploads/uuid.webp",
  "objectPath": "uuid.webp",
  "mimeType": "image/webp",
  "sizeBytes": 182034,
  "expiresAt": "2026-03-08T03:50:00.000Z",
  "provider": "local_dev"
}
```

## `GET|POST /api/internal/assets/cleanup?limit=50`

Endpoint internal cho cron job.

- Yeu cau header `x-cron-secret` hoac `Authorization: Bearer <CRON_SECRET>`
- Chi xoa assets:
  - `giftId = null`
  - `status IN (uploaded, pending_delete)`
  - `expiresAt <= now`

Response:

```json
{
  "success": true,
  "scanned": 12,
  "deleted": 12,
  "failed": 0
}
```

## `GET /api/export/{id}`

Export HTML offline:

- Chi chap nhan asset trong whitelist storage.
- Data duoc sanitize truoc khi render.
