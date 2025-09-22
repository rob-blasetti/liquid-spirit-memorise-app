// Mock deps before requiring the module under test
jest.mock('../services/profileService', () => ({ saveProfile: jest.fn() }));
jest.mock('../config', () => ({ API_URL: 'http://test.local' }));
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const {
  getTotalPoints,
  awardAchievementData,
  fetchUserAchievements,
} = require('../services/achievementsService');
const AsyncStorage = require('@react-native-async-storage/async-storage');

// Helper: build achievement items quickly
const A = (id, points, earned = false) => ({ id, title: id, points, earned });

describe('achievementsService', () => {
  describe('getTotalPoints', () => {
    it('sums only earned achievements', () => {
      const list = [A('a', 5, true), A('b', 10, false), A('c', 15, true)];
      expect(getTotalPoints(list)).toBe(20);
    });

    it('handles missing or zero points', () => {
      const list = [A('a', 0, true), { id: 'b', earned: true }, A('c', 3, false)];
      expect(getTotalPoints(list)).toBe(0);
    });
  });

  describe('awardAchievementData', () => {
    it('marks target as earned and returns notification and new total', () => {
      const list = [A('x', 5, false), A('y', 10, true)];
      const { achievementsList, notification, totalPoints } = awardAchievementData(list, 'x');
      expect(achievementsList.find(a => a.id === 'x')?.earned).toBe(true);
      expect(notification).toEqual({ id: 'x', title: 'x' });
      expect(totalPoints).toBe(15);
    });

    it('is a no-op if id not found or already earned', () => {
      const list = [A('x', 5, true)];
      expect(awardAchievementData(list, 'nope').totalPoints).toBe(5);
      expect(awardAchievementData(list, 'x').totalPoints).toBe(5);
    });
  });

  describe('fetchUserAchievements', () => {
    const originalFetch = global.fetch;
    afterEach(() => {
      global.fetch = originalFetch;
      jest.clearAllMocks();
    });

    it('normalizes server shapes and preserves server totalPoints', async () => {
      const payload = {
        achievements: [
          { achievement: { _id: 'a1', title: 'A One', points: 5 } },
          { _id: 'a2', title: 'A Two', points: 10 },
          'a3',
        ],
        totalPoints: 42,
      };
      global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(payload) }));

      const { achievements, totalPoints } = await fetchUserAchievements('user-1');
      expect(totalPoints).toBe(42);
      expect(achievements.find(a => a.id === 'a1')).toEqual(
        expect.objectContaining({ title: 'A One', points: 5, earned: true }),
      );
      expect(achievements.find(a => a.id === 'a2')).toEqual(
        expect.objectContaining({ title: 'A Two', points: 10, earned: true }),
      );
      expect(achievements.find(a => a.id === 'a3')).toEqual(
        expect.objectContaining({ id: 'a3', earned: true }),
      );
    });

    it('returns empty on failure', async () => {
      global.fetch = jest.fn(() => Promise.resolve({ ok: false, text: () => Promise.resolve('nope') }));
      const { achievements, totalPoints } = await fetchUserAchievements('user-1');
      expect(achievements).toEqual([]);
      expect(totalPoints).toBe(0);
    });
  });
});
