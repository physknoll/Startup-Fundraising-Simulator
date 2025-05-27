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
          <div className="flex justify-between">
            <span className="text-muted-foreground">Target Exit Valuation:</span>
            <span className="font-semibold">{formatCurrency(exitRound?.roundSize)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Founders&apos; Ownership at Exit:</span>
            <span className="font-semibold">{formatPercentage(foundersExitShare?.percentage)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Founders&apos; Value at Exit:</span>
            <span className="font-semibold">{formatCurrency(foundersExitShare?.valueAtExit)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total ESOP at Exit:</span>
            <span className="font-semibold">{formatPercentage(exitStage?.shares.find(sh => sh.name === 'ESOP')?.percentage)}</span>
          </div>
           <div className="flex justify-between">
            <span className="text-muted-foreground">Effective ESOP Rate (applied pre-round):</span>
            <span className="font-semibold">{esopPercentage}%</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Round Summary</CardTitle>
          <CardDescription>Overview of each fundraising round and key valuations.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Round</TableHead>
                <TableHead className="text-right">Round Size ($)</TableHead>
                <TableHead className="text-right">Dilution (%)</TableHead>
                <TableHead className="text-right">Post-Money Val. ($)</TableHead>
                <TableHead className="text-right">Required ARR ($)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calculatedRounds.filter(r => r.name !== 'Exit').map(round => (
                <TableRow key={round.name}>
                  <TableCell className="font-medium">{round.name}</TableCell>
                  <TableCell className="text-right">{formatCurrency(round.roundSize)}</TableCell>
                  <TableCell className="text-right">{formatPercentage(round.dilutionPercent)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(round.postMoneyValuation)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(round.requiredARR)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}; 