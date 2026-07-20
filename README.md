# Multi-Section Admin Panel

A premium enterprise administration dashboard built on Angular 19, demonstrating advanced client-side routing, route guard protection, dynamic breadcrumbs navigation, and lazy-loaded components.

## Stack
- **Framework**: Angular 19 (Standalone component design, Signals reactive architecture)
- **Routing**: Angular Router
- **Testing**: Vitest runner
- **Styling**: Vanilla CSS (Custom dark/light dashboard theme tokens)

## Setup
1. Clone the repository.
2. Navigate to the project root:
   ```bash
   cd Build_33
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Environment Variables
Refer to `.env.example`.
- `PORT`: Target dev server port (default 4200)

## Running Locally
Start the local Angular development server:
```bash
npm run start
```
Navigate to `http://localhost:4200` to interact with the admin panel.

## Deployed
*To be deployed on Vercel*

## Architecture Notes
To keep initial load speeds premium, all routes (Dashboard, Users, Audit Logs, Settings) are loaded lazily. Route guards protect secure panels, querying the client-side Authentication state context to allow or deny entrance. A central Breadcrumb component dynamically inspects route structures to build navigation hierarchy paths.

## Data Handling
No database is attached to this application. Data is processed in-memory and simulated via Mock Services. User configurations and mock session tokens are stored locally in browser LocalStorage.
