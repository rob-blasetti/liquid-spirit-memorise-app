import QuotePracticeScreen from './QuotePracticeScreen';
import TapMissingWordsGame from './TapMissingWordsGame';
import TapScrambledGame from './TapScrambledGame';
import NextWordQuizGame from './NextWordQuizGame';
import MemoryMatchGame from './MemoryMatchGame';
import FlashCardRecallGame from './FlashCardRecallGame';
import RevealWordGame from './RevealWordGame';
import FirstLetterQuizGame from './FirstLetterQuizGame';
import LetterScrambleGame from './LetterScrambleGame';
import FastTypeGame from './FastTypeGame';
import HangmanGame from './HangmanGame';
import FillBlankTypingGame from './FillBlankTypingGame';

export const gameScreens = {
  practice: QuotePracticeScreen,
  tapGame: TapMissingWordsGame,
  scrambleGame: TapScrambledGame,
  nextWordGame: NextWordQuizGame,
  memoryGame: MemoryMatchGame,
  flashGame: FlashCardRecallGame,
  revealGame: RevealWordGame,
  firstLetterGame: FirstLetterQuizGame,
  letterScrambleGame: LetterScrambleGame,
  fastTypeGame: FastTypeGame,
  hangmanGame: HangmanGame,
  fillBlankGame: FillBlankTypingGame,
};
