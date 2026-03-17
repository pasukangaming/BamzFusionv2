
export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9' | '3:1' | '2:1';

/**
 * Fix for multiple components:
 * Error: Module '"../types"' has no exported member 'UserRole'.
 */
export type UserRole = 'guest' | 'user' | 'admin';

// Shared navigation tab type for the application
export type Tab = 'home' | 'img2img' | 'text2img' | 'img2prompt' | 'kids-studio' | 'product-photo' | 'settings' | 'color-swapper' | 'photo-editor' | 'copywriter' | 'barbershop' | 'hajj-umrah' | 'wedding-studio' | 'change-angle' | 'graduation-studio' | 'mockup-studio' | 'fashion-studio' | 'ramadhan-studio' | 'eid-cards' | 'muslim-fashion';

export interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

export interface GenerationResult {
  imageUrls: string[];
  prompt: string;
  timestamp: number;
}

export interface VideoResult {
  videoUrl: string;
  prompt: string;
  timestamp: number;
  resolution: string;
}
