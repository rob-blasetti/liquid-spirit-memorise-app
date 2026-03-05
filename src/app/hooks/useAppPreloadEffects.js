import { useEffect } from 'react';
import { Image as RNImage, InteractionManager } from 'react-native';
import FastImage from 'react-native-fast-image';
import { preloadImages, collectChildAndClassImageUris } from '../../services/imageCache';
import { prefetchGames } from '../../games/lazyGameRoutes';
import { gameIds } from '../../games';
import { ACHIEVEMENTS_ENABLED } from '../../config/achievementsConfig';

export default function useAppPreloadEffects({ navScreen, profile, childrenProfiles }) {
  // Preload Pearlina image for Home screen into FastImage cache
  useEffect(() => {
    const asset = RNImage.resolveAssetSource(require('../../assets/img/pearlina-pointing-right.png'));
    FastImage.preload([{ uri: asset.uri }]);
  }, []);

  // Warm the most common game modules after first paint to trim Suspense delays
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      prefetchGames(['practice', ...gameIds.slice(0, 3)]);
    });
    return () => {
      if (task && typeof task.cancel === 'function') task.cancel();
    };
  }, []);

  useEffect(() => {
    if (!ACHIEVEMENTS_ENABLED) return undefined;
    const task = InteractionManager.runAfterInteractions(() => {
      import('../../screens/achievements/AchievementsScreen').catch((error) => {
        if (__DEV__) {
          console.warn('Failed to preload AchievementsScreen', error);
        }
      });
    });
    return () => {
      if (task && typeof task.cancel === 'function') {
        task.cancel();
      }
    };
  }, []);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      Promise.all([
        import('../../screens/profile/SettingsScreen'),
        import('../../screens/games/GamesListScreen'),
      ]).catch((error) => {
        if (__DEV__) {
          console.warn('Failed to preload settings/games screens', error);
        }
      });
    });
    return () => {
      if (task && typeof task.cancel === 'function') {
        task.cancel();
      }
    };
  }, []);

  // When player opens the games hub, preload the rest of the listed games in the background
  useEffect(() => {
    if (navScreen !== 'games') return undefined;
    const task = InteractionManager.runAfterInteractions(() => {
      prefetchGames(gameIds);
    });
    return () => {
      if (task && typeof task.cancel === 'function') task.cancel();
    };
  }, [navScreen]);

  // Warm cache with likely avatar + class images when child list or active profile changes
  useEffect(() => {
    const uris = new Set();
    const avatarUri = profile?.profilePicture || profile?.avatar;
    if (avatarUri) uris.add(avatarUri);
    const childUris = collectChildAndClassImageUris(childrenProfiles || []);
    childUris.forEach((uri) => {
      if (uri) {
        uris.add(uri);
      }
    });
    if (uris.size === 0) return;
    const primary = [];
    const secondary = [];
    uris.forEach((uri) => {
      if (!uri) return;
      if (uri === avatarUri) primary.push(uri);
      else secondary.push(uri);
    });
    if (primary.length) preloadImages(primary, { priority: 'normal' });
    if (secondary.length) preloadImages(secondary, { priority: 'low' });
  }, [childrenProfiles, profile?.profilePicture, profile?.avatar]);
}
