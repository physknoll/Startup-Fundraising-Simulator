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
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

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

type InvestorReturnSummary = InvestorShare;

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
    <Card>
      <CardHeader>
        <CardTitle>Investor Returns & Multiples</CardTitle>
        <CardDescription>
          Projected returns and multiples for each investor group at exit.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-card z-10 px-1 py-2 text-xs sm:text-sm sm:px-2 whitespace-nowrap w-[150px] min-w-[120px]">
                  Investor / Fund
                </TableHead>
                <TableHead className="text-right px-1 py-2 text-xs sm:text-sm sm:px-2 whitespace-nowrap min-w-[100px]">Invested ($)</TableHead>
                <TableHead className="text-right px-1 py-2 text-xs sm:text-sm sm:px-2 whitespace-nowrap min-w-[100px]">Ownership (%)</TableHead>
                <TableHead className="text-right px-1 py-2 text-xs sm:text-sm sm:px-2 whitespace-nowrap min-w-[100px]">Value at Exit ($)</TableHead>
                <TableHead className="text-right px-1 py-2 text-xs sm:text-sm sm:px-2 whitespace-nowrap min-w-[100px]">Return Multiple (x)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investorSummaries.map((investor) => (
                <TableRow key={investor.name}>
                  <TableCell className="font-medium sticky left-0 bg-card z-10 px-1 py-2 text-xs sm:text-sm sm:px-2 whitespace-nowrap w-[150px] min-w-[120px]">
                    {investor.name}
                  </TableCell>
                  <TableCell className="text-right px-1 py-2 text-xs sm:text-sm sm:px-2 whitespace-nowrap min-w-[100px]">
                    {formatCurrency(investor.investedAmount)}
                  </TableCell>
                  <TableCell className="text-right px-1 py-2 text-xs sm:text-sm sm:px-2 whitespace-nowrap min-w-[100px]">
                    {formatPercentage(investor.percentage)}
                  </TableCell>
                  <TableCell className="text-right px-1 py-2 text-xs sm:text-sm sm:px-2 whitespace-nowrap min-w-[100px]">
                    {formatCurrency(investor.valueAtExit)}
                  </TableCell>
                  <TableCell className="text-right px-1 py-2 text-xs sm:text-sm sm:px-2 whitespace-nowrap min-w-[100px]">
                    {formatMultiple(investor.returnMultiple)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}; 