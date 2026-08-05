import { File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

export async function pickProfilePhoto() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    const error = new Error('PHOTO_PERMISSION_DENIED');
    error.code = 'PHOTO_PERMISSION_DENIED';
    throw error;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.82,
  });

  if (result.canceled || !result.assets?.[0]?.uri) return null;

  const source = new File(result.assets[0].uri);
  const extension = source.extension || '.jpg';
  const destination = new File(Paths.document, `profile-photo-${Date.now()}${extension}`);
  source.copy(destination);
  return destination.uri;
}

export function deleteProfilePhoto(photoUri) {
  if (!photoUri || !photoUri.startsWith(Paths.document.uri)) return;

  try {
    const file = new File(photoUri);
    if (file.exists) file.delete();
  } catch {
    // Keep profile actions resilient if an old photo was already removed.
  }
}
