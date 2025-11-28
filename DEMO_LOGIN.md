# Demo Login & Firebase Setup

## 🎮 Demo Mode (Default - No Setup Required)

The app now works **out of the box** with demo login!

**Demo Credentials:**

- Username: `admin`
- Password: `admin123`

**Demo Mode Features:**

- ✅ Works immediately without any configuration
- ✅ Data stored in browser localStorage
- ✅ Perfect for testing and development
- ⚠️ Data limited to ~5-10 MB (5,000-10,000 invoices)
- ⚠️ Data lost if browser cache is cleared

## 🔥 Firebase Mode (Optional - For Production)

Want unlimited storage and cloud sync? Configure Firebase!

### Quick Setup:

1. **Follow the guide**: See `FIREBASE_SETUP.md` for detailed steps

2. **Update `.env` file** with your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

3. **Create Firebase user** (in Firebase Console):

   - Email: `admin@company.com`
   - Password: `admin123`

4. **Restart the app**:

```bash
npm run dev
```

### Firebase Benefits:

- ✅ Unlimited storage (1 GB free = 500,000+ invoices)
- ✅ Cloud sync across devices
- ✅ Data never lost (even if browser uninstalled)
- ✅ Real-time updates
- ✅ Automatic backups

## How It Works

The app **automatically detects** which mode to use:

- **Demo Mode**: If Firebase credentials are missing or placeholder values
- **Firebase Mode**: If valid Firebase credentials are configured

Same login credentials work for both modes!

## Switching Between Modes

### To Use Demo Mode:

Just don't configure Firebase - it works by default!

### To Switch to Firebase:

1. Configure Firebase (see `FIREBASE_SETUP.md`)
2. Update `.env` with real credentials
3. Restart dev server

### To Switch Back to Demo:

1. Remove or reset `.env` values to placeholders
2. Restart dev server

---

**Current Mode**: Check login page - it shows "🎮 Demo Mode Active" or "Login Credentials"
