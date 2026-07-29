# Authentication Testing Quick Start

## 🚀 Quick Start

### 1. Seed Test Users (First Time Only)

```bash
npm run seed
```

This creates 4 test users with password `Demo@123`:
- engineer@kms.com (Engineer)
- lead@kms.com (TeamLead)
- manager@kms.com (Manager)
- admin@kms.com (Admin)

### 2. Start Dev Server

```bash
npm run dev
```

Server running at `http://localhost:3001`

### 3. Test Sign In

1. Open `http://localhost:3001/auth/login`
2. Enter credentials:
   - Email: `engineer@kms.com`
   - Password: `Demo@123`
3. Click "Sign In"
4. Should redirect to `/dashboard`

### 4. Test Sign Up

1. Open `http://localhost:3001/auth/signup`
2. Fill form:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `Test@123`
   - Confirm: `Test@123`
3. Click "Sign Up"
4. Should show success message and redirect to login
5. Use new credentials to sign in

---

## 🧪 Manual API Testing

### Sign Up via cURL

```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "name": "New User",
    "password": "Demo@123",
    "confirmPassword": "Demo@123"
  }'
```

Expected Response (201):
```json
{
  "message": "User created successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "newuser@example.com",
    "name": "New User",
    "role": "Engineer"
  }
}
```

### Sign In via NextAuth

Use the login form or call NextAuth directly:

```typescript
// In React component
const result = await signIn('credentials', {
  email: 'engineer@kms.com',
  password: 'Demo@123',
  redirect: false,
});

if (result?.ok) {
  console.log('Login successful');
} else {
  console.log('Error:', result?.error);
}
```

---

## ✅ Test Checklist

### Authentication Flow
- [ ] Seed command creates test users
- [ ] Login page renders correctly
- [ ] Sign in with correct credentials succeeds
- [ ] Sign in with wrong password fails
- [ ] Sign in redirects to dashboard
- [ ] Signup page renders correctly
- [ ] Create new user via signup works
- [ ] Password validation enforced (minimum 6 chars)
- [ ] Password confirmation checked
- [ ] Duplicate email prevention works

### Protected Routes
- [ ] Unauthenticated user redirected to login
- [ ] Dashboard accessible after login
- [ ] Logout clears session
- [ ] Callback URL works after login

### Error Handling
- [ ] Missing fields show error message
- [ ] Password mismatch shows error
- [ ] Duplicate email shows error
- [ ] Invalid credentials show error
- [ ] Server errors handled gracefully

---

## 🔐 Security Verification

### Passwords are Hashed
```bash
# Check MongoDB directly
db.users.findOne({ email: 'engineer@kms.com' })
# password field should look like: $2a$12$...encrypted...
# NOT: Demo@123
```

### JWT Token Validation
```bash
# After login, check session cookie
# In browser DevTools > Application > Cookies
# Look for: next-auth.session-token
```

---

## 📋 Files Modified/Created

### New Files
- `src/app/auth/signup/page.tsx` - Signup form component
- `src/app/api/auth/signup/route.ts` - Signup API endpoint
- `scripts/seed.ts` - Database seeding script
- `AUTHENTICATION.md` - Complete auth documentation

### Modified Files
- `src/app/api/auth/[...nextauth]/route.ts` - Added bcrypt password verification
- `src/app/auth/login/page.tsx` - Updated with NextAuth integration
- `src/models/User.ts` - Added password field to schema
- `src/types/index.ts` - Added password to IUser interface
- `package.json` - Added seed script

---

## 🐛 Troubleshooting

### Error: "MONGODB_URI not configured"
- Create `.env.local` file
- Add: `MONGODB_URI=your_connection_string`

### Error: "User not found" on login
- Run `npm run seed` first
- Verify user email in MongoDB

### Error: "Invalid password"
- Check password is exactly: `Demo@123`
- Passwords are case-sensitive
- Make sure confirmPassword matches

### Seed command fails
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env.local`
- Verify connection permissions

### Login redirects back to login
- Check NEXTAUTH_SECRET is set
- Clear browser cookies
- Restart dev server
- Check console for errors

---

## 📞 Support Commands

```bash
# View all test users
npm run seed -- --list

# Clear all users and reseed
npm run seed -- --reset

# Check MongoDB connection
npm run dev  # Then visit /api/health

# View environment variables
cat .env.local
```

---

## 🎯 Next Steps

1. **Password Reset**: Implement email-based password reset
2. **Email Verification**: Verify email before account activation
3. **OAuth**: Add Google/GitHub login
4. **2FA**: Two-factor authentication via email/SMS
5. **Profile Management**: User settings and password change

---

## 📊 Test Coverage

Current implementation covers:
- ✅ Password hashing with bcrypt (12 rounds)
- ✅ Email uniqueness validation
- ✅ Password confirmation matching
- ✅ Minimum password length (6 characters)
- ✅ JWT session management
- ✅ Role-based user creation
- ✅ Middleware-based route protection

Not yet implemented:
- ⏳ Email verification
- ⏳ Password reset
- ⏳ OAuth providers
- ⏳ Two-factor authentication
- ⏳ Session management UI
