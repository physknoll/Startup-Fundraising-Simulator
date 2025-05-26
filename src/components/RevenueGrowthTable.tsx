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
import { Input } from "@/components/ui/input"; // For ACV input
import { Label } from "@/components/ui/label"; // For ACV input label
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { InfoTip } from "@/components/InfoTip";

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
  if (!calculatedRounds || calculatedRounds.length === 0) {
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
    <Card>
      <CardHeader>
        <CardTitle>Revenue Growth & Valuation Metrics</CardTitle>
        <CardDescription>
          Projected revenue growth and key valuation metrics at each funding stage.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-3 sm:p-4 border rounded-lg bg-muted/30">
          <div className="flex flex-col items-start space-y-2 sm:flex-row sm:items-center sm:space-x-2 sm:space-y-0">
            <Label htmlFor="acvInput" className="text-sm font-medium w-full sm:w-auto">
              Average Contract Value (ACV):
            </Label>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-sm text-muted-foreground">$</span>
              <Input
                id="acvInput"
                type="number"
                value={acv}
                onChange={(e) => onAcvChange(Number(e.target.value))}
                className="w-full sm:w-[120px] text-sm"
                placeholder="e.g., 50000"
                min="0"
              />
              <InfoTip tipData={{ title: "ACV", explanation: "Average Annual Contract Value per customer. Used to estimate the number of customers needed to reach ARR targets." }} />
            </div>
          </div>
        </div>

        <Table>
          <TableHeader className="hidden md:table-header-group">
            <TableRow>
              <TableHead className="w-[15%]">Round</TableHead>
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
              <React.Fragment key={`${metric.name}-${index}`}>
                {/* Mobile Card View */}
                <div className={`block md:hidden border-b border-border p-4 space-y-3 mb-4 rounded-lg bg-card ${!metric.isEnabled ? "opacity-50" : ""}`}>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-lg text-primary">{metric.name}</h3>
                    {/* Optional: Add a toggle or indicator if the round is disabled, though revenue table might always show enabled rounds */}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Pre-Money:</p>
                      <p>{formatCurrency(metric.preMoneyValuation)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Post-Money:</p>
                      <p>{formatCurrency(metric.postMoneyValuation)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Round Size:</p>
                      <p>{formatCurrency(metric.roundSize)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Dilution:</p>
                      <p>{formatPercentage(metric.dilutionPercent)}</p>
                    </div>
                     <div>
                      <p className="text-xs text-muted-foreground">ARR Multiple:</p>
                      <p>{formatMultiple(metric.arrMultiple)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Required ARR:</p>
                      <p>{formatCurrency(metric.requiredARR)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Added ARR:</p>
                      <p>{formatCurrency(metric.addedARR)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Growth Rate:</p>
                      <p>{formatPercentage(metric.growthRate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Customers for ARR:</p>
                      <p>{formatNumber(metric.customersNeeded)}</p>
                    </div>
                  </div>
                </div>

                {/* Desktop TableRow */}
                <TableRow className={`hidden md:table-row ${!metric.isEnabled ? "opacity-50" : ""}`}>
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
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}; 