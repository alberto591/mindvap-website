# Supabase Migration Guide

This guide provides instructions on how to apply the database migrations to your Supabase project.

## Prerequisites

1. A Supabase project created at [https://supabase.com](https://supabase.com)
2. Supabase CLI installed (optional for manual migration)

## Method 1: Using Supabase Dashboard (Recommended)

### Step 1: Access Supabase Dashboard
1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project

### Step 2: Apply Migrations via SQL Editor
1. In the Supabase dashboard, navigate to the **SQL Editor** section
2. Open each migration file and copy the SQL content
3. Paste the SQL into the SQL Editor and execute it

### Migration Files
Apply the migrations in the following order:

1. **001_create_users_table.sql** - Creates the users table with authentication fields
2. **002_create_user_sessions_table.sql** - Creates the user sessions table
3. **003_create_user_addresses_table.sql** - Creates the user addresses table
4. **004_create_security_tables.sql** - Creates security-related tables
5. **005_create_views_and_functions.sql** - Creates views and functions

## Method 2: Using Supabase CLI

### Step 1: Install Supabase CLI
```bash
npm install -g supabase
```

### Step 2: Link Your Project
```bash
supabase link --project-ref your-project-ref
```

### Step 3: Apply Migrations
```bash
supabase migration up
```

## Verification

After applying the migrations, verify the tables exist:

1. Go to the **Table Editor** in the Supabase dashboard
2. Check that the following tables exist:
   - `users`
   - `user_sessions`
   - `user_addresses`
   - `security_tables`

## Troubleshooting

### Error: "Could not find the table 'public.users'"
This error indicates that the `users` table has not been created. Apply the `001_create_users_table.sql` migration first.

### Error: "Auth session missing!"
This error is expected when there is no active session. It does not indicate a problem with the database.

## Notes

- The Supabase JavaScript client does not support direct SQL execution for schema changes
- Use the Supabase dashboard or CLI to apply schema migrations
- Ensure you have the necessary permissions to modify the database schema

## Contact

For further assistance, refer to the [Supabase documentation](https://supabase.com/docs) or contact Supabase support.