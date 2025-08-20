import Link from "next/link";

interface ReviewPageProps {
  params: Promise<{
    district: string;
    month: string;
  }>;
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { district, month } = await params;
  
  // Mock data for demonstration
  const reviewData = {
    district: district.charAt(0).toUpperCase() + district.slice(1),
    month: month,
    status: "In Review",
    workflow: {
      draft: { completed: true, date: "2024-01-10" },
      inReview: { completed: false, date: null },
      approved: { completed: false, date: null },
      exported: { completed: false, date: null }
    },
    summary: {
      sessions: 45,
      specimens: 1250,
      discrepancies: 3,
      lastUpdated: "2024-01-15"
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/review" className="text-blue-600 hover:text-blue-800 mr-4">
                ← Back to Review Tasks
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {reviewData.district} - {reviewData.month}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Status: {reviewData.status}
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                Approve
              </button>
              <button className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                Request Changes
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Workflow Status */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Workflow Status
              </h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-3 ${reviewData.workflow.draft.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Draft</div>
                    {reviewData.workflow.draft.completed && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">{reviewData.workflow.draft.date}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-3 bg-yellow-500`}></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">In Review</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Current stage</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-3 bg-gray-300`}></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Approved</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Pending</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-3 bg-gray-300`}></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Exported</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Pending</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Summary
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Sessions</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{reviewData.summary.sessions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Specimens</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{reviewData.summary.specimens}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Discrepancies</span>
                  <span className={`text-sm font-medium ${reviewData.summary.discrepancies > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {reviewData.summary.discrepancies}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Last updated: {reviewData.summary.lastUpdated}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* KPIs Card */}
              <Link href={`/review/${district}/${month}/kpis`} className="block">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        KPI Review
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Review key performance indicators and metrics
                      </p>
                    </div>
                    <div className="text-blue-600">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Sessions Card */}
              <Link href={`/review/${district}/${month}/sessions`} className="block">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Session Tables
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Inspect session data and collection records
                      </p>
                    </div>
                    <div className="text-green-600">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Specimens Card */}
              <Link href={`/review/${district}/${month}/specimens`} className="block">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Specimen Tables
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Review specimen data and classifications
                      </p>
                    </div>
                    <div className="text-purple-600">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Discrepancies Card */}
              <Link href={`/review/${district}/${month}/discrepancies`} className="block">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-red-200 dark:hover:border-red-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Discrepancies
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Resolve data inconsistencies and errors
                      </p>
                      {reviewData.summary.discrepancies > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 mt-2">
                          {reviewData.summary.discrepancies} issues
                        </span>
                      )}
                    </div>
                    <div className="text-red-600">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}