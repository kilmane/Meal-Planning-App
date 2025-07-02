import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { FirebaseService } from '../services/firebaseService';

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  addedDate: string;
  tags?: string[]; // Enhanced tags for multi-category support
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: { name: string; quantity: number; unit: string }[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  tags: string[];
  image?: string;
  isUserCreated?: boolean;
}

export interface MealPlan {
  id: string;
  date: string;
  recipe: Recipe;
  servings: number;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  completed: boolean;
}

interface AppState {
  ingredients: Ingredient[];
  recipes: Recipe[];
  mealPlans: MealPlan[];
  shoppingList: ShoppingItem[];
  loading: boolean;
  error: string | null;
  firebaseService: FirebaseService | null;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FIREBASE_SERVICE'; payload: FirebaseService | null }
  | { type: 'SET_INGREDIENTS'; payload: Ingredient[] }
  | { type: 'SET_RECIPES'; payload: Recipe[] }
  | { type: 'SET_MEAL_PLANS'; payload: MealPlan[] }
  | { type: 'SET_SHOPPING_LIST'; payload: ShoppingItem[] }
  | { type: 'ADD_INGREDIENT'; payload: Ingredient }
  | { type: 'UPDATE_INGREDIENT'; payload: Ingredient }
  | { type: 'DELETE_INGREDIENT'; payload: string }
  | { type: 'ADD_RECIPE'; payload: Recipe }
  | { type: 'ADD_MEAL_PLAN'; payload: MealPlan }
  | { type: 'DELETE_MEAL_PLAN'; payload: string }
  | { type: 'ADD_SHOPPING_ITEM'; payload: ShoppingItem }
  | { type: 'TOGGLE_SHOPPING_ITEM'; payload: string }
  | { type: 'DELETE_SHOPPING_ITEM'; payload: string }
  | { type: 'GENERATE_MEAL_PLANS'; payload: MealPlan[] }
  | { type: 'GENERATE_SHOPPING_LIST'; payload: ShoppingItem[] };

// Default recipes that will be available to all users
const defaultRecipes: Recipe[] = [
  {
    id: 'default-1',
    name: 'Grilled Chicken with Broccoli',
    ingredients: [
      { name: 'Chicken Breast', quantity: 500, unit: 'g' },
      { name: 'Broccoli', quantity: 250, unit: 'g' },
      { name: 'Olive Oil', quantity: 2, unit: 'tbsp' }
    ],
    instructions: [
      'Season chicken breast with salt and pepper.',
      'Heat olive oil in a pan over medium-high heat.',
      'Cook chicken for 6-7 minutes per side until golden.',
      'Steam broccoli for 5 minutes until tender.',
      'Serve chicken with steamed broccoli.'
    ],
    prepTime: 10,
    cookTime: 20,
    servings: 2,
    nutrition: {
      calories: 320,
      protein: 35,
      carbs: 8,
      fat: 15,
      fiber: 4
    },
    tags: ['High Protein', 'Low Carb', 'Healthy'],
    image: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg'
  },
  {
    id: 'default-2',
    name: 'Salmon Rice Bowl',
    ingredients: [
      { name: 'Salmon Fillet', quantity: 400, unit: 'g' },
      { name: 'Rice', quantity: 200, unit: 'g' },
      { name: 'Bell Peppers', quantity: 1, unit: 'piece' }
    ],
    instructions: [
      'Cook rice according to package instructions.',
      'Season salmon with herbs and spices.',
      'Pan-sear salmon for 4-5 minutes per side.',
      'Sauté bell peppers until tender.',
      'Assemble bowl with rice, salmon, and peppers.'
    ],
    prepTime: 15,
    cookTime: 25,
    servings: 2,
    nutrition: {
      calories: 450,
      protein: 30,
      carbs: 45,
      fat: 18,
      fiber: 3
    },
    tags: ['Omega-3', 'Balanced', 'Heart Healthy'],
    image: 'https://images.pexels.com/photos/725997/pexels-photo-725997.jpeg'
  },
  {
    id: 'default-3',
    name: 'Beef and Vegetable Stir Fry',
    ingredients: [
      { name: 'Ground Beef', quantity: 400, unit: 'g' },
      { name: 'Bell Peppers', quantity: 2, unit: 'piece' },
      { name: 'Frozen Peas', quantity: 200, unit: 'g' },
      { name: 'Rice', quantity: 150, unit: 'g' }
    ],
    instructions: [
      'Cook rice according to package instructions.',
      'Brown ground beef in a large pan.',
      'Add sliced bell peppers and cook for 5 minutes.',
      'Add frozen peas and cook for 3 minutes.',
      'Season with soy sauce and serve over rice.'
    ],
    prepTime: 10,
    cookTime: 20,
    servings: 3,
    nutrition: {
      calories: 380,
      protein: 25,
      carbs: 35,
      fat: 16,
      fiber: 5
    },
    tags: ['Quick', 'One Pan', 'Family Friendly'],
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'
  }
];

const initialState: AppState = {
  ingredients: [],
  recipes: defaultRecipes,
  mealPlans: [],
  shoppingList: [],
  loading: false,
  error: null,
  firebaseService: null
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_FIREBASE_SERVICE':
      return { ...state, firebaseService: action.payload };
    case 'SET_INGREDIENTS':
      return { ...state, ingredients: action.payload };
    case 'SET_RECIPES':
      return { ...state, recipes: [...defaultRecipes, ...action.payload] };
    case 'SET_MEAL_PLANS':
      return { ...state, mealPlans: action.payload };
    case 'SET_SHOPPING_LIST':
      return { ...state, shoppingList: action.payload };
    case 'ADD_INGREDIENT':
      return {
        ...state,
        ingredients: [...state.ingredients, action.payload]
      };
    case 'UPDATE_INGREDIENT':
      return {
        ...state,
        ingredients: state.ingredients.map(ing =>
          ing.id === action.payload.id ? action.payload : ing
        )
      };
    case 'DELETE_INGREDIENT':
      return {
        ...state,
        ingredients: state.ingredients.filter(ing => ing.id !== action.payload)
      };
    case 'ADD_RECIPE':
      return {
        ...state,
        recipes: [...state.recipes, action.payload]
      };
    case 'ADD_MEAL_PLAN':
      return {
        ...state,
        mealPlans: [...state.mealPlans, action.payload]
      };
    case 'DELETE_MEAL_PLAN':
      return {
        ...state,
        mealPlans: state.mealPlans.filter(plan => plan.id !== action.payload)
      };
    case 'ADD_SHOPPING_ITEM':
      return {
        ...state,
        shoppingList: [...state.shoppingList, action.payload]
      };
    case 'TOGGLE_SHOPPING_ITEM':
      return {
        ...state,
        shoppingList: state.shoppingList.map(item =>
          item.id === action.payload
            ? { ...item, completed: !item.completed }
            : item
        )
      };
    case 'DELETE_SHOPPING_ITEM':
      return {
        ...state,
        shoppingList: state.shoppingList.filter(item => item.id !== action.payload)
      };
    case 'GENERATE_MEAL_PLANS':
      return {
        ...state,
        mealPlans: action.payload
      };
    case 'GENERATE_SHOPPING_LIST':
      return {
        ...state,
        shoppingList: action.payload
      };
    default:
      return state;
  }
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { user } = useAuth();

  // Initialize Firebase service when user changes
  useEffect(() => {
    if (user) {
      const firebaseService = new FirebaseService(user.uid);
      dispatch({ type: 'SET_FIREBASE_SERVICE', payload: firebaseService });
      
      // Set up real-time listeners
      const unsubscribeIngredients = firebaseService.subscribeToIngredients((ingredients) => {
        dispatch({ type: 'SET_INGREDIENTS', payload: ingredients });
      });

      const unsubscribeRecipes = firebaseService.subscribeToRecipes((recipes) => {
        dispatch({ type: 'SET_RECIPES', payload: recipes });
      });

      const unsubscribeMealPlans = firebaseService.subscribeToMealPlans((mealPlans) => {
        dispatch({ type: 'SET_MEAL_PLANS', payload: mealPlans });
      });

      const unsubscribeShoppingList = firebaseService.subscribeToShoppingList((shoppingList) => {
        dispatch({ type: 'SET_SHOPPING_LIST', payload: shoppingList });
      });

      // Cleanup function
      return () => {
        unsubscribeIngredients();
        unsubscribeRecipes();
        unsubscribeMealPlans();
        unsubscribeShoppingList();
      };
    } else {
      dispatch({ type: 'SET_FIREBASE_SERVICE', payload: null });
      dispatch({ type: 'SET_INGREDIENTS', payload: [] });
      dispatch({ type: 'SET_RECIPES', payload: [] });
      dispatch({ type: 'SET_MEAL_PLANS', payload: [] });
      dispatch({ type: 'SET_SHOPPING_LIST', payload: [] });
    }
  }, [user]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};