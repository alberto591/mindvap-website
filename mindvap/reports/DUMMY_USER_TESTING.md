# 🔐 Dummy User Testing Guide

This guide provides information about the test users available in the MindVap authentication system for local testing.

## 📋 Available Test Users

The system includes several pre-configured test users that you can use to test the authentication functionality:

### 1. Basic Test User
- **Email**: `test@example.com`
- **Password**: `password123` (any password works for mock auth)
- **Name**: Test User
- **Status**: Active
- **Consents**: All accepted

### 2. Dummy User
- **Email**: `dummy@example.com`
- **Password**: `password123`
- **Name**: Dummy User
- **Status**: Active
- **Consents**: All accepted

### 3. Custom Test User (Created for You)
- **Email**: `testuser@mindvap.com`
- **Password**: `password123`
- **Name**: Test MindVap
- **Status**: Active
- **Consents**: All accepted

## 🚀 How to Use Test Users

### 1. Enable Mock Authentication

Create or update your `.env` file in the `mindvap` directory:

```env
SKIP_EMAIL_VERIFICATION=true
```

This enables mock authentication mode, which bypasses email verification and allows you to test without a real email service.

### 2. Start the Development Server

```bash
cd mindvap
npm run dev
```

### 3. Test Login Functionality

1. Open your browser to `http://localhost:5173/login`
2. Enter one of the test user emails
3. Enter any password (mock auth accepts any password)
4. Click "Sign In"

### 4. Test Registration Functionality

1. Open your browser to `http://localhost:5173/register`
2. Fill out the registration form with a **new email** (not in the list above)
3. Use a password that meets the requirements (at least 8 characters)
4. Check all required consent boxes
5. Click "Create Account"

### 5. Test Account Features

After logging in, you can test:
- Profile management
- Account settings
- Order history
- Address management
- Payment methods
- Logout functionality

## 🔧 Testing Scenarios

### Successful Login
✅ Use valid test user credentials
✅ Should redirect to profile/dashboard
✅ Should create a valid session

### Failed Login
❌ Use invalid email
❌ Should show error message
❌ Should not create session

### Successful Registration
✅ Use new email address
✅ Fill all required fields
✅ Accept all consents
✅ Should create new user account

### Failed Registration
❌ Use existing email
❌ Should show "email already exists" error
❌ Missing required fields
❌ Should show validation errors

## 💡 Tips

- Use Chrome DevTools (F12) to inspect network requests and localStorage
- Check the browser console for any errors
- Test both mobile and desktop views
- Try different password strengths
- Test the "Forgot Password" functionality

## 🎯 Advanced Testing

You can also test:
- Password reset functionality
- Profile updates
- Email preference changes
- Session timeout behavior
- Multiple browser tabs
- Incognito/private browsing

## 🔐 Security Notes

- These test users only work in **mock authentication mode**
- In production mode, you'll need real email verification
- Test user data is stored in memory and reset when the server restarts
- Passwords are not actually validated in mock mode

Enjoy testing your MindVap authentication system! 🚀