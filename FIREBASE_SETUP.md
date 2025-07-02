# Firebase Setup Guide for FreshPlan

Follow these steps to set up Firebase for your FreshPlan meal planning app.

## Step 1: Create a Firebase Project

1. **Go to Firebase Console**
   - Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Sign in with your Google account

2. **Create New Project**
   - Click "Create a project" or "Add project"
   - Enter project name: `freshplan-app` (or your preferred name)
   - Choose whether to enable Google Analytics (recommended)
   - Select your Analytics account or create a new one
   - Click "Create project"

## Step 2: Enable Authentication

1. **Navigate to Authentication**
   - In your Firebase project dashboard, click "Authentication" in the left sidebar
   - Click "Get started" if this is your first time

2. **Configure Sign-in Methods**
   - Go to the "Sign-in method" tab
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

3. **Optional: Configure Authorized Domains**
   - In the "Settings" tab under Authentication
   - Add your domain if deploying to production
   - For development, `localhost` is already included

## Step 3: Set Up Firestore Database

1. **Navigate to Firestore Database**
   - Click "Firestore Database" in the left sidebar
   - Click "Create database"

2. **Choose Security Rules**
   - Select "Start in test mode" for development
   - Choose a location close to your users (e.g., us-central1)
   - Click "Done"

3. **Set Up Production Security Rules (Important!)**
   - Go to the "Rules" tab in Firestore
   - Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

   - Click "Publish"

## Step 4: Get Your Firebase Configuration

1. **Add Web App**
   - In your project overview, click the web icon `</>`
   - Enter app nickname: "FreshPlan Web App"
   - Check "Also set up Firebase Hosting" (optional)
   - Click "Register app"

2. **Copy Configuration**
   - Copy the `firebaseConfig` object that appears
   - It should look like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

## Step 5: Configure Your App

1. **Update Firebase Configuration**
   - Open `src/config/firebase.ts`
   - Replace the placeholder values with your actual config:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

2. **Set Up Environment Variables (Optional but Recommended)**
   - Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   
   - Edit `.env` with your Firebase config:
   ```
   VITE_FIREBASE_API_KEY=your-api-key-here
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

   - Update `src/config/firebase.ts` to use environment variables:
   ```typescript
   const firebaseConfig = {
     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
     authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
     projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
     storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
     messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
     appId: import.meta.env.VITE_FIREBASE_APP_ID
   };
   ```

## Step 6: Test Your Setup

1. **Start Your Development Server**
   ```bash
   npm run dev
   ```

2. **Test Authentication**
   - Open your app in the browser
   - Click "Get Started" or "Sign In"
   - Try creating a new account
   - Verify you can sign in and out

3. **Test Data Sync**
   - Add some ingredients to your inventory
   - Check the Firestore console to see if data appears
   - Try refreshing the page to see if data persists

## Step 7: Optional Enhancements

### Enable Firebase Storage (for recipe images)
1. Go to "Storage" in Firebase Console
2. Click "Get started"
3. Choose security rules (start in test mode)
4. Select a location

### Set Up Firebase Hosting (for deployment)
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Build your app: `npm run build`
5. Deploy: `firebase deploy`

## Troubleshooting

### Common Issues:

1. **"Firebase: Error (auth/configuration-not-found)"**
   - Check that your API key is correct
   - Ensure Authentication is enabled in Firebase Console

2. **"Missing or insufficient permissions"**
   - Verify your Firestore security rules are set up correctly
   - Make sure the user is authenticated before accessing data

3. **"Network request failed"**
   - Check your internet connection
   - Verify your Firebase project is active

4. **Data not syncing**
   - Check browser console for errors
   - Verify Firestore rules allow read/write for authenticated users

### Getting Help:

- Check the browser console for detailed error messages
- Visit [Firebase Documentation](https://firebase.google.com/docs)
- Check [Firebase Status Page](https://status.firebase.google.com/)

## Security Best Practices

1. **Never commit API keys to public repositories**
   - Use environment variables
   - Add `.env` to your `.gitignore`

2. **Use proper Firestore security rules**
   - Never use test mode in production
   - Implement user-specific data access

3. **Validate data on the client and server**
   - Use Firebase security rules for server-side validation
   - Implement client-side validation for better UX

## Next Steps

Once Firebase is set up:
- ✅ Users can create accounts and sign in
- ✅ Data syncs in real-time across devices
- ✅ Each user has their own private data
- ✅ Offline support with automatic sync
- ✅ Secure, scalable backend infrastructure

Your FreshPlan app is now ready for production use! 🎉