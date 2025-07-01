import React, { useState } from 'react';
import { ShoppingCart, Plus, Check, Trash2, Sparkles, Package } from 'lucide-react';
import { useApp, ShoppingItem } from '../context/AppContext';

const ShoppingList: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [generatingList, setGeneratingList] = useState(false);

  const categories = ['Protein', 'Vegetables', 'Fruits', 'Dairy', 'Grains', 'Pantry', 'Herbs & Spices'];

  // Group shopping items by category
  const groupedItems = categories.reduce((acc, category) => {
    acc[category] = state.shoppingList.filter(item => item.category === category);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  // Calculate progress
  const completedItems = state.shoppingList.filter(item => item.completed).length;
  const totalItems = state.shoppingList.length;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  // Generate shopping list from meal plans
  const generateShoppingList = async () => {
    setGeneratingList(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Analyze meal plans and current inventory to generate shopping list
    const neededItems: ShoppingItem[] = [];
    
    // Get all ingredients needed for planned meals
    const mealPlanIngredients = state.mealPlans.flatMap(plan => 
      plan.recipe.ingredients.map(ing => ({
        ...ing,
        needed: ing.quantity * plan.servings
      }))
    );

    // Group by ingredient name and sum quantities
    const consolidatedNeeds = mealPlanIngredients.reduce((acc, ingredient) => {
      const key = ingredient.name.toLowerCase();
      if (acc[key]) {
        acc[key].needed += ingredient.needed;
      } else {
        acc[key] = { ...ingredient };
      }
      return acc;
    }, {} as Record<string, any>);

    // Check against current inventory
    Object.values(consolidatedNeeds).forEach((needed: any) => {
      const currentStock = state.ingredients.find(
        ing => ing.name.toLowerCase() === needed.name.toLowerCase()
      );
      
      const shortfall = needed.needed - (currentStock?.quantity || 0);
      
      if (shortfall > 0) {
        neededItems.push({
          id: Date.now().toString() + Math.random(),
          name: needed.name,
          quantity: Math.ceil(shortfall),
          unit: needed.unit,
          category: getCategoryForIngredient(needed.name),
          completed: false
        });
      }
    });

    // Add some essential items that are commonly needed
    const essentials = [
      { name: 'Olive Oil', quantity: 1, unit: 'bottle', category: 'Pantry' },
      { name: 'Salt', quantity: 1, unit: 'container', category: 'Pantry' },
      { name: 'Black Pepper', quantity: 1, unit: 'container', category: 'Herbs & Spices' }
    ];

    essentials.forEach(essential => {
      const hasItem = state.ingredients.some(ing => 
        ing.name.toLowerCase().includes(essential.name.toLowerCase())
      );
      const inList = neededItems.some(item => 
        item.name.toLowerCase().includes(essential.name.toLowerCase())
      );
      
      if (!hasItem && !inList) {
        neededItems.push({
          id: Date.now().toString() + Math.random(),
          ...essential,
          completed: false
        });
      }
    });

    dispatch({ type: 'GENERATE_SHOPPING_LIST', payload: neededItems });
    setGeneratingList(false);
  };

  const getCategoryForIngredient = (name: string): string => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('chicken') || lowerName.includes('beef') || lowerName.includes('fish') || lowerName.includes('salmon')) return 'Protein';
    if (lowerName.includes('pepper') || lowerName.includes('broccoli') || lowerName.includes('onion')) return 'Vegetables';
    if (lowerName.includes('apple') || lowerName.includes('banana') || lowerName.includes('berry')) return 'Fruits';
    if (lowerName.includes('milk') || lowerName.includes('cheese') || lowerName.includes('yogurt')) return 'Dairy';
    if (lowerName.includes('rice') || lowerName.includes('pasta') || lowerName.includes('bread')) return 'Grains';
    if (lowerName.includes('oil') || lowerName.includes('salt') || lowerName.includes('sugar')) return 'Pantry';
    return 'Pantry';
  };

  const AddItemForm: React.FC<{ onSubmit: (item: ShoppingItem) => void; onCancel: () => void }> = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      name: '',
      quantity: 1,
      unit: 'piece',
      category: 'Vegetables'
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit({
        id: Date.now().toString(),
        ...formData,
        completed: false
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Shopping Item</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="piece">piece</option>
                  <option value="lbs">lbs</option>
                  <option value="oz">oz</option>
                  <option value="cup">cup</option>
                  <option value="bunch">bunch</option>
                  <option value="package">package</option>
                  <option value="bottle">bottle</option>
                  <option value="container">container</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
              >
                Add Item
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
    );
  };

  const handleAddItem = (item: ShoppingItem) => {
    dispatch({ type: 'ADD_SHOPPING_ITEM', payload: item });
    setShowAddForm(false);
  };

  const toggleItem = (id: string) => {
    dispatch({ type: 'TOGGLE_SHOPPING_ITEM', payload: id });
  };

  const deleteItem = (id: string) => {
    dispatch({ type: 'DELETE_SHOPPING_ITEM', payload: id });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Shopping List</h2>
          <p className="text-gray-600">Keep track of what you need to buy</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={generateShoppingList}
            disabled={generatingList}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            {generatingList ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Smart Generate</span>
              </>
            )}
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {totalItems > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-900">Shopping Progress</h3>
            <span className="text-sm text-gray-600">{completedItems}/{totalItems} items</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">{Math.round(progress)}% complete</p>
        </div>
      )}

      {/* Smart Generation Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-start space-x-3">
          <Sparkles className="w-6 h-6 text-blue-500 mt-1" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Smart Shopping List Generation</h3>
            <p className="text-gray-700 text-sm">
              Our AI analyzes your meal plans and current inventory to automatically generate a shopping list with exactly what you need. It consolidates quantities and adds essential pantry items you might be running low on.
            </p>
          </div>
        </div>
      </div>

      {/* Shopping List */}
      {totalItems === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your shopping list is empty</h3>
          <p className="text-gray-600 mb-4">
            Generate a smart shopping list from your meal plans or add items manually.
          </p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={generateShoppingList}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate List</span>
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map(category => {
            const categoryItems = groupedItems[category];
            if (categoryItems.length === 0) return null;

            return (
              <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center space-x-2">
                    <Package className="w-5 h-5 text-gray-500" />
                    <h3 className="font-semibold text-gray-900">{category}</h3>
                    <span className="text-sm text-gray-500">({categoryItems.length} items)</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {categoryItems.map(item => (
                      <div 
                        key={item.id} 
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                          item.completed 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => toggleItem(item.id)}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              item.completed
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 hover:border-green-400'
                            }`}
                          >
                            {item.completed && <Check className="w-3 h-3" />}
                          </button>
                          <div>
                            <p className={`font-medium ${
                              item.completed ? 'text-green-700 line-through' : 'text-gray-900'
                            }`}>
                              {item.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {item.quantity} {item.unit}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Item Form */}
      {showAddForm && (
        <AddItemForm
          onSubmit={handleAddItem}
          onCancel={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
};

export default ShoppingList;