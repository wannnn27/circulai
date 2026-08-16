import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export async function pickProfilePhoto() {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    const error = new Error('PHOTO_PERMISSION_DENIED');
    error.code = 'PHOTO_PERMISSION_DENIED';
    throw error;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.82,
  });

  if (result.canceled || !result.assets?.[0]?.uri) return null;

  const sourceUri = result.assets[0].uri;
  
  if (Platform.OS === 'web') {
    return sourceUri;
  }

  let extension = 'jpg';
  const parts = sourceUri.split('.');
  if (parts.length > 1) {
    extension = parts.pop();
  }
  
  const destinationUri = `${FileSystem.documentDirectory}profile-photo-${Date.now()}.${extension}`;
  
  await FileSystem.copyAsync({
    from: sourceUri,
    to: destinationUri,
  });
  
  return destinationUri;
}

export async function deleteProfilePhoto(photoUri) {
  if (Platform.OS === 'web') return;
  if (!photoUri || !photoUri.startsWith(FileSystem.documentDirectory)) return;

  try {
    const info = await FileSystem.getInfoAsync(photoUri);
    if (info.exists) {
      await FileSystem.deleteAsync(photoUri);
    }
  } catch {
    // Keep profile actions resilient if an old photo was already removed.
  }
}
