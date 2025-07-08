export interface LicensePlate {
  id: string;
  plate_number: string;
  confidence: number;
  image_url: string;
  detected_at: string;
  camera_id: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  vehicle_info?: {
    make?: string;
    model?: string;
    color?: string;
    type?: string;
  };
  status: 'pending' | 'verified' | 'flagged';
  created_at: string;
  updated_at: string;
}

export interface RegisteredPlate {
  id: string;
  plate_number: string;
  owner_name: string;
  owner_phone: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_color?: string;
  registration_date: string;
  expiry_date?: string;
  status: 'active' | 'inactive' | 'suspended';
  alert_enabled: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Camera {
  id: string;
  name: string;
  location: string;
  ip_address: string;
  port: number;
  username?: string;
  password?: string;
  stream_url: string;
  status: 'online' | 'offline' | 'maintenance';
  last_heartbeat: string;
  settings: {
    resolution: string;
    fps: number;
    detection_zone?: {
      x: number;
      y: number;
      width: number;
      height: number;
    }[];
  };
  created_at: string;
  updated_at: string;
}

export interface Detection {
  id: string;
  camera_id: string;
  plate_id: string;
  registered_plate_id?: string;
  confidence: number;
  bounding_box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  processing_time: number;
  notification_sent: boolean;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
  name: string;
  phone?: string;
  permissions: string[];
  last_login: string;
  created_at: string;
  updated_at: string;
}

export interface SystemStats {
  total_detections: number;
  total_registered_plates: number;
  active_cameras: number;
  detections_today: number;
  accuracy_rate: number;
  avg_processing_time: number;
  system_uptime: number;
}

export interface NotificationLog {
  id: string;
  detection_id: string;
  phone_number: string;
  message: string;
  status: 'sent' | 'failed' | 'pending';
  provider: 'twilio' | 'aws_sns';
  sent_at?: string;
  error_message?: string;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}