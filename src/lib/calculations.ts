import { RoundInput, CalculatedRound, InvestorShare, OwnershipStage } from './types';

export function calculatePreMoney(roundSize: number, dilutionPercent: number): number | null {
  if (dilutionPercent === 0) {
    return null;
  }
  if (roundSize === 0) return 0;
  return (roundSize / (dilutionPercent / 100)) - roundSize;
}

export function calculatePostMoney(preMoneyValuation: number | null, roundSize: number): number | null {
  if (preMoneyValuation === null) return null;
  return preMoneyValuation + roundSize;
}

export function calculateRequiredARR(postMoneyValuation: number | null, arrMultiple: number | null): number | null {
  if (postMoneyValuation === null || arrMultiple === null || arrMultiple === 0) {
    return null;
  }
  return postMoneyValuation / arrMultiple;
}

export interface CalculateAllRoundsParams {
  rounds: RoundInput[];
  initialFounderOwnership: number;
  defaultEsopPercentageForPricedRounds: number;
  liquidationPreferenceEnabled?: boolean;
}

export interface CalculationResult {
  calculatedRounds: CalculatedRound[];
  ownershipStages: OwnershipStage[];
}

interface ProcessedSAFE {
  originalIndex: number;
  details: RoundInput;
  converted: boolean;
  effectiveDilutionPercent: number | null;
  conversionStageName: string | null;
}

export function calculateAllRounds(params: CalculateAllRoundsParams): CalculationResult {
  const { rounds, initialFounderOwnership, defaultEsopPercentageForPricedRounds, liquidationPreferenceEnabled } = params;
  const calculatedRoundsResult: CalculatedRound[] = [];
  const ownershipStages: OwnershipStage[] = [];
  const processedSafes: ProcessedSAFE[] = [];

  for (const round of rounds) {
    calculatedRoundsResult.push({
      ...round,
      preMoneyValuation: null,
      postMoneyValuation: null,
      requiredARR: null,
    });
  }

  rounds.forEach((round, index) => {
    if (round.roundType === 'SAFE') {
      processedSafes.push({
        originalIndex: index,
        details: { ...round },
        converted: false,
        effectiveDilutionPercent: null,
        conversionStageName: null,
      });
    }
  });

  let currentOwnership: InvestorShare[] = [
    { name: 'Founders', percentage: initialFounderOwnership, valueAtExit: 0, investedAmount: 0 },
  ];

  ownershipStages.push({
    stageName: 'Initial',
    shares: currentOwnership.map(s => ({ ...s })),
  });

  let lastPostMoneyValuation: number | null = 0;

  for (let i = 0; i < rounds.length; i++) {
    const roundInput = rounds[i];
    const currentCalcRoundEntry = calculatedRoundsResult[i];

    if (!roundInput.isEnabled) {
      currentCalcRoundEntry.preMoneyValuation = null;
      currentCalcRoundEntry.postMoneyValuation = null;
      currentCalcRoundEntry.requiredARR = null;
      if (roundInput.roundType === 'SAFE') {
        currentCalcRoundEntry.dilutionPercent = roundInput.dilutionPercent; 
      }
      if (roundInput.name === 'Exit') {
         ownershipStages.push({
            stageName: roundInput.name,
            shares: currentOwnership.map(s => ({ ...s })), 
          });
          if (roundInput.roundSize !== null) {
            lastPostMoneyValuation = roundInput.roundSize;
            currentCalcRoundEntry.postMoneyValuation = roundInput.roundSize;
            currentCalcRoundEntry.preMoneyValuation = lastPostMoneyValuation - (roundInput.roundSize || 0);
          }
      }
      continue;
    }

    let preMoneyValuation: number | null = null;
    let postMoneyValuation: number | null = null;
    let requiredARR: number | null = null;
    const roundName = roundInput.name;

    let ownershipBeforeRoundInvestment = currentOwnership.map(s => ({ ...s }));

    if (roundInput.roundType !== 'SAFE' && roundInput.name !== 'Exit') {
      const targetEsopPercentForRound = (roundInput.optionPoolPercent !== null && roundInput.optionPoolPercent !== undefined && roundInput.optionPoolPercent >= 0)
        ? roundInput.optionPoolPercent
        : defaultEsopPercentageForPricedRounds;

      if (targetEsopPercentForRound > 0) {
        let currentTotalEsopPercentage = 0;
        ownershipBeforeRoundInvestment.filter(s => s.name === 'ESOP').forEach(s => currentTotalEsopPercentage += s.percentage);

        if (targetEsopPercentForRound > currentTotalEsopPercentage) {
          const additionalEsopNeeded = targetEsopPercentForRound - currentTotalEsopPercentage;
          const nonEsopHoldersTotalPercentage = 100 - currentTotalEsopPercentage;

          if (nonEsopHoldersTotalPercentage > 0 && nonEsopHoldersTotalPercentage < 100) {
            const dilutionFactorForNonEsop = (nonEsopHoldersTotalPercentage - additionalEsopNeeded) / nonEsopHoldersTotalPercentage;
            
            ownershipBeforeRoundInvestment.forEach(share => {
              if (share.name !== 'ESOP') {
                share.percentage *= dilutionFactorForNonEsop;
              }
            });
          } else if (nonEsopHoldersTotalPercentage === 100) {
            const dilutionFactorForAll = (100 - targetEsopPercentForRound) / 100;
            ownershipBeforeRoundInvestment.forEach(share => {
                share.percentage *= dilutionFactorForAll;
            });
          }
          
          const esopShare = ownershipBeforeRoundInvestment.find(s => s.name === 'ESOP');
          if (esopShare) {
            esopShare.percentage = targetEsopPercentForRound;
          } else {
            ownershipBeforeRoundInvestment.push({ name: 'ESOP', percentage: targetEsopPercentForRound, valueAtExit: 0, investedAmount: 0 });
          }

          let currentSum = ownershipBeforeRoundInvestment.reduce((sum, share) => sum + share.percentage, 0);
          if (currentSum !== 100 && currentSum > 0) {
            const normalizationFactor = 100 / currentSum;
            ownershipBeforeRoundInvestment.forEach(share => {
              share.percentage *= normalizationFactor;
            });
          }
        }
      }
    }
    currentOwnership = ownershipBeforeRoundInvestment.map(s => ({ ...s }));

    if (roundInput.roundType !== 'SAFE' && roundInput.name !== 'Exit' && roundInput.dilutionPercent !== null && roundInput.roundSize !== null) {
      const qualifyingRoundPreMoneyForSafeConversion = calculatePreMoney(roundInput.roundSize, roundInput.dilutionPercent);

      if (qualifyingRoundPreMoneyForSafeConversion !== null) {
        for (const safe of processedSafes) {
          if (!safe.converted && rounds[safe.originalIndex].isEnabled && safe.originalIndex < i) { 
            const safeDetails = safe.details;
            let conversionPreMoneyForSafe = Infinity;
            const cap = safeDetails.valuationCap ?? null;
            const discount = safeDetails.discountRate ?? null;

            if (cap !== null && cap > 0) {
                conversionPreMoneyForSafe = Math.min(conversionPreMoneyForSafe, cap);
            }
            if (discount !== null && discount > 0 && qualifyingRoundPreMoneyForSafeConversion > 0) {
                conversionPreMoneyForSafe = Math.min(conversionPreMoneyForSafe, qualifyingRoundPreMoneyForSafeConversion * (1 - discount / 100));
            }
            
            if (conversionPreMoneyForSafe === Infinity || conversionPreMoneyForSafe <=0 ) { 
                console.warn(`SAFE ${safeDetails.name} has invalid conversion terms (Cap: ${cap}, Discount: ${discount}% on Pre-money: ${qualifyingRoundPreMoneyForSafeConversion}). Cannot convert effectively.`);
                safe.effectiveDilutionPercent = 0; 
            } else if (safeDetails.roundSize === null || safeDetails.roundSize <= 0) {
                console.warn(`SAFE ${safeDetails.name} has no investment amount. Cannot convert effectively.`);
                safe.effectiveDilutionPercent = 0;
            } else {
                safe.effectiveDilutionPercent = (safeDetails.roundSize / (conversionPreMoneyForSafe + safeDetails.roundSize)) * 100;
            }

            if (safe.effectiveDilutionPercent !== null && safe.effectiveDilutionPercent > 0 && safe.effectiveDilutionPercent < 100) {
              const safeDilutionFactor = (100 - safe.effectiveDilutionPercent) / 100;
              currentOwnership.forEach(share => {
                share.percentage *= safeDilutionFactor;
              });
              currentOwnership.push({
                name: `${safeDetails.name} Investors (SAFE)`,
                percentage: safe.effectiveDilutionPercent,
                valueAtExit: 0,
                investedAmount: safeDetails.roundSize ?? 0,
              });
            } else if (safe.effectiveDilutionPercent !== null && safe.effectiveDilutionPercent >= 100) {
                console.warn(`SAFE ${safeDetails.name} effective dilution is ${safe.effectiveDilutionPercent}%. This would wipe out other shareholders. Clamping dilution effect for this SAFE.`);
                const safeDilutionFactor = (100 - safe.effectiveDilutionPercent) / 100;
                currentOwnership.forEach(share => share.percentage *= Math.max(0, safeDilutionFactor));
                 currentOwnership.push({
                    name: `${safeDetails.name} Investors (SAFE)`,
                    percentage: Math.min(100, safe.effectiveDilutionPercent),
                    valueAtExit: 0,
                    investedAmount: safeDetails.roundSize ?? 0,
                });
                let currentSum = currentOwnership.reduce((sum, share) => sum + share.percentage, 0);
                if (currentSum > 100 && currentSum > 0) {
                    const esopAndFounders = currentOwnership.filter(s => s.name ==='ESOP' || s.name === 'Founders');
                    if (esopAndFounders.length > 0) {
                       if(safe.effectiveDilutionPercent >= 100) esopAndFounders.forEach(s => s.percentage = 0);
                    }
                    currentSum = currentOwnership.reduce((sum, share) => sum + share.percentage, 0);
                    if (currentSum > 0) { 
                        const normFactor = 100 / currentSum;
                        currentOwnership.forEach(s => s.percentage *= normFactor);
                    }
                }
            }
            safe.converted = true;
            safe.conversionStageName = roundName;
            calculatedRoundsResult[safe.originalIndex].dilutionPercent = safe.effectiveDilutionPercent;
          }
        }
      }
    }

    if (roundInput.roundType === 'SAFE') {
      preMoneyValuation = null;
      postMoneyValuation = null;
      requiredARR = null;
    } else if (roundInput.name === 'Exit') {
      preMoneyValuation = lastPostMoneyValuation;
      postMoneyValuation = roundInput.roundSize ?? 0;
      if (roundInput.arrMultiple && postMoneyValuation !== null) {
        requiredARR = calculateRequiredARR(postMoneyValuation, roundInput.arrMultiple);
      }
    } else { 
      if (roundInput.dilutionPercent !== null && roundInput.roundSize !== null && roundInput.dilutionPercent > 0 && roundInput.dilutionPercent < 100) {
        preMoneyValuation = calculatePreMoney(roundInput.roundSize, roundInput.dilutionPercent);
        postMoneyValuation = calculatePostMoney(preMoneyValuation, roundInput.roundSize);

        if (postMoneyValuation !== null && roundInput.arrMultiple !== null) {
          requiredARR = calculateRequiredARR(postMoneyValuation, roundInput.arrMultiple);
        }

        const pricedRoundDilutionFactor = (100 - roundInput.dilutionPercent) / 100;
        currentOwnership.forEach(share => {
          share.percentage *= pricedRoundDilutionFactor;
        });
        currentOwnership.push({
          name: `${roundName} Investors`,
          percentage: roundInput.dilutionPercent,
          valueAtExit: 0,
          investedAmount: roundInput.roundSize ?? 0,
        });
      } else {
        if (lastPostMoneyValuation !== null && roundInput.arrMultiple !== null && roundInput.roundSize !== null) {
            postMoneyValuation = lastPostMoneyValuation;
            if (roundInput.roundSize > 0) { 
                postMoneyValuation = (postMoneyValuation ?? 0) + roundInput.roundSize;
            }
            requiredARR = calculateRequiredARR(postMoneyValuation, roundInput.arrMultiple);
            preMoneyValuation = postMoneyValuation !== null ? postMoneyValuation - roundInput.roundSize : null;
            if (roundInput.dilutionPercent === 0 && roundInput.roundSize > 0) {
            } else if (roundInput.dilutionPercent === 100 && roundInput.roundSize > 0) {
                 currentOwnership.forEach(share => share.percentage = 0);
                 currentOwnership.push({
                    name: `${roundName} Investors`,
                    percentage: 100,
                    valueAtExit: 0,
                    investedAmount: roundInput.roundSize ?? 0,
                });
            }
        }
      }
    }

    currentCalcRoundEntry.preMoneyValuation = preMoneyValuation;
    currentCalcRoundEntry.postMoneyValuation = postMoneyValuation;
    currentCalcRoundEntry.requiredARR = requiredARR;
    if (roundInput.roundType !== 'SAFE') {
        currentCalcRoundEntry.dilutionPercent = roundInput.dilutionPercent;
    }
    
    ownershipStages.push({
      stageName: roundName,
      shares: currentOwnership.map(s => ({ ...s })),
    });

    if (postMoneyValuation !== null && roundInput.name !== 'Exit') {
      lastPostMoneyValuation = postMoneyValuation;
    }
  }

  const exitStageIndex = ownershipStages.findIndex(stage => stage.stageName === 'Exit');
  const finalExitValuation = calculatedRoundsResult.find(r => r.name === 'Exit' && r.isEnabled)?.postMoneyValuation ?? 0;

  if (exitStageIndex !== -1 && finalExitValuation > 0) {
    const exitStageData = ownershipStages[exitStageIndex];
    exitStageData.shares.forEach(share => {
      let currentLpType: 'NonParticipating' | 'Participating' | null = null;
      let currentLpMultiple: number = 1;

      const investorRoundName = share.name.replace(/ Investors(?: \(SAFE\))?$/, '');
      const originalRoundInput = rounds.find(r => r.name === investorRoundName);

      if (share.name === 'Founders' || share.name === 'ESOP') {
        currentLpType = null;
      } else if (originalRoundInput) {
        currentLpType = originalRoundInput.lpType ?? (liquidationPreferenceEnabled ? 'NonParticipating' : null);
        currentLpMultiple = originalRoundInput.lpMultiple ?? 1;
      } else {
        currentLpType = liquidationPreferenceEnabled ? 'NonParticipating' : null;
        currentLpMultiple = 1;
      }

      const invested = share.investedAmount ?? 0;
      let provisionalPayout = 0;
      const preferenceAmount = invested * currentLpMultiple;
      const commonEquivalent = (share.percentage / 100) * finalExitValuation;

      if (currentLpType === 'NonParticipating') {
        provisionalPayout = Math.max(preferenceAmount, commonEquivalent);
      } else if (currentLpType === 'Participating') {
        provisionalPayout = preferenceAmount + commonEquivalent;
      } else {
        provisionalPayout = commonEquivalent;
      }
      (share as any)._provisionalPayout = provisionalPayout;
    });

    const totalProvisionalClaim = exitStageData.shares.reduce((sum, s) => sum + ((s as any)._provisionalPayout || 0), 0);

    exitStageData.shares.forEach(share => {
      const provisionalPayout = (share as any)._provisionalPayout || 0;
      if (totalProvisionalClaim > 0 && finalExitValuation > 0) {
        if (totalProvisionalClaim > finalExitValuation) {
          share.valueAtExit = (provisionalPayout / totalProvisionalClaim) * finalExitValuation;
        } else {
          share.valueAtExit = provisionalPayout;
        }
      } else {
        share.valueAtExit = 0;
      }
      delete (share as any)._provisionalPayout;

      if (share.investedAmount !== undefined && share.investedAmount > 0) {
        share.returnMultiple = share.valueAtExit / share.investedAmount;
      } else if ((share.investedAmount === 0 || share.investedAmount === undefined) && share.valueAtExit > 0) {
        share.returnMultiple = Infinity;
      } else {
        share.returnMultiple = 0;
      }
    });

    ownershipStages.forEach(stage => {
      if (stage.stageName !== 'Exit') {
        stage.shares.forEach(s => {
          const correspondingExitShare = exitStageData.shares.find(es => es.name === s.name);
          if (correspondingExitShare) {
            s.valueAtExit = correspondingExitShare.valueAtExit;
            s.investedAmount = correspondingExitShare.investedAmount;
            s.returnMultiple = correspondingExitShare.returnMultiple;
          }
        });
      }
    });
  } else if (exitStageIndex !== -1) {
    const exitStageData = ownershipStages[exitStageIndex];
    exitStageData.shares.forEach(share => {
      share.valueAtExit = 0;
      share.returnMultiple = (share.investedAmount !== undefined && share.investedAmount > 0) ? 0 : undefined;
    });
    ownershipStages.forEach(stage => {
      if (stage.stageName === 'Exit') return;
      stage.shares.forEach(s => {
        s.valueAtExit = 0;
        const exitShare = exitStageData.shares.find(es => es.name === s.name);
        s.investedAmount = exitShare?.investedAmount ?? s.investedAmount;
        s.returnMultiple = exitShare?.returnMultiple;
      });
    });
  }
  
  return { calculatedRounds: calculatedRoundsResult, ownershipStages };
} 