import { Claim, DashboardStats, ChartData } from '../types';

export const dashboardStats: DashboardStats = {
  totalClaims: 12450,
  verifiedClaims: 8920,
  pendingClaims: 3530,
  titlesGranted: 6700,
};

export const sampleClaims: Claim[] = [
  {
    id: 'FRA-2024-0001',
    type: 'IFR',
    status: 'Verified',
    applicantName: 'Ramesh Kumar',
    village: 'Kanhargaon',
    state: 'Madhya Pradesh',
    submissionDate: '2024-01-15',
    area: 2.5,
    coordinates: { lat: 22.9734, lng: 78.6569 },
  },
  {
    id: 'FRA-2024-0002',
    type: 'CR',
    status: 'Pending',
    applicantName: 'Sunita Devi',
    village: 'Baripada',
    state: 'Odisha',
    submissionDate: '2024-02-03',
    area: 1.8,
    coordinates: { lat: 21.9347, lng: 86.7750 },
  },
  {
    id: 'FRA-2024-0003',
    type: 'CFR',
    status: 'Approved',
    applicantName: 'Tribhuvan Singh',
    village: 'Agartala',
    state: 'Tripura',
    submissionDate: '2024-01-28',
    area: 3.2,
    coordinates: { lat: 23.8315, lng: 91.2868 },
  },
  {
    id: 'FRA-2024-0004',
    type: 'IFR',
    status: 'Verified',
    applicantName: 'Lakshmi Naidu',
    village: 'Warangal',
    state: 'Telangana',
    submissionDate: '2024-02-10',
    area: 2.1,
    coordinates: { lat: 17.9689, lng: 79.5937 },
  },
  {
    id: 'FRA-2024-0005',
    type: 'CR',
    status: 'Pending',
    applicantName: 'Gopal Rao',
    village: 'Bhadrachalam',
    state: 'Telangana',
    submissionDate: '2024-02-18',
    area: 1.5,
    coordinates: { lat: 17.6688, lng: 80.8936 },
  },
];

export const claimDistributionData: ChartData = {
  labels: ['Individual Forest Rights (IFR)', 'Community Rights (CR)', 'Community Forest Rights (CFR)'],
  values: [5200, 3800, 3450],
};

export const yearlyProgressData: ChartData = {
  labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
  values: [1200, 1800, 2400, 3100, 2900, 1950],
};

export const stateWiseData = {
  'Madhya Pradesh': 3200,
  'Odisha': 2800,
  'Tripura': 1900,
  'Telangana': 2100,
  'Chhattisgarh': 2450,
};