import Link from "next/link";

export default function AnnotationListPage() {
  // Mock annotation task data
  const annotationTasks = [
    {
      month: "2024-01",
      totalSpecimens: 150,
      completed: 45,
      accuracy: 94.5,
      deadline: "2024-01-31",
      status: "In Progress",
      priority: "high"
    },
    {
      month: "2023-12", 
      totalSpecimens: 200,
      completed: 200,
      accuracy: 96.8,
      deadline: "2023-12-31",
      status: "Completed",
      priority: "completed"
    },
    {
      month: "2023-11",
      totalSpecimens: 175,
      completed: 175,
      accuracy: 95.2,
      deadline: "2023-11-30", 
      status: "Completed",
      priority: "completed"
    },
    {
      month: "2023-10",
      totalSpecimens: 125,
      completed: 125,
      accuracy: 97.1,
      deadline: "2023-10-31",
      status: "Completed",
      priority: "completed"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Completed': return 'text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'Overdue': return 'text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default: return 'text-gray-700 bg-gray-100 dark:bg-gray-900 dark:text-gray-300';
    }
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
                Annotation Tasks
              </h1>
            </div>
            <nav className="flex space-x-4">
              <Link href="/review" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Review
              </Link>
              <Link href="/exports" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Exports
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Tasks</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {annotationTasks.filter(t => t.status === "In Progress").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {annotationTasks.filter(t => t.status === "Completed").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Specimens</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {annotationTasks.reduce((sum, task) => sum + task.totalSpecimens, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600 dark:text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Accuracy</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {(annotationTasks.reduce((sum, task) => sum + task.accuracy, 0) / annotationTasks.length).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Annotation Tasks Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Monthly Annotation Assignments ({annotationTasks.length})
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Image annotation tasks for mosquito specimen classification
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Accuracy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {annotationTasks.map((task, index) => {
                  const progressPercentage = (task.completed / task.totalSpecimens) * 100;
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {task.month}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white mb-1">
                          {task.completed}/{task.totalSpecimens} specimens
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {progressPercentage.toFixed(1)}% complete
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {task.accuracy}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {task.deadline}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {task.status === "In Progress" ? (
                          <Link 
                            href={`/annotation/${task.month}/labeling`}
                            className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 font-medium"
                          >
                            Continue →
                          </Link>
                        ) : task.status === "Completed" ? (
                          <Link 
                            href={`/annotation/${task.month}`}
                            className="text-green-600 hover:text-green-900 dark:hover:text-green-400 font-medium"
                          >
                            View Results →
                          </Link>
                        ) : (
                          <Link 
                            href={`/annotation/${task.month}`}
                            className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 font-medium"
                          >
                            Start →
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}