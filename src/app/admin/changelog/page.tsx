import Link from "next/link";

export default function ChangelogPage() {
  // Mock changelog data
  const changelogEntries = [
    {
      id: "CHG-2024-001",
      timestamp: "2024-01-20 15:45:00",
      user: "Dr. Jane Mwangi",
      action: "Approved",
      resource: "Nairobi 2024-01 Data Snapshot",
      details: "Approved final data snapshot for export to Ministry of Health. All discrepancies resolved.",
      changes: [
        "Status: In Review → Approved",
        "Discrepancies: 3 → 0",
        "Export ready: Yes"
      ]
    },
    {
      id: "CHG-2024-002",
      timestamp: "2024-01-20 14:30:00", 
      user: "System",
      action: "Export Started",
      resource: "Nairobi 2024-01 Export Job",
      details: "Automated export job initiated for approved data snapshot EXP-2024-001.",
      changes: [
        "Job status: Created",
        "Export format: JSON + CSV",
        "Recipient: Ministry of Health"
      ]
    },
    {
      id: "CHG-2024-003",
      timestamp: "2024-01-19 16:22:00",
      user: "Mary Njoki",
      action: "Resolved Discrepancy",
      resource: "Specimen SPEC-004",
      details: "Re-classified specimen with updated confidence score after expert review.",
      changes: [
        "Species: Unknown → Culex quinquefasciatus",
        "Confidence: 0% → 92%",
        "Status: Flagged → Verified"
      ]
    },
    {
      id: "CHG-2024-004",
      timestamp: "2024-01-19 11:15:00",
      user: "John Kamau",
      action: "Updated Session",
      resource: "Session SES-002",
      details: "Added missing weather conditions and trap location data.",
      changes: [
        "Weather: null → Rainy",
        "Trap locations: 3 → 6",
        "Completeness: 85% → 96%"
      ]
    },
    {
      id: "CHG-2024-005",
      timestamp: "2024-01-18 09:30:00",
      user: "Dr. Jane Mwangi",
      action: "Created Annotation Assignment",
      resource: "2024-02 Monthly Assignment", 
      details: "Created new monthly annotation assignment with 175 specimens for February 2024.",
      changes: [
        "Assignment created: 2024-02",
        "Specimens assigned: 175",
        "Deadline: 2024-02-29"
      ]
    },
    {
      id: "CHG-2024-006",
      timestamp: "2024-01-17 14:45:00",
      user: "System",
      action: "Data Validation",
      resource: "Mombasa 2024-01 Dataset",
      details: "Automated data validation completed. Found 7 discrepancies requiring attention.",
      changes: [
        "Validation status: Completed",
        "Records validated: 890",
        "Discrepancies found: 7"
      ]
    }
  ];

  const getActionColor = (action: string) => {
    switch (action) {
      case 'Approved': return 'text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'Export Started': return 'text-blue-700 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      case 'Resolved Discrepancy': return 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Updated Session': return 'text-purple-700 bg-purple-100 dark:bg-purple-900 dark:text-purple-300';
      case 'Created Annotation Assignment': return 'text-indigo-700 bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-300';
      case 'Data Validation': return 'text-orange-700 bg-orange-100 dark:bg-orange-900 dark:text-orange-300';
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
                System Changelog
              </h1>
            </div>
            <nav className="flex space-x-4">
              <Link href="/admin/jobs" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Jobs
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
              <option value="">All Users</option>
              <option value="jane">Dr. Jane Mwangi</option>
              <option value="john">John Kamau</option>
              <option value="mary">Mary Njoki</option>
              <option value="system">System</option>
            </select>
            <select className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="">All Actions</option>
              <option value="approved">Approved</option>
              <option value="export">Export Started</option>
              <option value="resolved">Resolved Discrepancy</option>
              <option value="updated">Updated Session</option>
              <option value="created">Created Assignment</option>
              <option value="validation">Data Validation</option>
            </select>
            <input
              type="date"
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="From date"
            />
            <input
              type="date"
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="To date"
            />
          </div>
          <div className="mt-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors mr-3">
              Apply Filters
            </button>
            <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium py-2 px-4 rounded-md transition-colors">
              Clear
            </button>
          </div>
        </div>

        {/* Changelog Entries */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Recent Changes ({changelogEntries.length})
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Complete audit trail of all system activities and data changes
            </p>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {changelogEntries.map((entry) => (
              <div key={entry.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                        {entry.id}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(entry.action)}`}>
                        {entry.action}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        by {entry.user}
                      </span>
                    </div>

                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                      {entry.resource}
                    </h4>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {entry.details}
                    </p>

                    {/* Changes List */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <h5 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Changes Made:
                      </h5>
                      <ul className="space-y-1">
                        {entry.changes.map((change, index) => (
                          <li key={index} className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                            • {change}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="text-right text-sm text-gray-500 dark:text-gray-400 ml-6">
                    <div className="font-medium">{entry.timestamp.split(' ')[1]}</div>
                    <div>{entry.timestamp.split(' ')[0]}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing 1 to {changelogEntries.length} of {changelogEntries.length} entries
          </div>
          <div className="flex space-x-2">
            <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium py-2 px-3 rounded-md transition-colors">
              Previous
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-md transition-colors">
              1
            </button>
            <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium py-2 px-3 rounded-md transition-colors">
              2
            </button>
            <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium py-2 px-3 rounded-md transition-colors">
              Next
            </button>
          </div>
        </div>

        {/* Export Options */}
        <div className="mt-8 text-center">
          <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
            Export Changelog to CSV
          </button>
        </div>
      </main>
    </div>
  );
}