export interface LossTriangleData {
  accidentYear: number;
  developmentPeriods: number[];
  cumulativePaid: number[];
  cumulativeIncurred: number[];
  claimCount: number;
}

export interface LossTriangle {
  triangleType: 'PAID' | 'INCURRED' | 'CASE_RESERVES';
  data: LossTriangleData[];
  developmentFactors: number[][];
  ultimateLoss: number[];
  reserves: number[];
  metadata: {
    asOfDate: Date;
    currency: string;
    policyType?: string;
    totalYears: number;
    totalPeriods: number;
  };
}

export interface LossDevelopmentFactor {
  fromPeriod: number;
  toPeriod: number;
  factor: number;
  averageMethod: 'SIMPLE' | 'WEIGHTED' | 'GEOMETRIC';
}

export interface ReserveEstimate {
  accidentYear: number;
  paidToDate: number;
  caseReserves: number;
  ibnrReserve: number; // Incurred But Not Reported
  ultimateLoss: number;
  percentDeveloped: number;
}

export interface TriangleVisualizationOptions {
  showCumulative: boolean;
  showIncremental: boolean;
  showFactors: boolean;
  highlightDiagonal: boolean;
  colorScale: 'default' | 'heatmap';
}

