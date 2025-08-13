jest.mock('../services/achievementsService', () => ({
  updateAchievementOnServer: jest.fn(),
}));

const { grantAchievement } = require('../services/achievementGrantService');
const {
  updateAchievementOnServer,
} = require('../services/achievementsService');

const A = (id, points, earned = false) => ({ id, title: id, points, earned });

describe('achievementGrantService', () => {
  it('syncs total points with server response', async () => {
    updateAchievementOnServer.mockResolvedValue({
      user: {
        achievements: [{ achievement: { _id: 'x', title: 'x', points: 10 } }],
        totalPoints: 15,
      },
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

    expect(setTotalPoints).toHaveBeenLastCalledWith(15);
    expect(saveProfile).toHaveBeenLastCalledWith(
      expect.objectContaining({ totalPoints: 15 }),
    );
  });
});
