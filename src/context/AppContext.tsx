import React, { createContext, useContext, useReducer, ReactNode } from 'react';

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
}

type AppAction =
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

const initialState: AppState = {
  ingredients: [
    {
      id: '1',
      name: 'Chicken Breast',
      category: 'Protein',
      quantity: 1,
      unit: 'kg',
      expiryDate: '2025-01-10',
      addedDate: '2025-01-01',
      tags: ['protein', 'meat', 'chicken', 'fridge', 'lean']
    },
    {
      id: '2',
      name: 'Broccoli',
      category: 'Vegetables',
      quantity: 500,
      unit: 'g',
      expiryDate: '2025-01-08',
      addedDate: '2025-01-01',
      tags: ['vegetable', 'green', 'cruciferous', 'fridge', 'fresh']
    },
    {
      id: '3',
      name: 'Rice',
      category: 'Grains',
      quantity: 2,
      unit: 'kg',
      expiryDate: '2025-03-01',
      addedDate: '2025-01-01',
      tags: ['grain', 'carbs', 'staple', 'pantry', 'dried']
    },
    {
      id: '4',
      name: 'Salmon Fillet',
      category: 'Protein',
      quantity: 750,
      unit: 'g',
      expiryDate: '2025-01-07',
      addedDate: '2025-01-01',
      tags: ['protein', 'fish', 'omega3', 'fridge', 'fresh']
    },
    {
      id: '5',
      name: 'Bell Peppers',
      category: 'Vegetables',
      quantity: 4,
      unit: 'piece',
      expiryDate: '2025-01-12',
      addedDate: '2025-01-01',
      tags: ['vegetable', 'colorful', 'vitamin-c', 'fridge', 'fresh']
    },
    {
      id: '6',
      name: 'Frozen Peas',
      category: 'Vegetables',
      quantity: 500,
      unit: 'g',
      expiryDate: '2025-06-01',
      addedDate: '2025-01-01',
      tags: ['vegetable', 'frozen', 'green', 'freezer']
    },
    {
      id: '7',
      name: 'Ground Beef',
      category: 'Protein',
      quantity: 1,
      unit: 'kg',
      expiryDate: '2025-04-01',
      addedDate: '2025-01-01',
      tags: ['protein', 'meat', 'beef', 'frozen', 'freezer']
    },
    {
      id: '8',
      name: 'Pasta',
      category: 'Grains',
      quantity: 500,
      unit: 'g',
      expiryDate: '2025-12-01',
      addedDate: '2025-01-01',
      tags: ['grain', 'carbs', 'italian', 'pantry', 'dried']
    },
    {
      id: '9',
      name: 'Pasta Sauce',
      category: 'Pantry',
      quantity: 2,
      unit: 'jar',
      expiryDate: '2025-08-01',
      addedDate: '2025-01-01',
      tags: ['sauce', 'tomato', 'italian', 'pantry', 'jarred']
    },
    {
      id: '10',
      name: 'Frozen Chicken Thighs',
      category: 'Protein',
      quantity: 1.5,
      unit: 'kg',
      expiryDate: '2025-05-01',
      addedDate: '2025-01-01',
      tags: ['protein', 'meat', 'chicken', 'frozen', 'freezer', 'dark-meat']
    },
    {
      id: '11',
      name: 'Frozen Salmon Portions',
      category: 'Protein',
      quantity: 800,
      unit: 'g',
      expiryDate: '2025-04-15',
      addedDate: '2025-01-01',
      tags: ['protein', 'fish', 'omega3', 'frozen', 'freezer', 'portioned']
    }
  ],
  recipes: [
    {
      id: '1',
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
      id: '2',
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
      id: '3',
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
    },
    {
      id: '4',
      name: 'Chicken Fried Rice',
      ingredients: [
        { name: 'Chicken Breast', quantity: 300, unit: 'g' },
        { name: 'Rice', quantity: 200, unit: 'g' },
        { name: 'Frozen Peas', quantity: 150, unit: 'g' },
        { name: 'Bell Peppers', quantity: 1, unit: 'piece' }
      ],
      instructions: [
        'Cook rice and let it cool completely.',
        'Cut chicken into small cubes and cook until done.',
        'Heat oil in a wok or large pan.',
        'Add rice and stir-fry for 3 minutes.',
        'Add chicken, peas, and peppers. Cook for 5 minutes.',
        'Season with soy sauce and serve hot.'
      ],
      prepTime: 15,
      cookTime: 20,
      servings: 2,
      nutrition: {
        calories: 420,
        protein: 28,
        carbs: 48,
        fat: 12,
        fiber: 4
      },
      tags: ['Asian', 'Comfort Food', 'Leftover Rice'],
      image: 'https://images.pexels.com/photos/1410235/pexels-photo-1410235.jpeg'
    },
    {
      id: '5',
      name: 'Salmon with Steamed Vegetables',
      ingredients: [
        { name: 'Salmon Fillet', quantity: 350, unit: 'g' },
        { name: 'Broccoli', quantity: 250, unit: 'g' },
        { name: 'Bell Peppers', quantity: 1, unit: 'piece' }
      ],
      instructions: [
        'Season salmon with lemon, salt, and pepper.',
        'Steam broccoli and bell peppers for 8 minutes.',
        'Pan-sear salmon for 4 minutes per side.',
        'Serve salmon with steamed vegetables.',
        'Drizzle with olive oil and lemon juice.'
      ],
      prepTime: 10,
      cookTime: 15,
      servings: 2,
      nutrition: {
        calories: 290,
        protein: 32,
        carbs: 12,
        fat: 14,
        fiber: 6
      },
      tags: ['Low Carb', 'Keto Friendly', 'Anti-inflammatory'],
      image: 'https://images.pexels.com/photos/1516415/pexels-photo-1516415.jpeg'
    },
    {
      id: '6',
      name: 'Beef and Rice Casserole',
      ingredients: [
        { name: 'Ground Beef', quantity: 500, unit: 'g' },
        { name: 'Rice', quantity: 250, unit: 'g' },
        { name: 'Frozen Peas', quantity: 200, unit: 'g' },
        { name: 'Bell Peppers', quantity: 2, unit: 'piece' }
      ],
      instructions: [
        'Preheat oven to 180°C.',
        'Cook rice until almost tender.',
        'Brown ground beef with diced peppers.',
        'Mix beef, rice, and peas in a casserole dish.',
        'Bake for 25 minutes until heated through.',
        'Let rest for 5 minutes before serving.'
      ],
      prepTime: 20,
      cookTime: 35,
      servings: 4,
      nutrition: {
        calories: 365,
        protein: 24,
        carbs: 38,
        fat: 14,
        fiber: 4
      },
      tags: ['Casserole', 'Make Ahead', 'Family Size'],
      image: 'https://images.pexels.com/photos/1109197/pexels-photo-1109197.jpeg'
    },
    {
      id: '7',
      name: 'Classic Pasta with Tomato Sauce',
      ingredients: [
        { name: 'Pasta', quantity: 300, unit: 'g' },
        { name: 'Pasta Sauce', quantity: 1, unit: 'jar' },
        { name: 'Bell Peppers', quantity: 1, unit: 'piece' }
      ],
      instructions: [
        'Bring a large pot of salted water to boil.',
        'Cook pasta according to package directions.',
        'Meanwhile, sauté diced bell peppers in olive oil.',
        'Heat pasta sauce in a separate pan.',
        'Drain pasta and mix with sauce and peppers.',
        'Serve hot with grated cheese if desired.'
      ],
      prepTime: 5,
      cookTime: 15,
      servings: 3,
      nutrition: {
        calories: 320,
        protein: 12,
        carbs: 62,
        fat: 4,
        fiber: 6
      },
      tags: ['Italian', 'Vegetarian', 'Quick'],
      image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg'
    },
    {
      id: '8',
      name: 'Chicken and Pasta Bake',
      ingredients: [
        { name: 'Chicken Breast', quantity: 400, unit: 'g' },
        { name: 'Pasta', quantity: 250, unit: 'g' },
        { name: 'Pasta Sauce', quantity: 1, unit: 'jar' },
        { name: 'Bell Peppers', quantity: 1, unit: 'piece' }
      ],
      instructions: [
        'Preheat oven to 190°C.',
        'Cook pasta until al dente, drain.',
        'Cut chicken into bite-sized pieces and season.',
        'Mix pasta, chicken, sauce, and diced peppers.',
        'Transfer to baking dish and cover with foil.',
        'Bake for 30 minutes until chicken is cooked through.'
      ],
      prepTime: 15,
      cookTime: 35,
      servings: 4,
      nutrition: {
        calories: 385,
        protein: 28,
        carbs: 48,
        fat: 8,
        fiber: 5
      },
      tags: ['Baked', 'Comfort Food', 'Family Friendly'],
      image: 'https://images.pexels.com/photos/1438672/pexels-photo-1438672.jpeg'
    },
    {
      id: '9',
      name: 'Beef Pasta Skillet',
      ingredients: [
        { name: 'Ground Beef', quantity: 350, unit: 'g' },
        { name: 'Pasta', quantity: 200, unit: 'g' },
        { name: 'Pasta Sauce', quantity: 1, unit: 'jar' },
        { name: 'Frozen Peas', quantity: 150, unit: 'g' }
      ],
      instructions: [
        'Cook pasta according to package directions.',
        'Brown ground beef in a large skillet.',
        'Add pasta sauce and simmer for 5 minutes.',
        'Stir in cooked pasta and frozen peas.',
        'Cook for 3-4 minutes until peas are heated.',
        'Serve immediately while hot.'
      ],
      prepTime: 10,
      cookTime: 20,
      servings: 3,
      nutrition: {
        calories: 410,
        protein: 26,
        carbs: 52,
        fat: 12,
        fiber: 6
      },
      tags: ['One Pan', 'Quick', 'Hearty'],
      image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg'
    },
    {
      id: '10',
      name: 'Vegetable Rice Pilaf',
      ingredients: [
        { name: 'Rice', quantity: 200, unit: 'g' },
        { name: 'Bell Peppers', quantity: 2, unit: 'piece' },
        { name: 'Frozen Peas', quantity: 200, unit: 'g' },
        { name: 'Broccoli', quantity: 200, unit: 'g' }
      ],
      instructions: [
        'Rinse rice until water runs clear.',
        'Sauté diced bell peppers in oil for 3 minutes.',
        'Add rice and stir for 2 minutes.',
        'Add water and bring to boil, then simmer covered.',
        'In last 5 minutes, add broccoli and peas on top.',
        'Let stand 5 minutes, then fluff with fork.'
      ],
      prepTime: 10,
      cookTime: 25,
      servings: 3,
      nutrition: {
        calories: 280,
        protein: 8,
        carbs: 58,
        fat: 2,
        fiber: 8
      },
      tags: ['Vegetarian', 'Healthy', 'Colorful'],
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'
    },
    {
      id: '11',
      name: 'Frozen Chicken Thigh Curry',
      ingredients: [
        { name: 'Frozen Chicken Thighs', quantity: 600, unit: 'g' },
        { name: 'Rice', quantity: 200, unit: 'g' },
        { name: 'Bell Peppers', quantity: 1, unit: 'piece' },
        { name: 'Frozen Peas', quantity: 150, unit: 'g' }
      ],
      instructions: [
        'Thaw chicken thighs completely and cut into pieces.',
        'Cook rice according to package instructions.',
        'Brown chicken pieces in a large pan.',
        'Add curry spices and diced bell peppers.',
        'Simmer for 20 minutes until chicken is tender.',
        'Add frozen peas in last 5 minutes and serve over rice.'
      ],
      prepTime: 15,
      cookTime: 30,
      servings: 3,
      nutrition: {
        calories: 420,
        protein: 32,
        carbs: 45,
        fat: 14,
        fiber: 5
      },
      tags: ['Curry', 'Frozen Friendly', 'Spicy'],
      image: 'https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg'
    },
    {
      id: '12',
      name: 'Frozen Salmon Teriyaki Bowl',
      ingredients: [
        { name: 'Frozen Salmon Portions', quantity: 400, unit: 'g' },
        { name: 'Rice', quantity: 200, unit: 'g' },
        { name: 'Broccoli', quantity: 250, unit: 'g' },
        { name: 'Bell Peppers', quantity: 1, unit: 'piece' }
      ],
      instructions: [
        'Thaw salmon portions according to package instructions.',
        'Cook rice according to package directions.',
        'Steam broccoli and bell peppers for 8 minutes.',
        'Pan-sear salmon with teriyaki sauce for 4 minutes per side.',
        'Assemble bowls with rice, vegetables, and salmon.',
        'Drizzle with extra teriyaki sauce.'
      ],
      prepTime: 20,
      cookTime: 25,
      servings: 2,
      nutrition: {
        calories: 480,
        protein: 35,
        carbs: 52,
        fat: 16,
        fiber: 6
      },
      tags: ['Asian', 'Frozen Friendly', 'Balanced'],
      image: 'https://images.pexels.com/photos/725997/pexels-photo-725997.jpeg'
    }
  ],
  mealPlans: [],
  shoppingList: []
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
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