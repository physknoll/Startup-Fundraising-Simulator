import React from 'react';
import { CalculatedRound, OwnershipStage } from '@/lib/types';

interface CalculationNarrativeProps {
  calculatedRounds: CalculatedRound[];
  ownershipStages: OwnershipStage[];
  esopPercentage: number;
  liquidationPreferenceEnabled: boolean;
}

export const CalculationNarrative: React.FC<CalculationNarrativeProps> = ({
  calculatedRounds,
  ownershipStages,
  esopPercentage,
  liquidationPreferenceEnabled
}) => {
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return `$${value.toLocaleString()}`;
  };

  const formatPercent = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return `${value.toFixed(2)}%`;
  };

  const generateNarrative = () => {
    const narrative: string[] = [];
    
    // Initial state
    narrative.push("📊 **Initial State**: Founders start with 100% ownership of the company.");
    
    for (let i = 0; i < calculatedRounds.length; i++) {
      const round = calculatedRounds[i];
      
      if (!round.isEnabled) {
        narrative.push(`\n⏭️ **${round.name}**: Round is disabled, skipping.`);
        continue;
      }

      narrative.push(`\n🎯 **${round.name} Round**:`);
      
      if (round.roundType === 'SAFE') {
        // SAFE round narrative
        narrative.push(`   • Investment Type: SAFE (Simple Agreement for Future Equity)`);
        narrative.push(`   • Investment Amount: ${formatCurrency(round.roundSize)}`);
        if (round.valuationCap) {
          narrative.push(`   • Valuation Cap: ${formatCurrency(round.valuationCap)}`);
        }
        if (round.discountRate) {
          narrative.push(`   • Discount Rate: ${round.discountRate}%`);
        }
        narrative.push(`   • Status: SAFE will convert in the next priced round`);
        
        if (round.dilutionPercent !== null) {
          narrative.push(`   • Effective Dilution at Conversion: ${formatPercent(round.dilutionPercent)}`);
          narrative.push(`   • Note: This dilution was calculated when the SAFE converted during a later priced round`);
        }
        
      } else if (round.name === 'Exit') {
        // Exit scenario
        narrative.push(`   • Exit Valuation: ${formatCurrency(round.roundSize)}`);
        if (round.arrMultiple && round.requiredARR) {
          narrative.push(`   • Based on ${round.arrMultiple}x multiple of ${formatCurrency(round.requiredARR)} ARR`);
        }
        
        // Show final ownership breakdown
        const exitStage = ownershipStages.find(stage => stage.stageName === 'Exit');
        if (exitStage) {
          narrative.push(`   • **Final Ownership at Exit**:`);
          exitStage.shares.forEach(share => {
            const valueAtExit = share.valueAtExit || 0;
            const returnMultiple = share.returnMultiple;
            narrative.push(`     - ${share.name}: ${formatPercent(share.percentage)} (${formatCurrency(valueAtExit)})`);
            if (returnMultiple !== undefined && share.investedAmount && share.investedAmount > 0) {
              narrative.push(`       → Return: ${returnMultiple.toFixed(1)}x on ${formatCurrency(share.investedAmount)} invested`);
            }
          });
        }
        
      } else {
        // Priced round narrative
        narrative.push(`   • Investment Type: Priced Round (Preferred Stock)`);
        narrative.push(`   • Investment Amount: ${formatCurrency(round.roundSize)}`);
        narrative.push(`   • Dilution: ${formatPercent(round.dilutionPercent)}`);
        
        if (round.preMoneyValuation && round.postMoneyValuation) {
          narrative.push(`   • Pre-Money Valuation: ${formatCurrency(round.preMoneyValuation)}`);
          narrative.push(`   • Post-Money Valuation: ${formatCurrency(round.postMoneyValuation)}`);
          
          // Show calculation
          if (round.dilutionPercent && round.roundSize) {
            const calculatedPreMoney = (round.roundSize / (round.dilutionPercent / 100)) - round.roundSize;
            narrative.push(`   • Calculation: Pre-money = (${formatCurrency(round.roundSize)} ÷ ${round.dilutionPercent}%) - ${formatCurrency(round.roundSize)} = ${formatCurrency(calculatedPreMoney)}`);
          }
        }
        
        if (round.arrMultiple && round.requiredARR) {
          narrative.push(`   • Required ARR: ${formatCurrency(round.requiredARR)} (${formatCurrency(round.postMoneyValuation)} ÷ ${round.arrMultiple}x)`);
        }
        
        // ESOP creation for priced rounds
        const targetEsop = round.optionPoolPercent !== null && round.optionPoolPercent !== undefined 
          ? round.optionPoolPercent 
          : esopPercentage;
        if (targetEsop > 0) {
          narrative.push(`   • ESOP Creation: ${targetEsop}% option pool created before investment`);
          narrative.push(`     → This dilutes all existing shareholders by ${((100 - targetEsop) / 100).toFixed(3)}x`);
        }
        
        // SAFE conversions during this round
        const safeRounds = calculatedRounds.slice(0, i).filter(r => 
          r.roundType === 'SAFE' && r.isEnabled && r.dilutionPercent !== null
        );
        
        if (safeRounds.length > 0) {
          narrative.push(`   • **SAFE Conversions during this round**:`);
          safeRounds.forEach(safe => {
            if (safe.dilutionPercent !== null) {
              narrative.push(`     - ${safe.name} SAFE: ${formatCurrency(safe.roundSize)} converts to ${formatPercent(safe.dilutionPercent)} equity`);
              
              // Show conversion calculation
              if (safe.valuationCap && round.preMoneyValuation) {
                const discountPrice = safe.discountRate ? round.preMoneyValuation * (1 - safe.discountRate / 100) : null;
                const conversionValuation = Math.min(
                  safe.valuationCap,
                  discountPrice || Infinity
                );
                narrative.push(`       → Conversion at ${formatCurrency(conversionValuation)} valuation (better of cap vs discount)`);
                narrative.push(`       → Calculation: ${formatCurrency(safe.roundSize)} ÷ (${formatCurrency(conversionValuation)} + ${formatCurrency(safe.roundSize)}) = ${formatPercent(safe.dilutionPercent)}`);
              }
            }
          });
        }
        
        // Show ownership after this round
        const stageAfterRound = ownershipStages.find(stage => stage.stageName === round.name);
        if (stageAfterRound) {
          narrative.push(`   • **Ownership after ${round.name}**:`);
          stageAfterRound.shares.forEach(share => {
            narrative.push(`     - ${share.name}: ${formatPercent(share.percentage)}`);
          });
        }
      }
    }
    
    // Summary
    narrative.push(`\n📈 **Summary**:`);
    narrative.push(`• Total rounds modeled: ${calculatedRounds.filter(r => r.isEnabled).length}`);
    narrative.push(`• ESOP default percentage: ${esopPercentage}%`);
    narrative.push(`• Liquidation preferences: ${liquidationPreferenceEnabled ? 'Enabled (1x Non-Participating default)' : 'Disabled'}`);
    
    const totalInvestment = calculatedRounds
      .filter(r => r.isEnabled && r.name !== 'Exit' && r.roundSize)
      .reduce((sum, r) => sum + (r.roundSize || 0), 0);
    narrative.push(`• Total capital raised: ${formatCurrency(totalInvestment)}`);
    
    const exitRound = calculatedRounds.find(r => r.name === 'Exit' && r.isEnabled);
    if (exitRound && exitRound.roundSize) {
      narrative.push(`• Exit valuation: ${formatCurrency(exitRound.roundSize)}`);
      
      const foundersAtExit = ownershipStages
        .find(s => s.stageName === 'Exit')?.shares
        .find(s => s.name === 'Founders');
      
      if (foundersAtExit) {
        narrative.push(`• Founders' final ownership: ${formatPercent(foundersAtExit.percentage)}`);
        narrative.push(`• Founders' exit value: ${formatCurrency(foundersAtExit.valueAtExit)}`);
      }
    }
    
    return narrative;
  };

  const narrativeLines = generateNarrative();

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">Calculation Narrative</h3>
      <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
        {narrativeLines.map((line, index) => {
          const isHeader = line.includes('**') && !line.includes('   •');
          const isSubItem = line.includes('     -') || line.includes('       →');
          const isMainItem = line.includes('   •');
          
          return (
            <div 
              key={index} 
              className={`
                ${isHeader ? 'font-semibold text-foreground mt-3 first:mt-0' : ''}
                ${isMainItem ? 'ml-2 text-muted-foreground' : ''}
                ${isSubItem ? 'ml-6 text-muted-foreground/80 text-xs' : ''}
                ${!isHeader && !isMainItem && !isSubItem ? 'text-muted-foreground' : ''}
              `}
            >
              {line.replace(/\*\*(.*?)\*\*/g, '$1')}
            </div>
          );
        })}
      </div>
    </div>
  );
};