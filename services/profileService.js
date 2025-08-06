import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

export const loadProfile = async () => {
  try {
    const data = await AsyncStorage.getItem('profile');
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Error loading profile:', e);
    return null;
  }
};

export const loadGuestProfile = async () => {
  try {
    const data = await AsyncStorage.getItem('guestProfile');
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Error loading guest profile:', e);
    return null;
  }
};

export const saveProfile = async (profile) => {
  try {
    // Store registered and guest profiles separately
    if (profile.guest) {
      await AsyncStorage.setItem('guestProfile', JSON.stringify(profile));
    } else {
      await AsyncStorage.setItem('profile', JSON.stringify(profile));
    }
  } catch (e) {
    console.error('Error saving profile:', e);
  }
};

export const deleteGuestProfile = async () => {
  try {
    await AsyncStorage.removeItem('guestProfile');
  } catch (e) {
    console.error('Error deleting guest profile:', e);
  }
};

export const clearProfile = async () => {
  try {
    await AsyncStorage.removeItem('profile');
  } catch {
    // ignore errors
  }
};

async function getS3PresignUrl(fileName, fileType) {
  const token = await AsyncStorage.getItem('token');
  const res = await fetch(
    `${API_URL}/api/upload/s3-url?fileName=${encodeURIComponent(fileName)}&fileType=${encodeURIComponent(fileType)}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  if (!res.ok) throw new Error('Failed to get S3 upload URL');
  const { url } = await res.json();
  return url;
}

// 1b) Upload the raw file data to S3
async function uploadToS3(presignUrl, uri, fileType) {
  // In RN you can `fetch` a file:// URI as the body
  const res = await fetch(presignUrl, {
    method: 'PUT',
    body: await (await fetch(uri)).blob(),    // turn the local file into a Blob
    headers: { 'Content-Type': fileType }
  });
  if (!res.ok) throw new Error('S3 upload failed');
  // public URL is everything before the “?” in the presign URL
  return presignUrl.split('?')[0];
}

// 2) Hit your avatar endpoint
async function updateProfilePictureOnServer(user, profilePictureUrl) {
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

// 3) Orchestrator: from a picker asset to a saved profile
export async function uploadAndSetProfilePicture(user, asset) {
  // asset = { uri, fileName, type } from react-native-image-picker
  const { uri, fileName, type } = asset;
  if (!uri || !fileName || !type) {
    throw new Error('Invalid image asset');
  }

  // 1. get the presign URL
  const presignUrl = await getS3PresignUrl(fileName, type);

  // 2. upload the image
  const publicUrl = await uploadToS3(presignUrl, uri, type);

  // 3. update your NuriProfile
  const updatedProfile = await updateProfilePictureOnServer(user, publicUrl);
  return updatedProfile;
}
