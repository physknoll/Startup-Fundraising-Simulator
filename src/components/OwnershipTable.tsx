import React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { OwnershipStage } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

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

  // Get all unique investor names for rows, maintaining a preferred order
  const allInvestorNames = Array.from(
    new Set(ownershipStages.flatMap(stage => stage.shares.map(share => share.name)))
  );
  const preferredOrder = ['Founders', 'ESOP'];
  allInvestorNames.sort((a, b) => {
    const idxA = preferredOrder.indexOf(a);
    const idxB = preferredOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    if (a.includes('Investors') && !b.includes('Investors')) return 1;
    if (!a.includes('Investors') && b.includes('Investors')) return -1;
    return a.localeCompare(b);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ownership & Dilution Summary</CardTitle>
        <CardDescription>
          Percentage ownership by each shareholder group at each funding stage.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-card z-10 px-1 py-2 text-xs sm:text-sm sm:px-2 whitespace-nowrap w-[150px] min-w-[120px]">
                  Investor Group
                </TableHead>
                {ownershipStages.map(stage => (
                  <TableHead 
                    key={stage.stageName} 
                    className="text-right px-1 py-2 text-xs sm:text-sm sm:px-2 whitespace-nowrap min-w-[100px]"
                  >
                    {stage.stageName}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {allInvestorNames.map(investorName => (
                <TableRow key={investorName}>
                  <TableCell className="font-medium sticky left-0 bg-card z-10 px-1 py-2 text-xs sm:text-sm sm:px-2 whitespace-nowrap w-[150px] min-w-[120px]">
                    {investorName}
                  </TableCell>
                  {ownershipStages.map(stage => {
                    const share = stage.shares.find(s => s.name === investorName);
                    return (
                      <TableCell 
                        key={`${stage.stageName}-${investorName}`} 
                        className="text-right px-1 py-2 text-xs sm:text-sm sm:px-2 whitespace-nowrap min-w-[100px]"
                      >
                        {formatPercentage(share ? share.percentage : 0)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}; 