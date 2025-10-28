import { Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { uploadAndSetProfilePicture } from './profileService';

export const createAvatarActions = ({ profile, setProfile, saveProfile }) => {
  const pickNewAvatar = () => {
    const pickerOptions = { mediaType: 'photo' };
    if (profile?.guest) {
      pickerOptions.includeBase64 = true;
    }

    launchImageLibrary(pickerOptions, async (response) => {
      if (response.didCancel || response.errorCode) return;
      const asset = response.assets?.[0];
      if (!asset) return;

      const originalProfile = profile;
      const preferredUri =
        asset.base64 && profile?.guest
          ? `data:${asset.type || 'image/jpeg'};base64,${asset.base64}`
          : asset.uri;

      if (!preferredUri) return;

      const optimisticProfile = {
        ...originalProfile,
        profilePicture: preferredUri,
        avatar: preferredUri,
      };
      setProfile(optimisticProfile);

      if (originalProfile?.guest) {
        try {
          await saveProfile(optimisticProfile);
        } catch (err) {
          console.error('Storing guest avatar failed:', err);
          setProfile(originalProfile);
          Alert.alert('Error', 'Could not save your profile picture. Please try again.');
        }
        return;
      }

      try {
        const updatedServerProfile = await uploadAndSetProfilePicture(originalProfile, asset);
        const newProfile = { ...originalProfile, ...updatedServerProfile };
        await saveProfile(newProfile);
        setProfile(newProfile);
      } catch (err) {
        console.error('Avatar upload/update failed:', err);
        setProfile(originalProfile);
        Alert.alert('Error', 'Could not update your profile picture. Please try again.');
      }
    });
  };

  return {
    pickNewAvatar,
  };
};
