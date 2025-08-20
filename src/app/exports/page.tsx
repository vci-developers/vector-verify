import Link from "next/link";

export default function ExportsPage() {
  // Mock export data
  const exports = [
    {
      id: "EXP-2024-001",
      district: "Nairobi",
      month: "2024-01",
      status: "Completed",
      exportDate: "2024-01-20",
      fileSize: "2.4 MB",
      records: 1250,
      recipient: "Ministry of Health"
    },
    {
      id: "EXP-2023-012",
      district: "Mombasa", 
      month: "2023-12",
      status: "Completed",
      exportDate: "2024-01-05",
      fileSize: "2.1 MB",
      records: 890,
      recipient: "Ministry of Health"
    },
    {
      id: "EXP-2024-002",
      district: "Kisumu",
      month: "2024-01", 
      status: "In Progress",
      exportDate: "-",
      fileSize: "-",
      records: 756,
      recipient: "Ministry of Health"
    },
    {
      id: "EXP-2023-011",
      district: "Nakuru",
      month: "2023-12",
      status: "Failed",
      exportDate: "2024-01-03",
      fileSize: "-",
      records: 1100,
      recipient: "Ministry of Health"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'In Progress': return 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Failed': return 'text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-300';
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
                Data Exports
              </h1>
            </div>
            <nav className="flex space-x-4">
              <Link href="/review" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Review
              </Link>
              <Link href="/annotation" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Annotation
              </Link>
              <Link href="/admin/jobs" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Jobs
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Exports</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {exports.length}
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
                  {exports.filter(e => e.status === "Completed").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {exports.filter(e => e.status === "In Progress").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Failed</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {exports.filter(e => e.status === "Failed").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Exports Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Export History ({exports.length})
              </h3>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                New Export
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Export ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    District / Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Records
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    File Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Export Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {exports.map((exportItem) => (
                  <tr key={exportItem.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800">
                      <Link href={`/exports/${exportItem.id}`} className="hover:underline">
                        {exportItem.id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {exportItem.district}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {exportItem.month}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(exportItem.status)}`}>
                        {exportItem.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {exportItem.records.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {exportItem.fileSize}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {exportItem.exportDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <Link 
                          href={`/exports/${exportItem.id}`}
                          className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 font-medium"
                        >
                          View
                        </Link>
                        {exportItem.status === "Completed" && (
                          <button className="text-green-600 hover:text-green-900 dark:hover:text-green-400 font-medium">
                            Download
                          </button>
                        )}
                        {exportItem.status === "Failed" && (
                          <button className="text-red-600 hover:text-red-900 dark:hover:text-red-400 font-medium">
                            Retry
                          </button>
                        )}
                      </div>
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