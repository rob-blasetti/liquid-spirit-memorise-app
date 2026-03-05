# Repository Guidelines

## Project Structure & Module Organization
- Entry point: `index.js` boots `src/app/index.js`.
- App shell: `src/app/` (`AppRoot.js`, `MainApp.js`, contexts, auth navigator).
- Feature modules: `src/modules/` (`auth/`, `profile/`, `games/`, `achievements/`).
- Shared UI: `src/ui/components/`, styles in `src/ui/stylesheets/`.
- Business/data layer: `src/services/`, `src/hooks/`, `src/config/`, `src/utils/`.
- Assets: `src/assets/` (images + animations).
- Tests: `__tests__/`.
- Native projects: `android/`, `ios/`.

## Build, Test, and Development Commands
- `yarn start` / `npm start`: Metro bundler.
- `yarn android` / `npm run android`: Android build/run.
- `yarn ios` / `npm run ios`: iOS build/run.
- `yarn test` / `npm test`: Jest suite.
- `yarn lint` / `npm run lint`: ESLint.
- iOS setup: from `ios/` run `bundle install` then `bundle exec pod install`.

## Coding Style & Naming Conventions
- ESLint: `@react-native` config, Prettier (single quotes, trailing commas, 2-space indent).
- Components/screens: `PascalCase.jsx`.
- Utilities/services/hooks: `camelCase.js`.
- Keep modules focused; avoid adding cross-module coupling in screen files.

## Testing Guidelines
- Framework: Jest + React Native preset (`jest.setup.js`).
- Place tests in `__tests__/` as `*.test.js(x)` / `*.test.tsx`.
- Prefer service/hook unit tests and focused screen behavior tests.

## Commit & Pull Request Guidelines
- Use Conventional Commits (`feat:`, `fix:`, `refactor:`, `test:`, `chore:`).
- Keep commits scoped and reviewable.
- PRs should include: summary, risk notes, screenshots (UI changes), and test evidence.

## Security & Configuration Tips
- Env vars come from `.env` via `react-native-config`.
- `src/config/index.js` expects `PROD_API` for API base URL.
- Never commit secrets or auth tokens.
- Avoid logging sensitive payloads/tokens in production paths.
