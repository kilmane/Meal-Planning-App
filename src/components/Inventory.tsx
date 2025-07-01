import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Calendar, Package2, AlertCircle, Info } from 'lucide-react';
import { useApp, Ingredient } from '../context/AppContext';

const Inventory: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Protein', 'Vegetables', 'Fruits', 'Dairy', 'Grains', 'Pantry', 'Herbs & Spices', 'Frozen'];

  const filteredIngredients = state.ingredients.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || ingredient.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = (expiryDate: string) => {
    const days = getDaysUntilExpiry(expiryDate);
    if (days < 0) return { status: 'expired', color: 'text-red-600 bg-red-50', text: 'Expired' };
    if (days <= 3) return { status: 'expiring', color: 'text-orange-600 bg-orange-50', text: `${days} days left` };
    if (days <= 7) return { status: 'warning', color: 'text-yellow-600 bg-yellow-50', text: `${days} days left` };
    return { status: 'fresh', color: 'text-green-600 bg-green-50', text: `${days} days left` };
  };

  const IngredientForm: React.FC<{
    ingredient?: Ingredient;
    onSubmit: (ingredient: Ingredient) => void;
    onCancel: () => void;
  }> = ({ ingredient, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      name: ingredient?.name || '',
      category: ingredient?.category || 'Vegetables',
      quantity: ingredient?.quantity || 1,
      unit: ingredient?.unit || 'piece',
      expiryDate: ingredient?.expiryDate || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const newIngredient: Ingredient = {
        id: ingredient?.id || Date.now().toString(),
        ...formData,
        addedDate: ingredient?.addedDate || new Date().toISOString().split('T')[0],
      };
      onSubmit(newIngredient);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {ingredient ? 'Edit Ingredient' : 'Add New Ingredient'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {categories.slice(1).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="piece">piece</option>
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="lbs">lbs</option>
                  <option value="oz">oz</option>
                  <option value="cup">cup</option>
                  <option value="ml">ml</option>
                  <option value="l">l</option>
                  <option value="bunch">bunch</option>
                  <option value="package">package</option>
                </select>
              </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
              >
                {ingredient ? 'Update' : 'Add'} Ingredient
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

  const handleAddIngredient = (ingredient: Ingredient) => {
    dispatch({ type: 'ADD_INGREDIENT', payload: ingredient });
    setShowAddForm(false);
  };

  const handleUpdateIngredient = (ingredient: Ingredient) => {
    dispatch({ type: 'UPDATE_INGREDIENT', payload: ingredient });
    setEditingIngredient(null);
  };

  const handleDeleteIngredient = (id: string) => {
    dispatch({ type: 'DELETE_INGREDIENT', payload: id });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventory</h2>
          <p className="text-gray-600">Manage your fridge, pantry, and freezer contents</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Ingredient</span>
        </button>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Inventory Management Tips:</p>
            <ul className="space-y-1 text-blue-700">
              <li>• Add ingredients from your fridge, pantry, and freezer</li>
              <li>• Include expiry dates to get alerts before food spoils</li>
              <li>• Use metric (kg/g) or imperial (lbs/oz) units as preferred</li>
              <li>• Frozen items typically last much longer - adjust expiry dates accordingly</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Ingredients Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredIngredients.map((ingredient) => {
          const expiryInfo = getExpiryStatus(ingredient.expiryDate);
          
          return (
            <div key={ingredient.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Package2 className="w-5 h-5 text-gray-400" />
                  <h3 className="font-semibold text-gray-900 text-sm">{ingredient.name}</h3>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setEditingIngredient(ingredient)}
                    className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteIngredient(ingredient.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Category</span>
                  <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded">{ingredient.category}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Quantity</span>
                  <span className="text-xs font-medium">{ingredient.quantity} {ingredient.unit}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Expires
                  </span>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${expiryInfo.color}`}>
                    {expiryInfo.text}
                  </span>
                </div>

                {expiryInfo.status === 'expired' || expiryInfo.status === 'expiring' ? (
                  <div className="flex items-center space-x-1 mt-2 text-xs text-orange-600">
                    <AlertCircle className="w-3 h-3" />
                    <span>Use soon or may spoil!</span>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {filteredIngredients.length === 0 && (
        <div className="text-center py-12">
          <Package2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No ingredients found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedCategory !== 'All' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Start by adding some ingredients to your inventory.'
            }
          </p>
          {!searchTerm && selectedCategory === 'All' && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Add Your First Ingredient
            </button>
          )}
        </div>
      )}

      {/* Forms */}
      {showAddForm && (
        <IngredientForm
          onSubmit={handleAddIngredient}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {editingIngredient && (
        <IngredientForm
          ingredient={editingIngredient}
          onSubmit={handleUpdateIngredient}
          onCancel={() => setEditingIngredient(null)}
        />
      )}
    </div>
  );
};

export default Inventory;