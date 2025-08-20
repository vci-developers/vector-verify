import Link from "next/link";

interface SpecimensPageProps {
  params: Promise<{
    district: string;
    month: string;
  }>;
}

export default async function SpecimensPage({ params }: SpecimensPageProps) {
  const { district, month } = await params;
  
  // Mock specimen data
  const specimenData = {
    district: district.charAt(0).toUpperCase() + district.slice(1),
    month: month,
    specimens: [
      {
        id: "SPEC-001",
        sessionId: "SES-001",
        species: "Anopheles gambiae",
        sex: "Female",
        condition: "Good",
        bloodFed: "Yes",
        gravid: "No",
        identified: "Yes",
        confidence: 95
      },
      {
        id: "SPEC-002",
        sessionId: "SES-001", 
        species: "Aedes aegypti",
        sex: "Female",
        condition: "Good",
        bloodFed: "No",
        gravid: "Yes",
        identified: "Yes",
        confidence: 98
      },
      {
        id: "SPEC-003",
        sessionId: "SES-002",
        species: "Culex quinquefasciatus",
        sex: "Male",
        condition: "Damaged",
        bloodFed: "No",
        gravid: "N/A",
        identified: "Yes",
        confidence: 87
      },
      {
        id: "SPEC-004",
        sessionId: "SES-002",
        species: "Unknown",
        sex: "Female",
        condition: "Poor",
        bloodFed: "Unknown",
        gravid: "Unknown",
        identified: "No",
        confidence: 0
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
                  Specimen Tables - {specimenData.district}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {specimenData.month} • Specimen Classification Records
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {specimenData.specimens.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Specimens</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">
              {specimenData.specimens.filter(s => s.identified === "Yes").length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Identified</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-red-600">
              {specimenData.specimens.filter(s => s.identified === "No").length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Unidentified</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round((specimenData.specimens.filter(s => s.identified === "Yes").length / specimenData.specimens.length) * 100)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">ID Rate</div>
          </div>
        </div>

        {/* Specimens Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Specimen Records ({specimenData.specimens.length})
              </h3>
              <div className="flex space-x-2">
                <select className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="">All Species</option>
                  <option value="anopheles">Anopheles</option>
                  <option value="aedes">Aedes</option>
                  <option value="culex">Culex</option>
                </select>
                <select className="border border-gray-300 dark:border-gray-600 rounded px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="">All Status</option>
                  <option value="identified">Identified</option>
                  <option value="unidentified">Unidentified</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Specimen ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Session</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Species</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sex</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Condition</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Blood Fed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Gravid</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Confidence</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {specimenData.specimens.map((specimen) => (
                  <tr key={specimen.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800">
                      <Link href={`#`} className="hover:underline">{specimen.id}</Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {specimen.sessionId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <span className={specimen.species === "Unknown" ? "text-red-600 italic" : ""}>
                        {specimen.species}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {specimen.sex}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <span className={`${
                        specimen.condition === 'Good' ? 'text-green-600' :
                        specimen.condition === 'Damaged' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {specimen.condition}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {specimen.bloodFed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {specimen.gravid}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {specimen.confidence > 0 ? `${specimen.confidence}%` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        specimen.identified === 'Yes' 
                          ? 'text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300'
                          : 'text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {specimen.identified === 'Yes' ? 'Identified' : 'Unidentified'}
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