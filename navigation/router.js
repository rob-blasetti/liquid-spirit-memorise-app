import { lazyGameScreens } from '../games/lazyGameRoutes';

export const gameScreenNames = Object.keys(lazyGameScreens);
export const isGameScreen = (name) => gameScreenNames.includes(name);

