export class FileUploadResponseDto {
  success: boolean;
  message: string;
  fileName?: string;
  downloadUrl?: string;
  fileSize?: number;
  contentType?: string;
}
