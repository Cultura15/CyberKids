import React, { useState, useEffect } from 'react';
import { Save, User, Lock } from 'lucide-react';

const API_BASE_URL = 'https://cyberkids.onrender.com';

const Settings = () => {
  // State for settings
  const [accountSettings, setAccountSettings] = useState({
    email: '',
    fullName: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Fetch teacher data when component mounts
  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/teacher/me`, {
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include' // Include cookies for authentication
        });

        if (!response.ok) {
          throw new Error('Failed to fetch teacher data');
        }

        const teacherData = await response.json();
        setAccountSettings({
          email: teacherData.email || '',
          fullName: teacherData.fullName || ''
        });
        setError(null);
      } catch (err) {
        setError('Error loading your profile. Please try again later.');
        console.error('Error fetching teacher data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAccountSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle settings save
  const handleSave = async (e) => {
    e.preventDefault();
    setSaveSuccess(false);
    setSaveError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/teacher/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(accountSettings)
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      const updatedTeacher = await response.json();
      setAccountSettings({
        email: updatedTeacher.email,
        fullName: updatedTeacher.fullName
      });
      setSaveSuccess(true);
    } catch (err) {
      setSaveError('Failed to save settings. Please try again.');
      console.error('Error updating teacher data:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Settings</h2>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      {/* Settings Form */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="grid grid-cols-12 divide-x divide-gray-100">
          {/* Settings Navigation */}
          <div className="col-span-3 p-6">
            <nav className="space-y-1">
              <button className="flex items-center px-3 py-2 w-full text-left rounded-md bg-indigo-50 text-indigo-700 font-medium">
                <User className="h-5 w-5 mr-2" />
                <span>Account</span>
              </button>
              <button className="flex items-center px-3 py-2 w-full text-left rounded-md text-gray-600 hover:bg-gray-50">
                <Lock className="h-5 w-5 mr-2" />
                <span>Security</span>
              </button>
            </nav>
          </div>

          {/* Settings Content */}
          <div className="col-span-9 p-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-gray-500">Loading your profile...</div>
              </div>
            ) : error ? (
              <div className="bg-red-50 p-4 rounded-md">
                <p className="text-red-700">{error}</p>
              </div>
            ) : (
              <form onSubmit={handleSave}>
                {/* Account Settings */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
                    <p className="mt-1 text-sm text-gray-500">Update your account details.</p>
                  </div>

                  {saveSuccess && (
                    <div className="bg-green-50 p-4 rounded-md">
                      <p className="text-green-700">Settings saved successfully!</p>
                    </div>
                  )}
                  
                  {saveError && (
                    <div className="bg-red-50 p-4 rounded-md">
                      <p className="text-red-700">{saveError}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="fullName"
                          id="fullName"
                          value={accountSettings.fullName}
                          onChange={handleChange}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <div className="mt-1">
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={accountSettings.email}
                          onChange={handleChange}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="pt-5 mt-8">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      disabled={loading}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Settings
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;