"use client"; // Required for Recharts components

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { OwnershipStage } from '@/lib/types';

interface OwnershipChartProps {
  ownershipStages: OwnershipStage[];
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
  '#A020F0', '#FF00FF', '#FF6347', '#7FFF00',
  '#D2691E', '#FFD700', '#6495ED', '#DC143C'
];

const getInvestorColor = (name: string, allInvestorNames: string[]) => {
  if (name.toLowerCase().includes('founder')) return COLORS[0];
  if (name.toLowerCase().includes('esop')) return COLORS[1];
  const index = allInvestorNames.filter(n => !n.toLowerCase().includes('founder') && !n.toLowerCase().includes('esop')).indexOf(name);
  return COLORS[(index + 2) % COLORS.length]; // Start colors after founder and ESOP
};

export const OwnershipChart: React.FC<OwnershipChartProps> = ({ ownershipStages }) => {
  if (!ownershipStages || ownershipStages.length === 0) {
    return <p>No ownership data to display.</p>;
  }

  // Transform data for Recharts
  // We need a list of all unique investor names across all stages for consistent coloring and stacking
  const allInvestorNames = Array.from(
    new Set(ownershipStages.flatMap(stage => stage.shares.map(share => share.name)))
  );

  // Ensure Founders and ESOP are first if they exist, for consistent stacking order preference
  const preferredOrder = ['Founders', 'ESOP'];
  allInvestorNames.sort((a, b) => {
    const idxA = preferredOrder.indexOf(a);
    const idxB = preferredOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });


  const chartData = ownershipStages.map(stage => {
    const stageEntry: { [key: string]: string | number } = { name: stage.stageName };
    allInvestorNames.forEach(investorName => {
      const share = stage.shares.find(s => s.name === investorName);
      stageEntry[investorName] = share ? parseFloat(share.percentage.toFixed(2)) : 0;
    });
    return stageEntry;
  });

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart
        data={chartData}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(tick) => `${tick}%`} />
        <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
        <Legend />
        {allInvestorNames.map((investorName) => (
          <Area
            key={investorName}
            type="monotone"
            dataKey={investorName}
            stackId="1"
            stroke={getInvestorColor(investorName, allInvestorNames)}
            fill={getInvestorColor(investorName, allInvestorNames)}
            fillOpacity={0.6}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}; 