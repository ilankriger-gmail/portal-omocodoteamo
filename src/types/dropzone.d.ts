import { DropzoneOptions } from 'react-dropzone';
import { CarouselImage } from '@/components/ui/image-carousel';

export interface DropzoneUploadProps {
  /**
   * Called when the list of images changes
   */
  onImagesChange: (images: CarouselImage[]) => void;

  /**
   * Maximum number of images allowed
   */
  maxImages?: number;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Initial images to display
   */
  initialImages?: CarouselImage[];

  /**
   * Called when upload starts
   */
  onUploadStart?: () => void;

  /**
   * Called when upload completes
   */
  onUploadComplete?: () => void;

  /**
   * Custom dropzone options
   */
  dropzoneOptions?: Partial<DropzoneOptions>;
}

export interface DropzoneUploadSingleProps {
  /**
   * Called when the image URL changes
   */
  onImageChange: (imageUrl: string) => void;

  /**
   * Initial image URL to display
   */
  initialImage?: string;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Type of image being uploaded (for display and logging)
   */
  imageType?: 'foto' | 'comprovante';

  /**
   * Called when upload starts
   */
  onUploadStart?: () => void;

  /**
   * Called when upload completes
   */
  onUploadComplete?: () => void;

  /**
   * Custom dropzone options
   */
  dropzoneOptions?: Partial<DropzoneOptions>;
}

export interface ImageUploadState {
  id: string;
  file: File;
  previewUrl: string;
  uploading: boolean;
  progress: number;
  url?: string;
  legenda?: string;
  error?: string;
}