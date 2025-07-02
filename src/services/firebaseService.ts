import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Ingredient, Recipe, MealPlan, ShoppingItem } from '../context/AppContext';

export class FirebaseService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // Helper method to get user-specific collection reference
  private getUserCollection(collectionName: string) {
    return collection(db, 'users', this.userId, collectionName);
  }

  // Ingredients
  async addIngredient(ingredient: Omit<Ingredient, 'id'>) {
    const docRef = await addDoc(this.getUserCollection('ingredients'), {
      ...ingredient,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  }

  async updateIngredient(id: string, ingredient: Partial<Ingredient>) {
    const docRef = doc(this.getUserCollection('ingredients'), id);
    await updateDoc(docRef, {
      ...ingredient,
      updatedAt: Timestamp.now()
    });
  }

  async deleteIngredient(id: string) {
    const docRef = doc(this.getUserCollection('ingredients'), id);
    await deleteDoc(docRef);
  }

  async getIngredients(): Promise<Ingredient[]> {
    const querySnapshot = await getDocs(
      query(this.getUserCollection('ingredients'), orderBy('createdAt', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Ingredient));
  }

  subscribeToIngredients(callback: (ingredients: Ingredient[]) => void) {
    return onSnapshot(
      query(this.getUserCollection('ingredients'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const ingredients = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Ingredient));
        callback(ingredients);
      }
    );
  }

  // Recipes
  async addRecipe(recipe: Omit<Recipe, 'id'>) {
    const docRef = await addDoc(this.getUserCollection('recipes'), {
      ...recipe,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  }

  async updateRecipe(id: string, recipe: Partial<Recipe>) {
    const docRef = doc(this.getUserCollection('recipes'), id);
    await updateDoc(docRef, {
      ...recipe,
      updatedAt: Timestamp.now()
    });
  }

  async deleteRecipe(id: string) {
    const docRef = doc(this.getUserCollection('recipes'), id);
    await deleteDoc(docRef);
  }

  async getRecipes(): Promise<Recipe[]> {
    const querySnapshot = await getDocs(
      query(this.getUserCollection('recipes'), orderBy('createdAt', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Recipe));
  }

  subscribeToRecipes(callback: (recipes: Recipe[]) => void) {
    return onSnapshot(
      query(this.getUserCollection('recipes'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const recipes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Recipe));
        callback(recipes);
      }
    );
  }

  // Meal Plans
  async addMealPlan(mealPlan: Omit<MealPlan, 'id'>) {
    const docRef = await addDoc(this.getUserCollection('mealPlans'), {
      ...mealPlan,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  }

  async updateMealPlan(id: string, mealPlan: Partial<MealPlan>) {
    const docRef = doc(this.getUserCollection('mealPlans'), id);
    await updateDoc(docRef, {
      ...mealPlan,
      updatedAt: Timestamp.now()
    });
  }

  async deleteMealPlan(id: string) {
    const docRef = doc(this.getUserCollection('mealPlans'), id);
    await deleteDoc(docRef);
  }

  async getMealPlans(): Promise<MealPlan[]> {
    const querySnapshot = await getDocs(
      query(this.getUserCollection('mealPlans'), orderBy('date', 'asc'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as MealPlan));
  }

  subscribeToMealPlans(callback: (mealPlans: MealPlan[]) => void) {
    return onSnapshot(
      query(this.getUserCollection('mealPlans'), orderBy('date', 'asc')),
      (snapshot) => {
        const mealPlans = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as MealPlan));
        callback(mealPlans);
      }
    );
  }

  // Shopping List
  async addShoppingItem(item: Omit<ShoppingItem, 'id'>) {
    const docRef = await addDoc(this.getUserCollection('shoppingList'), {
      ...item,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  }

  async updateShoppingItem(id: string, item: Partial<ShoppingItem>) {
    const docRef = doc(this.getUserCollection('shoppingList'), id);
    await updateDoc(docRef, {
      ...item,
      updatedAt: Timestamp.now()
    });
  }

  async deleteShoppingItem(id: string) {
    const docRef = doc(this.getUserCollection('shoppingList'), id);
    await deleteDoc(docRef);
  }

  async getShoppingList(): Promise<ShoppingItem[]> {
    const querySnapshot = await getDocs(
      query(this.getUserCollection('shoppingList'), orderBy('createdAt', 'desc'))
    );
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ShoppingItem));
  }

  subscribeToShoppingList(callback: (items: ShoppingItem[]) => void) {
    return onSnapshot(
      query(this.getUserCollection('shoppingList'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as ShoppingItem));
        callback(items);
      }
    );
  }

  // Batch operations for meal plan generation
  async generateMealPlans(mealPlans: Omit<MealPlan, 'id'>[]) {
    // First, clear existing meal plans for the date range
    const existingPlans = await this.getMealPlans();
    const planDates = mealPlans.map(plan => plan.date);
    const plansToDelete = existingPlans.filter(plan => planDates.includes(plan.date));
    
    // Delete existing plans
    await Promise.all(plansToDelete.map(plan => this.deleteMealPlan(plan.id)));
    
    // Add new plans
    await Promise.all(mealPlans.map(plan => this.addMealPlan(plan)));
  }

  // Batch operations for shopping list generation
  async generateShoppingList(items: Omit<ShoppingItem, 'id'>[]) {
    // Clear existing shopping list
    const existingItems = await this.getShoppingList();
    await Promise.all(existingItems.map(item => this.deleteShoppingItem(item.id)));
    
    // Add new items
    await Promise.all(items.map(item => this.addShoppingItem(item)));
  }
}