export type Role = 'citizen' | 'responder' | 'admin' | 'admin_police' | 'admin_hospital' | 'admin_fire' | 'police' | 'hospital' | 'fire';
export type ServiceType = 'police' | 'hospital' | 'fire' | 'admin';

export type AlertType = 'medical' | 'fire' | 'accident' | 'violence' | 'flood' | 'other';
export type AlertStatus = 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'cancelled';
export type AlertPriority = 'low' | 'medium' | 'high' | 'critical';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: Role;
  avatar?: string;
  createdAt: string;
  isActive: boolean;
  region?: string;
  facilityId?: string;
  facilityName?: string;
}

export interface Location {
  lat: number;
  lng: number;
  address: string;
  city: string;
}

export interface Alert {
  id: string;
  type: AlertType;
  status: AlertStatus;
  priority: AlertPriority;
  title: string;
  description: string;
  location: Location;
  createdAt: string;
  updatedAt: string;
  citizen: User;
  responder?: User;
  service: ServiceType;
  images?: string[];
  notes?: string;
}

export interface Stats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  avgResponseTime: number;
  byType: Record<AlertType, number>;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface Facility {
  id: string;
  name: string;
  type: 'hospital' | 'police' | 'fire';
  address: string;
  city: string;
  phone?: string;
  lat: number;
  lng: number;
  isActive: boolean;
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export type BroadcastCategory = 'info' | 'warning' | 'danger';

export interface Broadcast {
  id: string;
  title: string;
  message: string;
  category: BroadcastCategory;
  authorId: string;
  authorName: string;
  authorRole: Role | string;
  authorService: ServiceType | null;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}
