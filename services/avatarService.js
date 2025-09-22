import { Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { uploadAndSetProfilePicture } from './profileService';

export const createAvatarActions = ({ profile, setProfile, saveProfile }) => {
  const pickNewAvatar = () => {
    launchImageLibrary({ mediaType: 'photo' }, async (response) => {
      if (response.didCancel || response.errorCode) return;
      const asset = response.assets?.[0];
      if (!asset) return;

      const originalProfile = profile;
      const optimisticProfile = { ...originalProfile, profilePicture: asset.uri };
      setProfile(optimisticProfile);

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
