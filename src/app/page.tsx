"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from 'react';
import { RoundInput, CalculatedRound, OwnershipStage } from '@/lib/types';
import { calculateAllRounds, CalculationResult } from '@/lib/calculations';
import { InputParametersTable } from '@/components/InputParametersTable';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { OwnershipChart } from "@/components/OwnershipChart";
import { OwnershipTable } from "@/components/OwnershipTable";
import { RevenueGrowthTable } from "@/components/RevenueGrowthTable";
import { InvestorReturnsTable } from "@/components/InvestorReturnsTable";
import { SummaryView } from "@/components/SummaryView";
import { Switch } from "@/components/ui/switch";
import { generalTooltips } from "@/lib/tips";
import { InfoTip } from "@/components/InfoTip";

const initialRawRounds: RoundInput[] = [
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
    name: 'Seed',
    roundSize: 2000000,
    preMoneyValuation: null,
    dilutionPercent: 20,
    arrMultiple: 30,
    requiredARR: null,
    postMoneyValuation: null,
    isEnabled: true,
    roundType: 'SAFE',
    valuationCap: 15000000,
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
    name: 'Series B',
    roundSize: 30000000,
    preMoneyValuation: null,
    dilutionPercent: 15,
    arrMultiple: 15,
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
    optionPoolPercent: 10,
    investorBoardSeats: 1,
    protectiveProvisions: true,
    dragAlongRights: true,
  },
  {
    name: 'Series C',
    roundSize: 50000000,
    preMoneyValuation: null,
    dilutionPercent: 10,
    arrMultiple: 10,
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
    optionPoolPercent: 10,
    investorBoardSeats: 1,
    protectiveProvisions: true,
    dragAlongRights: true,
  },
  {
    name: 'Exit',
    roundSize: 500000000,
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
  },
];

export default function HomePage() {
  const [inputRounds, setInputRounds] = useState<RoundInput[]>(initialRawRounds);
  const [esopPercentage, setEsopPercentage] = useState<number>(10);
  const [liquidationPreferenceEnabled, setLiquidationPreferenceEnabled] = useState<boolean>(false);
  const [calculationResult, setCalculationResult] = useState<CalculationResult>({
    calculatedRounds: [],
    ownershipStages: [],
  });
  const [acv, setAcv] = useState<number>(50000);

  useEffect(() => {
    const results = calculateAllRounds({
      rounds: inputRounds,
      initialFounderOwnership: 100,
      defaultEsopPercentageForPricedRounds: esopPercentage,
      liquidationPreferenceEnabled: liquidationPreferenceEnabled,
    });
    setCalculationResult(results);
  }, [inputRounds, esopPercentage, liquidationPreferenceEnabled]);

  const handleInputChange = (index: number, field: keyof RoundInput, value: string) => {
    const newRounds = [...inputRounds];
    let parsedValue: any = value;

    switch (field) {
      case 'roundSize':
      case 'preMoneyValuation':
      case 'dilutionPercent':
      case 'arrMultiple':
      case 'valuationCap':
      case 'discountRate':
      case 'lpMultiple':
      case 'optionPoolPercent':
      case 'investorBoardSeats':
        parsedValue = value === '' ? null : parseFloat(value);
        if (value !== '' && isNaN(parsedValue)) return; // Ignore if not a valid number
        if (parsedValue !== null) {
          if (field === 'dilutionPercent' || field === 'discountRate' || field === 'optionPoolPercent') {
            if (parsedValue < 0 || parsedValue > 100) return; // Clamp between 0-100
          } else if (field === 'investorBoardSeats') {
            if (parsedValue < 0 || !Number.isInteger(parsedValue)) return; // Non-negative integer
          } else if (parsedValue < 0) {
            return; // Other numeric fields must be non-negative
          }
        }
        break;
      case 'lpType':
        parsedValue = value === 'None' ? null : value;
        break;
      case 'roundType':
      case 'antiDilution':
        parsedValue = value === 'None' ? null : value;
        break;
      case 'proRataRights':
      case 'protectiveProvisions':
      case 'dragAlongRights':
        if (value === 'unspecified_pr') {
          parsedValue = null;
        } else {
          parsedValue = value === 'true';
        }
        break;
      default:
        break;
    }

    newRounds[index] = { ...newRounds[index], [field]: parsedValue };
    setInputRounds(newRounds);
  };

  const handleRoundEnabledChange = (index: number, isEnabled: boolean) => {
    setInputRounds(prevRounds =>
      prevRounds.map((round, i) =>
        i === index ? { ...round, isEnabled } : round
      )
    );
  };

  const handleEsopChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newEsop = value === '' ? 0 : Number(value);
    if (value === '' || (!isNaN(newEsop) && newEsop >= 0 && newEsop <= 100)) {
        setEsopPercentage(newEsop);
    } else if (value !== '' && Number(value) > 100) {
        setEsopPercentage(100);
    } else if (value !== '' && Number(value) < 0) {
        setEsopPercentage(0);
    }
  };

  const handleAcvChange = (newAcv: number) => {
    if (newAcv >= 0) {
        setAcv(newAcv);
    }
  };

  return (
    <main className="container mx-auto p-4">
      <header className="text-center my-8">
        <h1 className="text-4xl font-bold">Startup Fundraising Simulator</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Model your startup's fundraising journey from pre-seed to exit. Understand dilution, valuation, and revenue requirements.
        </p>
        <p className="text-sm mt-1">brought to you by PREQUEL VENTURES (Placeholder)</p>
      </header>

      <section id="esop-input" className="my-6 p-4 border rounded-lg shadow-sm bg-card">
        <h2 className="text-xl font-semibold mb-3">Global Defaults & Settings</h2>
        <div className="space-y-4">
            <div>
                <Label htmlFor="esopPercentage" className="text-base flex items-center">
                    Default Target ESOP % (for Priced Rounds)
                    <InfoTip tipData={generalTooltips.globalEsopDefault} usePopover />
                </Label>
                <div className="flex items-center space-x-2 mt-1">
                    <Input
                        type="number"
                        id="esopPercentage"
                        value={esopPercentage}
                        onChange={handleEsopChange}
                        placeholder="e.g., 10"
                        className="w-24"
                        min="0"
                        max="100"
                    />
                    <span>%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    This percentage is used as the target option pool for a priced round if no specific target is set in its advanced settings. The pool is typically created/refreshed before the new investment, diluting then-existing shareholders.
                </p>
            </div>

            <div>
                <Label htmlFor="liquidation-preference" className="text-base flex items-center">
                    Global Liquidation Preference (Default)
                    <InfoTip tipData={generalTooltips.globalLiquidationPreference} usePopover />
                </Label>
                <div className="flex items-center space-x-2 mt-1">
                    <Switch
                        id="liquidation-preference"
                        checked={liquidationPreferenceEnabled}
                        onCheckedChange={setLiquidationPreferenceEnabled}
                    />
                    <span className="text-sm">Enable 1x Non-Participating for Investors</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    If enabled, this applies a 1x Non-Participating Liquidation Preference to investors in rounds where no specific preference type is set in advanced settings. It does not apply to Founders or ESOP.
                </p>
            </div>
        </div>
      </section>

      <section id="input-parameters" className="my-8">
        <h2 className="text-2xl font-semibold mb-4">Input Parameters</h2>
        <InputParametersTable 
            roundsData={calculationResult.calculatedRounds} 
            handleInputChange={handleInputChange}
            handleRoundEnabledChange={handleRoundEnabledChange}
        />
      </section>

      {/* Results Section (Phase 4) */}
      <section id="results" className="my-8">
        <h2 className="text-2xl font-semibold mb-4">Results</h2>
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="revenue-growth">Revenue Growth</TabsTrigger>
            <TabsTrigger value="ownership">Ownership</TabsTrigger>
            <TabsTrigger value="investor-returns">Investor Returns</TabsTrigger>
          </TabsList>
          <TabsContent value="summary">
            <div className="p-4 border rounded-lg mt-2">
              <SummaryView 
                calculatedRounds={calculationResult.calculatedRounds}
                ownershipStages={calculationResult.ownershipStages}
                esopPercentage={esopPercentage}
              />
            </div>
          </TabsContent>
          <TabsContent value="revenue-growth">
            <div className="p-4 border rounded-lg mt-2">
              <RevenueGrowthTable 
                calculatedRounds={calculationResult.calculatedRounds}
                acv={acv}
                onAcvChange={handleAcvChange}
              />
            </div>
          </TabsContent>
          <TabsContent value="ownership">
            <div className="p-4 border rounded-lg mt-2 space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">Ownership Chart</h3>
                <OwnershipChart ownershipStages={calculationResult.ownershipStages} />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Ownership Table</h3>
                <OwnershipTable ownershipStages={calculationResult.ownershipStages} />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="investor-returns">
            <div className="p-4 border rounded-lg mt-2">
              <InvestorReturnsTable 
                ownershipStages={calculationResult.ownershipStages}
                calculatedRounds={calculationResult.calculatedRounds}
              />
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <footer className="text-center text-sm text-muted-foreground my-8">
        © {new Date().getFullYear()} Prequel Ventures GmbH. All calculations are simulations and should not be considered financial advice.
      </footer>
    </main>
  );
}
