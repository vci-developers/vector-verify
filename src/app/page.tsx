import Link from "next/link";

export default function Dashboard() {
  // Mock data for demonstration
  const recentReviewTasks = [
    { district: "Nairobi", month: "2024-01", status: "In Review", priority: "high" },
    { district: "Mombasa", month: "2024-01", status: "Draft", priority: "medium" },
    { district: "Kisumu", month: "2023-12", status: "Needs Attention", priority: "urgent" },
  ];

  const recentAnnotationTasks = [
    { month: "2024-01", specimens: 150, completed: 45, priority: "high" },
    { month: "2023-12", specimens: 200, completed: 200, priority: "completed" },
    { month: "2023-11", specimens: 175, completed: 175, priority: "completed" },
  ];

  const districts = [
    "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Malindi", "Garissa"
  ];

  const months = [
    "2024-01", "2023-12", "2023-11", "2023-10", "2023-09", "2023-08"
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                VectorVerify
              </h1>
              <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                Monthly Data Quality Control
              </span>
            </div>
            <nav className="flex space-x-4">
              <Link href="/review" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Review
              </Link>
              <Link href="/annotation" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Annotation
              </Link>
              <Link href="/exports" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Exports
              </Link>
              <Link href="/profile" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Profile
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Review Tasks */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Recent Review Tasks
                </h2>
                <Link href="/review" className="text-blue-600 hover:text-blue-800 text-sm">
                  View all →
                </Link>
              </div>
              <div className="space-y-4">
                {recentReviewTasks.map((task, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {task.district} - {task.month}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Status: <span className={`
                            ${task.status === 'In Review' ? 'text-yellow-600' : ''}
                            ${task.status === 'Draft' ? 'text-gray-600' : ''}
                            ${task.status === 'Needs Attention' ? 'text-red-600' : ''}
                          `}>
                            {task.status}
                          </span>
                        </p>
                      </div>
                      <Link 
                        href={`/review/${task.district.toLowerCase()}/${task.month}`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Review →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Annotation Tasks */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Recent Annotation Tasks
                </h2>
                <Link href="/annotation" className="text-blue-600 hover:text-blue-800 text-sm">
                  View all →
                </Link>
              </div>
              <div className="space-y-4">
                {recentAnnotationTasks.map((task, index) => (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {task.month} Annotation
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Progress: {task.completed}/{task.specimens} specimens
                        </p>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(task.completed / task.specimens) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <Link 
                        href={`/annotation/${task.month}`}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Continue →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* District-Month Picker */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Quick Access
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select District
                  </label>
                  <select className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="">Choose district...</option>
                    {districts.map((district) => (
                      <option key={district} value={district.toLowerCase()}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Month
                  </label>
                  <select className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="">Choose month...</option>
                    {months.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>

                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                  Go to Review
                </button>
              </div>

              {/* Quick Links */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Quick Links
                </h3>
                <div className="space-y-2">
                  <Link href="/admin/jobs" className="block text-blue-600 hover:text-blue-800 text-sm">
                    Job Status Monitor
                  </Link>
                  <Link href="/admin/changelog" className="block text-blue-600 hover:text-blue-800 text-sm">
                    Full Changelog
                  </Link>
                  <Link href="/exports" className="block text-blue-600 hover:text-blue-800 text-sm">
                    Export History
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
