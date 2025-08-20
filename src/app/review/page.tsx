import Link from "next/link";

export default function ReviewListPage() {
  // Mock data for demonstration
  const reviewTasks = [
    { 
      district: "Nairobi", 
      month: "2024-01", 
      status: "In Review", 
      priority: "high",
      kpis: { sessions: 45, specimens: 1250, discrepancies: 3 },
      lastUpdated: "2024-01-15"
    },
    { 
      district: "Mombasa", 
      month: "2024-01", 
      status: "Draft", 
      priority: "medium",
      kpis: { sessions: 32, specimens: 890, discrepancies: 7 },
      lastUpdated: "2024-01-14"
    },
    { 
      district: "Kisumu", 
      month: "2023-12", 
      status: "Needs Attention", 
      priority: "urgent",
      kpis: { sessions: 28, specimens: 756, discrepancies: 12 },
      lastUpdated: "2024-01-10"
    },
    { 
      district: "Nakuru", 
      month: "2023-12", 
      status: "Approved", 
      priority: "completed",
      kpis: { sessions: 38, specimens: 1100, discrepancies: 0 },
      lastUpdated: "2024-01-08"
    },
    { 
      district: "Eldoret", 
      month: "2023-12", 
      status: "Exported", 
      priority: "completed",
      kpis: { sessions: 42, specimens: 1300, discrepancies: 0 },
      lastUpdated: "2024-01-05"
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
      case 'In Review': return 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Needs Attention': return 'text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-300';
      case 'Approved': return 'text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'Exported': return 'text-blue-700 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      default: return 'text-gray-600 bg-gray-100';
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
                Data Review Tasks
              </h1>
            </div>
            <nav className="flex space-x-4">
              <Link href="/annotation" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Annotation
              </Link>
              <Link href="/exports" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Exports
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="">All Districts</option>
              <option value="nairobi">Nairobi</option>
              <option value="mombasa">Mombasa</option>
              <option value="kisumu">Kisumu</option>
              <option value="nakuru">Nakuru</option>
            </select>
            <select className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="">All Months</option>
              <option value="2024-01">January 2024</option>
              <option value="2023-12">December 2023</option>
              <option value="2023-11">November 2023</option>
            </select>
            <select className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="in-review">In Review</option>
              <option value="needs-attention">Needs Attention</option>
              <option value="approved">Approved</option>
              <option value="exported">Exported</option>
            </select>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
              Apply Filters
            </button>
          </div>
        </div>

        {/* Review Tasks Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Review Tasks ({reviewTasks.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    District / Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    KPIs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {reviewTasks.map((task, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {task.district}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {task.month}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div className="space-y-1">
                        <div>Sessions: {task.kpis.sessions}</div>
                        <div>Specimens: {task.kpis.specimens}</div>
                        <div className={task.kpis.discrepancies > 0 ? 'text-red-600' : 'text-green-600'}>
                          Discrepancies: {task.kpis.discrepancies}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {task.lastUpdated}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link 
                        href={`/review/${task.district.toLowerCase()}/${task.month}`}
                        className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 font-medium"
                      >
                        Review →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}