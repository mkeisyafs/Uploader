# Uploader for

A modern file storage server built with **Elysia.js** and **TypeScript**, running on **Bun** runtime. Supports multiple file categories with automatic type detection.

## Features

- 🚀 **Fast** - Built on Bun runtime for maximum performance
- 📁 **Multi-category** - Organize files by type (images, documents, videos, audio, others)
- 🔒 **Secure** - API key authentication for uploads and deletes
- 📝 **TypeScript** - Full type safety
- 🎯 **Auto-detect** - Automatically categorizes files based on MIME type
- 📊 **File management** - List, info, and delete endpoints

## File Categories

| Category    | Allowed Types                                        | Max Size |
| ----------- | ---------------------------------------------------- | -------- |
| `images`    | jpg, jpeg, png, gif, webp, svg, bmp, tiff            | 10MB     |
| `documents` | pdf, doc, docx, xls, xlsx, ppt, pptx, txt, csv, json | 50MB     |
| `videos`    | mp4, webm, mov, avi, mkv, mpeg                       | 100MB    |
| `audio`     | mp3, wav, ogg, m4a, flac, aac                        | 50MB     |
| `others`    | any file type                                        | 25MB     |

## Prerequisites

- [Bun](https://bun.sh/) v1.0 or higher

## Installation

```bash
# Clone or navigate to the project
cd onpost-storage

# Install dependencies
bun install

# Copy environment file
copy .env.example .env

# Edit .env with your configuration
```

## Configuration

Create a `.env` file with the following variables:

```env
PORT=3002
BASE_URL=http://localhost:3002
API_KEY=your_secure_api_key_here
MAX_IMAGE_SIZE=10
MAX_DOCUMENT_SIZE=50
MAX_VIDEO_SIZE=100
MAX_AUDIO_SIZE=50
MAX_OTHER_SIZE=25
```

## Running

```bash
# Development (with hot reload)
bun run dev

# Production
bun run start
```

## API Endpoints

### Health Check

```http
GET /health
```

### Upload File (Auto-detect category)

```http
POST /upload
Content-Type: multipart/form-data
x-api-key: your_api_key

file: <binary>
```

### Upload to Specific Category

```http
POST /upload/:category
Content-Type: multipart/form-data
x-api-key: your_api_key

file: <binary>
```

Categories: `images`, `documents`, `videos`, `audio`, `others`

### List All Files

```http
GET /files
x-api-key: your_api_key
```

### List Files by Category

```http
GET /files/:category
x-api-key: your_api_key
```

### Get File Info

```http
GET /files/:category/:filename/info
x-api-key: your_api_key
```

### Delete File

```http
DELETE /files/:category/:filename
x-api-key: your_api_key
```

### Serve File (Public)

```http
GET /uploads/:category/:filename
```

## Example Usage

### Upload an Image (cURL)

```bash
curl -X POST http://localhost:3002/upload \
  -H "x-api-key: your_api_key" \
  -F "file=@/path/to/image.jpg"
```

### Upload a Document to Specific Category

```bash
curl -X POST http://localhost:3002/upload/documents \
  -H "x-api-key: your_api_key" \
  -F "file=@/path/to/document.pdf"
```

### List All Files

```bash
curl http://localhost:3002/files \
  -H "x-api-key: your_api_key"
```

### Delete a File

```bash
curl -X DELETE http://localhost:3002/files/images/uuid-filename.jpg \
  -H "x-api-key: your_api_key"
```

## Project Structure

```
onpost-storage/
├── src/
│   ├── index.ts              # Entry point
│   ├── config/
│   │   └── index.ts          # Configuration
│   ├── middleware/
│   │   └── auth.ts           # API key middleware
│   ├── routes/
│   │   ├── index.ts          # Route aggregator
│   │   ├── upload.ts         # Upload endpoints
│   │   ├── files.ts          # File management
│   │   └── health.ts         # Health check
│   ├── services/
│   │   └── file.service.ts   # File operations
│   ├── utils/
│   │   └── helpers.ts        # Utilities
│   └── types/
│       └── index.ts          # TypeScript types
├── uploads/                   # File storage
│   ├── images/
│   ├── documents/
│   ├── videos/
│   ├── audio/
│   └── others/
├── package.json
├── tsconfig.json
└── README.md
```

## Response Examples

### Successful Upload

```json
{
  "success": true,
  "url": "http://localhost:3002/uploads/images/uuid-filename.jpg",
  "filename": "uuid-filename.jpg",
  "originalName": "my-photo.jpg",
  "category": "images",
  "size": 123456,
  "mimeType": "image/jpeg"
}
```

### List Files

```json
{
  "files": [
    {
      "filename": "uuid-filename.jpg",
      "url": "http://localhost:3002/uploads/images/uuid-filename.jpg",
      "category": "images",
      "size": 123456,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

### Error Response

```json
{
  "success": false,
  "error": "File size exceeds maximum allowed size of 10MB for images"
}
```

## License

MIT
