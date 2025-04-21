# README: Med AI Insight Viewer - Functional Overview for AI Engineer

## 1. Project Overview

**Purpose:** This web application allows users to upload medical images (like X-rays, MRIs) and receive an AI-powered analysis, including a description, potential diagnosis, and additional comments. It uses OpenAI's vision models via a Supabase Edge Function for analysis and Supabase for authentication and data storage.

**Target User:** Users who need quick, preliminary insights into medical images (Disclaimer: Not a substitute for professional medical advice).

## 2. Core Technologies

*   **Frontend:** React (Vite), TypeScript
*   **UI:** Shadcn/ui, Tailwind CSS
*   **Routing:** React Router DOM (`react-router-dom`)
*   **State Management:** React `useState` for local component state, `localStorage` for API key persistence. `@tanstack/react-query` is set up but not explicitly used for data fetching in the current code (potential for future use).
*   **Backend:** Supabase (Auth, Database, Edge Functions)
*   **AI Analysis:** OpenAI API (specifically `gpt-4-vision-preview` accessed via Supabase Edge Function)

## 3. Architecture

*   **`/src`:** Contains the React frontend application.
    *   **`/components`:** Reusable UI elements.
        *   **`/ui`:** Base Shadcn/ui components.
        *   Custom functional components: `ApiKeyInput.tsx`, `ImageUpload.tsx`, `AnalysisResult.tsx`, `HistoryList.tsx`, `Header.tsx`.
    *   **`/hooks`:** Custom React hooks (e.g., `use-toast`, `use-mobile`).
    *   **`/lib`:** Utility functions (e.g., `cn` for class names).
    *   **`/pages`:** Top-level page components (`Index.tsx`, `Dashboard.tsx`, `NotFound.tsx`).
    *   **`/types`:** TypeScript type definitions (`index.ts`).
    *   **`/utils`:** Utility functions, specifically for external interactions (`openai.ts` - intended for calling the backend).
    *   `App.tsx`: Main application component, sets up routing, Supabase context, and providers.
    *   `main.tsx`: Application entry point.
*   **`/supabase`:** Contains backend configuration and code.
    *   **`/functions`:** Serverless Edge Functions.
        *   **`analyze-image`:** Handles the core image analysis logic by calling the OpenAI API.
        *   **`_shared`:** Shared utility code for functions (e.g., CORS headers).
    *   **`/migrations`:** Database schema definitions (`.sql` files).
*   **`/public`:** Static assets.

## 4. Key Functional Elements & Workflow

### 4.1. Authentication

*   **Provider:** Supabase Auth.
*   **Mechanism:** Uses `SessionContextProvider` from `@supabase/auth-helpers-react`. The landing page (`Index.tsx`) suggests Google login is intended.
*   **Protected Routes:** The `/dashboard` route is protected using a `RequireAuth` component in `App.tsx`, which checks for a Supabase session. Unauthorized users are redirected to `/`.
*   **Logout:** Implemented in `Header.tsx` using `supabase.auth.signOut()`.

### 4.2. API Key Management (`src/pages/Dashboard.tsx`, `src/components/ApiKeyInput.tsx`)

*   **Purpose:** Users must provide their own OpenAI API key for analysis.
*   **Input:** `ApiKeyInput.tsx` component provides a password-masked input field.
*   **Storage:** The key is stored in the browser's `localStorage` (`openai_api_key`) for persistence across sessions.
*   **Usage:** The key is required by the frontend `Dashboard.tsx` to enable the "Analyze Image" button. **Crucially**, the key itself is *not* sent directly from the client in the intended final flow. The backend Edge Function (`analyze-image`) uses a securely stored secret key (`Deno.env.get('OPENAI_API_KEY')`). The client-side check is likely a prerequisite confirmation before invoking the backend.

### 4.3. Image Upload (`src/pages/Dashboard.tsx`, `src/components/ImageUpload.tsx`)

*   **UI:** `ImageUpload.tsx` provides a drag-and-drop area and a file selection button.
*   **State:** The selected `File` object and a base64 `imagePreview` string are managed in `Dashboard.tsx`'s state.
*   **Functionality:** Allows users to select an image file, displays a preview, and provides an option to remove/replace the image.

### 4.4. Image Analysis Trigger (`src/pages/Dashboard.tsx`)

*   **Trigger:** The "Analyze Image" button in `Dashboard.tsx`.
*   **Pre-requisites:** Requires a valid API key (entered by the user) and a selected image file.
*   **Loading State:** `isAnalyzing` state variable tracks the analysis process to disable the button and show loading indicators.
*   **Interaction:**
    *   **Current Implementation (Mock):** The `analyzeImage` function in `Dashboard.tsx` currently *mocks* the API call with a `setTimeout` and a hardcoded result.
    *   **Intended Implementation:** Should likely call the utility function defined in `src/utils/openai.ts`, which in turn makes a `fetch` request to the Supabase Edge Function (`/functions/v1/analyze-image`). The `imageBase64` representation of the image and `imageType` (currently hardcoded in the function call but should be derived) would be sent in the request body.

### 4.5. Backend Analysis (`supabase/functions/analyze-image/index.ts`)

*   **Endpoint:** Supabase Edge Function triggered by POST requests to `/functions/v1/analyze-image`.
*   **Input:** Expects a JSON body with `imageBase64` (string) and `imageType` (string). Requires `Authorization` header with Supabase JWT.
*   **Core Logic:**
    1.  Authenticates the request using the provided JWT.
    2.  Retrieves the OpenAI API key from secure environment variables (`Deno.env.get('OPENAI_API_KEY')`).
    3.  Constructs a prompt for the OpenAI `gpt-4-vision-preview` model, requesting analysis in a specific JSON format (`description`, `diagnosis`, `extra_comments`).
    4.  Sends the image (as base64) and prompt to the OpenAI API.
    5.  Parses the JSON response from OpenAI.
    6.  Adds a `timestamp`.
    7.  Saves the analysis result (`AnalysisResultType`) and metadata (`imageType`) to the `users_history` table in the Supabase database, associating it with the authenticated `user_id`.
*   **Output:** Returns the newly created database entry (including the analysis result) as JSON.

### 4.6. Result Display (`src/pages/Dashboard.tsx`, `src/components/AnalysisResult.tsx`)

*   **UI:** `AnalysisResult.tsx` component displays the structured analysis data received after analysis.
*   **Content:** Shows the analyzed image preview (if available), diagnosis, description, extra comments, and timestamp. Uses Tabs (`description`, `comments`) for organization. Includes a disclaimer.

### 4.7. History (`src/pages/Dashboard.tsx`, `src/components/HistoryList.tsx`)

*   **UI:** A tab on the `Dashboard.tsx` page contains the `HistoryList.tsx` component.
*   **Data Fetching:** `HistoryList.tsx` fetches records from the `users_history` table using the Supabase client JS library (`supabase.from('users_history').select('*')`). RLS policies ensure users only see their own history.
*   **Display:** Lists past analyses, showing image type, diagnosis, date/time. Includes a "View Details" button (currently non-functional).
*   **Data Storage:** See Section 5.

## 5. Data Model & Storage

*   **Types (`src/types/index.ts`):**
    *   `AnalysisResultType`: `{ description: string; diagnosis: string; extra_comments: string; timestamp: string; }` - Represents the structured output from the AI analysis.
    *   `UserHistoryItem`: `{ id: string; userId: string; imageUrl?: string; imageType: string; result: AnalysisResultType; createdAt: string; }` - Represents a single entry in the user's analysis history.
*   **Database (`supabase/migrations/...sql`):**
    *   **Table:** `public.users_history`
    *   **Columns:**
        *   `id` (uuid, PK)
        *   `user_id` (uuid, FK to `auth.users`)
        *   `image_url` (text, optional - *Note: Currently seems unused, analysis uses base64*)
        *   `image_type` (text, e.g., "X-ray", "MRI")
        *   `result` (jsonb, stores the `AnalysisResultType` object)
        *   `created_at` (timestamptz)
    *   **Security:** Row Level Security (RLS) is enabled. Users can only `select` and `insert` rows where `user_id` matches their own `auth.uid()`.

## 6. UI Components Library

*   **Shadcn/ui:** Provides the base UI components (Button, Card, Input, Tabs, etc.). Configuration is in `tailwind.config.ts` and `components.json`.
*   **Custom Components:** Key functional components built on top of Shadcn/ui are located directly under `src/components/`.

## 7. Routing (`src/App.tsx`)

*   `/`: Landing page (`Index.tsx`).
*   `/dashboard`: Main application interface after login (`Dashboard.tsx`), protected by authentication.
*   `*`: Catch-all route for 404 errors (`NotFound.tsx`).

## 8. Important Notes for AI Engineer

*   **Client-Side Mock:** The core analysis logic in `Dashboard.tsx` is currently **mocked**. When modifying analysis features, focus on the interaction with the Supabase Edge Function (`supabase/functions/analyze-image/index.ts`) via `src/utils/openai.ts`.
*   **API Key Handling:** While the user enters their key client-side, the actual OpenAI API call in the backend uses a secret environment variable. Ensure client-side key usage remains limited to enabling features or potentially passing it *securely* to the backend if the architecture changes (though using the backend secret is preferred).
*   **Error Handling:** Basic error handling exists using `react-hot-toast` (`useToast`). Enhance as needed, especially around API calls.
*   **Data Fetching:** History fetching uses the Supabase JS client directly. Consider migrating to `@tanstack/react-query` for better caching, background updates, etc.
*   **Image Type:** The `imageType` is passed to the backend but seems hardcoded or not dynamically determined on the client-side yet. This might need implementation (e.g., a dropdown).
*   **RLS:** Remember that all database interactions involving `users_history` are governed by RLS policies defined in the migration file.