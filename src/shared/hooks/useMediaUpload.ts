import React from 'react';
import * as ImagePicker from 'expo-image-picker';
import { uploadMedia, type UploadableContentType } from '@/shared/services/media';

export interface MediaUploadState {
  uploading: boolean;
  progress: 'idle' | 'picking' | 'uploading' | 'done' | 'error';
  error: string | null;
}

function contentTypeFromAsset(asset: ImagePicker.ImagePickerAsset): UploadableContentType {
  const mime = asset.mimeType?.toLowerCase();
  if (mime === 'image/png') return 'image/png';
  if (mime === 'image/webp') return 'image/webp';
  return 'image/jpeg';
}

/**
 * Opens the device image picker, uploads the chosen image straight to S3 via
 * mining-api's presigned URL, and returns the object key to save on whatever
 * record it belongs to (avatar, document, etc). Use `resolveMediaUrl(key)`
 * (see media.ts) to build a displayable URL from that key later.
 */
export function useMediaUpload() {
  const [state, setState] = React.useState<MediaUploadState>({
    uploading: false,
    progress: 'idle',
    error: null,
  });

  const pickAndUpload = React.useCallback(async (): Promise<{ key: string } | null> => {
    setState({ uploading: false, progress: 'picking', error: null });

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setState({ uploading: false, progress: 'error', error: 'Photo library access denied' });
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) {
      setState({ uploading: false, progress: 'idle', error: null });
      return null;
    }

    const asset = result.assets[0];
    setState({ uploading: true, progress: 'uploading', error: null });

    try {
      const { key } = await uploadMedia({
        uri: asset.uri,
        contentType: contentTypeFromAsset(asset),
      });
      setState({ uploading: false, progress: 'done', error: null });
      return { key };
    } catch (error) {
      setState({
        uploading: false,
        progress: 'error',
        error: error instanceof Error ? error.message : 'Upload failed',
      });
      return null;
    }
  }, []);

  return { ...state, pickAndUpload };
}
