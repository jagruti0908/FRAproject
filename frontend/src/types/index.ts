export interface Claim {
  id: string;
  type: 'IFR' | 'CR' | 'CFR';
  status: 'Pending' | 'Verified' | 'Approved' | 'Rejected';
  applicantName: string;
  village: string;
  state: string;
  submissionDate: string;
  area: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface DashboardStats {
  totalClaims: number;
  verifiedClaims: number;
  pendingClaims: number;
  titlesGranted: number;
}

export interface MapLayer {
  id: string;
  name: string;
  visible: boolean;
  color: string;
}

export interface ChartData {
  labels: string[];
  values: number[];
}