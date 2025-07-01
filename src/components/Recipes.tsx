import React, { useState } from 'react';
import { Clock, Users, Search, Filter, Heart, ChefHat, Plus, Info } from 'lucide-react';
import { useApp, Recipe } from '../context/AppContext';

const Recipes: React.FC = () => {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showAddRecipe, setShowAddRecipe] = useState(false);

  // Get all unique tags
  const allTags = ['All', ...new Set(state.recipes.flatMap(recipe => recipe.tags))];

  // Filter recipes
  const filteredRecipes = state.recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.ingredients.some(ing => ing.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTag = selectedTag === 'All' || recipe.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
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

  // Check if we can make a recipe with available ingredients
  const canMakeRecipe = (recipe: Recipe) => {
    return recipe.ingredients.every(recipeIngredient => {
      const availableIngredient = findMatchingIngredient(recipeIngredient.name, state.ingredients);
      return availableIngredient && availableIngredient.quantity >= recipeIngredient.quantity;
    });
  };

  const getMissingIngredients = (recipe: Recipe) => {
    return recipe.ingredients.filter(recipeIngredient => {
      const availableIngredient = findMatchingIngredient(recipeIngredient.name, state.ingredients);
      return !availableIngredient || availableIngredient.quantity < recipeIngredient.quantity;
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

  const AddRecipeForm: React.FC<{ onSubmit: (recipe: Recipe) => void; onCancel: () => void }> = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      name: '',
      prepTime: 15,
      cookTime: 30,
      servings: 2,
      tags: [] as string[],
      ingredients: [{ name: '', quantity: 1, unit: 'piece' }],
      instructions: [''],
      nutrition: {
        calories: 300,
        protein: 20,
        carbs: 30,
        fat: 10,
        fiber: 5
      }
    });

    const addIngredient = () => {
      setFormData(prev => ({
        ...prev,
        ingredients: [...prev.ingredients, { name: '', quantity: 1, unit: 'piece' }]
      }));
    };

    const updateIngredient = (index: number, field: string, value: any) => {
      setFormData(prev => ({
        ...prev,
        ingredients: prev.ingredients.map((ing, i) => 
          i === index ? { ...ing, [field]: value } : ing
        )
      }));
    };

    const removeIngredient = (index: number) => {
      setFormData(prev => ({
        ...prev,
        ingredients: prev.ingredients.filter((_, i) => i !== index)
      }));
    };

    const addInstruction = () => {
      setFormData(prev => ({
        ...prev,
        instructions: [...prev.instructions, '']
      }));
    };

    const updateInstruction = (index: number, value: string) => {
      setFormData(prev => ({
        ...prev,
        instructions: prev.instructions.map((inst, i) => 
          i === index ? value : inst
        )
      }));
    };

    const removeInstruction = (index: number) => {
      setFormData(prev => ({
        ...prev,
        instructions: prev.instructions.filter((_, i) => i !== index)
      }));
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const newRecipe: Recipe = {
        id: Date.now().toString(),
        ...formData,
        isUserCreated: true
      };
      onSubmit(newRecipe);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Recipe</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recipe Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (min)</label>
                  <input
                    type="number"
                    value={formData.prepTime}
                    onChange={(e) => setFormData({ ...formData, prepTime: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cook Time (min)</label>
                  <input
                    type="number"
                    value={formData.cookTime}
                    onChange={(e) => setFormData({ ...formData, cookTime: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Servings</label>
                  <input
                    type="number"
                    value={formData.servings}
                    onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Ingredients</label>
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="text-green-600 hover:text-green-700 text-sm"
                  >
                    + Add Ingredient
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.ingredients.map((ingredient, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2">
                      <input
                        type="text"
                        placeholder="Ingredient name"
                        value={ingredient.name}
                        onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                        className="col-span-6 border border-gray-300 rounded px-2 py-1 text-sm"
                        required
                      />
                      <input
                        type="number"
                        step="0.1"
                        value={ingredient.quantity}
                        onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value))}
                        className="col-span-2 border border-gray-300 rounded px-2 py-1 text-sm"
                        required
                      />
                      <select
                        value={ingredient.unit}
                        onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                        className="col-span-3 border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        <option value="piece">piece</option>
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="cup">cup</option>
                        <option value="tbsp">tbsp</option>
                        <option value="tsp">tsp</option>
                        <option value="jar">jar</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="col-span-1 text-red-500 hover:text-red-700 text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Instructions</label>
                  <button
                    type="button"
                    onClick={addInstruction}
                    className="text-green-600 hover:text-green-700 text-sm"
                  >
                    + Add Step
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.instructions.map((instruction, index) => (
                    <div key={index} className="flex gap-2">
                      <span className="text-sm text-gray-500 mt-2">{index + 1}.</span>
                      <textarea
                        value={instruction}
                        onChange={(e) => updateInstruction(index, e.target.value)}
                        className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                        rows={2}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeInstruction(index)}
                        className="text-red-500 hover:text-red-700 text-sm mt-2"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Add Recipe
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const RecipeCard: React.FC<{ recipe: Recipe }> = ({ recipe }) => {
    const compatibility = getRecipeCompatibility(recipe);
    const canMake = compatibility.percentage === 100;
    
    return (
      <div 
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => setSelectedRecipe(recipe)}
      >
        {recipe.image && (
          <img 
            src={recipe.image} 
            alt={recipe.name}
            className="w-full h-48 object-cover"
          />
        )}
        
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-gray-900 text-lg">{recipe.name}</h3>
            <div className="flex items-center space-x-1">
              {recipe.isUserCreated && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Custom</span>
              )}
              <button className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {recipe.prepTime + recipe.cookTime}m
            </span>
            <span className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {recipe.servings} servings
            </span>
            <span className="flex items-center">
              <ChefHat className="w-4 h-4 mr-1" />
              {recipe.nutrition.calories} cal
            </span>
          </div>
          
          <div className={`text-sm px-3 py-2 rounded-lg mb-3 ${
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
          
          <div className="flex flex-wrap gap-2">
            {recipe.tags.map(tag => (
              <span 
                key={tag} 
                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const RecipeModal: React.FC<{ recipe: Recipe; onClose: () => void }> = ({ recipe, onClose }) => {
    const compatibility = getRecipeCompatibility(recipe);
    const canMake = compatibility.percentage === 100;
    const missingIngredients = getMissingIngredients(recipe);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {recipe.image && (
            <img 
              src={recipe.image} 
              alt={recipe.name}
              className="w-full h-64 object-cover rounded-t-xl"
            />
          )}
          
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{recipe.name}</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-lg font-semibold text-blue-600">{recipe.prepTime}m</p>
                <p className="text-sm text-blue-700">Prep Time</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-lg font-semibold text-green-600">{recipe.cookTime}m</p>
                <p className="text-sm text-green-700">Cook Time</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-lg font-semibold text-purple-600">{recipe.servings}</p>
                <p className="text-sm text-purple-700">Servings</p>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg mb-6 ${
              canMake 
                ? 'bg-green-100 border border-green-200' 
                : compatibility.percentage >= 50
                ? 'bg-yellow-100 border border-yellow-200'
                : 'bg-orange-100 border border-orange-200'
            }`}>
              {canMake ? (
                <p className="text-green-800 font-medium">✓ You can make this recipe with your current ingredients!</p>
              ) : (
                <div>
                  <p className="font-medium mb-2">
                    {compatibility.percentage >= 50 ? 'Mostly available:' : 'Missing ingredients:'}
                  </p>
                  <ul className="text-sm">
                    {missingIngredients.map(ing => (
                      <li key={ing.name}>• {ing.quantity} {ing.unit} {ing.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Ingredients</h3>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex justify-between text-sm">
                      <span>{ingredient.name}</span>
                      <span className="text-gray-600">{ingredient.quantity} {ingredient.unit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Nutrition (per serving)</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Calories</span>
                    <span>{recipe.nutrition.calories}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Protein</span>
                    <span>{recipe.nutrition.protein}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Carbs</span>
                    <span>{recipe.nutrition.carbs}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fat</span>
                    <span>{recipe.nutrition.fat}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fiber</span>
                    <span>{recipe.nutrition.fiber}g</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Instructions</h3>
              <ol className="list-decimal list-inside space-y-2">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="text-sm text-gray-700">{instruction}</li>
                ))}
              </ol>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-6">
              {recipe.tags.map(tag => (
                <span 
                  key={tag} 
                  className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleAddRecipe = (recipe: Recipe) => {
    dispatch({ type: 'ADD_RECIPE', payload: recipe });
    setShowAddRecipe(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Recipe Library</h2>
          <p className="text-gray-600">Discover healthy recipes and check what you can make</p>
        </div>
        <button
          onClick={() => setShowAddRecipe(true)}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Recipe</span>
        </button>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Recipe Matching Tips:</p>
            <ul className="space-y-1 text-blue-700">
              <li>• Recipes are matched against your inventory using smart ingredient detection</li>
              <li>• Green badges mean you can make the recipe right now</li>
              <li>• Yellow badges mean you have most ingredients</li>
              <li>• Add your own custom recipes with the "Add Recipe" button</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search recipes or ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2 sm:w-48">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ChefHat className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">{filteredRecipes.length}</p>
              <p className="text-sm text-gray-600">Total Recipes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {filteredRecipes.filter(canMakeRecipe).length}
              </p>
              <p className="text-sm text-gray-600">Can Make Now</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Plus className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {state.recipes.filter(r => r.isUserCreated).length}
              </p>
              <p className="text-sm text-gray-600">Custom Recipes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map(recipe => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="text-center py-12">
          <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Recipe Modal */}
      {selectedRecipe && (
        <RecipeModal 
          recipe={selectedRecipe} 
          onClose={() => setSelectedRecipe(null)} 
        />
      )}

      {/* Add Recipe Form */}
      {showAddRecipe && (
        <AddRecipeForm
          onSubmit={handleAddRecipe}
          onCancel={() => setShowAddRecipe(false)}
        />
      )}
    </div>
  );
};

export default Recipes;