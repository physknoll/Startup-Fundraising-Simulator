import React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalculatedRound, OwnershipStage } from "@/lib/types";

interface SummaryViewProps {
  calculatedRounds: CalculatedRound[];
  ownershipStages: OwnershipStage[];
  esopPercentage: number;
}

const formatCurrency = (value: number | null | undefined, defaultValue: string = 'N/A') => {
  if (value === null || value === undefined || isNaN(value)) return defaultValue;
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const formatPercentage = (value: number | null | undefined, defaultValue: string = 'N/A') => {
  if (value === null || value === undefined || isNaN(value)) return defaultValue;
  return `${value.toFixed(2)}%`;
};

export const SummaryView: React.FC<SummaryViewProps> = ({ calculatedRounds, ownershipStages, esopPercentage }) => {
  if (!calculatedRounds || calculatedRounds.length === 0 || !ownershipStages || ownershipStages.length === 0) {
    return <p>No summary data to display.</p>;
  }

  const exitRound = calculatedRounds.find(r => r.name === 'Exit');
  const exitStage = ownershipStages.find(s => s.stageName === 'Exit');
  const foundersExitShare = exitStage?.shares.find(sh => sh.name === 'Founders');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Key Metrics at Exit</CardTitle>
          <CardDescription>
            Summary of the simulation based on the provided inputs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:justify-between">
            <span className="text-muted-foreground text-sm">Target Exit Valuation:</span>
            <span className="font-semibold text-sm sm:text-base">{formatCurrency(exitRound?.roundSize)}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between">
            <span className="text-muted-foreground text-sm">Founders&apos; Ownership at Exit:</span>
            <span className="font-semibold text-sm sm:text-base">{formatPercentage(foundersExitShare?.percentage)}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between">
            <span className="text-muted-foreground text-sm">Founders&apos; Value at Exit:</span>
            <span className="font-semibold text-sm sm:text-base">{formatCurrency(foundersExitShare?.valueAtExit)}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between">
            <span className="text-muted-foreground text-sm">Total ESOP at Exit:</span>
            <span className="font-semibold text-sm sm:text-base">{formatPercentage(exitStage?.shares.find(sh => sh.name === 'ESOP')?.percentage)}</span>
          </div>
           <div className="flex flex-col sm:flex-row sm:justify-between">
            <span className="text-muted-foreground text-sm">Effective ESOP Rate (applied pre-round):</span>
            <span className="font-semibold text-sm sm:text-base">{esopPercentage}%</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Round Summary</CardTitle>
          <CardDescription>Overview of each fundraising round and key valuations.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead className="w-auto sm:w-[150px] px-1 py-2 sm:px-2">Round</TableHead>
                <TableHead className="text-right px-1 py-2 sm:px-2">Pre-Money ($)</TableHead>
                <TableHead className="text-right px-1 py-2 sm:px-2">Round Size ($)</TableHead>
                <TableHead className="text-right px-1 py-2 sm:px-2">Post-Money ($)</TableHead>
                <TableHead className="text-right px-1 py-2 sm:px-2">Dilution (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calculatedRounds.filter(r => r.name !== 'Exit').map(round => (
                <TableRow key={round.name}>
                  <TableCell className="font-medium px-1 py-2 sm:px-2">{round.name}</TableCell>
                  <TableCell className="text-right px-1 py-2 sm:px-2">{formatCurrency(round.preMoneyValuation)}</TableCell>
                  <TableCell className="text-right px-1 py-2 sm:px-2">{formatCurrency(round.roundSize)}</TableCell>
                  <TableCell className="text-right px-1 py-2 sm:px-2">{formatCurrency(round.postMoneyValuation)}</TableCell>
                  <TableCell className="text-right px-1 py-2 sm:px-2">{formatPercentage(round.dilutionPercent, 'N/A')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}; 