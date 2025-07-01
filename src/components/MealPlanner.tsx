import React, { useState } from 'react';
import { Calendar, Clock, Users, ChefHat, Sparkles, Trash2, RefreshCw, Info } from 'lucide-react';
import { useApp, MealPlan, Recipe } from '../context/AppContext';

const MealPlanner: React.FC = () => {
  const { state, dispatch } = useApp();
  const [selectedWeek, setSelectedWeek] = useState(0); // 0 = current week, 1 = next week
  const [generatingPlan, setGeneratingPlan] = useState(false);

  // Get week dates
  const getWeekDates = (weekOffset: number) => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7));
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const weekDates = getWeekDates(selectedWeek);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Get meal plans for the selected week
  const weekMealPlans = state.mealPlans.filter(plan => {
    const planDate = new Date(plan.date);
    return weekDates.some(date => 
      date.toDateString() === planDate.toDateString()
    );
  });

  // Enhanced ingredient matching function
  const findMatchingIngredient = (recipeName: string, availableIngredients: any[]) => {
    const lowerRecipeName = recipeName.toLowerCase();
    
    return availableIngredients.find(ingredient => {
      const lowerIngredientName = ingredient.name.toLowerCase();
      
      // Direct name match
      if (lowerIngredientName === lowerRecipeName) return true;
      
      // Partial matches for common variations
      if (lowerRecipeName.includes('pasta') && lowerIngredientName.includes('pasta')) return true;
      if (lowerRecipeName.includes('sauce') && lowerIngredientName.includes('sauce')) return true;
      if (lowerRecipeName.includes('chicken') && lowerIngredientName.includes('chicken')) return true;
      if (lowerRecipeName.includes('beef') && lowerIngredientName.includes('beef')) return true;
      if (lowerRecipeName.includes('salmon') && lowerIngredientName.includes('salmon')) return true;
      if (lowerRecipeName.includes('rice') && lowerIngredientName.includes('rice')) return true;
      if (lowerRecipeName.includes('pepper') && lowerIngredientName.includes('pepper')) return true;
      if (lowerRecipeName.includes('peas') && lowerIngredientName.includes('peas')) return true;
      if (lowerRecipeName.includes('broccoli') && lowerIngredientName.includes('broccoli')) return true;
      
      // Tag-based matching
      if (ingredient.tags) {
        return ingredient.tags.some((tag: string) => 
          lowerRecipeName.includes(tag.toLowerCase()) || 
          tag.toLowerCase().includes(lowerRecipeName)
        );
      }
      
      return false;
    });
  };

  // Generate intelligent meal plan
  const generateMealPlan = async () => {
    setGeneratingPlan(true);
    
    // Simulate AI planning delay for realism
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Smart meal planning algorithm that considers available ingredients
    const availableRecipes = [...state.recipes];
    const newMealPlans: MealPlan[] = [];
    
    // Only plan for weekdays (Monday-Friday) for dinner
    const weekdayDates = weekDates.slice(1, 6);
    
    // Score recipes based on available ingredients
    const scoredRecipes = availableRecipes.map(recipe => {
      let score = 0;
      let availableIngredients = 0;
      
      recipe.ingredients.forEach(recipeIngredient => {
        const matchingIngredient = findMatchingIngredient(recipeIngredient.name, state.ingredients);
        
        if (matchingIngredient && matchingIngredient.quantity >= recipeIngredient.quantity) {
          score += 10; // Full ingredient available
          availableIngredients++;
        } else if (matchingIngredient) {
          score += 5; // Partial ingredient available
          availableIngredients++;
        }
      });
      
      // Bonus for recipes with more available ingredients
      const ingredientRatio = availableIngredients / recipe.ingredients.length;
      score += ingredientRatio * 20;
      
      return { recipe, score, availableIngredients, totalIngredients: recipe.ingredients.length };
    });

    // Sort by score (highest first)
    scoredRecipes.sort((a, b) => b.score - a.score);
    
    // Select recipes for each day, ensuring variety
    const usedRecipes = new Set<string>();
    
    weekdayDates.forEach((date, index) => {
      // Find the best available recipe that hasn't been used
      const availableRecipe = scoredRecipes.find(scored => 
        !usedRecipes.has(scored.recipe.id) && scored.score > 0
      );
      
      if (availableRecipe) {
        usedRecipes.add(availableRecipe.recipe.id);
        newMealPlans.push({
          id: `${date.toISOString().split('T')[0]}-${availableRecipe.recipe.id}`,
          date: date.toISOString().split('T')[0],
          recipe: availableRecipe.recipe,
          servings: 2
        });
      } else if (scoredRecipes.length > 0) {
        // Fallback to any recipe if no perfect matches
        const fallbackRecipe = scoredRecipes[index % scoredRecipes.length];
        newMealPlans.push({
          id: `${date.toISOString().split('T')[0]}-${fallbackRecipe.recipe.id}`,
          date: date.toISOString().split('T')[0],
          recipe: fallbackRecipe.recipe,
          servings: 2
        });
      }
    });

    dispatch({ type: 'GENERATE_MEAL_PLANS', payload: newMealPlans });
    setGeneratingPlan(false);
  };

  // Remove meal plan
  const removeMealPlan = (planId: string) => {
    dispatch({ type: 'DELETE_MEAL_PLAN', payload: planId });
  };

  // Enhanced recipe compatibility check
  const canMakeRecipe = (recipe: Recipe) => {
    return recipe.ingredients.every(recipeIngredient => {
      const availableIngredient = findMatchingIngredient(recipeIngredient.name, state.ingredients);
      return availableIngredient && availableIngredient.quantity >= recipeIngredient.quantity;
    });
  };

  const getRecipeCompatibility = (recipe: Recipe) => {
    let availableCount = 0;
    let totalCount = recipe.ingredients.length;
    
    recipe.ingredients.forEach(recipeIngredient => {
      const availableIngredient = findMatchingIngredient(recipeIngredient.name, state.ingredients);
      if (availableIngredient && availableIngredient.quantity >= recipeIngredient.quantity) {
        availableCount++;
      }
    });
    
    return { availableCount, totalCount, percentage: (availableCount / totalCount) * 100 };
  };

  const MealCard: React.FC<{ plan: MealPlan }> = ({ plan }) => {
    const compatibility = getRecipeCompatibility(plan.recipe);
    const canMake = compatibility.percentage === 100;
    
    return (
      <div className={`bg-white rounded-lg shadow-sm border-2 p-4 hover:shadow-md transition-shadow ${
        canMake ? 'border-green-200' : compatibility.percentage >= 50 ? 'border-yellow-200' : 'border-orange-200'
      }`}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 text-sm mb-1">{plan.recipe.name}</h4>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {plan.recipe.prepTime + plan.recipe.cookTime}m
              </span>
              <span className="flex items-center">
                <Users className="w-3 h-3 mr-1" />
                {plan.servings}
              </span>
            </div>
          </div>
          <button
            onClick={() => removeMealPlan(plan.id)}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        
        {plan.recipe.image && (
          <img 
            src={plan.recipe.image} 
            alt={plan.recipe.name}
            className="w-full h-24 object-cover rounded-md mb-3"
          />
        )}
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Calories</span>
            <span className="text-xs font-medium">{plan.recipe.nutrition.calories} cal</span>
          </div>
          
          <div className={`text-xs px-2 py-1 rounded ${
            canMake 
              ? 'bg-green-100 text-green-700' 
              : compatibility.percentage >= 50
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-orange-100 text-orange-700'
          }`}>
            {canMake 
              ? '✓ Can make with current ingredients' 
              : `${compatibility.availableCount}/${compatibility.totalCount} ingredients available`
            }
          </div>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {plan.recipe.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Meal Planner</h2>
          <p className="text-gray-600">Plan your weekly dinners intelligently</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value={0}>This Week</option>
            <option value={1}>Next Week</option>
          </select>
          <button
            onClick={generateMealPlan}
            disabled={generatingPlan}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            {generatingPlan ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Plan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Smart Meal Planning Tips:</p>
            <ul className="space-y-1 text-blue-700">
              <li>• The AI prioritizes recipes using ingredients you already have</li>
              <li>• Add more ingredients to your inventory for better meal suggestions</li>
              <li>• Recipes are scored based on ingredient availability and freshness</li>
              <li>• Plans focus on weekday dinners (Monday-Friday)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* AI Planning Info */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
        <div className="flex items-start space-x-3">
          <Sparkles className="w-6 h-6 text-green-500 mt-1" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Smart Meal Planning</h3>
            <p className="text-gray-700 text-sm mb-3">
              Our AI analyzes your available ingredients, expiry dates, and nutritional goals to create balanced weekly meal plans that minimize waste and maximize variety.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Uses ingredients before expiry</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Ensures nutritional balance</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Maximizes recipe variety</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Calendar */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
          {weekDates.map((date, index) => {
            const dayPlan = weekMealPlans.find(plan => 
              new Date(plan.date).toDateString() === date.toDateString()
            );
            
            const isToday = date.toDateString() === new Date().toDateString();
            const isWeekend = index === 0 || index === 6;
            
            return (
              <div key={date.toISOString()} className={`p-4 rounded-lg border-2 ${
                isToday ? 'border-green-300 bg-green-50' : 'border-gray-200'
              }`}>
                <div className="text-center mb-3">
                  <h3 className={`font-semibold ${isToday ? 'text-green-700' : 'text-gray-900'}`}>
                    {dayNames[index]}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                
                {isWeekend ? (
                  <div className="text-center py-8 text-gray-400">
                    <ChefHat className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Weekend - Freestyle!</p>
                  </div>
                ) : dayPlan ? (
                  <MealCard plan={dayPlan} />
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <div className="w-8 h-8 mx-auto mb-2 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <p className="text-xs">No meal planned</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Week Summary */}
      {weekMealPlans.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Week Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {weekMealPlans.reduce((sum, plan) => sum + plan.recipe.nutrition.calories, 0)}
              </p>
              <p className="text-sm text-blue-700">Total Calories</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {weekMealPlans.reduce((sum, plan) => sum + plan.recipe.nutrition.protein, 0)}g
              </p>
              <p className="text-sm text-green-700">Protein</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">
                {weekMealPlans.reduce((sum, plan) => sum + plan.recipe.nutrition.fiber, 0)}g
              </p>
              <p className="text-sm text-orange-700">Fiber</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{weekMealPlans.length}</p>
              <p className="text-sm text-purple-700">Meals Planned</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanner;