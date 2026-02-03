export interface SalesRecord {
  source: string;
  leads: number;
  successful: number;
  efficiency: number;
  revenue: number;
  avgCheck: number;
}

export interface KPIMetrics {
  totalRevenue: number;
  totalLeads: number;
  totalSuccessful: number;
  avgEfficiency: number;
  avgCheckGlobal: number;
}

export enum ChartType {
  REVENUE = 'REVENUE',
  CONVERSION = 'CONVERSION',
  SCATTER = 'SCATTER'
}

export type Language = 'ru' | 'en';