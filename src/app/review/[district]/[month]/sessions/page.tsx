import Link from "next/link";

interface SessionsPageProps {
  params: Promise<{
    district: string;
    month: string;
  }>;
}

export default async function SessionsPage({ params }: SessionsPageProps) {
  const { district, month } = await params;
  
  // Mock session data
  const sessionData = {
    district: district.charAt(0).toUpperCase() + district.slice(1),
    month: month,
    sessions: [
      {
        id: "SES-001",
        date: "2024-01-15",
        location: "Kibera Slums",
        collector: "Jane Mwangi",
        traps: 8,
        specimens: 45,
        weather: "Sunny",
        status: "Complete"
      },
      {
        id: "SES-002", 
        date: "2024-01-16",
        location: "Westlands",
        collector: "John Kamau",
        traps: 6,
        specimens: 32,
        weather: "Rainy",
        status: "Complete"
      },
      {
        id: "SES-003",
        date: "2024-01-17",
        location: "Eastlands",
        collector: "Mary Njoki",
        traps: 5,
        specimens: 28,
        weather: "Cloudy",
        status: "Incomplete"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href={`/review/${district}/${month}`} className="text-blue-600 hover:text-blue-800 mr-4">
                ← Back to Review
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Session Tables - {sessionData.district}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {sessionData.month} • Collection Session Records
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Collection Sessions ({sessionData.sessions.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Session ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Collector</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Traps</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Specimens</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Weather</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sessionData.sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800">
                      <Link href={`#`} className="hover:underline">{session.id}</Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {session.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {session.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {session.collector}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {session.traps}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {session.specimens}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {session.weather}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        session.status === 'Complete' 
                          ? 'text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300'
                          : 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}>
                        {session.status}
                      </span>
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