import React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { OwnershipStage, InvestorShare } from "@/lib/types";

interface OwnershipTableProps {
  ownershipStages: OwnershipStage[];
}

const formatPercentage = (value: number | null | undefined) => {
  if (value === null || value === undefined) return 'N/A';
  return `${value.toFixed(2)}%`;
};

export const OwnershipTable: React.FC<OwnershipTableProps> = ({ ownershipStages }) => {
  if (!ownershipStages || ownershipStages.length === 0) {
    return <p>No ownership data to display.</p>;
  }

  // Get all unique investor names for columns, maintaining a preferred order
  const allInvestorNames = Array.from(
    new Set(ownershipStages.flatMap(stage => stage.shares.map(share => share.name)))
  );
  const preferredOrder = ['Founders', 'ESOP'];
  allInvestorNames.sort((a, b) => {
    const idxA = preferredOrder.indexOf(a);
    const idxB = preferredOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB; // Sort by preferred order if both are in it
    if (idxA !== -1) return -1; // Keep preferred items at the start
    if (idxB !== -1) return 1;  // Keep preferred items at the start
    if (a.includes('Investors') && !b.includes('Investors')) return 1; // Push general investors later
    if (!a.includes('Investors') && b.includes('Investors')) return -1;
    return a.localeCompare(b); // Alphabetical for others
  });


  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[150px]">Investor Group</TableHead>
          {ownershipStages.map(stage => (
            <TableHead key={stage.stageName} className="text-right">{stage.stageName}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {allInvestorNames.map(investorName => (
          <TableRow key={investorName}>
            <TableCell className="font-medium">{investorName}</TableCell>
            {ownershipStages.map(stage => {
              const share = stage.shares.find(s => s.name === investorName);
              return (
                <TableCell key={`${stage.stageName}-${investorName}`} className="text-right">
                  {formatPercentage(share ? share.percentage : 0)}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}; 