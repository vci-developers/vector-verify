import Link from "next/link";

export default function JobsPage() {
  // Mock job data
  const jobs = [
    {
      id: "JOB-2024-001",
      type: "Data Export",
      district: "Nairobi",
      month: "2024-01",
      status: "Running",
      progress: 75,
      startTime: "2024-01-20 14:30:00",
      estimatedCompletion: "2024-01-20 14:45:00",
      logs: ["Started export process", "Validating data...", "Generating report..."]
    },
    {
      id: "JOB-2024-002", 
      type: "Data Validation",
      district: "Mombasa",
      month: "2024-01",
      status: "Completed",
      progress: 100,
      startTime: "2024-01-19 10:15:00",
      estimatedCompletion: "2024-01-19 10:20:00",
      logs: ["Started validation", "Checked 890 records", "Validation completed successfully"]
    },
    {
      id: "JOB-2024-003",
      type: "Annotation Assignment",
      district: "All",
      month: "2024-02",
      status: "Failed",
      progress: 45,
      startTime: "2024-01-18 16:00:00",
      estimatedCompletion: "2024-01-18 16:10:00",
      logs: ["Started assignment", "Processing specimens...", "Error: Database connection timeout"]
    },
    {
      id: "JOB-2024-004",
      type: "Monthly Report",
      district: "Kisumu", 
      month: "2023-12",
      status: "Queued",
      progress: 0,
      startTime: "-",
      estimatedCompletion: "-",
      logs: ["Job queued for processing"]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Running': return 'text-blue-700 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'Completed': return 'text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'Failed': return 'text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-300';
      case 'Queued': return 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'text-gray-700 bg-gray-100 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'Running': return 'bg-blue-600';
      case 'Completed': return 'bg-green-600';
      case 'Failed': return 'bg-red-600';
      case 'Queued': return 'bg-gray-400';
      default: return 'bg-gray-400';
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
                Job Status Monitor
              </h1>
            </div>
            <nav className="flex space-x-4">
              <Link href="/admin/changelog" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Changelog
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Running</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {jobs.filter(j => j.status === "Running").length}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Queued</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {jobs.filter(j => j.status === "Queued").length}
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
                  {jobs.filter(j => j.status === "Completed").length}
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
                  {jobs.filter(j => j.status === "Failed").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-6">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {job.id}
                    </h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Type:</span>
                      <div className="text-gray-900 dark:text-white">{job.type}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">District:</span>
                      <div className="text-gray-900 dark:text-white">{job.district}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Month:</span>
                      <div className="text-gray-900 dark:text-white">{job.month}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Started:</span>
                      <div className="text-gray-900 dark:text-white">{job.startTime}</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {job.status !== "Queued" && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="text-gray-900 dark:text-white">{job.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getProgressColor(job.status)}`}
                          style={{ width: `${job.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Estimated Completion */}
                  {job.estimatedCompletion !== "-" && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Estimated completion: {job.estimatedCompletion}
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 ml-6">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View Logs
                  </button>
                  {job.status === "Failed" && (
                    <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                      Retry
                    </button>
                  )}
                  {job.status === "Running" && (
                    <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* Recent Logs */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Recent Logs:</h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                  {job.logs.map((log, index) => (
                    <div key={index} className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Auto-refresh notice */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This page auto-refreshes every 30 seconds
          </p>
        </div>
      </main>
    </div>
  );
}