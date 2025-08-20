import Link from "next/link";

interface ExportDetailsPageProps {
  params: Promise<{
    exportId: string;
  }>;
}

export default async function ExportDetailsPage({ params }: ExportDetailsPageProps) {
  const { exportId } = await params;
  
  // Mock export details data
  const exportDetails = {
    id: exportId,
    district: "Nairobi",
    month: "2024-01",
    status: "Completed",
    createdAt: "2024-01-20 14:30:00",
    completedAt: "2024-01-20 14:45:00",
    fileSize: "2.4 MB",
    recordCount: 1250,
    recipient: "Ministry of Health",
    format: "JSON + CSV",
    downloadUrl: "/exports/download/EXP-2024-001.zip",
    checksum: "sha256:a1b2c3d4e5f6...",
    metadata: {
      exportedBy: "Dr. Jane Mwangi",
      approvedBy: "Dr. Jane Mwangi",
      approvalDate: "2024-01-20 14:25:00",
      dataVersion: "v1.2.3",
      includesAnnotations: true,
      qualityScore: 98.5
    },
    contents: {
      sessions: 45,
      specimens: 1250,
      annotations: 1180,
      discrepancies: 0,
      kpis: 12
    },
    logs: [
      { timestamp: "2024-01-20 14:30:00", event: "Export job created", user: "System" },
      { timestamp: "2024-01-20 14:30:15", event: "Data validation started", user: "System" },
      { timestamp: "2024-01-20 14:32:00", event: "Data validation completed successfully", user: "System" },
      { timestamp: "2024-01-20 14:32:05", event: "File generation started", user: "System" },
      { timestamp: "2024-01-20 14:44:30", event: "Files generated successfully", user: "System" },
      { timestamp: "2024-01-20 14:44:45", event: "Package created and signed", user: "System" },
      { timestamp: "2024-01-20 14:45:00", event: "Export completed", user: "System" }
    ]
  };

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
              <Link href="/exports" className="text-blue-600 hover:text-blue-800 mr-4">
                ← Back to Exports
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Export Details
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {exportDetails.id} • {exportDetails.district} - {exportDetails.month}
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              {exportDetails.status === "Completed" && (
                <>
                  <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                    Download Package
                  </button>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                    Verify Integrity
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Details */}
          <div className="lg:col-span-2">
            {/* Status and Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Export Overview
                </h2>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(exportDetails.status)}`}>
                  {exportDetails.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">District / Month</span>
                    <div className="text-sm text-gray-900 dark:text-white">{exportDetails.district} - {exportDetails.month}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Created</span>
                    <div className="text-sm text-gray-900 dark:text-white">{exportDetails.createdAt}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</span>
                    <div className="text-sm text-gray-900 dark:text-white">{exportDetails.completedAt}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Exported By</span>
                    <div className="text-sm text-gray-900 dark:text-white">{exportDetails.metadata.exportedBy}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">File Size</span>
                    <div className="text-sm text-gray-900 dark:text-white">{exportDetails.fileSize}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Record Count</span>
                    <div className="text-sm text-gray-900 dark:text-white">{exportDetails.recordCount.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Format</span>
                    <div className="text-sm text-gray-900 dark:text-white">{exportDetails.format}</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Recipient</span>
                    <div className="text-sm text-gray-900 dark:text-white">{exportDetails.recipient}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Package Contents */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Package Contents
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(exportDetails.contents).map(([type, count]) => (
                  <div key={type} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{count}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">{type}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Export Log */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Export Log
              </h3>
              <div className="space-y-3">
                {exportDetails.logs.map((log, index) => (
                  <div key={index} className="flex items-start space-x-3 text-sm">
                    <div className="text-gray-500 dark:text-gray-400 font-mono min-w-0 flex-shrink-0">
                      {log.timestamp.split(' ')[1]}
                    </div>
                    <div className="text-gray-900 dark:text-white flex-1">
                      {log.event}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs">
                      {log.user}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Download Section */}
            {exportDetails.status === "Completed" && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Download
                </h3>
                <div className="space-y-3">
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                    Download Complete Package
                  </button>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                    Download JSON Only
                  </button>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                    Download CSV Only
                  </button>
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Metadata
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">Data Version:</span>
                  <div className="text-gray-900 dark:text-white">{exportDetails.metadata.dataVersion}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">Quality Score:</span>
                  <div className="text-gray-900 dark:text-white">{exportDetails.metadata.qualityScore}%</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">Includes Annotations:</span>
                  <div className="text-gray-900 dark:text-white">
                    {exportDetails.metadata.includesAnnotations ? "Yes" : "No"}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">Approved By:</span>
                  <div className="text-gray-900 dark:text-white">{exportDetails.metadata.approvedBy}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">Approval Date:</span>
                  <div className="text-gray-900 dark:text-white">{exportDetails.metadata.approvalDate}</div>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Security & Integrity
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-600 dark:text-gray-400">Checksum:</span>
                  <div className="text-gray-900 dark:text-white font-mono text-xs break-all">
                    {exportDetails.checksum}
                  </div>
                </div>
                <button className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                  Verify Package Integrity
                </button>
                <button className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                  View Digital Signature
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}