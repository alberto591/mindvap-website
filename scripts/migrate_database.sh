#!/bin/bash
# Database Security Migration Execution Script
# This script will guide you through executing the security migration

set -e  # Exit on error

echo "🛡️  MindVap Database Security Migration"
echo "======================================"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI is not installed"
    echo "Install it with: brew install supabase/tap/supabase"
    exit 1
fi

echo "✅ Supabase CLI detected: $(supabase --version)"
echo ""

# Prompt for Supabase project details
echo "📋 Please provide your Supabase project details:"
echo ""
read -p "Project Reference ID (from your Supabase dashboard URL): " PROJECT_ID
read -sp "Database Password: " DB_PASSWORD
echo ""
echo ""

# Construct database URL
DB_URL="postgresql://postgres:${DB_PASSWORD}@db.${PROJECT_ID}.supabase.co:5432/postgres"

echo "🔗 Connecting to your Supabase project..."
echo ""

# Execute the migration
echo "🚀 Executing security migration..."
echo ""

psql "$DB_URL" -f supabase/fix_security_issues.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "📊 Verifying migration..."
    echo ""
    
    # Verify RLS is enabled
    psql "$DB_URL" -c "SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"
    
    echo ""
    echo "🎉 Database security migration complete!"
    echo ""
    echo "Next steps:"
    echo "1. Test your application's checkout flow"
    echo "2. Verify users can only access their own orders"
    echo "3. Check Supabase dashboard for any warnings"
else
    echo ""
    echo "❌ Migration failed. Please check the error messages above."
    echo ""
    echo "Troubleshooting:"
    echo "1. Verify your database password is correct"
    echo "2. Check your project ID matches your Supabase dashboard"
    echo "3. Ensure you have network access to Supabase"
    exit 1
fi
