import { User, Alert, Facility } from '../types';

export const normalizeUser = (u: any): User => {
  // Handle unpopulated ObjectId ref (string or object without firstName)
  if (!u || typeof u === 'string' || !u.firstName) {
    return {
      id: u?._id?.toString() || u?.id?.toString() || String(u || ''),
      firstName: '', lastName: '', email: '', phone: '',
      role: 'citizen', isActive: true, createdAt: '',
    };
  }
  return {
    id: u._id?.toString() || u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email || '',
    phone: u.phone || '',
    role: u.role,
    isActive: u.isActive,
    createdAt: u.createdAt,
    region: u.region,
    avatar: u.avatar,
    facilityId: u.facility?._id?.toString() || (typeof u.facility === 'string' ? u.facility : undefined),
    facilityName: u.facilityName || undefined,
  };
};

export const normalizeAlert = (a: any): Alert => ({
  id: a._id || a.id,
  type: a.type,
  status: a.status,
  priority: a.priority,
  title: a.title,
  description: a.description,
  service: a.service,
  location: {
    lat: a.location?.lat ?? 9.537,
    lng: a.location?.lng ?? -13.6773,
    address: a.location?.address || '',
    city: a.location?.city || 'Conakry',
  },
  citizen: a.citizen ? normalizeUser(a.citizen) : ({} as User),
  responder: a.responder ? normalizeUser(a.responder) : undefined,
  notes: a.notes || undefined,
  createdAt: a.createdAt,
  updatedAt: a.updatedAt,
});

export const normalizeFacility = (f: any): Facility => ({
  id: f._id || f.id,
  name: f.name,
  type: f.type,
  address: f.address,
  city: f.city || 'Conakry',
  phone: f.phone || undefined,
  lat: f.lat,
  lng: f.lng,
  isActive: f.isActive ?? true,
});
