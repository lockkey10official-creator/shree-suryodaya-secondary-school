export type NoticeCategory = 
  | 'urgent' 
  | 'holidays' 
  | 'results' 
  | 'exams' 
  | 'events' 
  | 'meetings' 
  | 'tuition' 
  | 'routine' 
  | 'general';

export type TargetAudience = 'all' | 'students' | 'parents' | 'teachers';

export interface Attachment {
  id: string;
  title_en: string;
  title_np: string;
  fileType: 'pdf' | 'image' | 'doc';
  fileSize: string;
  url: string;
}

export interface Notice {
  id: string;
  title_en: string;
  title_np: string;
  content_en: string;
  content_np: string;
  category: NoticeCategory;
  targetAudience: TargetAudience;
  isUrgent: boolean;
  isPinned: boolean;
  dateBS: string; // e.g. "२०८१ भदौ २८"
  dateAD: string; // e.g. "2026-09-13"
  author: string;
  attachments?: Attachment[];
  viewsCount: number;
  sharesCount: number;
  isPublished: boolean;
  scheduledDate?: string;
}

export interface StaffRole {
  id: string;
  name: string;
  email: string;
  designation_en: string;
  designation_np: string;
  role: 'principal' | 'vice_principal' | 'teacher' | 'admin_staff';
  canPost: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canBroadcastPush: boolean;
  avatarUrl?: string;
}

export interface TopPerformer {
  id: string;
  studentName_en: string;
  studentName_np: string;
  photoUrl: string;
  gpaOrPercentage: string;
  examTitle_en: string;
  examTitle_np: string;
  rank: number;
  gradeClass: string;
  achievementBadge?: string;
}

export interface AcademicCalendarEvent {
  id: string;
  dateBS: string;
  dateAD: string;
  title_en: string;
  title_np: string;
  type: 'holiday' | 'exam' | 'event' | 'meeting' | 'academic';
  description_en?: string;
  description_np?: string;
  isHoliday: boolean;
}

export interface GalleryAlbum {
  id: string;
  title_en: string;
  title_np: string;
  dateBS: string;
  coverImage: string;
  photosCount: number;
  photos: string[];
  videoUrls?: string[];
  category: string;
}

export interface DocumentItem {
  id: string;
  title_en: string;
  title_np: string;
  category: NoticeCategory;
  fileType: 'pdf' | 'doc' | 'xls';
  fileSize: string;
  downloadCount: number;
  url: string;
  uploadDate: string;
}

export interface AnalyticsStats {
  totalNotices: number;
  totalViews: number;
  pushSubscribersCount: number;
  documentsDownloaded: number;
  categoryDistribution: Record<string, number>;
}
