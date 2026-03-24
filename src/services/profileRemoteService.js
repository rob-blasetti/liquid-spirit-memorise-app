import { apiRequest, authedApiRequest } from './apiClient';

export async function getS3PresignUrl(fileName, fileType) {
  const { url } = await authedApiRequest({
    path: `/api/upload/s3-url?fileName=${encodeURIComponent(fileName)}&fileType=${encodeURIComponent(fileType)}`,
    fallbackMessage: 'Failed to get S3 upload URL',
  });
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
  return authedApiRequest({
    path: '/api/nuri/profile/avatar',
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user, profilePicture: profilePictureUrl }),
    fallbackMessage: 'Server update failed',
  });
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
