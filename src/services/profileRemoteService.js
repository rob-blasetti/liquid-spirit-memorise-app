import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

export async function getS3PresignUrl(fileName, fileType) {
  const token = await AsyncStorage.getItem('token');
  const res = await fetch(
    `${API_URL}/api/upload/s3-url?fileName=${encodeURIComponent(fileName)}&fileType=${encodeURIComponent(fileType)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (!res.ok) throw new Error('Failed to get S3 upload URL');
  const { url } = await res.json();
  return url;
}

export async function uploadToS3(presignUrl, uri, fileType) {
  const res = await fetch(presignUrl, {
    method: 'PUT',
    body: await (await fetch(uri)).blob(),
    headers: { 'Content-Type': fileType },
  });
  if (!res.ok) throw new Error('S3 upload failed');
  return presignUrl.split('?')[0];
}

export async function updateProfilePictureOnServer(user, profilePictureUrl) {
  const token = await AsyncStorage.getItem('token');
  const res = await fetch(`${API_URL}/api/nuri/profile/avatar`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ user, profilePicture: profilePictureUrl }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Server update failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function uploadAndSetProfilePicture(user, asset) {
  const { uri, fileName, type } = asset;
  if (!uri || !fileName || !type) {
    throw new Error('Invalid image asset');
  }

  const presignUrl = await getS3PresignUrl(fileName, type);
  const publicUrl = await uploadToS3(presignUrl, uri, type);
  return updateProfilePictureOnServer(user, publicUrl);
}
