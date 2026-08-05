import { File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

export async function pickReturnEvidencePhoto() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    const error = new Error('PHOTO_PERMISSION_DENIED');
    error.code = 'PHOTO_PERMISSION_DENIED';
    throw error;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: false,
    quality: 0.78,
  });

  if (result.canceled || !result.assets?.[0]?.uri) return null;

  const source = new File(result.assets[0].uri);
  const extension = source.extension || '.jpg';
  const destination = new File(Paths.document, `return-evidence-${Date.now()}${extension}`);
  source.copy(destination);
  return destination.uri;
}

export function deleteReturnEvidencePhotos(photoUris = []) {
  photoUris.forEach((photoUri) => {
    if (!photoUri || !photoUri.startsWith(Paths.document.uri)) return;

    try {
      const file = new File(photoUri);
      if (file.exists) file.delete();
    } catch {
      // Evidence cleanup should never block account reset.
    }
  });
}
