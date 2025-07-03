# Storage Module - Documentación

## Descripción
El módulo de Storage proporciona funcionalidades para la gestión de archivos utilizando Google Cloud Storage como backend de almacenamiento.

## Configuración

### Variables de Entorno Requeridas
```bash
GOOGLE_CLOUD_PROJECT_ID=tu-proyecto-id
GOOGLE_CLOUD_KEY_FILE=path/to/your/service-account-key.json
GOOGLE_CLOUD_STORAGE_BUCKET=videoshop_image_storage_bucket_1
```

### Configuración de Google Cloud Storage
1. Crear un proyecto en Google Cloud Console
2. Habilitar la API de Cloud Storage
3. Crear un Service Account y descargar las credenciales JSON
4. Crear un bucket de almacenamiento
5. Configurar las variables de entorno

## Endpoints Disponibles

### 1. Subir Archivo
**POST** `/storage/upload`

**Form Data:**
- `file`: Archivo a subir (requerido)
- `fileName`: Nombre del archivo (opcional)
- `folder`: Carpeta de destino (opcional, default: "uploads")
- `contentType`: Tipo de contenido (opcional)

**Respuesta:**
```json
{
  "success": true,
  "message": "Archivo subido exitosamente",
  "fileName": "archivo.jpg",
  "downloadUrl": "https://storage.googleapis.com/bucket/uploads/archivo.jpg",
  "fileSize": 1024768,
  "contentType": "image/jpeg"
}
```

### 2. Descargar Archivo
**GET** `/storage/download/:fileName`

**Query Parameters:**
- `folder`: Carpeta origen (opcional, default: "uploads")

**Respuesta:** Archivo binario con headers apropiados

### 3. Eliminar Archivo
**DELETE** `/storage/delete/:fileName`

**Query Parameters:**
- `folder`: Carpeta del archivo (opcional, default: "uploads")

**Respuesta:**
```json
{
  "success": true,
  "message": "Archivo eliminado exitosamente"
}
```

### 4. Listar Archivos
**GET** `/storage/list`

**Query Parameters:**
- `folder`: Carpeta a listar (opcional, default: "uploads")

**Respuesta:**
```json
{
  "files": ["archivo1.jpg", "archivo2.pdf", "video.mp4"]
}
```

### 5. Obtener Información del Archivo
**GET** `/storage/info/:fileName`

**Query Parameters:**
- `folder`: Carpeta del archivo (opcional, default: "uploads")

**Respuesta:**
```json
{
  "name": "uploads/archivo.jpg",
  "size": "1024768",
  "contentType": "image/jpeg",
  "created": "2024-01-15T10:30:00Z",
  "updated": "2024-01-15T10:30:00Z",
  "downloadUrl": "https://storage.googleapis.com/bucket/uploads/archivo.jpg"
}
```

### 6. Obtener URL de Descarga
**GET** `/storage/url/:fileName`

**Query Parameters:**
- `folder`: Carpeta del archivo (opcional, default: "uploads")

**Respuesta:**
```json
{
  "downloadUrl": "https://storage.googleapis.com/bucket/uploads/archivo.jpg"
}
```

### 7. Verificar Existencia del Archivo
**GET** `/storage/exists/:fileName`

**Query Parameters:**
- `folder`: Carpeta del archivo (opcional, default: "uploads")

**Respuesta:**
```json
{
  "exists": true
}
```

## Tipos de Archivo Permitidos

### Imágenes
- JPEG (`image/jpeg`)
- PNG (`image/png`)
- GIF (`image/gif`)
- WebP (`image/webp`)

### Videos
- MP4 (`video/mp4`)
- AVI (`video/avi`)
- MOV (`video/mov`)
- WMV (`video/wmv`)

### Documentos
- PDF (`application/pdf`)
- Word (`application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`)
- Excel (`application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`)

## Limitaciones
- Tamaño máximo de archivo: 10MB
- Los archivos se almacenan públicamente en Google Cloud Storage
- Los archivos se procesan en memoria durante la subida

## Ejemplos de Uso

### Subir un archivo con curl
```bash
curl -X POST \
  http://localhost:3000/storage/upload \
  -F "file=@/path/to/your/file.jpg" \
  -F "fileName=mi-archivo" \
  -F "folder=imagenes"
```

### Descargar un archivo
```bash
curl -X GET \
  "http://localhost:3000/storage/download/mi-archivo.jpg?folder=imagenes" \
  --output archivo-descargado.jpg
```

### Eliminar un archivo
```bash
curl -X DELETE \
  "http://localhost:3000/storage/delete/mi-archivo.jpg?folder=imagenes"
```

## Integración con otros módulos

El `StorageService` se exporta desde el módulo y puede ser utilizado por otros módulos para operaciones de archivos programáticas:

```typescript
import { StorageService } from '../storage/storage.service';

@Injectable()
export class ProductosService {
  constructor(private readonly storageService: StorageService) {}

  async subirImagenProducto(file: Express.Multer.File, productoId: string) {
    return await this.storageService.uploadFile(file, {
      fileName: `producto-${productoId}`,
      folder: 'productos',
    });
  }
}
```
