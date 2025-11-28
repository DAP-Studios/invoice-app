# Firebase Setup Guide for Invoice Management System

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `  ` (or your preferred name)
4. Disable Google Analytics (optional for this project)
5. Click **"Create project"**

## Step 2: Enable Firebase Services

### A. Enable Firestore Database

1. In Firebase Console, go to **Build > Firestore Database**
2. Click **"Create database"**
3. Select **"Start in test mode"** (for development)
4. Choose a location closest to you
5. Click **"Enable"**

### B. Enable Authentication

1. Go to **Build > Authentication**
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Click on **"Email/Password"**
5. Enable **"Email/Password"** (first option)
6. Click **"Save"**

### C. Enable Storage (for company logos)

1. Go to **Build > Storage**
2. Click **"Get started"**
3. Select **"Start in test mode"**
4. Click **"Next"** and **"Done"**

## Step 3: Add User to Authentication

1. Go to **Authentication > Users** tab
2. Click **"Add user"**
3. Enter:
   - **Email**: `admin@company.com`
   - **Password**: `admin123`
4. Click **"Add user"**

## Step 4: Get Firebase Configuration

1. In Firebase Console, click the **gear icon** (⚙️) > **Project settings**
2. Scroll down to **"Your apps"** section
3. Click the **Web icon** (`</>`) to add a web app
4. Enter app nickname: `Invoice App`
5. **Don't check** "Set up Firebase Hosting"
6. Click **"Register app"**
7. Copy the configuration object (looks like this):

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
};
```

## Step 5: Configure Your App

1. Create `.env` file in your project root:

```bash
# Copy .env.example to .env
copy .env.example .env
```

2. Open `.env` file and add your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Step 6: Update Firestore Security Rules (Optional but Recommended)

1. Go to **Firestore Database > Rules** tab
2. Replace with these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read/write
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click **"Publish"**

## Step 7: Update Storage Security Rules (Optional but Recommended)

1. Go to **Storage > Rules** tab
2. Replace with these rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click **"Publish"**

## Step 8: Run Your App

```bash
npm run dev
```

## Login Credentials

- **Email**: admin@company.com
- **Password**: admin123
- **Username** (for login form): admin

## Troubleshooting

### Error: "Firebase: Error (auth/configuration-not-found)"

- Make sure you've created the `.env` file with correct credentials
- Restart the dev server after creating `.env`

### Error: "Missing or insufficient permissions"

- Update Firestore security rules (Step 6)
- Make sure you're logged in

### Error: "Failed to get document"

- Check if Firestore is enabled
- Check your internet connection

## What's Stored Where?

- **Firestore Database**:

  - Collection: `invoices` - All invoice/quotation data
  - Collection: `settings` - Company settings

- **Firebase Storage**:

  - Path: `company/logo.png` - Company logo

- **Firebase Authentication**:
  - User accounts and sessions

## Free Tier Limits

- **Firestore**: 1 GB storage, 50K reads/day, 20K writes/day
- **Authentication**: Unlimited users
- **Storage**: 5 GB storage, 1 GB/day downloads

This is more than enough for 50,000+ invoices!

## Next Steps

After setup, your data will:
✅ Sync across devices
✅ Persist permanently (not lost on browser uninstall)
✅ Be backed up by Google's infrastructure
✅ Support unlimited users
✅ Scale to millions of invoices

---

**Need help?** Check Firebase documentation at https://firebase.google.com/docs
