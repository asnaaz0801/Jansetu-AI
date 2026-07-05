# Google Auth & Issue Limit Implementation Guide

This guide documents the exact SQL queries and React frontend changes required to implement **Google OAuth** and an **active-ticket limit** for issue submissions on the Jansetu AI platform. 

To preserve the stability of the current application, **no existing files have been modified**. This guide serves as a blueprint for safe integration.

---

## 1. Codebase Scan Summary

A scan of the `/src` directory (specifically [SubmitIssue.jsx](file:///g:/My%20Drive/Vision%20Vault%20Hackathon/src/pages/SubmitIssue.jsx)) reveals the following data structures and naming conventions:

- **Supabase Table Name**: `issues`
- **Submission Function**: `const handleSubmit = async (e) => { ... }` in [SubmitIssue.jsx](file:///g:/My%20Drive/Vision%20Vault%20Hackathon/src/pages/SubmitIssue.jsx#L665)
- **Current Payload Fields**:
  ```javascript
  const payload = {
    citizen_id: '00000000-0000-0000-0000-000000000001', // Temporary dummy UUID
    title: dbTitle,
    description: description,
    category: dbCategory,
    constituency: 'Central Delhi',
    state: locState.trim() || 'Delhi',
    district: locDistrict.trim() || null,
    city: locCity.trim() || null,
    area: locArea.trim() || null,
    pincode: locPincode.trim() || null,
    latitude: locationCoords?.lat ?? null,
    longitude: locationCoords?.lng ?? null,
    geolocation: locationCoords ? `POINT(${locationCoords.lng} ${locationCoords.lat})` : null,
    status: 'Pending',
    citizen_name: citizenName.trim() || null,
    image_url: dbImageUrl
  };
  ```

---

## 2. Database Schema Updates (SQL)

Based on the discovered `issues` table, run the following SQL commands in your Supabase SQL Editor. 

This script:
1. Adds a `user_id` column referencing Supabase's built-in `auth.users` table.
2. Ensures the `status` column has a default value of `'open'` (or `'Pending'`), and updates any issues lacking a status.

```sql
-- 1. Add 'user_id' column to track the authenticated Google user
ALTER TABLE public.issues 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Add an index for performance optimization (speeding up user queries & active issue counts)
CREATE INDEX IF NOT EXISTS idx_issues_user_id_status ON public.issues(user_id, status);

-- 3. Adjust the 'status' column default (Optional)
-- Note: The current frontend submits issues with status 'Pending'. 
-- We can set the column default value to 'open' if we want fallback database-level support.
ALTER TABLE public.issues 
ALTER COLUMN status SET DEFAULT 'open';

-- 4. Enable Row Level Security (RLS) for user-level security (Optional but highly recommended)
-- Run this when you are ready to secure the database.
-- ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can only view their own issues" 
-- ON public.issues FOR SELECT 
-- USING (auth.uid() = user_id);

-- CREATE POLICY "Users can insert their own issues" 
-- ON public.issues FOR INSERT 
-- WITH CHECK (auth.uid() = user_id);
```

---

## 3. Frontend React Snippets

### A. Check Session & Handle Auth State
To listen to session updates and store the user context, add the following state and `useEffect` hook inside your layout wrapper or directly within [SubmitIssue.jsx](file:///g:/My%20Drive/Vision%20Vault%20Hackathon/src/pages/SubmitIssue.jsx):

```jsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/db'; // Correct client import path

// Inside your component:
const [user, setUser] = useState(null);

useEffect(() => {
  // 1. Fetch initial session
  supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user ?? null);
  });

  // 2. Listen for auth changes (Login, Logout, etc.)
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null);
  });

  return () => subscription.unsubscribe();
}, []);
```

---

### B. Google Sign-In Button Component
A premium styled button using **Tailwind CSS v4** (imported in your codebase) and lucide-inspired styling:

```jsx
function GoogleSignInButton() {
  const handleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Redirects back to the current page on success
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error("Sign-in failed:", err.message);
    }
  };

  return (
    <button
      onClick={handleSignIn}
      className="flex items-center justify-center gap-3 w-full max-w-sm px-6 py-3.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl shadow-xs hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-goi-navy)] transition-all duration-200"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
      </svg>
      <span>Continue with Google</span>
    </button>
  );
}
```

---

### C. Updated Submission & Limit Check
Modify the `handleSubmit` function in [SubmitIssue.jsx](file:///g:/My%20Drive/Vision%20Vault%20Hackathon/src/pages/SubmitIssue.jsx#L665) to verify auth state and prevent users from going over the limit of active (open/Pending) complaints:

```javascript
  // FORM VALIDATION & SUBMISSION
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    // 1. REQUIRE AUTHENTICATION
    if (!user) {
      setValidationErrors(prev => ({
        ...prev,
        submit: "Please sign in with Google before submitting a complaint."
      }));
      return;
    }

    if (!selectedCategory) {
      errors.category = t.selectCategoryAlert;
    }
    // ... (Keep existing form validations) ...

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      // ... (Keep scroll-to-error logic) ...
      return;
    }

    setIsSubmitting(true);

    try {
      // 2. CHECK ACTIVE TICKET LIMIT (E.G., MAX 3 ACTIVE TICKETS)
      // Since the unique row ID is 'issue_id' in your table, we query that.
      // We check for either 'open' or 'Pending' issues based on your workflow.
      const ACTIVE_LIMIT = 3;
      const { count, error: countError } = await supabase
        .from('issues')
        .select('issue_id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('status', ['open', 'Pending']); // Adjust status list as per workflow definitions

      if (countError) {
        console.error('Error verifying active limits:', countError);
      } else if (count !== null && count >= ACTIVE_LIMIT) {
        setValidationErrors(prev => ({
          ...prev,
          submit: `You have reached the limit of ${ACTIVE_LIMIT} active complaints. Please wait for them to be resolved.`
        }));
        setIsSubmitting(false);
        return;
      }

      // Generate standard GOI request Complaint ID (JSA-2026-XXXX)
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      // ... (Keep existing label mappings) ...

      // 3. CREATE PAYLOAD WITH DYNAMIC USER_ID
      const payload = {
        user_id: user.id, // Google User ID
        citizen_id: user.id, // Overwriting placeholder client UUID for backward compatibility
        title: dbTitle,
        description: description,
        category: dbCategory,
        constituency: 'Central Delhi', 
        state: locState.trim() || 'Delhi',
        district: locDistrict.trim() || null,
        city: locCity.trim() || null,
        area: locArea.trim() || null,
        pincode: locPincode.trim() || null,
        latitude: locationCoords?.lat ?? null,
        longitude: locationCoords?.lng ?? null,
        geolocation: locationCoords ? `POINT(${locationCoords.lng} ${locationCoords.lat})` : null,
        status: 'Pending', // Current status on insert
        citizen_name: user.user_metadata?.full_name || citizenName.trim() || null, // Auto-pull name from Google Account metadata
        image_url: dbImageUrl
      };

      // Submit to Supabase
      const { data, error } = await supabase
        .from('issues')
        .insert(payload)
        .select('reference_code')
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        setValidationErrors(prev => ({
          ...prev,
          submit: t.dbSaveError
        }));
        setIsSubmitting(false);
        return;
      }

      setSubmittedId(data.reference_code);
      setValidationErrors({});
      setIsSubmitting(false);
      setShowSuccessModal(true);

    } catch (err) {
      console.error('Submission failed:', err);
      setValidationErrors(prev => ({
        ...prev,
        submit: t.unexpectedError
      }));
      setIsSubmitting(false);
    }
  };
```

---

## 4. Supabase Project Setup Check-list

To complete this integration:
1. **Enable Google Provider**: Go to your [Supabase Dashboard](https://supabase.com/dashboard) -> **Authentication** -> **Providers** -> **Google**. Enable the provider and paste your Google Client ID and Secret (obtained from Google Cloud Console).
2. **Redirect URIs**: In the Supabase Google Auth configuration, add the local development URL (`http://localhost:5173` or similar) to the Redirect URIs.
