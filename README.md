# 🩺 Med AI Insight Viewer

**A web application leveraging AI to analyze medical images and provide insightful descriptions.**

This application allows users to securely upload medical images (X-rays, MRIs, CT scans, etc.) and receive AI-generated analysis, including potential observations and structured descriptions. It utilizes OpenAI's vision capabilities via Supabase Edge Functions for analysis, along with Supabase for authentication and data persistence.

---

<!-- Add a screenshot or GIF demo here -->
<!-- ![App Screenshot](link/to/screenshot.png) -->

## ✨ Key Features

*   **Secure User Authentication:** Google OAuth login via Supabase Auth ensures user data privacy.
*   **Easy Image Upload:** Simple drag-and-drop or file selection interface for medical images.
*   **AI-Powered Analysis:** Utilizes OpenAI's advanced vision models (e.g., `gpt-4-vision-preview`) to interpret images.
*   **Structured Results:** Provides analysis in a clear format (e.g., description, potential findings, comments).
*   **Analysis History:** Stores past analyses for user reference, secured by Row Level Security (RLS).
*   **Responsive UI:** Built with Shadcn/ui and Tailwind CSS for a clean experience on desktop and mobile.

## 🚀 Tech Stack

*   **Frontend:**
    *   Framework: React (Vite)
    *   Language: TypeScript
    *   UI Library: Shadcn/ui
    *   Styling: Tailwind CSS
    *   Routing: React Router DOM (`react-router-dom`)
    *   State Management: React Context, `useState`, Supabase Auth Helpers
    *   Notifications: `react-hot-toast` (via `useToast` hook), `sonner`
    *   Markdown Rendering: `markdown-to-jsx`
*   **Backend:**
    *   Platform: Supabase
    *   Authentication: Supabase Auth (Google OAuth configured)
    *   Database: Supabase PostgreSQL
    *   Serverless Functions: Supabase Edge Functions (Deno Runtime)
*   **AI:**
    *   Model Provider: OpenAI
    *   API Interaction: Via Supabase Edge Function

## 📁 Project Structure

.
├── public/ # Static assets (icons, robots.txt)
├── src/ # Frontend React application source
│ ├── components/ # Reusable React components
│ │ ├── ui/ # Shadcn UI components
│ │ ├── AnalysisResult.tsx # Displays AI analysis results
│ │ ├── ApiKeyInput.tsx # (Legacy/Client-side check - Not used for Backend API call)
│ │ ├── Header.tsx # Application header with navigation/logout
│ │ ├── HistoryList.tsx # Displays list of past analyses
│ │ └── ImageUpload.tsx # Handles image selection and preview
│ ├── hooks/ # Custom React hooks (use-toast, use-mobile)
│ ├── lib/ # Utility functions (cn)
│ ├── pages/ # Top-level route components (Index, Dashboard, NotFound)
│ ├── types/ # TypeScript type definitions
│ ├── utils/ # Utility functions for external services (openai.ts - calls backend)
│ ├── App.css # Basic App styles (potentially removable)
│ ├── App.tsx # Main application component, routing, Supabase context
│ ├── index.css # Tailwind directives and base styles
│ ├── main.tsx # Application entry point
│ └── vite-env.d.ts # Vite TypeScript env declarations
├── supabase/ # Supabase backend configuration and code
│ ├── functions/ # Supabase Edge Functions
│ │ ├── _shared/ # Shared code for functions (cors.ts)
│ │ └── analyze-image/ # Edge Function for OpenAI image analysis
│ │ └── index.ts
│ └── migrations/ # Database schema migrations (.sql)
├── .gitignore # Git ignore rules
├── components.json # Shadcn UI configuration
├── eslint.config.js # ESLint configuration
├── index.html # Main HTML entry point for Vite
├── package.json # Project dependencies and scripts
├── postcss.config.js # PostCSS configuration
├── README.md # This file
├── tailwind.config.ts # Tailwind CSS configuration
├── tsconfig.app.json # TypeScript config for the app
├── tsconfig.json # Base TypeScript config
├── tsconfig.node.json # TypeScript config for Node env (Vite config)
└── vite.config.ts # Vite build configuration


## ⚙️ Core Functionality & Workflow

1.  **Authentication (`src/App.tsx`, `src/pages/Index.tsx`):**
    *   Users land on the `Index` page.
    *   Clicking "Get Started" initiates the Supabase Google OAuth flow.
    *   Upon successful login, Supabase redirects back to the app (specifically `/dashboard` as configured in the OAuth options).
    *   The `RequireAuth` component in `App.tsx` verifies the Supabase session using `useSession`. Authenticated users can access `/dashboard`; others are redirected to `/`.
    *   The `Header` component provides a logout button which calls `supabase.auth.signOut()`.

2.  **Image Upload (`src/pages/Dashboard.tsx`, `src/components/ImageUpload.tsx`):**
    *   On the `Dashboard`, the `ImageUpload` component allows users to drag & drop or select an image file.
    *   A preview of the selected image is displayed.
    *   The selected `File` object and a base64 representation (`imagePreview`) are stored in the `Dashboard` component's state.

3.  **Analysis Process:**
    *   **Trigger:** The user clicks the "Analyze Image" button on the `Dashboard`.
    *   **Frontend (`src/pages/Dashboard.tsx`, `src/utils/openai.ts`):**
        *   The `analyzeImage` function in `Dashboard.tsx` is called.
        *   It calls the utility function `analyzeImageApi` from `src/utils/openai.ts`.
        *   `analyzeImageApi` gets the current Supabase session token.
        *   It makes a `POST` request to the Supabase Edge Function endpoint (`/functions/v1/analyze-image`).
        *   The request includes the `Authorization: Bearer <token>` header and a JSON body containing `imageBase64` and `imageType`.
        *   It handles the response from the Edge Function.
    *   **Backend (`supabase/functions/analyze-image/index.ts`):**
        *   The Edge Function receives the request.
        *   It validates the incoming JWT using the Supabase client initialized with the user's token.
        *   It retrieves the **securely stored OpenAI API key** from the Edge Function's environment variables (`Deno.env.get('OPENAI_API_KEY')`). **The client-side key is NOT used here.**
        *   It formats the `imageBase64` string into a data URL if necessary.
        *   It constructs a request to the OpenAI API (`gpt-4.1-mini` or similar vision model specified in the function), sending the image URL and a specific prompt asking for medical observations/hypothetical diagnosis.
        *   It receives the analysis text from OpenAI.
        *   It structures the response into the `AnalysisResultType` format, adding a timestamp.
        *   It saves the `imageType` and the structured `result` (as JSONB) to the `users_history` table in the Supabase database, linking it to the authenticated `user_id`.
        *   It returns the newly created database record (containing the result) to the frontend.
    *   **Frontend (`src/pages/Dashboard.tsx`):**
        *   Receives the analysis result from the utility function.
        *   Updates the `analysisResult` state variable.
        *   Displays a success toast notification.
        *   The `AnalysisResult` component re-renders to display the new data.

4.  **Result Display (`src/components/AnalysisResult.tsx`):**
    *   Renders the `AnalysisResultType` data passed via props.
    *   Displays the image preview alongside the AI-generated content.
    *   Uses `markdown-to-jsx` to render the analysis content, allowing for formatted text from the AI.
    *   Includes a crucial disclaimer about the analysis not being professional medical advice.

5.  **History (`src/pages/Dashboard.tsx`, `src/components/HistoryList.tsx`):**
    *   The "History" tab on the `Dashboard` renders the `HistoryList` component.
    *   `HistoryList` uses the Supabase JS client (`useSupabaseClient`) to fetch records from the `users_history` table, ordered by creation date.
    *   Supabase RLS policies ensure only the currently logged-in user's history is returned.
    *   Displays a list of past analyses, showing image type, a snippet of the diagnosis, and timestamp.

## 💾 Backend Details

### Supabase Edge Function (`analyze-image`)

*   **Purpose:** Securely interacts with the OpenAI API using a server-side secret key and stores results.
*   **Trigger:** HTTP POST request to `/functions/v1/analyze-image`.
*   **Authentication:** Requires a valid Supabase JWT in the `Authorization` header.
*   **Environment Variables:** Requires `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `OPENAI_API_KEY` to be set in the Edge Function settings.
*   **Input:** JSON `{ imageBase64: string, imageType: string }`.
*   **Processing:**
    1.  Authenticates user via JWT.
    2.  Retrieves `OPENAI_API_KEY` secret.
    3.  Calls OpenAI Chat Completions API with vision model.
    4.  Parses OpenAI response.
    5.  Inserts result into `users_history` table using the authenticated user's ID.
*   **Output:** JSON containing the newly created database entry (`{ result: UserHistoryItem }`).

### Supabase Database Schema (`users_history`)

*   **Table:** `public.users_history`
*   **Purpose:** Stores the results of image analyses linked to users.
*   **Columns:**
    *   `id` (uuid, PK): Unique identifier for the history entry.
    *   `user_id` (uuid, FK -> `auth.users`): Links the entry to the authenticated user.
    *   `image_url` (text, nullable): *Currently seems unused in the primary analysis flow which uses base64.* Could be used if storing uploaded images directly.
    *   `image_type` (text, not null): Type of the analyzed image (e.g., "X-ray", "MRI").
    *   `result` (jsonb, not null): Stores the structured `AnalysisResultType` object returned by the AI.
    *   `created_at` (timestamptz, default now()): Timestamp of when the analysis was performed.
*   **Row Level Security (RLS):**
    *   **Enabled:** Yes.
    *   **Policies:**
        *   Users can `SELECT` only their own history records (`auth.uid() = user_id`).
        *   Users can `INSERT` only records where `user_id` matches their own `auth.uid()`.

## 🛠️ Getting Started

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm, yarn, or pnpm
*   Git
*   Supabase Account
*   Supabase CLI (Optional, for local development)
*   OpenAI API Key

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd med-ai-insight-viewer
    ```

2.  **Install frontend dependencies:**
    ```bash
    npm install
    # or yarn install or pnpm install
    ```

3.  **Set up Environment Variables:**
    *   Create a `.env` file in the root directory.
    *   Add your Supabase Project URL and Anon Key:
        ```env
        VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
        VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
        ```
    *   You can find these in your Supabase project settings (Project Settings > API).

4.  **Supabase Setup:**
    *   **Option A: Supabase Cloud (Recommended for deployment)**
        1.  Go to your Supabase project dashboard.
        2.  **Authentication:** Navigate to Authentication > Providers and enable the "Google" provider. Add your Google Cloud OAuth credentials. Ensure you add your app's URL(s) (including localhost for development) to the "Redirect URLs" section in Supabase Auth settings *and* in your Google Cloud OAuth configuration.
        3.  **Database:** Navigate to the SQL Editor. Copy the contents of `supabase/migrations/20250421000000_initial_schema.sql` and run it to create the `users_history` table and RLS policies.
        4.  **Edge Functions:**
            *   Navigate to Edge Functions.
            *   Deploy the `analyze-image` function (e.g., using `supabase functions deploy analyze-image --no-verify-jwt` if testing locally first, or set up CI/CD).
            *   Go to the `analyze-image` function's settings > Secrets and add your `OPENAI_API_KEY`.
    *   **Option B: Supabase Local Development**
        1.  Initialize Supabase locally: `supabase init`
        2.  Start Supabase services: `supabase start`
        3.  Apply database migrations: `supabase db push` (or link your project `supabase link --project-ref <your-project-ref>` and pull schema changes if needed).
        4.  Set Edge Function secrets locally: `supabase secrets set OPENAI_API_KEY=YOUR_OPENAI_API_KEY`
        5.  (You'll need to configure Google Auth locally or use email/password for testing if not using the cloud setup). Use the local Supabase URL/keys in your `.env`.

5.  **Run the Frontend:**
    ```bash
    npm run dev
    ```
    The application should now be running, typically at `http://localhost:8080`.

6.  **Deploy Edge Function (if not done in step 4):**
    ```bash
    # Link to your project if you haven't already
    # supabase link --project-ref <your-project-ref>

    # Deploy the function
    supabase functions deploy analyze-image

    # IMPORTANT: Set the secret in the Supabase Dashboard (Settings > Edge Functions > analyze-image > Secrets)
    # Add OPENAI_API_KEY with your actual OpenAI key value.
    ```

## 🔧 Configuration

*   **OpenAI Model:** The AI model used for analysis is specified in `supabase/functions/analyze-image/index.ts` (currently hardcoded, likely `gpt-4.1-mini` or similar).
*   **Analysis Prompt:** The prompt sent to OpenAI is also defined within the `analyze-image` Edge Function. Modify this to change the AI's behavior or the desired output format.
*   **UI Theme:** Colors and styles can be adjusted in `src/index.css` (CSS variables) and `tailwind.config.ts`.
*   **Shadcn UI:** Components can be added or customized using the Shadcn CLI and `components.json`.

## 💡 Usage

1.  Open the application in your browser.
2.  Log in using your Google account.
3.  Navigate to the "Analyze Image" tab.
4.  Upload a medical image using the drag-and-drop area or the file selector.
5.  Click the "Analyze Image" button.
6.  Wait for the analysis to complete (a loading indicator will show).
7.  View the structured results displayed below the upload section.
8.  Navigate to the "History" tab to view past analyses.

## ⚠️ Disclaimer

**This application is for informational and demonstration purposes only. The AI-generated analysis is NOT a substitute for professional medical advice, diagnosis, or treatment.** Always consult with a qualified healthcare provider regarding any medical conditions or concerns. Do not disregard professional medical advice or delay in seeking it because of something you have read or seen using this application.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

## 📄 License

(Specify License - e.g., MIT, Apache 2.0. If none, state "All Rights Reserved.")