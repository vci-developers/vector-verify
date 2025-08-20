import Link from "next/link";

interface KPIsPageProps {
  params: Promise<{
    district: string;
    month: string;
  }>;
}

export default async function KPIsPage({ params }: KPIsPageProps) {
  const { district, month } = await params;
  
  // Mock data for demonstration
  const kpiData = {
    district: district.charAt(0).toUpperCase() + district.slice(1),
    month: month,
    metrics: {
      traps: {
        deployed: 125,
        collected: 120,
        lossRate: 4.0,
        target: 130
      },
      specimens: {
        total: 1250,
        identified: 1180,
        unidentified: 70,
        identificationRate: 94.4
      },
      species: {
        anopheles: 450,
        aedes: 380,
        culex: 350,
        other: 70
      },
      quality: {
        completeness: 96.8,
        accuracy: 98.2,
        timeliness: 92.1,
        consistency: 97.5
      }
    },
    trends: [
      { month: "2023-09", specimens: 1100, completeness: 94.2 },
      { month: "2023-10", specimens: 1180, completeness: 95.1 },
      { month: "2023-11", specimens: 1320, completeness: 97.3 },
      { month: "2023-12", specimens: 1250, completeness: 96.8 },
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href={`/review/${district}/${month}`} className="text-blue-600 hover:text-blue-800 mr-4">
                ← Back to Review
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  KPI Review - {kpiData.district}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {kpiData.month} • Key Performance Indicators
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Traps Collected</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {kpiData.metrics.traps.collected}/{kpiData.metrics.traps.deployed}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {kpiData.metrics.traps.lossRate}% loss rate
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Specimens</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {kpiData.metrics.specimens.total.toLocaleString()}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {kpiData.metrics.specimens.identificationRate}% identified
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Data Completeness</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {kpiData.metrics.quality.completeness}%
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Quality score
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600 dark:text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Timeliness</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {kpiData.metrics.quality.timeliness}%
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  On-time submissions
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Species Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Species Distribution
            </h3>
            <div className="space-y-4">
              {Object.entries(kpiData.metrics.species).map(([species, count]) => {
                const percentage = ((count / kpiData.metrics.specimens.total) * 100).toFixed(1);
                return (
                  <div key={species}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400 capitalize">{species}</span>
                      <span className="text-gray-900 dark:text-white">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quality Metrics */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Data Quality Metrics
            </h3>
            <div className="space-y-4">
              {Object.entries(kpiData.metrics.quality).map(([metric, score]) => {
                const color = score >= 95 ? 'bg-green-600' : score >= 90 ? 'bg-yellow-600' : 'bg-red-600';
                return (
                  <div key={metric}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400 capitalize">{metric}</span>
                      <span className="text-gray-900 dark:text-white">{score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`${color} h-2 rounded-full`} 
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trends */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Monthly Trends
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 text-sm font-medium text-gray-600 dark:text-gray-400">Month</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-600 dark:text-gray-400">Specimens</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-600 dark:text-gray-400">Completeness</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-600 dark:text-gray-400">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {kpiData.trends.map((trend, index) => {
                    const prevMonth = index > 0 ? kpiData.trends[index - 1] : null;
                    const specimenTrend = prevMonth ? trend.specimens - prevMonth.specimens : 0;
                    
                    return (
                      <tr key={trend.month}>
                        <td className="py-2 text-sm text-gray-900 dark:text-white">{trend.month}</td>
                        <td className="py-2 text-sm text-gray-900 dark:text-white">{trend.specimens.toLocaleString()}</td>
                        <td className="py-2 text-sm text-gray-900 dark:text-white">{trend.completeness}%</td>
                        <td className="py-2 text-sm">
                          <div className="flex items-center space-x-2">
                            {specimenTrend > 0 ? (
                              <span className="text-green-600">↗ +{specimenTrend}</span>
                            ) : specimenTrend < 0 ? (
                              <span className="text-red-600">↘ {specimenTrend}</span>
                            ) : (
                              <span className="text-gray-500">→ 0</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}