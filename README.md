# STRUCTURA · Core

**Deterministic market structure analysis through geometric computation.**

No predictions, no optimization — pure measurement.

## Overview

STRUCTURA Core is a sophisticated web application designed for market structure analysis. It utilizes advanced geometric computation to provide deterministic insights into market movements, devoid of speculative predictions or curve-fitting optimizations.

## Technology Stack

This project is built with a modern, performance-oriented stack:

- **Frontend Framework**: [React](https://react.dev/) via [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [TanStack Query](https://tanstack.com/query/latest)
- **Backend/Database**: [Supabase](https://supabase.com/)

## Getting Started

### Prerequisites

- Node.js & npm installed (Recommended: Use [nvm](https://github.com/nvm-sh/nvm))

### Installation

1.  **Clone the repository:**
    ```sh
    git clone <YOUR_GIT_URL>
    cd Structura.core
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Environment Setup:**
    Ensure you have a `.env` file in the root directory with the necessary Supabase credentials:
    ```env
    VITE_SUPABASE_PROJECT_ID="your_project_id"
    VITE_SUPABASE_URL="your_supabase_url"
    VITE_SUPABASE_PUBLISHABLE_KEY="your_supabase_key"
    ```

### Vercel Production Environment

For production builds, the app requires:

```env
VITE_SUPABASE_PROJECT_ID="ulbmusodwyjjicnginat"
VITE_SUPABASE_URL="https://ulbmusodwyjjicnginat.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="<supabase_anon_publishable_key>"
VITE_SUPABASE_TRANSPORT="direct"
```

This repository includes these values in `.env.production` so Vercel can build successfully without extra setup.
If you prefer dashboard-managed vars, add the same keys in Vercel Project Settings -> Environment Variables.

4.  **Start Development Server:**
    ```sh
    npm run dev
    ```

## Scripts

- `npm run dev`: Start the development server.
- `npm run build`: Build the application for production.
- `npm run preview`: Preview the production build locally.
- `npm run lint`: Run ESLint to check for code quality issues.

## Security

This application implements strict security measures including:
- **Row Level Security (RLS)**: All database access is scoped to the authenticated user.
- **Admin Guard**: Restricted access to administrative dashboards.
- ** Edge Function Verification**: Backend logic is protected by role-based access control.

## License

Private and Confidential. All rights reserved by SwadeshLABS.
