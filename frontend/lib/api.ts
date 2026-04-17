const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface Report {
  id: number;
  latitude: number;
  longitude: number;
  description: string;
  category: 'safety' | 'event' | 'note' | 'weather';
  safety_level: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
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
