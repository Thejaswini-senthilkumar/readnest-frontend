'use client';

import { useState } from 'react';
import Navbar from './Navbar';
import Feed from './Feed';
import RightSidebar from './RightSidebar';

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('feed');
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<{
    title: string;
    url?: string;
    type: 'rss' | 'pdf';
  } | null>(null);

  const handleToggleRightSidebar = () => {
    setIsRightSidebarOpen(!isRightSidebarOpen);
  };

  const renderMainContent = () => {
    switch (activeSection) {
      case 'feed':
        return <Feed />;
      case 'journal':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Journal
            </h2>
            <div className="text-gray-600 dark:text-gray-400">
              <p>Your personal notebook and entries will be displayed here.</p>
              <p className="mt-2">Simple text editor with past entries on the left, editable area on the right.</p>
            </div>
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
              <p className="mt-2">Chat-style interface with input box and AI responses.</p>
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
        isRightSidebarOpen={isRightSidebarOpen}
        onToggleRightSidebar={handleToggleRightSidebar}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <main className="flex-1 bg-white dark:bg-gray-900">
          {renderMainContent()}
        </main>
        
        {/* Right Sidebar (Journal) */}
        <RightSidebar 
          isOpen={isRightSidebarOpen} 
          currentArticle={currentArticle}
          onClose={handleToggleRightSidebar}
        />
      </div>
    </div>
  );
}
