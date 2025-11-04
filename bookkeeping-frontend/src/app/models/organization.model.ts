export interface Organization {
  id: string;
  name: string;
  countryCode: string;
  defaultCurrency: string;
  defaultTimezone: string;
  fiscalYearStart: number;
  fiscalYearEnd: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface FiscalPeriod {
  id: string;
  organizationId: string;
  periodName: string;
  startDate: Date;
  endDate: Date;
  fiscalYear: number;
  isClosed: boolean;
  closedAt?: Date;
  closedBy?: string;
  createdAt: Date;
}

