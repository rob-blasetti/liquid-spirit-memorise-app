# Repository Guidelines

## Project Structure & Module Organization
- Root-first app: `index.js` bootstraps `App.jsx`.
- Key folders: `components/` (reusable UI), `screens/` (navigation targets), `services/` (API/auth/storage), `navigation/`, `contexts/`, `games/`, `hooks/`, `styles/`, `assets/` (img, animations), `data/` (seed/config), `__tests__/` (unit/integration). Native code lives in `android/` and `ios/`.
- Configuration: `.env` (env vars) with `react-native-config` used via `config.js`.

## Build, Test, and Development Commands
- `npm start` or `yarn start`: start Metro bundler.
- `npm run android` / `npm run ios`: build and run on emulator/device.
- iOS pods: from `ios/`, run `bundle install` then `bundle exec pod install` on first setup or native changes.
- `npm test`: run Jest test suite. Add `--coverage` for a report.
- `npm run lint`: run ESLint.

## Coding Style & Naming Conventions
- Linting: ESLint extends `@react-native`; format with Prettier (single quotes, trailing commas, avoid parens on single-arg arrows, 2-space indent).
- Files: Components and screens use `PascalCase.jsx` (e.g., `NotificationBanner.jsx`); utility modules use `camelCase.js`.
- Code: variables/functions `camelCase`, components `PascalCase`, constants `UPPER_SNAKE_CASE`.
- Keep modules focused; colocate small, component-specific assets with the component when practical.

## Testing Guidelines
- Framework: Jest with React Native preset; mocks configured in `jest.setup.js`.
- Location/naming: place tests in `__tests__/` as `*.test.js(x)` or `*.test.tsx` (e.g., `NuriLoginScreen.test.js`).
- Run: `npm test`. Prefer `react-test-renderer` for component tests; mock native modules as in existing tests.

## Commit & Pull Request Guidelines
- Commits: prefer Conventional Commits (e.g., `feat:`, `fix:`, `refactor:`) as seen in history; keep changes small and scoped.
- Branches: use clear names like `codex/<short-purpose>` or `feature/<scope>`.
- PRs: include summary, linked issues, before/after screenshots for UI, and test updates. Ensure `npm test` and `npm run lint` pass.

## Security & Configuration Tips
- Env vars: manage via `.env` (`DEV_API`, `STAGING_API`, `PROD_API`). Never commit secrets.
- Access config through `react-native-config` (`Config.*`); avoid logging sensitive values and remove debug `console.log` calls before merging.
- Use Node >= 18; for iOS, manage CocoaPods via Bundler.

