import React from 'react';
import { Calendar, Package, AlertTriangle, TrendingUp, Clock, Target, Info, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Dashboard: React.FC = () => {
  const { state } = useApp();

  // Calculate expiring items (within 3 days)
  const today = new Date();
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(today.getDate() + 3);

  const expiringItems = state.ingredients.filter(ingredient => {
    const expiryDate = new Date(ingredient.expiryDate);
    return expiryDate <= threeDaysFromNow && expiryDate >= today;
  });

  const expiredItems = state.ingredients.filter(ingredient => {
    const expiryDate = new Date(ingredient.expiryDate);
    return expiryDate < today;
  });

  // Calculate this week's meal plans
  const startOfWeek = new Date();
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const thisWeekMealPlans = state.mealPlans.filter(plan => {
    const planDate = new Date(plan.date);
    return planDate >= startOfWeek && planDate <= endOfWeek;
  });

  // Calculate nutrition goals progress (mock data)
  const weeklyNutritionGoals = {
    protein: { target: 350, current: 245 },
    vegetables: { target: 21, current: 15 },
    fiber: { target: 175, current: 120 }
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    trend?: string;
  }> = ({ title, value, icon, color, trend }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-xs text-green-600 font-medium flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const NutritionProgress: React.FC<{
    label: string;
    current: number;
    target: number;
    unit: string;
  }> = ({ label, current, target, unit }) => {
    const percentage = Math.min((current / target) * 100, 100);
    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-xs text-gray-500">{current}/{target} {unit}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  const GettingStartedCard: React.FC = () => (
    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200 mb-6">
      <div className="flex items-start space-x-3">
        <Info className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-3">Getting Started with FreshPlan</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <span className="text-gray-700">Start by adding ingredients to your <strong>Inventory</strong> - include what's in your fridge, pantry, and freezer</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <span className="text-gray-700">Browse <strong>Recipes</strong> to see what you can make with your current ingredients</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <span className="text-gray-700">Use <strong>Meal Planner</strong> to generate smart weekly dinner plans</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
              <span className="text-gray-700">Generate a <strong>Shopping List</strong> for missing ingredients</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h2>
        <p className="text-gray-600">Here's what's happening with your meal planning.</p>
      </div>

      {/* Getting Started Guide */}
      <GettingStartedCard />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Ingredients"
          value={state.ingredients.length}
          icon={<Package className="w-6 h-6 text-white" />}
          color="bg-blue-500"
        />
        <StatCard
          title="This Week's Meals"
          value={thisWeekMealPlans.length}
          icon={<Calendar className="w-6 h-6 text-white" />}
          color="bg-green-500"
          trend="+2 from last week"
        />
        <StatCard
          title="Expiring Soon"
          value={expiringItems.length}
          icon={<Clock className="w-6 h-6 text-white" />}
          color="bg-orange-500"
        />
        <StatCard
          title="Shopping Items"
          value={state.shoppingList.length}
          icon={<Target className="w-6 h-6 text-white" />}
          color="bg-purple-500"
        />
      </div>

      {/* Alerts Section */}
      {(expiringItems.length > 0 || expiredItems.length > 0) && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900">Inventory Alerts</h3>
          </div>
          
          {expiredItems.length > 0 && (
            <div className="mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <h4 className="font-medium text-red-800 mb-2">Expired Items</h4>
              <div className="space-y-1">
                {expiredItems.map(item => (
                  <p key={item.id} className="text-sm text-red-700">
                    {item.name} - expired {new Date(item.expiryDate).toLocaleDateString()}
                  </p>
                ))}
              </div>
            </div>
          )}

          {expiringItems.length > 0 && (
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h4 className="font-medium text-orange-800 mb-2">Expiring Soon</h4>
              <div className="space-y-1">
                {expiringItems.map(item => (
                  <p key={item.id} className="text-sm text-orange-700">
                    {item.name} - expires {new Date(item.expiryDate).toLocaleDateString()}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Weekly Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nutrition Progress */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Nutrition Goals</h3>
          <NutritionProgress
            label="Protein"
            current={weeklyNutritionGoals.protein.current}
            target={weeklyNutritionGoals.protein.target}
            unit="g"
          />
          <NutritionProgress
            label="Vegetable Servings"
            current={weeklyNutritionGoals.vegetables.current}
            target={weeklyNutritionGoals.vegetables.target}
            unit="servings"
          />
          <NutritionProgress
            label="Fiber"
            current={weeklyNutritionGoals.fiber.current}
            target={weeklyNutritionGoals.fiber.target}
            unit="g"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Package className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-900">Add Ingredients</p>
                    <p className="text-sm text-gray-600">Update your fridge, pantry & freezer inventory</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium text-gray-900">Generate Meal Plan</p>
                    <p className="text-sm text-gray-600">Create smart weekly dinner schedule</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </div>
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors group">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Target className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="font-medium text-gray-900">Create Shopping List</p>
                    <p className="text-sm text-gray-600">Plan your grocery shopping trip</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;