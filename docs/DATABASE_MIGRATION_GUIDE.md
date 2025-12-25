# Database Security Migration Guide

**Date**: December 24, 2025  
**Migration Script**: `supabase/fix_security_issues.sql`  
**Purpose**: Apply Row Level Security (RLS) policies, create missing tables, and enforce security standards

---

## Prerequisites

### 1. Supabase CLI Installation

The Supabase CLI is currently being installed via Homebrew. Once complete, verify:

```bash
supabase --version
```

### 2. Supabase Project Credentials

You'll need:
- **Project Reference ID**: Found in your Supabase dashboard URL (`https://supabase.com/dashboard/project/YOUR_PROJECT_ID`)
- **Database Password**: The password you set when creating your Supabase project
- **API URL**: `https://YOUR_PROJECT_ID.supabase.co`

---

## Migration Steps

### Step 1: Link to Your Supabase Project

```bash
cd "/Users/lycanbeats/Desktop/Herb business/MindVap WebPage"
supabase link --project-ref YOUR_PROJECT_ID
```

When prompted, enter your database password.

### Step 2: Review the Migration Script

The script will:
- ✅ Create missing `orders` and `order_items` tables
- ✅ Enable Row Level Security (RLS) on all public tables
- ✅ Add ownership policies for e-commerce tables
- ✅ Fix `SECURITY DEFINER` warnings for views
- ✅ Create indexes for performance

**Review the script**:
```bash
cat supabase/fix_security_issues.sql
```

### Step 3: Execute the Migration

**Option A: Via Supabase CLI (Recommended)**
```bash
supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.YOUR_PROJECT_ID.supabase.co:5432/postgres" --file supabase/fix_security_issues.sql
```

**Option B: Via Supabase Dashboard**
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/fix_security_issues.sql`
4. Paste into the SQL Editor
5. Click **Run**

**Option C: Via psql (Advanced)**
```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.YOUR_PROJECT_ID.supabase.co:5432/postgres" -f supabase/fix_security_issues.sql
```

### Step 4: Verify Migration Success

After running the migration, verify:

```sql
-- Check that RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Verify orders table exists
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'orders';

-- Verify order_items table exists
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'order_items';

-- Check RLS policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

---

## What This Migration Does

### 1. Creates Missing E-Commerce Tables

**`orders` Table**:
- Stores customer orders with status tracking
- Links to users via `user_id`
- Includes shipping/billing addresses
- Tracks payment status and totals

**`order_items` Table**:
- Stores individual items within each order
- Links to products and orders
- Tracks quantity and pricing at time of purchase

### 2. Enables Row Level Security (RLS)

RLS ensures users can only access their own data:
- Users can only view their own orders
- Users can only modify their own addresses
- Users can only access their own payment methods
- Public product catalog remains accessible to all

### 3. Fixes Security Warnings

Resolves `SECURITY DEFINER` warnings for views:
- `active_users_verification`
- `user_security_summary`
- `gdpr_compliance_summary`

### 4. Adds Performance Indexes

Creates indexes for:
- Order lookups by user
- Order item queries
- Faster filtering and sorting

---

## Rollback Plan

If you need to rollback this migration:

```sql
-- Drop new tables (if needed)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;

-- Disable RLS on specific tables (if needed)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE addresses DISABLE ROW LEVEL SECURITY;
-- etc.
```

**⚠️ WARNING**: Only rollback if absolutely necessary. Disabling RLS exposes user data.

---

## Post-Migration Testing

### Test 1: Verify RLS Policies Work

```sql
-- As an authenticated user, try to access another user's orders
-- This should return 0 rows
SELECT * FROM orders WHERE user_id != auth.uid();
```

### Test 2: Verify Order Creation

```sql
-- Create a test order
INSERT INTO orders (user_id, total, status, shipping_address, billing_address)
VALUES (
  auth.uid(),
  29.99,
  'pending',
  '{"street": "123 Test St", "city": "Berlin", "country": "DE"}',
  '{"street": "123 Test St", "city": "Berlin", "country": "DE"}'
);
```

### Test 3: Verify Application Functionality

1. Log into your application
2. Add a product to cart
3. Complete checkout
4. Verify order appears in your account dashboard
5. Verify order is saved in Supabase database

---

## Troubleshooting

### Error: "permission denied for table X"

**Solution**: The migration script includes ownership fixes. If this persists, run:
```sql
ALTER TABLE X OWNER TO postgres;
```

### Error: "relation already exists"

**Solution**: Some tables may already exist. The script uses `IF NOT EXISTS` to prevent errors, but if you see this, it's safe to ignore.

### Error: "RLS already enabled"

**Solution**: This is safe to ignore. The script is idempotent.

---

## Security Checklist

After migration, verify:

- [ ] All public tables have RLS enabled
- [ ] Users can only access their own orders
- [ ] Product catalog is publicly accessible
- [ ] Order creation works via application
- [ ] No security warnings in Supabase dashboard
- [ ] Application checkout flow works end-to-end

---

## Next Steps After Migration

1. **Test the application thoroughly** with real user flows
2. **Monitor Supabase logs** for any RLS policy violations
3. **Update your application code** to handle RLS policies correctly
4. **Deploy to production** once verified in staging

---

## Support

If you encounter issues:
1. Check Supabase logs in the dashboard
2. Review the [Supabase RLS documentation](https://supabase.com/docs/guides/auth/row-level-security)
3. Consult the [ADR-0012: Security Patterns](file:///Users/lycanbeats/Desktop/Herb%20business/MindVap%20WebPage/docs/adr/0012-security-patterns.md)

---

**Status**: Ready for execution once Supabase CLI installation completes.
