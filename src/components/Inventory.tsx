import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Calendar, Package2, AlertCircle, Info, Tag } from 'lucide-react';
import { useApp, Ingredient } from '../context/AppContext';

const Inventory: React.FC = () => {
  const { state, dispatch } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Protein', 'Vegetables', 'Fruits', 'Dairy', 'Grains', 'Pantry', 'Herbs & Spices', 'Frozen'];
  const storageLocations = ['Fridge', 'Freezer', 'Pantry', 'Counter'];

  const filteredIngredients = state.ingredients.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || 
                           ingredient.category === selectedCategory ||
                           (ingredient.tags && ingredient.tags.includes(selectedCategory.toLowerCase()));
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

  const getStorageIcon = (tags: string[] = []) => {
    if (tags.includes('frozen')) return '❄️';
    if (tags.includes('fridge')) return '🧊';
    if (tags.includes('pantry')) return '🏠';
    return '📦';
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
      storageLocation: ingredient?.tags?.find(tag => storageLocations.map(l => l.toLowerCase()).includes(tag)) || 'fridge',
      additionalTags: ingredient?.tags?.filter(tag => !storageLocations.map(l => l.toLowerCase()).includes(tag)) || [],
    });

    const [newTag, setNewTag] = useState('');

    const commonTags = {
      'Protein': ['lean', 'high-protein', 'meat', 'fish', 'poultry'],
      'Vegetables': ['organic', 'fresh', 'leafy', 'root', 'cruciferous'],
      'Fruits': ['seasonal', 'citrus', 'berry', 'tropical', 'stone-fruit'],
      'Dairy': ['low-fat', 'whole', 'aged', 'fresh'],
      'Grains': ['whole-grain', 'refined', 'gluten-free'],
      'Pantry': ['canned', 'dried', 'jarred', 'bottled'],
      'Herbs & Spices': ['dried', 'fresh', 'ground', 'whole'],
      'Frozen': ['frozen']
    };

    const addTag = (tag: string) => {
      if (tag && !formData.additionalTags.includes(tag)) {
        setFormData(prev => ({
          ...prev,
          additionalTags: [...prev.additionalTags, tag]
        }));
      }
      setNewTag('');
    };

    const removeTag = (tagToRemove: string) => {
      setFormData(prev => ({
        ...prev,
        additionalTags: prev.additionalTags.filter(tag => tag !== tagToRemove)
      }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      // Combine storage location and additional tags
      const allTags = [
        formData.storageLocation.toLowerCase(),
        ...formData.additionalTags
      ];

      // Add category-specific tags
      if (formData.storageLocation.toLowerCase() === 'freezer') {
        allTags.push('frozen');
      }

      const ingredientData = {
        name: formData.name,
        category: formData.category,
        quantity: formData.quantity,
        unit: formData.unit,
        expiryDate: formData.expiryDate,
        addedDate: ingredient?.addedDate || new Date().toISOString().split('T')[0],
        tags: [...new Set(allTags)] // Remove duplicates
      };

      try {
        if (ingredient && state.firebaseService) {
          // Update existing ingredient
          await state.firebaseService.updateIngredient(ingredient.id, ingredientData);
        } else if (state.firebaseService) {
          // Add new ingredient
          const id = await state.firebaseService.addIngredient(ingredientData);
          const newIngredient: Ingredient = { id, ...ingredientData };
          dispatch({ type: 'ADD_INGREDIENT', payload: newIngredient });
        }
        onSubmit({ id: ingredient?.id || '', ...ingredientData });
      } catch (error) {
        console.error('Error saving ingredient:', error);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Category</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Storage Location</label>
                <select
                  value={formData.storageLocation}
                  onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {storageLocations.map(location => (
                    <option key={location} value={location.toLowerCase()}>{location}</option>
                  ))}
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
                  <option value="jar">jar</option>
                  <option value="bottle">bottle</option>
                </select>
              </div>
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

            {/* Additional Tags Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Tags</label>
              
              {/* Quick tag suggestions based on category */}
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">Quick add:</p>
                <div className="flex flex-wrap gap-1">
                  {commonTags[formData.category]?.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom tag input */}
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add custom tag..."
                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-green-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(newTag))}
                />
                <button
                  type="button"
                  onClick={() => addTag(newTag)}
                  className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                >
                  Add
                </button>
              </div>

              {/* Current tags */}
              <div className="flex flex-wrap gap-1">
                {formData.additionalTags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
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
    setShowAddForm(false);
  };

  const handleUpdateIngredient = (ingredient: Ingredient) => {
    setEditingIngredient(null);
  };

  const handleDeleteIngredient = async (id: string) => {
    if (state.firebaseService) {
      try {
        await state.firebaseService.deleteIngredient(id);
      } catch (error) {
        console.error('Error deleting ingredient:', error);
      }
    }
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
            <p className="font-medium mb-1">Enhanced Inventory Management:</p>
            <ul className="space-y-1 text-blue-700">
              <li>• Choose primary category (Protein, Vegetables, etc.) and storage location</li>
              <li>• Add multiple tags - frozen chicken can be both "Protein" and "Frozen"</li>
              <li>• Use storage locations: Fridge, Freezer, Pantry, or Counter</li>
              <li>• Quick-add common tags or create custom ones for better organization</li>
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
          const storageIcon = getStorageIcon(ingredient.tags);
          
          return (
            <div key={ingredient.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2 flex-1">
                  <span className="text-lg">{storageIcon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{ingredient.name}</h3>
                    <div className="flex items-center space-x-1 mt-1">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {ingredient.category}
                      </span>
                      {ingredient.tags?.includes('frozen') && (
                        <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded">
                          Frozen
                        </span>
                      )}
                    </div>
                  </div>
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

                {/* Additional Tags */}
                {ingredient.tags && ingredient.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {ingredient.tags
                      .filter(tag => !['fridge', 'freezer', 'pantry', 'counter', 'frozen'].includes(tag))
                      .slice(0, 3)
                      .map(tag => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-1 py-0.5 rounded flex items-center">
                          <Tag className="w-2 h-2 mr-1" />
                          {tag}
                        </span>
                      ))}
                  </div>
                )}
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