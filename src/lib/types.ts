export type Currency = 'USD'; // Default to USD, can extend later

export interface RoundInput {
  name: string;
  roundSize: number | null;
  preMoneyValuation: number | null;
  dilutionPercent: number | null;
  arrMultiple: number | null;
  requiredARR: number | null;
  postMoneyValuation: number | null;
  isEnabled: boolean; // Added to enable/disable rounds
  roundType?: 'SAFE' | 'Priced'; // For Pre-Seed/Seed
  valuationCap?: number | null;   // For SAFE
  discountRate?: number | null;   // For SAFE (e.g., 20 for 20%)
  lpType?: 'NonParticipating' | 'Participating' | null; // Liquidation Preference Type
  lpMultiple?: number | null; // Liquidation Preference Multiple (e.g., 1 for 1x)

  // New Advanced Terms for Priced Rounds
  proRataRights?: boolean | null;
  antiDilution?: 'None' | 'BroadBasedWA' | 'FullRatchet' | null;
  optionPoolPercent?: number | null; // Percentage of post-money fully diluted for new pool or top-up
  investorBoardSeats?: number | null;
  protectiveProvisions?: boolean | null; // New
  dragAlongRights?: boolean | null;    // New

  // For Exit round, roundSize might be 0, arrMultiple applies to Exit Valuation
}

export interface CalculatedRound extends RoundInput {
  preMoneyValuation: number | null;
  postMoneyValuation: number | null;
  requiredARR: number | null; // n.a. for Pre-Seed, relevant for Exit Valuation
}

export interface InvestorShare {
  name: string; // e.g., "Founders", "Pre-Seed Investors", "ESOP"
  percentage: number;
  valueAtExit: number;
  investedAmount?: number; // Optional, for calculating multiples
  returnMultiple?: number; // Optional
}

export interface OwnershipStage {
  stageName: string; // "Pre-Seed", "Seed", ..., "Exit"
  shares: InvestorShare[];
}

export interface CalculationResult {
  calculatedRounds: CalculatedRound[];
  ownershipStages: OwnershipStage[];
  summaryMetrics: SummaryMetrics;
}

export interface SummaryMetrics {
  totalFundsRaised: number;
  finalFounderOwnership: number;
  finalEsopOwnership: number;
  exitValuation: number;
}

// ... other types for Revenue Growth, Investor Returns tables 