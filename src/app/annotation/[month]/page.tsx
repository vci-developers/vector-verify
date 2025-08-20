import Link from "next/link";

interface AnnotationMonthPageProps {
  params: Promise<{
    month: string;
  }>;
}

export default async function AnnotationMonthPage({ params }: AnnotationMonthPageProps) {
  const { month } = await params;
  
  // Mock annotation data for the month
  const annotationData = {
    month: month,
    totalSpecimens: 150,
    completed: 45,
    accuracy: 94.5,
    deadline: "2024-01-31",
    status: "In Progress",
    speciesBreakdown: {
      "Anopheles gambiae": { total: 45, completed: 15, accuracy: 96.2 },
      "Aedes aegypti": { total: 38, completed: 12, accuracy: 94.1 },
      "Culex quinquefasciatus": { total: 42, completed: 13, accuracy: 92.8 },
      "Other": { total: 25, completed: 5, accuracy: 95.0 }
    },
    performance: {
      averageTimePerSpecimen: 45, // seconds
      totalTimeSpent: 33.75, // minutes
      streak: 8, // consecutive correct annotations
      bestAccuracy: 98.5
    }
  };

  const progressPercentage = (annotationData.completed / annotationData.totalSpecimens) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/annotation" className="text-blue-600 hover:text-blue-800 mr-4">
                ← Back to Annotation Tasks
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {annotationData.month} Annotation
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Monthly specimen classification assignment
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link
                href={`/annotation/${month}/labeling`}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Continue Labeling
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Progress Overview */}
          <div className="lg:col-span-2">
            {/* Progress Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Progress Overview
              </h2>
              
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Overall Progress</span>
                  <span className="text-gray-900 dark:text-white">
                    {annotationData.completed}/{annotationData.totalSpecimens} specimens
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full" 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {progressPercentage.toFixed(1)}% complete
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{annotationData.completed}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-400">{annotationData.totalSpecimens - annotationData.completed}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Remaining</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{annotationData.accuracy}%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{Math.ceil((annotationData.totalSpecimens - annotationData.completed) / 10)}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Est. Days</div>
                </div>
              </div>
            </div>

            {/* Species Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Species Breakdown
              </h3>
              <div className="space-y-4">
                {Object.entries(annotationData.speciesBreakdown).map(([species, data]) => {
                  const speciesProgress = (data.completed / data.total) * 100;
                  return (
                    <div key={species} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{species}</h4>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {data.completed}/{data.total} specimens • {data.accuracy}% accuracy
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {speciesProgress.toFixed(0)}%
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${speciesProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Performance Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Performance Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Avg Time/Specimen</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {annotationData.performance.averageTimePerSpecimen}s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Time</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {annotationData.performance.totalTimeSpent}m
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Current Streak</span>
                  <span className="text-sm font-medium text-green-600">
                    {annotationData.performance.streak} correct
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Best Accuracy</span>
                  <span className="text-sm font-medium text-green-600">
                    {annotationData.performance.bestAccuracy}%
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  href={`/annotation/${month}/labeling`}
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Continue Labeling
                </Link>
                <button className="block w-full bg-gray-600 hover:bg-gray-700 text-white text-center font-medium py-2 px-4 rounded-md transition-colors">
                  Review Guidelines
                </button>
                <button className="block w-full bg-green-600 hover:bg-green-700 text-white text-center font-medium py-2 px-4 rounded-md transition-colors">
                  Download Progress Report
                </button>
              </div>
            </div>

            {/* Deadline Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Assignment Details
              </h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Deadline</span>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {annotationData.deadline}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                  <div className="text-sm font-medium text-yellow-600">
                    {annotationData.status}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Assignment Type</span>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Monthly Image Annotation
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}