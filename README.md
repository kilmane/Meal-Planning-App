# FreshPlan - Intelligent Meal Planning App

A comprehensive meal planning application built with React, TypeScript, and Firebase that helps you plan healthy meals, manage inventory, and reduce food waste through AI-powered suggestions.

## Features

### 🥗 Smart Meal Planning
- AI-powered meal plan generation based on available ingredients
- Weekly meal scheduling with nutritional tracking
- Recipe suggestions that prioritize ingredients nearing expiry

### 📦 Enhanced Inventory Management
- Multi-category ingredient organization (Primary category + storage location + custom tags)
- Expiry date tracking with smart alerts
- Support for frozen, fresh, and pantry items
- Visual storage indicators (freezer ❄️, fridge 🧊, pantry 🏠)

### 👨‍🍳 Recipe Library
- Curated healthy recipes with nutritional information
- Custom recipe creation and management
- Ingredient availability matching
- Recipe compatibility scoring

### 🛒 Smart Shopping Lists
- Auto-generated shopping lists from meal plans
- Ingredient consolidation and quantity optimization
- Category-organized shopping with progress tracking

### 🔐 User Authentication & Cloud Sync
- Firebase Authentication with email/password
- Real-time data synchronization across devices
- Secure user-specific data storage

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Icons**: Lucide React
- **Build Tool**: Vite

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- Firebase project (see setup instructions below)

### Firebase Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project" and follow the setup wizard
   - Enable Google Analytics (optional)

2. **Enable Authentication**
   - In your Firebase project, go to Authentication > Sign-in method
   - Enable "Email/Password" provider
   - Optionally configure authorized domains

3. **Create Firestore Database**
   - Go to Firestore Database > Create database
   - Choose "Start in test mode" for development
   - Select a location close to your users

4. **Get Firebase Configuration**
   - Go to Project Settings > General
   - Scroll down to "Your apps" and click "Web app" icon
   - Register your app and copy the configuration object

5. **Configure Environment Variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env with your Firebase configuration
   VITE_FIREBASE_API_KEY=your-api-key-here
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

### Installation

1. **Clone and Install Dependencies**
   ```bash
   npm install
   ```

2. **Update Firebase Configuration**
   - Edit `src/config/firebase.ts`
   - Replace the placeholder values with your actual Firebase config

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## Firebase Security Rules

For production, update your Firestore security rules:

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

## Project Structure

```
src/
├── components/          # React components
│   ├── AuthModal.tsx   # Authentication modal
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Inventory.tsx   # Inventory management
│   ├── MealPlanner.tsx # Meal planning interface
│   ├── Recipes.tsx     # Recipe library
│   └── ShoppingList.tsx # Shopping list management
├── config/
│   └── firebase.ts     # Firebase configuration
├── context/
│   └── AppContext.tsx  # Global state management
├── hooks/
│   └── useAuth.ts      # Authentication hook
├── services/
│   └── firebaseService.ts # Firebase data operations
└── App.tsx             # Main application component
```

## Key Features Explained

### Multi-Category Inventory System
- **Primary Category**: Main food category (Protein, Vegetables, etc.)
- **Storage Location**: Where it's stored (Fridge, Freezer, Pantry, Counter)
- **Additional Tags**: Custom descriptive tags for better organization
- **Smart Filtering**: Filter by any category or tag combination

### AI-Powered Meal Planning
- Analyzes available ingredients and expiry dates
- Prioritizes recipes using ingredients that expire soon
- Ensures nutritional balance and variety
- Generates shopping lists for missing ingredients

### Real-time Data Sync
- All data is automatically synced across devices
- Real-time updates when data changes
- Offline support with automatic sync when reconnected

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions:
1. Check the Firebase Console for any configuration issues
2. Ensure your Firestore security rules allow authenticated users to read/write their data
3. Verify your environment variables are correctly set
4. Check the browser console for any error messages

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Barcode scanning for easy ingredient entry
- [ ] Nutrition goal tracking and recommendations
- [ ] Social features (share recipes, meal plans)
- [ ] Integration with grocery delivery services
- [ ] Advanced meal planning algorithms with dietary restrictions