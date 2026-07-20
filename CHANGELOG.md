# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-07-20

### Added
- Created functional standalone routing configuration in `app.routes.ts`.
- Implemented lazy-loaded workspace views for `Dashboard`, `Users`, `Audit Logs`, and `Settings`.
- Created authentication state machine `AuthService` handling active roles (Admin vs Guest) and LocalStorage caching.
- Created `authGuard` restricting admin panel tabs to authorized user sessions.
- Created recursive `BreadcrumbsComponent` tracking active navigation paths.
- Setup dark theme tokens and Outfit Google Fonts variables.

## [0.3.0] - 2026-07-20

### Added
- Integrated system activity inactivity timeout alert overlay.
- Added demo fast-expiry toggle selector (15-second timer) to the sidebar footer layout.
- Added session keep-alive extend actions, updating the seconds countdown dynamically.
- Added unit specs asserting timer updates and caching.
