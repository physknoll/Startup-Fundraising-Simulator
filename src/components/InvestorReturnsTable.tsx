import React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { OwnershipStage, InvestorShare, CalculatedRound } from "@/lib/types";

interface InvestorReturnsTableProps {
  ownershipStages: OwnershipStage[];
  calculatedRounds: CalculatedRound[]; // Needed for Exit Valuation
}

const formatCurrency = (value: number | null | undefined, defaultValue: string = 'N/A') => {
  if (value === null || value === undefined || isNaN(value)) return defaultValue;
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const formatPercentage = (value: number | null | undefined, defaultValue: string = 'N/A') => {
  if (value === null || value === undefined || isNaN(value)) return defaultValue;
  return `${value.toFixed(2)}%`;
};

const formatMultiple = (value: number | null | undefined, defaultValue: string = 'N/A') => {
  if (value === null || value === undefined || !isFinite(value)) return defaultValue;
  if (value === Infinity) return '∞';
  return `${value.toFixed(1)}x`;
};

interface InvestorReturnSummary extends InvestorShare {
    // investedAmount is already in InvestorShare
    // valueAtExit is already in InvestorShare
    // returnMultiple is already in InvestorShare
    // We might want to add ownership at specific key stages if needed for this table explicitly
    // For now, assuming `InvestorShare` from the *final exit stage* contains all necessary info.
}

export const InvestorReturnsTable: React.FC<InvestorReturnsTableProps> = ({ ownershipStages, calculatedRounds }) => {
  if (!ownershipStages || ownershipStages.length === 0 || !calculatedRounds || calculatedRounds.length === 0) {
    return <p>No investor return data to display.</p>;
  }

  const exitStage = ownershipStages.find(stage => stage.stageName === 'Exit');
  const exitValuationRound = calculatedRounds.find(r => r.name === 'Exit');

  if (!exitStage || !exitValuationRound) {
    return <p>Exit data not available for calculating returns.</p>;
  }

  // Use the shares from the exit stage as they should have final calculations
  const investorSummaries: InvestorReturnSummary[] = exitStage.shares.map(share => ({
    ...share,
    // Ensure investedAmount is a number for display; it might be undefined if not set (e.g. for Founders initially)
    investedAmount: share.investedAmount ?? 0 
  }));

  // Sort for display: Founders, ESOP, then others
  investorSummaries.sort((a, b) => {
    if (a.name === 'Founders') return -1;
    if (b.name === 'Founders') return 1;
    if (a.name === 'ESOP') return -1;
    if (b.name === 'ESOP') return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">Investor Group</TableHead>
          <TableHead className="text-right">Invested ($)</TableHead>
          {/* It might be useful to show ownership % at key stages, e.g., after Series A, before Exit */}
          {/* For simplicity, the plan asks for Exit %, which is already used for Exit Value */}
          <TableHead className="text-right">Exit Ownership (%)</TableHead>
          <TableHead className="text-right">Exit Value ($)</TableHead>
          <TableHead className="text-right">Return Multiple (x)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {investorSummaries.map(summary => (
          <TableRow key={summary.name}>
            <TableCell className="font-medium">{summary.name}</TableCell>
            <TableCell className="text-right">
              {summary.name === 'Founders' && (summary.investedAmount === null || summary.investedAmount === 0) 
                ? 'N/A' 
                : formatCurrency(summary.investedAmount)}
            </TableCell>
            <TableCell className="text-right">{formatPercentage(summary.percentage)}</TableCell>
            <TableCell className="text-right">{formatCurrency(summary.valueAtExit)}</TableCell>
            <TableCell className="text-right">
                { (summary.investedAmount === 0 && summary.valueAtExit > 0) ? '∞' : formatMultiple(summary.returnMultiple) }
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}; 