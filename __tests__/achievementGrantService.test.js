jest.mock('../services/achievementsService', () => ({
  updateAchievementOnServer: jest.fn(() => Promise.resolve()),
  fetchUserAchievements: jest.fn(() => Promise.resolve({ achievements: [], totalPoints: 0 })),
}));

const { grantAchievement } = require('../services/achievementGrantService');
const {
  updateAchievementOnServer,
  fetchUserAchievements,
} = require('../services/achievementsService');

const A = (id, points, earned = false) => ({ id, title: id, points, earned });

describe('achievementGrantService', () => {
  it('syncs total points with server response', async () => {
    fetchUserAchievements.mockResolvedValue({
      achievements: [A('x', 10, true)],
      totalPoints: 15,
    });

    const profile = { id: 'u1', totalPoints: 5 };
    const achievements = [A('x', 10, false)];
    const setAchievements = jest.fn();
    const setNotification = jest.fn();
    const saveProfile = jest.fn();
    const setTotalPoints = jest.fn();

    await grantAchievement({
      id: 'x',
      profile,
      achievements,
      setAchievements,
      setNotification,
      saveProfile,
      setTotalPoints,
    });

    expect(updateAchievementOnServer).toHaveBeenCalledWith('u1', 'x', 15);
    expect(fetchUserAchievements).toHaveBeenCalledWith('u1');
    expect(setTotalPoints).toHaveBeenLastCalledWith(15);
    expect(saveProfile).toHaveBeenLastCalledWith(
      expect.objectContaining({
        totalPoints: 15,
        achievements: expect.arrayContaining([
          expect.objectContaining({ id: 'x', earned: true, points: 10 }),
        ]),
      }),
    );
  });
});
