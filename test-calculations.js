// Simple test to verify calculations are working correctly
// Run with: node test-calculations.js

const { calculateAllRounds, calculatePreMoney, calculatePostMoney } = require('./src/lib/calculations.ts');

// Test basic helper functions
console.log('=== Testing Helper Functions ===');

// Test calculatePreMoney
console.log('calculatePreMoney(1000000, 20):', calculatePreMoney(1000000, 20)); // Should be 4000000
console.log('calculatePreMoney(1000000, 0):', calculatePreMoney(1000000, 0)); // Should be null
console.log('calculatePreMoney(0, 20):', calculatePreMoney(0, 20)); // Should be 0

// Test calculatePostMoney
console.log('calculatePostMoney(4000000, 1000000):', calculatePostMoney(4000000, 1000000)); // Should be 5000000
console.log('calculatePostMoney(null, 1000000):', calculatePostMoney(null, 1000000)); // Should be null

console.log('\n=== Testing Full Calculation Scenario ===');

// Test a simple scenario with SAFE conversion
const testRounds = [
  {
    name: 'Pre-Seed',
    roundSize: 500000,
    preMoneyValuation: null,
    dilutionPercent: 15,
    arrMultiple: null,
    requiredARR: null,
    postMoneyValuation: null,
    isEnabled: true,
    roundType: 'SAFE',
    valuationCap: 6000000,
    discountRate: 20,
    lpType: null,
    lpMultiple: null,
    proRataRights: null,
    antiDilution: null,
    optionPoolPercent: null,
    investorBoardSeats: null,
    protectiveProvisions: null,
    dragAlongRights: null,
  },
  {
    name: 'Series A',
    roundSize: 10000000,
    preMoneyValuation: null,
    dilutionPercent: 20,
    arrMultiple: 20,
    requiredARR: null,
    postMoneyValuation: null,
    isEnabled: true,
    roundType: 'Priced',
    valuationCap: null,
    discountRate: null,
    lpType: 'NonParticipating',
    lpMultiple: 1,
    proRataRights: true,
    antiDilution: 'BroadBasedWA',
    optionPoolPercent: 15,
    investorBoardSeats: 1,
    protectiveProvisions: true,
    dragAlongRights: true,
  },
  {
    name: 'Exit',
    roundSize: 100000000, // $100M exit
    preMoneyValuation: null,
    dilutionPercent: null,
    arrMultiple: 10,
    requiredARR: null,
    postMoneyValuation: null,
    isEnabled: true,
    roundType: 'Priced',
    valuationCap: null,
    discountRate: null,
    lpType: null,
    lpMultiple: null,
    proRataRights: null,
    antiDilution: null,
    optionPoolPercent: null,
    investorBoardSeats: null,
    protectiveProvisions: null,
    dragAlongRights: null,
  }
];

try {
  const result = calculateAllRounds({
    rounds: testRounds,
    initialFounderOwnership: 100,
    defaultEsopPercentageForPricedRounds: 10,
    liquidationPreferenceEnabled: true
  });

  console.log('Calculation completed successfully!');
  console.log('\nOwnership Stages:');
  result.ownershipStages.forEach((stage, index) => {
    console.log(`\n${index + 1}. ${stage.stageName}:`);
    stage.shares.forEach(share => {
      console.log(`  ${share.name}: ${share.percentage.toFixed(2)}%`);
    });
  });

  console.log('\nCalculated Rounds:');
  result.calculatedRounds.forEach((round, index) => {
    console.log(`\n${index + 1}. ${round.name}:`);
    console.log(`  Pre-money: $${round.preMoneyValuation?.toLocaleString() || 'N/A'}`);
    console.log(`  Post-money: $${round.postMoneyValuation?.toLocaleString() || 'N/A'}`);
    console.log(`  Dilution: ${round.dilutionPercent?.toFixed(2) || 'N/A'}%`);
  });

  // Test exit values
  const exitStage = result.ownershipStages.find(stage => stage.stageName === 'Exit');
  if (exitStage) {
    console.log('\nExit Values:');
    exitStage.shares.forEach(share => {
      console.log(`  ${share.name}: $${share.valueAtExit.toLocaleString()} (${(share.returnMultiple || 0).toFixed(2)}x)`);
    });
  }

} catch (error) {
  console.error('Error in calculations:', error);
} 