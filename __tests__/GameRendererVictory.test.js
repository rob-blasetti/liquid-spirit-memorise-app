import React, { useEffect } from 'react';
import ReactTestRenderer from 'react-test-renderer';

const mockOnVictory = jest.fn();
const mockAwardGameAchievement = jest.fn();
const mockRecordGamePlay = jest.fn();
const mockGoTo = jest.fn();
const mockSetActiveGame = jest.fn();
const mockSetLevel = jest.fn();
const mockMarkLevelComplete = jest.fn();
const mockGetProgressForGame = jest.fn(() => ({ completed: { 1: true }, highestUnlocked: 2, currentLevel: 2 }));
const mockUseDifficulty = jest.fn();

jest.mock('../src/modules/profile/screens/GradesScreen', () => () => null);
jest.mock('../src/modules/profile/screens/Grade1SetScreen', () => () => null);
jest.mock('../src/modules/profile/screens/Grade1LessonScreen', () => () => null);
jest.mock('../src/modules/profile/screens/SettingsScreen', () => () => null);
jest.mock('../src/modules/achievements/screens/AchievementsScreen', () => () => null);
jest.mock('../src/modules/profile/screens/HomeScreen', () => () => null);
jest.mock('../src/modules/games/screens/GamesListScreen', () => () => null);
jest.mock('../src/modules/profile/screens/ClassScreen', () => () => null);
jest.mock('../src/modules/profile/screens/LessonJourneyScreen', () => () => null);
jest.mock('../src/modules/games/screens/StoryModeScreen', () => () => null);
jest.mock('../src/modules/games/screens/GameVictoryScreen', () => () => null);
jest.mock('../src/modules/auth/screens/Splash', () => () => null);

jest.mock('../src/modules/games/lazyGameRoutes', () => {
  const React = require('react');
  const { useEffect } = React;
  const TestGame = (props) => {
    useEffect(() => {
      props.onWin?.({ perfect: true });
    }, [props]);
    return null;
  };
  return { lazyGameScreens: { testGame: TestGame } };
});

jest.mock('../src/app/contexts/DifficultyContext', () => ({
  useDifficulty: () => mockUseDifficulty(),
}));

jest.mock('../src/ui/components/DifficultyFAB', () => () => null);
jest.mock('../src/ui/components/LostOverlay', () => () => null);

describe('GameRenderer victory flow', () => {
  beforeEach(() => {
    mockOnVictory.mockClear();
    mockAwardGameAchievement.mockClear();
    mockRecordGamePlay.mockClear();
    mockMarkLevelComplete.mockClear();
    mockGoTo.mockClear();
    mockSetActiveGame.mockClear();
    mockSetLevel.mockClear();
    mockGetProgressForGame.mockClear();
    mockUseDifficulty.mockReset();

    mockUseDifficulty.mockReturnValue({
      level: 2,
      setLevel: mockSetLevel,
      activeGame: 'testGame',
      setActiveGame: mockSetActiveGame,
      markLevelComplete: mockMarkLevelComplete,
      getProgressForGame: mockGetProgressForGame,
    });

    mockGetProgressForGame.mockReturnValue({ completed: { 1: true }, highestUnlocked: 2, currentLevel: 2 });
  });

  it('invokes onVictory with game summary when a game reports a win', async () => {
    const GameRenderer = require('../src/ui/components/GameRenderer').default;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <GameRenderer
          screen="testGame"
          quote="test quote"
          awardGameAchievement={mockAwardGameAchievement}
          recordGamePlay={mockRecordGamePlay}
          onVictory={mockOnVictory}
          onBack={jest.fn()}
        />,
      );
    });

    expect(mockOnVictory).toHaveBeenCalledWith(
      expect.objectContaining({
        screenId: 'testGame',
        level: 2,
        perfect: true,
      }),
    );
    expect(mockMarkLevelComplete).toHaveBeenCalledWith('testGame', 2);
  });

  it('navigates to the victory screen when a game is won', async () => {
    const ScreenRenderer = require('../src/ui/components/ScreenRenderer').default;
    const navigationActions = {
      goHome: jest.fn(),
      goGrade1: jest.fn(),
      goGrade2: jest.fn(),
      goGrade3: jest.fn(),
      goGrade4: jest.fn(),
      goGrade2Set: jest.fn(),
      goGrade2Lesson: jest.fn(),
      goGrade2b: jest.fn(),
      goGrade2bSet: jest.fn(),
      goGrade2bLesson: jest.fn(),
      goBackToLesson: jest.fn(),
    };
    const appActions = {
      playSelectedGame: jest.fn(),
      getHomeProgress: jest.fn(() => ({ setNumber: 1, lessonNumber: 1 })),
      launchStoryModeGame: jest.fn(),
      getQuoteOfTheWeek: jest.fn(),
    };
    const lessonState = {
      completeLesson: jest.fn(),
      overrideProgress: {},
      setOverrideProgress: jest.fn(),
      getCurrentProgress: jest.fn(() => ({ setNumber: 1, lessonNumber: 1 })),
      completedLessons: [],
    };
    const accountActions = {
      deleteGuestAccount: jest.fn(),
      wipeProfile: jest.fn(),
      saveProfile: jest.fn(),
    };
    const modalHandlers = {
      setProfileModalVisible: jest.fn(),
      setComingSoonGrade: jest.fn(),
    };

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <ScreenRenderer
          navState={{
            screen: 'testGame',
            quote: 'test quote',
            rawQuote: 'test quote',
            sanitizedQuote: 'test quote',
            setNumber: 1,
            lessonNumber: 1,
            fromGames: true,
          }}
          profile={{ id: 'p1' }}
          achievements={[]}
          childrenProfiles={[]}
          level={2}
          navigationActions={navigationActions}
          goTo={mockGoTo}
          appActions={appActions}
          lessonState={lessonState}
          accountActions={accountActions}
          modalHandlers={modalHandlers}
          awardGameAchievement={mockAwardGameAchievement}
          recordGamePlay={mockRecordGamePlay}
        />,
      );
    });

    expect(mockGoTo).toHaveBeenCalledWith(
      'gameVictory',
      expect.objectContaining({
        gameId: 'testGame',
        fromGames: true,
        perfect: true,
      }),
    );
  });

  it('sets the active game to the highest unlocked level when switching games', async () => {
    mockGetProgressForGame.mockReturnValueOnce({ completed: {}, highestUnlocked: 1, currentLevel: 1 });
    mockUseDifficulty.mockReturnValueOnce({
      level: 3,
      setLevel: mockSetLevel,
      activeGame: 'previousGame',
      setActiveGame: mockSetActiveGame,
      markLevelComplete: mockMarkLevelComplete,
      getProgressForGame: mockGetProgressForGame,
    });

    const GameRenderer = require('../src/ui/components/GameRenderer').default;

    await ReactTestRenderer.act(async () => {
      ReactTestRenderer.create(
        <GameRenderer
          screen="testGame"
          quote="test quote"
          awardGameAchievement={mockAwardGameAchievement}
          recordGamePlay={mockRecordGamePlay}
          onVictory={mockOnVictory}
          onBack={jest.fn()}
        />,
      );
    });

    expect(mockSetActiveGame).toHaveBeenCalledWith('testGame');
  });
});
