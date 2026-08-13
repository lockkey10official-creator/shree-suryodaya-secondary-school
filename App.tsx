import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { OfflineBanner } from './components/OfflineBanner';
import { HeroBanner } from './components/HeroBanner';
import { FilterBar } from './components/FilterBar';
import { NoticeCard } from './components/NoticeCard';
import { NoticeDetailModal } from './components/NoticeDetailModal';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import { TopPerformersSection } from './components/TopPerformersSection';
import { AcademicCalendarModal } from './components/AcademicCalendarModal';
import { MediaGallerySection } from './components/MediaGallerySection';
import { DocumentResourcesSection } from './components/DocumentResourcesSection';
import { EmergencyContactsModal } from './components/EmergencyContactsModal';
import { PushNotificationModal } from './components/PushNotificationModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { Footer } from './components/Footer';

import { Notice, NoticeCategory, TargetAudience } from './types';
import { Language, translations } from './i18n/translations';
import { 
  initialNotices, 
  mockTopPerformers, 
  mockCalendarEvents, 
  mockGalleryAlbums, 
  mockDocuments 
} from './data/mockData';

export default function App() {
  // Locale State
  const [lang, setLang] = useState<Language>('np'); // Default Nepali for school context

  // Network Offline Status
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Core Data
  const [notices, setNotices] = useState<Notice[]>(initialNotices);
  const [loadingNotices, setLoadingNotices] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NoticeCategory | 'all'>('all');
  const [selectedAudience, setSelectedAudience] = useState<TargetAudience>('all');
  const [activeSection, setActiveSection] = useState('notices');

  // Modals
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [selectedPdfTitle, setSelectedPdfTitle] = useState<string>('');
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [pushPromptOpen, setPushPromptOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);

  // Service Worker Registration for PWA & Offline
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('Suryodaya PWA Service Worker registered successfully:', reg.scope);
        })
        .catch((err) => {
          console.warn('PWA Service Worker registration soft warning:', err);
        });
    }

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check Notification status
    if ('Notification' in window && Notification.permission === 'granted') {
      setPushEnabled(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch Notices from API Endpoint
  const fetchNotices = async () => {
    setLoadingNotices(true);
    try {
      const res = await fetch('/api/notices');
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        setNotices(data.data);
      }
    } catch (e) {
      console.log('Serving local/cached notices');
    } finally {
      setLoadingNotices(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // Handle URL Deep-Linking for single notice detail view (?noticeId=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const noticeId = params.get('noticeId');
    if (noticeId && notices.length > 0) {
      const match = notices.find(n => n.id === noticeId);
      if (match) {
        setSelectedNotice(match);
        handleRecordView(match.id);
      }
    }
  }, [notices]);

  // Record notice view
  const handleRecordView = (id: string) => {
    fetch(`/api/notices?viewId=${id}`).catch(() => {});
  };

  // Filter Notices
  const filteredNotices = notices.filter((n) => {
    if (selectedCategory !== 'all' && n.category !== selectedCategory) {
      return false;
    }
    if (selectedAudience !== 'all' && n.targetAudience !== 'all' && n.targetAudience !== selectedAudience) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const title = (n.title_en + ' ' + n.title_np).toLowerCase();
      const content = (n.content_en + ' ' + n.content_np).toLowerCase();
      return title.includes(q) || content.includes(q) || n.category.includes(q);
    }
    return true;
  });

  const urgentNotices = notices.filter(n => n.isUrgent || n.isPinned);

  const t = translations[lang];

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Offline Banner */}
      <OfflineBanner isOffline={isOffline} lang={lang} />

      {/* Main Header */}
      <Header
        lang={lang}
        onToggleLang={() => setLang(l => l === 'en' ? 'np' : 'en')}
        onOpenEmergency={() => setEmergencyOpen(true)}
        onOpenCalendar={() => setCalendarOpen(true)}
        onOpenPushPrompt={() => setPushPromptOpen(true)}
        onOpenAdmin={() => setAdminOpen(true)}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        pushEnabled={pushEnabled}
        isOffline={isOffline}
      />

      {/* Main Body Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Top Hero Announcement Banner Slider */}
        <HeroBanner
          lang={lang}
          urgentNotices={urgentNotices}
          onSelectNotice={(notice) => setSelectedNotice(notice)}
          onOpenCalendar={() => setCalendarOpen(true)}
          onSelectTab={(tab) => setActiveSection(tab)}
        />

        {/* Dynamic Navigation View Tabs */}
        {activeSection === 'notices' && (
          <div className="space-y-6">
            {/* Search & Filter Bar */}
            <FilterBar
              lang={lang}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedAudience={selectedAudience}
              setSelectedAudience={setSelectedAudience}
              resultsCount={filteredNotices.length}
            />

            {/* Live Feed Cards Grid */}
            {filteredNotices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNotices.map((notice) => (
                  <NoticeCard
                    key={notice.id}
                    notice={notice}
                    lang={lang}
                    onSelectNotice={(n) => setSelectedNotice(n)}
                    onOpenPdf={(url, title) => {
                      setSelectedPdfUrl(url);
                      setSelectedPdfTitle(title);
                    }}
                    onRecordView={handleRecordView}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3 max-w-lg mx-auto my-8">
                <p className="text-lg font-bold text-slate-800">{t.noNoticesFound}</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedAudience('all');
                  }}
                  className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Top Achievers Section View */}
        {(activeSection === 'topPerformers' || activeSection === 'notices') && (
          <TopPerformersSection topPerformers={mockTopPerformers} lang={lang} />
        )}

        {/* Media Gallery Section View */}
        {(activeSection === 'gallery' || activeSection === 'notices') && (
          <MediaGallerySection albums={mockGalleryAlbums} lang={lang} />
        )}

        {/* Document Resources Downloads View */}
        {(activeSection === 'documents' || activeSection === 'notices') && (
          <DocumentResourcesSection
            documents={mockDocuments}
            lang={lang}
            onOpenPdf={(url, title) => {
              setSelectedPdfUrl(url);
              setSelectedPdfTitle(title);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        lang={lang}
        onOpenEmergency={() => setEmergencyOpen(true)}
        onOpenCalendar={() => setCalendarOpen(true)}
        onOpenAdmin={() => setAdminOpen(true)}
      />

      {/* MODALS */}

      {/* Notice Detail Modal */}
      <NoticeDetailModal
        notice={selectedNotice}
        lang={lang}
        onClose={() => setSelectedNotice(null)}
        onOpenPdf={(url, title) => {
          setSelectedPdfUrl(url);
          setSelectedPdfTitle(title);
        }}
      />

      {/* Printable PDF Preview Modal */}
      <PdfPreviewModal
        pdfUrl={selectedPdfUrl}
        pdfTitle={selectedPdfTitle}
        lang={lang}
        onClose={() => setSelectedPdfUrl(null)}
      />

      {/* Academic Calendar Modal */}
      {calendarOpen && (
        <AcademicCalendarModal
          events={mockCalendarEvents}
          lang={lang}
          onClose={() => setCalendarOpen(false)}
        />
      )}

      {/* Emergency Contacts Modal */}
      {emergencyOpen && (
        <EmergencyContactsModal
          lang={lang}
          onClose={() => setEmergencyOpen(false)}
        />
      )}

      {/* Push Notification Permission Modal */}
      {pushPromptOpen && (
        <PushNotificationModal
          lang={lang}
          onClose={() => setPushPromptOpen(false)}
          onSubscribed={() => setPushEnabled(true)}
        />
      )}

      {/* Password Protected Admin Dashboard Modal */}
      {adminOpen && (
        <AdminDashboardModal
          lang={lang}
          onClose={() => setAdminOpen(false)}
          notices={notices}
          onNoticeCreated={fetchNotices}
          onNoticeDeleted={fetchNotices}
        />
      )}
    </div>
  );
}
