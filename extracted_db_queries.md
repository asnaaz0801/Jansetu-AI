# Extracted Database Queries & Schema Code - Jansetu AI

This file documents all database-related code, queries, and Supabase client interactions found across the workspace.

---

## Table of Contents
1. [SQL Migration Files (`supabase/migrations/*.sql`)](#1-sql-migration-files-supabasemigrationssql)
2. [Supabase Client Setup (`src/lib/db.js`)](#2-supabase-client-setup-srclibdbjs)
3. [App Pages Database Queries (`src/pages/*.jsx`)](#3-app-pages-database-queries-srcpagesjsx)
4. [Supabase Edge Functions (`supabase/functions/`)](#4-supabase-edge-functions-supabasefunctions)
5. [Root Inspection Utility Scripts (`/*.js`)](#5-root-inspection-utility-scripts-js)
6. [Scratch Development Scripts (`scratch/*.js`)](#6-scratch-development-scripts-scratchjs)

---

## 1. SQL Migration Files (`supabase/migrations/*.sql`)

### 📄 [20260628000000_add_location_columns.sql](file:///g:/My%20Drive/Vision%20Vault%20Hackathon/supabase/migrations/20260628000000_add_location_columns.sql)
Idempotent script to add administrative geographic columns to the `issues` table.
```sql
-- 1. Add missing columns to the existing 'issues' table
ALTER TABLE public.issues ADD COLUMN IF NOT EXISTS district text;
ALTER TABLE public.issues ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.issues ADD COLUMN IF NOT EXISTS area text;
ALTER TABLE public.issues ADD COLUMN IF NOT EXISTS pincode text;
```

### 📄 [20260629000000_add_image_url.sql](file:///g:/My%20Drive/Vision%20Vault%20Hackathon/supabase/migrations/20260629000000_add_image_url.sql)
Adds the `image_url` column to allow linking citizen grievance images.
```sql
ALTER TABLE public.issues ADD COLUMN IF NOT EXISTS image_url text;
```

### 📄 [20260630000000_add_mp_columns.sql](file:///g:/My%20Drive/Vision%20Vault%20Hackathon/supabase/migrations/20260630000000_add_mp_columns.sql)
Adds MP-specific tracking, commenting, and AI cache columns to the `issues` table.
```sql
ALTER TABLE public.issues ADD COLUMN IF NOT EXISTS mp_comment text;
ALTER TABLE public.issues ADD COLUMN IF NOT EXISTS assigned_mp text;
ALTER TABLE public.issues ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone;
ALTER TABLE public.issues ADD COLUMN IF NOT EXISTS resolved_at timestamp with time zone;
ALTER TABLE public.issues ADD COLUMN IF NOT EXISTS ai_analysis jsonb;
```

### 📄 [20260701000000_add_status_to_notices.sql](file:///g:/My%20Drive/Vision%20Vault%20Hackathon/supabase/migrations/20260701000000_add_status_to_notices.sql)
Adds status tracking to notices and disables Row Level Security (RLS) to simplify operations.
```sql
ALTER TABLE public.mp_notices ADD COLUMN IF NOT EXISTS status text;

-- Disable RLS on issues, mp_notices, and status_history tables to allow direct updates, inserts, and trigger operations
ALTER TABLE public.issues DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.mp_notices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_history DISABLE ROW LEVEL SECURITY;
```

---

## 2. Supabase Client Setup (`src/lib/db.js`)

### 📄 [db.js](file:///g:/My%20Drive/Vision%20Vault%20Hackathon/src/lib/db.js)
Initializes the Supabase client using environment variables.
```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing! Check your .env.local file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## 3. App Pages Database Queries (`src/pages/*.jsx`)

### 📄 [MpDashboard.jsx](file:///g:/My%20Drive/Vision%20Vault%20Hackathon/src/pages/MpDashboard.jsx)

*   **Load Priorities/Complaints** (Lines 74–77):
    ```javascript
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false });
    ```
*   **Update Complaint Status** (Lines 117–122):
    ```javascript
    const { data, error } = await supabase
      .from('issues')
      .update({ status: newStatus })
      .or(`reference_code.eq.${id},issue_id.eq.${id}`)
      .select()
      .single();
    ```

### 📄 [TrackRequest.jsx](file:///g:/My%20Drive/Vision%20Vault%20Hackathon/src/pages/TrackRequest.jsx)

*   **Fetch Latest Issue** (Lines 54–59):
    ```javascript
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    ```
*   **Fetch Latest 4 Issue IDs** (Lines 77–81):
    ```javascript
    const { data, error } = await supabase
      .from('issues')
      .select('reference_code, issue_id')
      .order('created_at', { ascending: false })
      .limit(4);
    ```
*   **Fetch Matching MP Notice** (Lines 390–397):
    ```javascript
    const { data, error } = await supabase
      .from('mp_notices')
      .select('*')
      .eq('area', currentRequest.area)
      .eq('category', currentRequest.category)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    ```
*   **Search Issue by Reference Code** (Lines 421–425):
    ```javascript
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .eq('reference_code', cleanId)
      .maybeSingle();
    ```

### 📄 [SubmitIssue.jsx](file:///g:/My%20Drive/Vision%20Vault%20Hackathon/src/pages/SubmitIssue.jsx)

*   **Submit Citizen Issue** (Lines 808–812):
    ```javascript
    const { data, error } = await supabase
      .from('issues')
      .insert(payload) // payload includes title, description, category, state, district, city, area, pincode, lat, lng, image_url
      .select('reference_code')
      .single();
    ```

### 📄 [MpComplaintDetails.jsx](file:///g:/My%20Drive/Vision%20Vault%20Hackathon/src/pages/MpComplaintDetails.jsx)

*   **Save AI Analysis Cache** (Lines 33–36):
    ```javascript
    const { error: updateErr } = await supabase
      .from('issues')
      .update({ ai_analysis: aiResult })
      .eq('issue_id', complaint.issue_id);
    ```
*   **Fetch Complaint Details by Reference/ID** (Lines 62–66):
    ```javascript
    const { data, error: fetchErr } = await supabase
      .from('issues')
      .select('*')
      .or(`reference_code.eq."${referenceCode}",issue_id.eq."${referenceCode}"`)
      .maybeSingle();
    ```
*   **Update MP Complaint Details/Status/Response** (Lines 179–182):
    ```javascript
    const { error: updateErr } = await supabase
      .from('issues')
      .update(updatePayload) // updatePayload contains status, mp_comment, updated_at, resolved_at, assigned_mp
      .eq('issue_id', complaint.issue_id);
    ```

### 📄 [MpComplaints.jsx](file:///g:/My%20Drive/Vision%20Vault%20Hackathon/src/pages/MpComplaints.jsx)

*   **Fetch All Complaints** (Lines 38–41):
    ```javascript
    const { data, error: fetchErr } = await supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false });
    ```

### 📄 [MpLogin.jsx](file:///g:/My%20Drive/Vision%20Vault%20Hackathon/src/pages/MpLogin.jsx)

*   **Query MP User** (Lines 85–89):
    ```javascript
    const { data, error } = await supabase
      .from('mp_users')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();
    ```

### 📄 [MpAnalytics.jsx](file:///g:/My%20Drive/Vision%20Vault%20Hackathon/src/pages/MpAnalytics.jsx)

*   **Fetch Complaints for Analytics** (Lines 56–59):
    ```javascript
    const { data, error: fetchErr } = await supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false });
    ```
*   **Insert MP Notice** (Lines 444–454):
    ```javascript
    const { error: insertErr } = await supabase
      .from('mp_notices')
      .insert({
        area: noticeArea,
        category: noticeCategory,
        status: noticeStatus,
        notice: noticeText.trim(),
        mp_name: mpName,
        constituency: mpConstituency,
        created_at: new Date().toISOString()
      });
    ```
*   **Fetch Matching Complaints (Before Update)** (Lines 467–471):
    ```javascript
    const { data: matchedBefore, error: matchErr } = await supabase
      .from('issues')
      .select('issue_id')
      .eq('area', noticeArea)
      .eq('category', noticeCategory);
    ```
*   **Update Matching Complaints Status** (Lines 476–481):
    ```javascript
    const { data: updatedRows, error: updateErr } = await supabase
      .from('issues')
      .update({ status: noticeStatus })
      .eq('area', noticeArea)
      .eq('category', noticeCategory)
      .select();
    ```

---

## 4. Supabase Edge Functions (`supabase/functions/`)

### 📄 [analyze-area/index.ts](file:///g:/My%20Drive/Vision%20Vault%20Hackathon/supabase/functions/analyze-area/index.ts)
Dynamically builds a select query to pull complaints based on geographic criteria for AI summarization.
```typescript
let query = supabaseClient
  .from('issues')
  .select('description, category, area, constituency, city, district, state')

// Conditional geographic filters:
if (state && state !== 'All') {
  query = query.eq('state', state)
}
if (district && district !== 'All') {
  query = query.eq('district', district)
}
if (city && city !== 'All') {
  query = query.eq('city', city)
}
if (area && area !== 'All') {
  query = query.eq('area', area)
}

// Fallback logic for un-structured search terms:
if ((!state || state === 'All') && (!district || district === 'All') && (!city || city === 'All') && (!area || area === 'All') && location && location !== 'All Regions') {
  query = query.or(`area.eq.${location},constituency.eq.${location},city.eq.${location},district.eq.${location},state.eq.${location}`)
}

const { data: issues, error } = await query
```

---

## 5. Root Inspection Utility Scripts (`/*.js`)

### 📄 [inspect-columns.js](file:///g:/My%20Drive/Vision%20Vault%20Hackathon/inspect-columns.js)
```javascript
// Test query to retrieve 1 row and inspect its schema
const { data, error } = await supabase.from('issues').select('*').limit(1);

// Test fallback insert query
const { data: insData, error: insErr } = await supabase.from('issues').insert(payload).select();
```

### 📄 [inspect-storage.js](file:///g:/My%20Drive/Vision%20Vault%20Hackathon/inspect-storage.js)
```javascript
// Lists and loops files in Supabase Storage Buckets
const { data: buckets, error } = await supabase.storage.listBuckets();
const { data: files, error: filesErr } = await supabase.storage.from(bucket.id).list();
```

### 📄 [search-db-images.js](file:///g:/My%20Drive/Vision%20Vault%20Hackathon/search-db-images.js)
```javascript
// Fetches all issue records to scan for media links
const { data, error } = await supabase.from('issues').select('*');
```

---

## 6. Scratch Development Scripts (`scratch/*.js`)

These scripts reside in `/scratch` and are utilized during local database debugging and testing:

*   **`scratch/check_columns.js`**: `supabase.from('issues').select('*').limit(1)`
*   **`scratch/check_schema.js`**: `supabase.from('issues').select('*').limit(5)`
*   **`scratch/find_combinations.js`**: `supabase.from('issues').select('area, category, status')`
*   **`scratch/insert_test_user.js`**: `supabase.from('mp_users').insert(payload).select()`
*   **`scratch/inspect_issues_data.js`**: `supabase.from('issues').select('area, category').limit(100)`
*   **`scratch/inspect_mp_notices.js`**: `supabase.from('mp_notices').select('*').limit(1)`
*   **`scratch/inspect_mp_users.js`**: `supabase.from('mp_users').select('*')`
*   **`scratch/inspect_notices_columns.js`**: `supabase.from('mp_notices').insert(dummy).select()` & delete.
*   **`scratch/inspect_policies.js`**: `supabase.from('pg_policies').select('*')`
*   **`scratch/list_functions.js`**: `supabase.from('pg_proc').select('*').limit(5)`
*   **`scratch/test_columns_existence.js`**: `supabase.from('mp_notices').insert(payload).select()`
*   **`scratch/test_combinations.js`**: `supabase.from('mp_notices').insert(payload).select()` & delete.
*   **`scratch/test_insert.js`**: `supabase.from('issues').insert(payload).select()` & delete.
*   **`scratch/test_notice_insert.js`**: `supabase.from('mp_notices').insert(testPayload).select()`
*   **`scratch/test_priority_areas.js`**: `supabase.from('issues').select('*')`
*   **`scratch/test_rls_all.js`**: `supabase.from('issues').insert(payload).select()` & delete.
*   **`scratch/test_single_update.js`**: `supabase.from('issues').select('issue_id, area, category, status').limit(1)`
*   **`scratch/test_valid_values.js`**: `supabase.from('mp_notices').insert(dummy).select()` & delete.
