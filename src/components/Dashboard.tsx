'use client';

import { useState } from 'react';
import Navbar from './Navbar';
import Feed from './Feed';
import DocumentUpload from './DocumentUpload';
import LeftSidebar from './LeftSidebar';
import JournalSidebar from './JournalSidebar';

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('feed');
  const [activeTab, setActiveTab] = useState<'rss' | 'pdf'>('rss');
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState<{
    type: 'rss' | 'pdf';
    title: string;
    url?: string;
    id?: string;
  } | null>(null);

  const handleToggleJournal = () => {
    setIsJournalOpen(!isJournalOpen);
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

        {/* Journal Sidebar */}
        <JournalSidebar
          isOpen={isJournalOpen}
          currentContent={currentContent}
          onClose={handleToggleJournal}
        />
      </div>
    </div>
  );
}
