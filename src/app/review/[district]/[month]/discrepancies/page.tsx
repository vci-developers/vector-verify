import Link from "next/link";

interface DiscrepanciesPageProps {
  params: Promise<{
    district: string;
    month: string;
  }>;
}

export default async function DiscrepanciesPage({ params }: DiscrepanciesPageProps) {
  const { district, month } = await params;
  
  // Mock discrepancy data
  const discrepancyData = {
    district: district.charAt(0).toUpperCase() + district.slice(1),
    month: month,
    discrepancies: [
      {
        id: "DISC-001",
        type: "Data Inconsistency",
        severity: "High",
        description: "Session SES-003 reports 5 traps but only 3 trap locations recorded",
        recordId: "SES-003",
        reportedBy: "System Check",
        reportedDate: "2024-01-17",
        status: "Open",
        assignedTo: "Jane Mwangi"
      },
      {
        id: "DISC-002",
        type: "Missing Data",
        severity: "Medium",
        description: "Weather conditions not recorded for session SES-002",
        recordId: "SES-002",
        reportedBy: "Data Validator",
        reportedDate: "2024-01-16",
        status: "In Progress",
        assignedTo: "John Kamau"
      },
      {
        id: "DISC-003",
        type: "Validation Error",
        severity: "Low",
        description: "Specimen SPEC-004 classification confidence below threshold (0%)",
        recordId: "SPEC-004",
        reportedBy: "Quality Control",
        reportedDate: "2024-01-15",
        status: "Resolved",
        assignedTo: "Mary Njoki"
      }
    ]
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-300';
      case 'Medium': return 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Low': return 'text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300';
      default: return 'text-gray-700 bg-gray-100 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-300';
      case 'In Progress': return 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Resolved': return 'text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300';
      default: return 'text-gray-700 bg-gray-100 dark:bg-gray-900 dark:text-gray-300';
    }
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
                  Discrepancies - {discrepancyData.district}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {discrepancyData.month} • Data Quality Issues
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
              {discrepancyData.discrepancies.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Issues</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-red-600">
              {discrepancyData.discrepancies.filter(d => d.status === "Open").length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Open</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {discrepancyData.discrepancies.filter(d => d.status === "In Progress").length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">In Progress</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="text-2xl font-bold text-green-600">
              {discrepancyData.discrepancies.filter(d => d.status === "Resolved").length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Resolved</div>
          </div>
        </div>

        {/* Discrepancies List */}
        <div className="space-y-6">
          {discrepancyData.discrepancies.map((discrepancy) => (
            <div key={discrepancy.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {discrepancy.id}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(discrepancy.severity)}`}>
                      {discrepancy.severity}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(discrepancy.status)}`}>
                      {discrepancy.status}
                    </span>
                  </div>
                  
                  <div className="mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {discrepancy.type}
                    </span>
                  </div>

                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {discrepancy.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Record ID:</span>
                      <div className="text-gray-900 dark:text-white">{discrepancy.recordId}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Reported By:</span>
                      <div className="text-gray-900 dark:text-white">{discrepancy.reportedBy}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Reported Date:</span>
                      <div className="text-gray-900 dark:text-white">{discrepancy.reportedDate}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 dark:text-gray-400">Assigned To:</span>
                      <div className="text-gray-900 dark:text-white">{discrepancy.assignedTo}</div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-6">
                  {discrepancy.status === "Open" && (
                    <>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors">
                        Investigate
                      </button>
                      <button className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors">
                        Resolve
                      </button>
                      <button className="bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors">
                        Assign
                      </button>
                    </>
                  )}
                  {discrepancy.status === "In Progress" && (
                    <>
                      <button className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors">
                        Mark Resolved
                      </button>
                      <button className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors">
                        Update Status
                      </button>
                    </>
                  )}
                  {discrepancy.status === "Resolved" && (
                    <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors">
                      View Resolution
                    </button>
                  )}
                </div>
              </div>

              {/* Action History - Only show for resolved items */}
              {discrepancy.status === "Resolved" && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Resolution Notes:</h4>
                  <div className="bg-green-50 dark:bg-green-900 p-3 rounded-md">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Issue resolved by {discrepancy.assignedTo} on {discrepancy.reportedDate}. 
                      Specimen was re-classified with updated confidence score of 92%.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* No discrepancies state */}
        {discrepancyData.discrepancies.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <div className="text-green-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Discrepancies Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              All data quality checks have passed for this district and month.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}