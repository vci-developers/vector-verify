"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface LabelingPageProps {
  params: Promise<{
    month: string;
  }>;
}

export default function LabelingPage({ params }: LabelingPageProps) {
  const [resolvedParams, setResolvedParams] = useState<{ month: string } | null>(null);
  const [currentSpecimen, setCurrentSpecimen] = useState(0);
  const [selectedSpecies, setSelectedSpecies] = useState<string>("");
  const [confidence, setConfidence] = useState<number>(85);
  
  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  if (!resolvedParams) {
    return <div>Loading...</div>;
  }
  
  // Mock specimen data for labeling
  const specimens = [
    {
      id: "SPEC-2024-001",
      imageUrl: "/api/placeholder/400/300", // Placeholder for specimen image
      metadata: {
        location: "Nairobi",
        trapType: "BG-Sentinel",
        collectionDate: "2024-01-15",
        weather: "Sunny"
      }
    },
    {
      id: "SPEC-2024-002", 
      imageUrl: "/api/placeholder/400/300",
      metadata: {
        location: "Kibera",
        trapType: "Ovitrap",
        collectionDate: "2024-01-16",
        weather: "Rainy"
      }
    },
    // More specimens would be loaded here
  ];

  const speciesOptions = [
    "Anopheles gambiae",
    "Anopheles arabiensis", 
    "Aedes aegypti",
    "Aedes albopictus",
    "Culex quinquefasciatus",
    "Culex pipiens",
    "Other",
    "Unable to identify"
  ];

  const handleSubmitLabel = () => {
    if (!selectedSpecies) return;
    
    // In a real app, this would submit to the backend
    console.log({
      specimenId: specimens[currentSpecimen].id,
      species: selectedSpecies,
      confidence: confidence
    });

    // Move to next specimen
    if (currentSpecimen < specimens.length - 1) {
      setCurrentSpecimen(currentSpecimen + 1);
      setSelectedSpecies("");
      setConfidence(85);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Keyboard shortcuts for faster labeling
    if (e.key >= '1' && e.key <= '8') {
      const index = parseInt(e.key) - 1;
      if (index < speciesOptions.length) {
        setSelectedSpecies(speciesOptions[index]);
      }
    } else if (e.key === 'Enter' && selectedSpecies) {
      handleSubmitLabel();
    } else if (e.key === 'ArrowLeft' && currentSpecimen > 0) {
      setCurrentSpecimen(currentSpecimen - 1);
    } else if (e.key === 'ArrowRight' && currentSpecimen < specimens.length - 1) {
      setCurrentSpecimen(currentSpecimen + 1);
    }
  };

  const currentSpec = specimens[currentSpecimen];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" onKeyDown={handleKeyPress} tabIndex={0}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href={`/annotation/${resolvedParams.month}`} className="text-blue-600 hover:text-blue-800 mr-4">
                ← Back to Assignment
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Fast Labeling Interface
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Specimen {currentSpecimen + 1} of {specimens.length} • Use keyboard shortcuts for speed
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Progress: {((currentSpecimen / specimens.length) * 100).toFixed(0)}%
              </div>
              <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(currentSpecimen / specimens.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Image Display */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Specimen Image
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ID: {currentSpec.id}
              </p>
            </div>
            
            {/* Image placeholder - in real app this would be actual specimen image */}
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg aspect-square flex items-center justify-center mb-4">
              <div className="text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400">Mosquito specimen image</p>
                <p className="text-xs text-gray-400 mt-1">High-resolution microscopy</p>
              </div>
            </div>

            {/* Image Controls */}
            <div className="flex justify-center space-x-2">
              <button className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm">
                Zoom In
              </button>
              <button className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm">
                Zoom Out
              </button>
              <button className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm">
                Reset View
              </button>
            </div>

            {/* Metadata */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Collection Metadata
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Location:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{currentSpec.metadata.location}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Trap:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{currentSpec.metadata.trapType}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Date:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{currentSpec.metadata.collectionDate}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Weather:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">{currentSpec.metadata.weather}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Labeling Interface */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Species Classification
            </h2>

            {/* Species Selection */}
            <div className="space-y-2 mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Species (Use keys 1-8 for shortcuts)
              </label>
              {speciesOptions.map((species, index) => (
                <label key={species} className="flex items-center">
                  <input
                    type="radio"
                    name="species"
                    value={species}
                    checked={selectedSpecies === species}
                    onChange={(e) => setSelectedSpecies(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-3 text-sm text-gray-900 dark:text-white">
                    <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs mr-2">
                      {index + 1}
                    </span>
                    {species}
                  </span>
                </label>
              ))}
            </div>

            {/* Confidence Slider */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confidence Level: {confidence}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={confidence}
                onChange={(e) => setConfidence(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleSubmitLabel}
                disabled={!selectedSpecies}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-md transition-colors"
              >
                Submit & Next (Enter)
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setCurrentSpecimen(Math.max(0, currentSpecimen - 1))}
                  disabled={currentSpecimen === 0}
                  className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Previous (←)
                </button>
                <button
                  onClick={() => setCurrentSpecimen(Math.min(specimens.length - 1, currentSpecimen + 1))}
                  disabled={currentSpecimen === specimens.length - 1}
                  className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Next (→)
                </button>
              </div>

              <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                Skip Specimen
              </button>
            </div>

            {/* Keyboard Shortcuts Help */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Keyboard Shortcuts
              </h3>
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <div>1-8: Select species</div>
                <div>Enter: Submit and next</div>
                <div>← →: Navigate specimens</div>
                <div>Tab: Navigate interface</div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}