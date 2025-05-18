import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';

const UserDashboardPage = () => {
  const [username, setUsername] = useState('EcoUser123');
  const [email, setEmail] = useState('eco@example.com');
  const [ecoPoints, setEcoPoints] = useState(125);
  const [preferences, setPreferences] = useState({
    recyclable: true,
    handmade: true,
    organic: false,
    vegan: false,
    localMade: true
  });

  const handlePreferenceChange = (pref) => {
    setPreferences({
      ...preferences,
      [pref]: !preferences[pref]
    });
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 p-8 w-full">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2 lg:w-1/3">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
              <h2 className="text-2xl font-bold text-green-700 mb-6">Your Profile</h2>
              
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
                  {username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-semibold">{username}</p>
                  <p className="text-gray-500">{email}</p>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-green-800">Eco Points</h3>
                  <span className="text-2xl font-bold text-green-700">{ecoPoints}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${(ecoPoints/200)*100}%` }}></div>
                </div>
                <p className="text-xs text-green-600 mt-2">Keep shopping sustainably to earn more points!</p>
              </div>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                    type="text" 
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    type="email" 
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300 font-semibold"
                >
                  Save Changes
                </button>
              </form>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 lg:w-2/3">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100 mb-6">
              <h3 className="text-xl font-bold text-green-700 mb-4">Sustainable Preferences</h3>
              <p className="text-gray-600 mb-4">Select your preferences to see more relevant eco-friendly products</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="recyclable" 
                    checked={preferences.recyclable} 
                    onChange={() => handlePreferenceChange('recyclable')}
                    className="w-4 h-4 text-green-600 border-green-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="recyclable" className="ml-2 block text-sm text-gray-900">Recyclable Materials</label>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="handmade" 
                    checked={preferences.handmade} 
                    onChange={() => handlePreferenceChange('handmade')}
                    className="w-4 h-4 text-green-600 border-green-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="handmade" className="ml-2 block text-sm text-gray-900">Handmade Items</label>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="organic" 
                    checked={preferences.organic} 
                    onChange={() => handlePreferenceChange('organic')}
                    className="w-4 h-4 text-green-600 border-green-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="organic" className="ml-2 block text-sm text-gray-900">Organic Products</label>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="vegan" 
                    checked={preferences.vegan} 
                    onChange={() => handlePreferenceChange('vegan')}
                    className="w-4 h-4 text-green-600 border-green-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="vegan" className="ml-2 block text-sm text-gray-900">Vegan Products</label>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="localMade" 
                    checked={preferences.localMade} 
                    onChange={() => handlePreferenceChange('localMade')}
                    className="w-4 h-4 text-green-600 border-green-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="localMade" className="ml-2 block text-sm text-gray-900">Locally Made</label>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-6 rounded-xl border border-green-200">
              <h3 className="text-xl font-bold text-green-800 mb-3">Your Environmental Impact</h3>
              <p className="text-gray-700 mb-4">Your purchases have made a difference!</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded-lg text-center">
                  <span className="block text-3xl font-bold text-green-700 mb-1">8</span>
                  <span className="text-sm text-gray-600">Items Reused</span>
                </div>
                <div className="bg-white p-3 rounded-lg text-center">
                  <span className="block text-3xl font-bold text-green-700 mb-1">20kg</span>
                  <span className="text-sm text-gray-600">Waste Reduced</span>
                </div>
                <div className="bg-white p-3 rounded-lg text-center">
                  <span className="block text-3xl font-bold text-green-700 mb-1">4</span>
                  <span className="text-sm text-gray-600">Trees Saved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardPage;