'use client';

import { useState } from 'react';
import Navbar from './Navbar';
import Feed from './Feed';
import DocumentUpload from './DocumentUpload';
import LeftSidebar from './LeftSidebar';
import JournalSidebar from './JournalSidebar';
import ScholarSidebar from './ScholarSidebar';

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('feed');
  const [activeTab, setActiveTab] = useState<'rss' | 'pdf'>('rss');
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isScholarOpen, setIsScholarOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState<{
    type: 'rss' | 'pdf';
    title: string;
    url?: string;
    id?: string;
  } | null>(null);

  const handleToggleJournal = () => {
    setIsJournalOpen(prev => !prev);
  };

  const renderMainContent = () => {
    switch (activeSection) {
      case 'feed':
        return activeTab === 'rss' ? 
          <Feed onContentSelect={setCurrentContent} /> : 
          <DocumentUpload onContentSelect={setCurrentContent} />;
      case 'research':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Research</h2>
            <p className="text-gray-600 dark:text-gray-400">In Development</p>
          </div>
        );
      case 'assistant':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              AI Assistant
            </h2>
            <div className="text-gray-600 dark:text-gray-400">
              <p>Ask questions and get AI-powered summaries here.</p>
              <p className="mt-2">
                In Development
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Welcome to ReadNest
            </h2>
            <div className="text-gray-600 dark:text-gray-400">
              <p>Select a section from the navigation to get started.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sticky Top Navbar */}
      <Navbar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Only show for feed section */}
        {activeSection === 'feed' && (
          <LeftSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 bg-white dark:bg-gray-900">
          {renderMainContent()}
        </main>

        {/* Right-side single stacked icon rail */}
        <div className="flex flex-col items-center gap-2 p-2">
          {/* Journal icon */}
          <button
            onClick={() => setIsJournalOpen(prev => !prev)}
            className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Open Journal"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          {/* Scholar icon */}
          <button
            onClick={() => setIsScholarOpen(prev => !prev)}
            className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="Open Scholar"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l7 4v6c0 5-3.582 9.512-7 10-3.418-.488-7-5-7-10V6l7-4z" />
            </svg>
          </button>
        </div>

        {/* Sidebars (render only expanded drawers) */}
        <JournalSidebar
          isOpen={isJournalOpen}
          currentContent={currentContent}
          onClose={() => setIsJournalOpen(false)}
        />

        <ScholarSidebar
          isOpen={isScholarOpen}
          onClose={() => setIsScholarOpen(false)}
        />
      </div>
    </div>
  );
}
