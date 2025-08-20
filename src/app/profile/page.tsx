import Link from "next/link";

export default function ProfilePage() {
  // Mock user data
  const userData = {
    name: "Dr. Jane Mwangi",
    email: "jane.mwangi@health.go.ke",
    role: "Master Vector Control Officer",
    department: "Ministry of Health",
    location: "Nairobi, Kenya",
    joinDate: "2022-03-15",
    permissions: [
      "Review all districts",
      "Approve data snapshots", 
      "Export to Ministry of Health",
      "Manage annotation assignments",
      "Access admin functions"
    ],
    preferences: {
      theme: "system",
      notifications: true,
      autoSave: true,
      language: "English"
    },
    recentActivity: [
      { action: "Approved Nairobi 2024-01 data", timestamp: "2024-01-20 14:30" },
      { action: "Completed 45/150 annotations for 2024-01", timestamp: "2024-01-19 16:15" },
      { action: "Resolved discrepancy DISC-001", timestamp: "2024-01-18 09:45" },
      { action: "Exported Mombasa 2023-12 data", timestamp: "2024-01-17 11:20" }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="text-blue-600 hover:text-blue-800 mr-4">
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Profile & Settings
              </h1>
            </div>
            <nav className="flex space-x-4">
              <Link href="/auth/logout" className="text-red-600 hover:text-red-800 font-medium">
                Sign Out
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Profile Info */}
          <div className="lg:col-span-2">
            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Profile Information
              </h2>
              
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                      {userData.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {userData.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {userData.role}
                  </p>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <div>📧 {userData.email}</div>
                    <div>🏢 {userData.department}</div>
                    <div>📍 {userData.location}</div>
                    <div>📅 Member since {userData.joinDate}</div>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Permissions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Permissions & Access
              </h3>
              <div className="space-y-2">
                {userData.permissions.map((permission, index) => (
                  <div key={index} className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {permission}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Preferences
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Theme
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Choose your preferred color scheme
                    </p>
                  </div>
                  <select className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="system">System</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Notifications
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Receive email notifications for important updates
                    </p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={userData.preferences.notifications}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    readOnly
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Auto-save
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Automatically save work in progress
                    </p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={userData.preferences.autoSave}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    readOnly
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Language
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Interface language
                    </p>
                  </div>
                  <select className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="en">English</option>
                    <option value="sw">Swahili</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors mr-3">
                  Save Changes
                </button>
                <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium py-2 px-4 rounded-md transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {userData.recentActivity.map((activity, index) => (
                  <div key={index} className="border-l-2 border-blue-200 pl-3">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.timestamp}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Security */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Security
              </h3>
              <div className="space-y-3">
                <button className="block w-full text-left text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Change Password
                </button>
                <button className="block w-full text-left text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Two-Factor Authentication
                </button>
                <button className="block w-full text-left text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Login History
                </button>
                <button className="block w-full text-left text-sm text-red-600 hover:text-red-800 font-medium">
                  Delete Account
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}