const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Report {
  id: number;
  title: string;
  latitude: number;
  longitude: number;
  description: string;
  category: 'safety' | 'event' | 'note' | 'weather' | 'infrastructure' | 'other';
  safety_level: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  likes: number;
  comments: number;
  shares: number;
  verified_count: number;
  created_at: string;
  updated_at: string;
  username: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
}

export async function fetchReports(): Promise<Report[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reports`);
    const result: ApiResponse<Report[]> = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Failed to fetch reports');
    }

    return result.data || [];
  } catch (error) {
    console.error('Error fetching reports:', error);
    return [];
  }
}

export async function fetchReport(id: number): Promise<Report | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reports/${id}`);
    const result: ApiResponse<Report> = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Failed to fetch report');
    }

    return result.data || null;
  } catch (error) {
    console.error('Error fetching report:', error);
    return null;
  }
}

export interface CreateReportData {
  title: string;
  location: string;
  category: 'Safety' | 'Event' | 'Note';
  description: string;
  urgency?: 'Urgent' | 'Warning' | 'Non-urgent';
  latitude?: number;
  longitude?: number;
  user_id?: number;
}

export async function createReport(data: CreateReportData): Promise<Report | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse<Report> = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Failed to create report');
    }

    return result.data || null;
  } catch (error) {
    console.error('Error creating report:', error);
    return null;
  }
}
