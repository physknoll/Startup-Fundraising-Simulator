import React, { useState } from 'react';
import { CalculatedRound, RoundInput } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getTip, generalTooltips, RoundName } from "@/lib/tips";
import { InfoTip } from "@/components/InfoTip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from '@/lib/utils';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

interface InputParametersTableProps {
  roundsData: CalculatedRound[];
  handleInputChange: (index: number, field: keyof RoundInput, value: string) => void;
  handleRoundEnabledChange: (index: number, isEnabled: boolean) => void;
}

// Updated formatCurrency to handle potential non-numeric strings during input
const formatCurrencyInput = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '';
  return String(value); // Keep it as a raw number string for input value
};

const displayCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return 'N/A';
  return `$${value.toLocaleString()}`;
};

const displayPercentage = (value: number | null | undefined) => {
  if (value === null || value === undefined) return 'N/A';
  const roundedValue = Math.round(value * 10) / 10; // Example: 15.0%, 12.5%
  return `${roundedValue}%`;
};

export const InputParametersTable: React.FC<InputParametersTableProps> = ({
  roundsData,
  handleInputChange,
  handleRoundEnabledChange,
}) => {
  const [expandedMobileRoundIndex, setExpandedMobileRoundIndex] = useState<number | null>(null);
  const [expandedAdvancedIndex, setExpandedAdvancedIndex] = useState<number | null>(null);

  const toggleMobileExpand = (index: number) => {
    setExpandedMobileRoundIndex(expandedMobileRoundIndex === index ? null : index);
     // Close advanced settings when main round section is collapsed/expanded for simplicity
    if (expandedAdvancedIndex === index && expandedMobileRoundIndex !== index) {
        setExpandedAdvancedIndex(null);
    }
  };

  const toggleAdvanced = (index: number) => {
    setExpandedAdvancedIndex(expandedAdvancedIndex === index ? null : index);
  };

  const renderAdvancedSettings = (round: CalculatedRound, index: number, isMobile: boolean) => {
    const roundNameKey = round.name as RoundName;
    const idSuffix = isMobile ? `-mobile-adv-${index}` : `-desktop-adv-${index}`;

    return (
      <div className={cn("p-4 rounded-md grid grid-cols-1 gap-x-6 gap-y-4", 
                        isMobile ? "bg-card" : "bg-muted/50 sm:grid-cols-2 lg:grid-cols-3"
      )}>
        {!isMobile && ( // Desktop shows title inside the advanced area
          <div className="sm:col-span-2 lg:col-span-3 border-b border-border/50 pb-2 mb-2">
            <h4 className="font-semibold flex items-center">
              {round.name} - Advanced Settings
              {/* InfoTips for advanced settings */}
            </h4>
          </div>
        )}
        
        {(round.name === 'Pre-Seed' || round.name === 'Seed') && (
          <div className="space-y-1">
            <Label htmlFor={`roundType${idSuffix}`} className="flex items-center text-sm font-medium">
              Round Type <InfoTip tipData={getTip(roundNameKey, 'roundType')} usePopover />
            </Label>
            <Select
              value={round.roundType || 'Priced'}
              onValueChange={(value) => handleInputChange(index, 'roundType', value as string)}
              disabled={!round.isEnabled}
            >
              <SelectTrigger id={`roundType${idSuffix}`} className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Priced">Priced Round</SelectItem>
                <SelectItem value="SAFE">SAFE</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {round.roundType === 'SAFE' && (round.name === 'Pre-Seed' || round.name === 'Seed') && (
          <>
            <div className="space-y-1">
              <Label htmlFor={`valuationCap${idSuffix}`} className="flex items-center text-sm font-medium">
                Valuation Cap ($) <InfoTip tipData={generalTooltips.valuationCap} usePopover />
              </Label>
              <Input
                type="number"
                id={`valuationCap${idSuffix}`}
                value={round.valuationCap === null || round.valuationCap === undefined ? '' : String(round.valuationCap)}
                onChange={(e) => handleInputChange(index, 'valuationCap', e.target.value)}
                placeholder={getTip(roundNameKey, 'valuationCap')?.placeholder || "e.g., 5M"}
                className="w-full"
                disabled={!round.isEnabled}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`discountRate${idSuffix}`} className="flex items-center text-sm font-medium">
                Discount Rate (%) <InfoTip tipData={generalTooltips.discountRate} usePopover />
              </Label>
              <Input
                type="number"
                id={`discountRate${idSuffix}`}
                value={round.discountRate === null || round.discountRate === undefined ? '' : String(round.discountRate)}
                onChange={(e) => handleInputChange(index, 'discountRate', e.target.value)}
                placeholder={getTip(roundNameKey, 'discountRate')?.placeholder || "e.g., 20%"}
                className="w-full"
                min="0" max="100"
                disabled={!round.isEnabled}
              />
            </div>
            <p className='sm:col-span-2 lg:col-span-3 text-xs text-muted-foreground'>Dilution % for SAFE rounds shows the percentage at conversion. Final ownership may be lower due to subsequent dilution events (ESOP creation, future rounds).</p>
          </>
        )}

        {round.isEnabled && round.roundType !== 'SAFE' && round.name !== 'Exit' && (
          <>
            {/* LP Type, LP Multiple, Pro-Rata, Anti-Dilution, Option Pool, Board Seats, Protective Provisions, Drag-Along */}
            {/* Example for LP Type */}
            <div className="space-y-1">
              <Label htmlFor={`lpType${idSuffix}`} className="flex items-center text-sm font-medium">
                Liquidation Preference <InfoTip tipData={generalTooltips.liquidationPreference} usePopover />
              </Label>
              <Select
                value={round.lpType || 'None'}
                onValueChange={(value) => handleInputChange(index, 'lpType', value as string)}
                disabled={!round.isEnabled}
              >
                <SelectTrigger id={`lpType${idSuffix}`} className="w-full"><SelectValue placeholder="Select LP Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="None">None</SelectItem>
                  <SelectItem value="NonParticipating">1x Non-Participating</SelectItem>
                  <SelectItem value="Participating">Participating</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* ... other advanced fields similarly, ensuring unique IDs with idSuffix ... */}
            <div className="space-y-1">
                <Label htmlFor={`lpMultiple${idSuffix}`} className="flex items-center text-sm font-medium">
                    LP Multiple (x) <InfoTip tipData={generalTooltips.multiple} usePopover />
                </Label>
                <Input type="number" id={`lpMultiple${idSuffix}`} value={round.lpMultiple === null ? '' : String(round.lpMultiple)} onChange={(e) => handleInputChange(index, 'lpMultiple', e.target.value)} placeholder="e.g., 1" className="w-full" min="0" disabled={!round.isEnabled || !round.lpType || round.lpType === 'NonParticipating'} />
                {round.lpType === 'NonParticipating' && <p className="text-xs text-muted-foreground">Multiple for Non-Participating is fixed at 1x.</p>}
            </div>
            <div className="space-y-1">
                <Label htmlFor={`proRataRights${idSuffix}`} className="flex items-center text-sm font-medium">Pro-Rata Rights <InfoTip tipData={generalTooltips.proRataRights} usePopover /></Label>
                <Select value={round.proRataRights === null ? 'unspecified_pr' : String(round.proRataRights)} onValueChange={(value) => handleInputChange(index, 'proRataRights', value)} disabled={!round.isEnabled}>
                    <SelectTrigger id={`proRataRights${idSuffix}`} className="w-full"><SelectValue placeholder="Select option" /></SelectTrigger>
                    <SelectContent><SelectItem value="true">Yes</SelectItem><SelectItem value="false">No</SelectItem><SelectItem value="unspecified_pr">N/A</SelectItem></SelectContent>
                </Select>
            </div>
            <div className="space-y-1">
                <Label htmlFor={`antiDilution${idSuffix}`} className="flex items-center text-sm font-medium">Anti-Dilution <InfoTip tipData={generalTooltips.antiDilution} usePopover /></Label>
                <Select value={round.antiDilution || 'None'} onValueChange={(value) => handleInputChange(index, 'antiDilution', value)} disabled={!round.isEnabled}>
                    <SelectTrigger id={`antiDilution${idSuffix}`} className="w-full"><SelectValue placeholder="Select protection" /></SelectTrigger>
                    <SelectContent><SelectItem value="None">None</SelectItem><SelectItem value="BroadBasedWA">Broad-Based WA</SelectItem><SelectItem value="FullRatchet">Full Ratchet</SelectItem></SelectContent>
                </Select>
            </div>
            <div className="space-y-1">
                <Label htmlFor={`optionPoolPercent${idSuffix}`} className="flex items-center text-sm font-medium">Option Pool (Pre-Round %) <InfoTip tipData={generalTooltips.optionPool} usePopover /></Label>
                <Input type="number" id={`optionPoolPercent${idSuffix}`} value={round.optionPoolPercent === null ? '' : String(round.optionPoolPercent)} onChange={(e) => handleInputChange(index, 'optionPoolPercent', e.target.value)} placeholder="e.g., 10" className="w-full" min="0" max="100" disabled={!round.isEnabled}/>
            </div>
            <div className="space-y-1">
                <Label htmlFor={`investorBoardSeats${idSuffix}`} className="flex items-center text-sm font-medium">Investor Board Seats <InfoTip tipData={generalTooltips.boardSeats} usePopover /></Label>
                <Input type="number" id={`investorBoardSeats${idSuffix}`} value={round.investorBoardSeats === null ? '' : String(round.investorBoardSeats)} onChange={(e) => handleInputChange(index, 'investorBoardSeats', e.target.value)} placeholder="e.g., 1" className="w-full" min="0" step="1" disabled={!round.isEnabled}/>
            </div>
            <div className="space-y-1">
                <Label htmlFor={`protectiveProvisions${idSuffix}`} className="flex items-center text-sm font-medium">Protective Provisions <InfoTip tipData={generalTooltips.protectiveProvisions} usePopover /></Label>
                <Select value={round.protectiveProvisions === null ? 'unspecified_pr' : String(round.protectiveProvisions)} onValueChange={(value) => handleInputChange(index, 'protectiveProvisions', value)} disabled={!round.isEnabled}>
                    <SelectTrigger id={`protectiveProvisions${idSuffix}`} className="w-full"><SelectValue placeholder="Select option" /></SelectTrigger>
                    <SelectContent><SelectItem value="true">Yes</SelectItem><SelectItem value="false">No</SelectItem><SelectItem value="unspecified_pr">N/A</SelectItem></SelectContent>
                </Select>
            </div>
            <div className="space-y-1">
                <Label htmlFor={`dragAlongRights${idSuffix}`} className="flex items-center text-sm font-medium">Drag-Along Rights <InfoTip tipData={generalTooltips.dragAlongRights} usePopover /></Label>
                <Select value={round.dragAlongRights === null ? 'unspecified_pr' : String(round.dragAlongRights)} onValueChange={(value) => handleInputChange(index, 'dragAlongRights', value)} disabled={!round.isEnabled}>
                    <SelectTrigger id={`dragAlongRights${idSuffix}`} className="w-full"><SelectValue placeholder="Select option" /></SelectTrigger>
                    <SelectContent><SelectItem value="true">Yes</SelectItem><SelectItem value="false">No</SelectItem><SelectItem value="unspecified_pr">N/A</SelectItem></SelectContent>
                </Select>
            </div>

            <div className="sm:col-span-2 lg:col-span-3 pt-2">
               <p className="text-xs text-muted-foreground break-words">Notes on Liquidation Preference, Governance Terms etc.</p>
            </div>
          </>
        )}
        
        {round.name === 'Exit' && <p className="sm:col-span-2 lg:col-span-3 text-sm text-muted-foreground">Exit Valuation is primary.</p>}
      </div>
    );
  };

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Enabled</TableHead>
              <TableHead className="w-[150px]">Round</TableHead>
              <TableHead className="w-[180px]">Round Size ($) <InfoTip tipData={generalTooltips.roundSize} usePopover /></TableHead>
              <TableHead className="w-[130px]">Dilution (%) <InfoTip tipData={generalTooltips.dilution} usePopover /></TableHead>
              <TableHead className="w-[140px]">ARR Multiple (x) <InfoTip tipData={generalTooltips.arrMultiple} usePopover /></TableHead>
              <TableHead>Pre-Money Val. ($)</TableHead>
              <TableHead>Post-Money Val. ($)</TableHead>
              <TableHead>Required ARR ($)</TableHead>
              <TableHead className="w-[100px] text-right">Advanced <InfoTip tipData={generalTooltips.advancedSettings} usePopover /></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roundsData.map((round, index) => {
              const roundNameKey = round.name as RoundName;
              return (
                <React.Fragment key={`${round.name}-desktop`}>
                  <TableRow className={!round.isEnabled ? "opacity-50" : ""}>
                    <TableCell>
                      <Switch
                        checked={round.isEnabled}
                        onCheckedChange={(isEnabled) => handleRoundEnabledChange(index, isEnabled)}
                        disabled={round.name === 'Exit'}
                        aria-label={`Enable ${round.name} round`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{round.name}</TableCell>
                    <TableCell>
                      <Input
                        type="text"
                        value={round.roundSize === null ? '' : round.roundSize.toLocaleString()}
                        onFocus={(e) => { e.target.value = formatCurrencyInput(round.roundSize); }}
                        onBlur={(e) => { handleInputChange(index, 'roundSize', e.target.value.replace(/[^\d.]/g, '')); }}
                        onChange={(e) => { handleInputChange(index, 'roundSize', e.target.value.replace(/[^\d.]/g, ''));}}
                        placeholder={getTip(roundNameKey, 'roundSize')?.placeholder || "e.g., 500K"}
                        className="w-full" disabled={!round.isEnabled} aria-label={`${round.name} round size`}
                      />
                      {round.name === 'Exit' && <span className="text-xs text-muted-foreground mt-1 flex items-center">(Exit Valuation) <InfoTip tipData={getTip('Exit', 'roundSize')} usePopover/></span>}
                      {getTip(roundNameKey, 'roundSize')?.typicalRange && <p className="text-xs text-muted-foreground mt-1">Typical: {getTip(roundNameKey, 'roundSize')?.typicalRange}</p>}
                    </TableCell>
                    <TableCell>
                      {round.name === 'Exit' ? (<span>N/A</span>) : 
                       round.roundType === 'SAFE' ? (<span className="text-sm text-muted-foreground italic">{displayPercentage(round.dilutionPercent)} (at conversion)</span>) : (
                        <>
                          <Input type="number" value={round.dilutionPercent === null ? '' : String(round.dilutionPercent)} onChange={(e) => handleInputChange(index, 'dilutionPercent', e.target.value)} placeholder="e.g., 10" className="w-full" min="0" max="100" step="0.1" disabled={!round.isEnabled} aria-label={`${round.name} dilution percent`} />
                          {getTip(roundNameKey, 'dilutionPercent')?.typicalRange && <p className="text-xs text-muted-foreground mt-1">Typical: {getTip(roundNameKey, 'dilutionPercent')?.typicalRange}</p>}
                        </>
                      )}
                    </TableCell>
                    <TableCell>
                      <Input type="number" value={round.arrMultiple === null ? '' : String(round.arrMultiple)} onChange={(e) => handleInputChange(index, 'arrMultiple', e.target.value)} placeholder={getTip(roundNameKey, 'arrMultiple')?.placeholder || "e.g., 10"} className="w-full" min="0" step="0.1" disabled={!round.isEnabled || (round.name === 'Pre-Seed' && round.roundType !== 'SAFE')} aria-label={`${round.name} ARR multiple`} />
                      {getTip(roundNameKey, 'arrMultiple')?.typicalRange && <p className="text-xs text-muted-foreground mt-1">Typical: {getTip(roundNameKey, 'arrMultiple')?.typicalRange}</p>}
                    </TableCell>
                    <TableCell>{displayCurrency(round.preMoneyValuation)}</TableCell>
                    <TableCell>{displayCurrency(round.postMoneyValuation)}</TableCell>
                    <TableCell>{displayCurrency(round.requiredARR)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" disabled={!round.isEnabled} onClick={() => toggleAdvanced(index)} aria-label={`Toggle advanced settings for ${round.name}`}>
                        {expandedAdvancedIndex === index ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedAdvancedIndex === index && round.isEnabled && (
                    <TableRow>
                      <TableCell colSpan={9} className="p-0"> {/* No padding on cell, padding is in renderAdvancedSettings */}
                        {renderAdvancedSettings(round, index, false)}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {roundsData.map((round, index) => {
          const roundNameKey = round.name as RoundName;
          const isMainExpanded = expandedMobileRoundIndex === index;
          const isAdvancedPanelOpen = expandedAdvancedIndex === index;

          return (
            <div key={`${round.name}-mobile`} className={cn("border rounded-lg", !round.isEnabled && "opacity-50 bg-muted/30")}>
              <Collapsible open={isMainExpanded} onOpenChange={() => toggleMobileExpand(index)}>
                <CollapsibleTrigger asChild className="flex items-center justify-between w-full p-3 sm:p-4 text-left">
                  <div> {/* This div becomes the button via asChild */} 
                    <div className="flex items-center gap-2 sm:gap-3">
                    <Switch
                        checked={round.isEnabled}
                        onCheckedChange={(isEnabled) => {
                            handleRoundEnabledChange(index, isEnabled);
                            if (!isEnabled) { // If disabling, collapse sections
                                if (expandedMobileRoundIndex === index) setExpandedMobileRoundIndex(null);
                                if (expandedAdvancedIndex === index) setExpandedAdvancedIndex(null);
                            }
                        }}
                        disabled={round.name === 'Exit'}
                        onClick={(e) => e.stopPropagation()} // Prevent trigger
                        aria-label={`Enable ${round.name} round`}
                        id={`enable-switch-mobile-${index}`}
                    />
                    <Label htmlFor={`enable-switch-mobile-${index}`} onClick={(e) => e.stopPropagation()} className="font-semibold text-md sm:text-lg">{round.name}</Label>
                    </div>
                    <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isMainExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </CollapsibleTrigger>
                
                {/* Always visible on mobile for this round - Round Size */}
                <div className="px-3 sm:px-4 pb-3 space-y-1">
                    <Label htmlFor={`roundSize-mobile-${index}`} className="text-sm font-medium">
                        Round Size ($) {round.name === 'Exit' && "(Exit Valuation)"}
                        <InfoTip tipData={round.name === 'Exit' ? getTip('Exit', 'roundSize') : generalTooltips.roundSize} usePopover />
                    </Label>
                    <Input
                        type="text" // Use text to allow comma display, handle parsing
                        id={`roundSize-mobile-${index}`}
                        value={round.roundSize === null ? '' : round.roundSize.toLocaleString()}
                        onFocus={(e) => { e.target.value = formatCurrencyInput(round.roundSize); }}
                        onBlur={(e) => { handleInputChange(index, 'roundSize', e.target.value.replace(/[^\d.]/g, '')); }}
                        onChange={(e) => { handleInputChange(index, 'roundSize', e.target.value.replace(/[^\d.]/g, ''));}}
                        placeholder={getTip(roundNameKey, 'roundSize')?.placeholder || (round.name === 'Exit' ? "e.g., 500M" : "e.g., 500K")}
                        className="w-full" disabled={!round.isEnabled} aria-label={`${round.name} round size`}
                    />
                    {getTip(roundNameKey, 'roundSize')?.typicalRange && <p className="text-xs text-muted-foreground mt-1">Typical: {getTip(roundNameKey, 'roundSize')?.typicalRange}</p>}
                </div>

                <CollapsibleContent className="px-3 sm:px-4 pb-3 space-y-3 border-t pt-3">
                    {/* Dilution % */}
                    {round.name !== 'Exit' && (
                    <div className="space-y-1">
                        <Label htmlFor={`dilution-mobile-${index}`} className="text-sm font-medium">Dilution (%) <InfoTip tipData={generalTooltips.dilution} usePopover /></Label>
                        {round.roundType === 'SAFE' ? 
                            (<p className="text-sm text-muted-foreground italic pt-2">{displayPercentage(round.dilutionPercent)} (at conversion)</p>) : 
                            (<>
                                <Input type="number" id={`dilution-mobile-${index}`} value={round.dilutionPercent === null ? '' : String(round.dilutionPercent)} onChange={(e) => handleInputChange(index, 'dilutionPercent', e.target.value)} placeholder="e.g., 10" className="w-full" min="0" max="100" step="0.1" disabled={!round.isEnabled} aria-label={`${round.name} dilution percent`} />
                                {getTip(roundNameKey, 'dilutionPercent')?.typicalRange && <p className="text-xs text-muted-foreground mt-1">Typical: {getTip(roundNameKey, 'dilutionPercent')?.typicalRange}</p>}
                            </>)
                        }
                    </div>
                    )}
                    {/* ARR Multiple */}
                    <div className="space-y-1">
                        <Label htmlFor={`arrMultiple-mobile-${index}`} className="text-sm font-medium">ARR Multiple (x) <InfoTip tipData={generalTooltips.arrMultiple} usePopover /></Label>
                        <Input type="number" id={`arrMultiple-mobile-${index}`} value={round.arrMultiple === null ? '' : String(round.arrMultiple)} onChange={(e) => handleInputChange(index, 'arrMultiple', e.target.value)} placeholder={getTip(roundNameKey, 'arrMultiple')?.placeholder || "e.g., 10"} className="w-full" min="0" step="0.1" disabled={!round.isEnabled || (round.name === 'Pre-Seed' && round.roundType !== 'SAFE')} aria-label={`${round.name} ARR multiple`} />
                        {getTip(roundNameKey, 'arrMultiple')?.typicalRange && <p className="text-xs text-muted-foreground mt-1">Typical: {getTip(roundNameKey, 'arrMultiple')?.typicalRange}</p>}
                    </div>
                    {/* Calculated Fields */}
                    <div className="grid grid-cols-1 gap-1 text-sm pt-2">
                        <div><span className="font-medium text-muted-foreground">Pre-Money:</span> {displayCurrency(round.preMoneyValuation)}</div>
                        <div><span className="font-medium text-muted-foreground">Post-Money:</span> {displayCurrency(round.postMoneyValuation)}</div>
                        <div><span className="font-medium text-muted-foreground">Req. ARR:</span> {displayCurrency(round.requiredARR)}</div>
                    </div>
                </CollapsibleContent>
              </Collapsible>
              {/* Advanced Settings - Rendered outside main collapsible content for independent control, but visually part of the card */}
              {isMainExpanded && round.isEnabled && (
                <Collapsible open={isAdvancedPanelOpen} onOpenChange={() => toggleAdvanced(index)} className="border-t">
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 sm:p-4 text-left text-primary hover:bg-muted/50">
                        <span className="font-medium">Advanced Settings</span>
                        <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isAdvancedPanelOpen ? 'rotate-180' : ''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-0"> {/* Padding handled by renderAdvancedSettings for mobile */}
                        {renderAdvancedSettings(round, index, true)}
                    </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}; 