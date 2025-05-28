import React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { CalculatedRound } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RevenueGrowthTableProps {
  calculatedRounds: CalculatedRound[];
  acv: number;
  onAcvChange: (newAcv: number) => void;
  // Props for multi-plan ACV later
  // planAMonthlyPrice: number;
  // planBMonthlyPrice: number;
  // percentPlanA: number;
  // onPlanChange: (field: string, value: number) => void;
}

const formatCurrency = (value: number | null | undefined, defaultValue: string = 'N/A') => {
  if (value === null || value === undefined) return defaultValue;
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const formatMultiple = (value: number | null | undefined) => {
  if (value === null || value === undefined) return 'N/A';
  return `${value.toFixed(1)}x`;
};

const formatPercentage = (value: number | null | undefined) => {
  if (value === null || value === undefined || !isFinite(value)) return 'N/A';
  return `${(value * 100).toFixed(1)}%`;
};

const formatNumber = (value: number | null | undefined, defaultValue: string = 'N/A') => {
    if (value === null || value === undefined || !isFinite(value)) return defaultValue;
    return value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

interface RevenueMetric extends CalculatedRound {
  addedARR: number | null;
  growthRate: number | null;
  growthFactor: number | null;
  customersNeeded: number | null;
  customersToAdd: number | null;
}

export const RevenueGrowthTable: React.FC<RevenueGrowthTableProps> = ({ calculatedRounds, acv, onAcvChange }) => {
  if (!calculatedRounds) {
    return <p>No revenue data to display.</p>;
  }

  let previousARR = 0;
  const revenueMetrics: RevenueMetric[] = calculatedRounds.map(round => {
    // Skip ARR calculations for Pre-Seed if its requiredARR is null (typical)
    // and for Exit round if its requiredARR is also meant to be excluded from growth path metrics.
    // For this table, we generally want to show ARR for all funding rounds and potentially the target ARR for exit.

    const currentARR = round.requiredARR;
    let addedARR: number | null = null;
    let growthRate: number | null = null;
    let growthFactor: number | null = null;
    let customersNeeded: number | null = null;
    let customersToAdd: number | null = null;

    if (currentARR !== null) {
      addedARR = currentARR - previousARR;
      if (previousARR > 0) { // Avoid division by zero for growth rate/factor
        growthRate = addedARR / previousARR;
        growthFactor = currentARR / previousARR;
      }
      if (acv > 0) {
        customersNeeded = currentARR / acv;
        if (addedARR !== null) {
            customersToAdd = addedARR / acv;
        }
      }
    }
    
    const metrics: RevenueMetric = {
      ...round,
      addedARR,
      growthRate,
      growthFactor,
      customersNeeded,
      customersToAdd
    };

    // Update previousARR for the next iteration, only if currentARR is valid
    if (currentARR !== null) {
        previousARR = currentARR;
    }

    return metrics;
  });

  return (
    <div className="space-y-4">
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:space-x-2 p-3 sm:p-4 border rounded-md bg-muted/50 mb-4">
            <Label htmlFor="acvInput" className="text-sm font-medium whitespace-nowrap shrink-0">Annual Contract Value (ACV):</Label>
            <Input 
                type="number"
                id="acvInput"
                value={acv}
                onChange={(e) => onAcvChange(Number(e.target.value))}
                className="w-full sm:w-32"
                placeholder="e.g., 50000"
            />
        </div>
        <Table>
        <TableHeader>
            <TableRow>
            <TableHead className="w-[120px]">Round</TableHead>
            <TableHead className="text-right">Pre-Money ($)</TableHead>
            <TableHead className="text-right">ARR Multiple (x)</TableHead>
            <TableHead className="text-right">Required ARR ($)</TableHead>
            <TableHead className="text-right">Added ARR ($)</TableHead>
            <TableHead className="text-right">Growth Rate (%)</TableHead>
            <TableHead className="text-right">Growth Factor (x)</TableHead>
            <TableHead className="text-right">Customers Needed</TableHead>
            <TableHead className="text-right">Customers to Add</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {revenueMetrics.map((metric, index) => (
            // Do not show Pre-Seed if its requiredARR is null, or Exit if it shouldn't show growth metrics
            // However, the plan implies showing all rounds. Let's show all.
            <TableRow key={`${metric.name}-${index}`}>
                <TableCell className="font-medium">{metric.name}</TableCell>
                <TableCell className="text-right">{formatCurrency(metric.preMoneyValuation)}</TableCell>
                <TableCell className="text-right">{metric.arrMultiple === null ? 'N/A' : formatMultiple(metric.arrMultiple)}</TableCell>
                <TableCell className="text-right">{formatCurrency(metric.requiredARR)}</TableCell>
                <TableCell className="text-right">{metric.name === 'Pre-Seed' && metric.requiredARR === null ? 'N/A' : formatCurrency(metric.addedARR)}</TableCell>
                <TableCell className="text-right">{metric.name === 'Pre-Seed' && metric.requiredARR === null ? 'N/A' : formatPercentage(metric.growthRate)}</TableCell>
                <TableCell className="text-right">{metric.name === 'Pre-Seed' && metric.requiredARR === null ? 'N/A' : formatMultiple(metric.growthFactor)}</TableCell>
                <TableCell className="text-right">{acv > 0 ? formatNumber(metric.customersNeeded) : 'N/A (Set ACV)'}</TableCell>
                <TableCell className="text-right">{acv > 0 && !(metric.name === 'Pre-Seed' && metric.requiredARR === null) ? formatNumber(metric.customersToAdd) : 'N/A'}</TableCell>
            </TableRow>
            ))}
        </TableBody>
        </Table>
    </div>
  );
}; 