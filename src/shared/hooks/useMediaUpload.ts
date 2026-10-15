import React from 'react';
import * as ImagePicker from 'expo-image-picker';
import { i18n } from '@/i18n';
import { uploadMedia, type UploadableContentType } from '@/shared/services/media';
import { ApiError } from '@/shared/services/api';
import { localizeApiMessage } from '@/shared/utils/localizeApiMessage';

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
 * mining-api's presigned URL, and returns both the object key (to save on
 * whatever record it belongs to) and the ready-to-display public URL.
 */
export function useMediaUpload() {
  const [state, setState] = React.useState<MediaUploadState>({
    uploading: false,
    progress: 'idle',
    error: null,
  });

  const pickImage = React.useCallback(async (): Promise<{
    uri: string;
    contentType: UploadableContentType;
  } | null> => {
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
    setState({ uploading: false, progress: 'idle', error: null });
    return { uri: asset.uri, contentType: contentTypeFromAsset(asset) };
  }, []);

  const pickAndUpload = React.useCallback(async (): Promise<{
    key: string;
    url: string;
  } | null> => {
    const picked = await pickImage();
    if (!picked) return null;

    setState({ uploading: true, progress: 'uploading', error: null });

    try {
      const { key, url } = await uploadMedia(picked);
      setState({ uploading: false, progress: 'done', error: null });
      return { key, url };
    } catch (error) {
      setState({
        uploading: false,
        progress: 'error',
        error:
          error instanceof ApiError
            ? localizeApiMessage(error.message)
            : i18n.t('common.error'),
      });
      return null;
    }
  }, [pickImage]);

  return { ...state, pickImage, pickAndUpload };
}
