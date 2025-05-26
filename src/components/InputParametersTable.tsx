import React, { useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
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

interface InputParametersTableProps {
  roundsData: CalculatedRound[];
  handleInputChange: (index: number, field: keyof RoundInput, value: string) => void;
  handleRoundEnabledChange: (index: number, isEnabled: boolean) => void;
}

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return 'N/A';
  return `$${value.toLocaleString()}`;
};

const formatPercentage = (value: number | null | undefined) => {
  if (value === null || value === undefined) return 'N/A';
  const roundedValue = Math.round(value * 10) / 10;
  return `${roundedValue}%`;
};



export const InputParametersTable: React.FC<InputParametersTableProps> = ({ 
  roundsData, 
  handleInputChange, 
  handleRoundEnabledChange 
}) => {
  const [expandedRowIndex, setExpandedRowIndex] = useState<number | null>(null);

  const toggleAdvanced = (index: number) => {
    setExpandedRowIndex(expandedRowIndex === index ? null : index);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">Enabled</TableHead>
          <TableHead className="w-[150px]">Round</TableHead>
          <TableHead className="w-[180px]">
            Round Size ($) <InfoTip tipData={generalTooltips.roundSize} />
          </TableHead>
          <TableHead className="w-[130px]">
            Dilution (%) <InfoTip tipData={generalTooltips.dilution} />
          </TableHead>
          <TableHead className="w-[140px]">
            ARR Multiple (x) <InfoTip tipData={generalTooltips.arrMultiple} />
          </TableHead>
          <TableHead>Pre-Money Val. ($)</TableHead>
          <TableHead>Post-Money Val. ($)</TableHead>
          <TableHead>Required ARR ($)</TableHead>
          <TableHead className="w-[100px] text-right">
            Advanced <InfoTip tipData={generalTooltips.advancedSettings} />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {roundsData.map((round, index) => {
          const roundNameKey = round.name as RoundName;
          return (
            <React.Fragment key={round.name}>
              <TableRow className={!round.isEnabled ? "opacity-50" : ""}>
                <TableCell>
                  <Switch
                    checked={round.isEnabled}
                    onCheckedChange={(isEnabled) => handleRoundEnabledChange(index, isEnabled)}
                    disabled={round.name === 'Exit'}
                  />
                </TableCell>
                <TableCell className="font-medium">{round.name}</TableCell>
                <TableCell>
                  {/* Always show Input for roundSize, including for Exit (as Exit Valuation) */}
                  <>
                    <Input
                      type="text" 
                      value={round.roundSize === null ? '' : formatCurrency(round.roundSize).replace("$","")}
                      onFocus={(e) => {
                        const rawValue = round.roundSize === null ? '' : String(round.roundSize);
                        e.target.value = rawValue;
                      }}
                      onBlur={(e) => {
                          // Clean the value from e.target.value before sending to handleInputChange
                          const cleanValue = e.target.value.replace(/[^\d.]/g, '');
                          handleInputChange(index, 'roundSize', cleanValue)
                      }}
                      onChange={(e) => {
                          const inputValue = e.target.value;
                          const numericValue = inputValue.replace(/[^\d.]/g, '');
                          handleInputChange(index, 'roundSize', numericValue); 
                      }}
                      placeholder={getTip(roundNameKey, 'roundSize')?.placeholder || (round.name === 'Exit' ? "e.g., 500M" : "e.g., 500K")}
                      className="w-full"
                      disabled={!round.isEnabled} // Enable for Exit row too if isEnabled is true
                    />
                    {round.name === 'Exit' && 
                        <span className="text-xs text-muted-foreground ml-1 flex items-center">
                            (Exit Valuation) <InfoTip tipData={getTip('Exit', 'roundSize')} />
                        </span>
                    }
                    {getTip(roundNameKey, 'roundSize')?.typicalRange && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Typical: {getTip(roundNameKey, 'roundSize')?.typicalRange}
                      </p>
                    )}
                  </>
                </TableCell>
                <TableCell>
                  {round.name === 'Exit' ? (
                    <span>N/A</span>
                  ) : round.roundType === 'SAFE' ? (
                    <span className="text-sm text-muted-foreground italic">
                        {round.dilutionPercent !== null && round.dilutionPercent !== undefined 
                          ? `${formatPercentage(round.dilutionPercent)} (effective)`
                          : "Pending Conversion"}
                    </span>
                  ) : (
                    <>
                      <Input
                        type="number"
                        value={round.dilutionPercent === null ? '' : round.dilutionPercent}
                        onChange={(e) => handleInputChange(index, 'dilutionPercent', e.target.value)}
                        placeholder={getTip(roundNameKey, 'dilutionPercent')?.placeholder || "e.g., 10"}
                        className="w-full"
                        min="0"
                        max="100"
                        disabled={!round.isEnabled}
                      />
                      {getTip(roundNameKey, 'dilutionPercent')?.typicalRange && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Typical: {getTip(roundNameKey, 'dilutionPercent')?.typicalRange}
                        </p>
                      )}
                    </>
                  )}
                </TableCell>
                <TableCell>
                  <>
                    <Input
                      type="number"
                      value={round.arrMultiple === null ? '' : round.arrMultiple}
                      onChange={(e) => handleInputChange(index, 'arrMultiple', e.target.value)}
                      placeholder={getTip(roundNameKey, 'arrMultiple')?.placeholder ||(round.name === 'Pre-Seed' ? 'N/A' : "e.g., 10")}
                      className="w-full"
                      disabled={!round.isEnabled || (round.name === 'Pre-Seed' && round.roundType !== 'SAFE')}
                    />
                    {getTip(roundNameKey, 'arrMultiple')?.typicalRange && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Typical: {getTip(roundNameKey, 'arrMultiple')?.typicalRange}
                      </p>
                    )}
                  </>
                </TableCell>
                <TableCell>{formatCurrency(round.preMoneyValuation)}</TableCell>
                <TableCell>{formatCurrency(round.postMoneyValuation)}</TableCell>
                <TableCell>{formatCurrency(round.requiredARR)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" disabled={!round.isEnabled} onClick={() => toggleAdvanced(index)}>
                    {expandedRowIndex === index ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    <span className="sr-only">Toggle Advanced Settings</span>
                  </Button>
                </TableCell>
              </TableRow>
              {expandedRowIndex === index && (
                <TableRow>
                  <TableCell colSpan={9} className="whitespace-normal">
                    <div className="p-4 bg-muted/50 rounded-md my-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                      
                      <div className="md:col-span-2 lg:col-span-3 border-b border-border/50 pb-2 mb-2">
                        <h4 className="font-semibold flex items-center">
                          {round.name} - Advanced Settings
                          {round.name === 'Exit' && <InfoTip tipData={generalTooltips.exitScenario} />}
                          {round.roundType === 'SAFE' && <InfoTip tipData={generalTooltips.safeGeneral} />}
                          {round.roundType !== 'SAFE' && (round.name === 'Pre-Seed' || round.name === 'Seed') && <InfoTip tipData={generalTooltips.convertibleNoteGeneral} />}
                          {round.roundType !== 'SAFE' && round.name !== 'Exit' && !(round.name === 'Pre-Seed' || round.name === 'Seed') && <InfoTip tipData={generalTooltips.pricedRoundGeneral} />}
                        </h4>
                      </div>

                      {(round.name === 'Pre-Seed' || round.name === 'Seed') && (
                        <div className="space-y-1">
                          <Label htmlFor={`roundType-${index}`} className="flex items-center text-sm font-medium">
                            Round Type <InfoTip tipData={getTip(roundNameKey, 'roundType')} />
                          </Label>
                          <Select
                            value={round.roundType || 'Priced'}
                            onValueChange={(value) => handleInputChange(index, 'roundType', value as string)}
                            disabled={!round.isEnabled}
                          >
                            <SelectTrigger id={`roundType-${index}`} className="w-full">
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
                            <Label htmlFor={`valuationCap-${index}`} className="flex items-center text-sm font-medium">
                              Valuation Cap ($) <InfoTip tipData={generalTooltips.valuationCap} />
                            </Label>
                            <Input
                              type="number"
                              id={`valuationCap-${index}`}
                              value={round.valuationCap === null || round.valuationCap === undefined ? '' : round.valuationCap}
                              onChange={(e) => handleInputChange(index, 'valuationCap', e.target.value)}
                              placeholder={getTip(roundNameKey, 'valuationCap')?.placeholder || "e.g., 5M"}
                              className="w-full"
                              disabled={!round.isEnabled}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`discountRate-${index}`} className="flex items-center text-sm font-medium">
                                Discount Rate (%) <InfoTip tipData={generalTooltips.discountRate} />
                            </Label>
                            <Input
                                type="number"
                                id={`discountRate-${index}`}
                                value={round.discountRate === null || round.discountRate === undefined ? '' : round.discountRate}
                                onChange={(e) => handleInputChange(index, 'discountRate', e.target.value)}
                                placeholder={getTip(roundNameKey, 'discountRate')?.placeholder || "e.g., 20%"}
                                className="w-full"
                                min="0"
                                max="100"
                                disabled={!round.isEnabled}
                            />
                          </div>
                          <p className='md:col-span-2 lg:col-span-3 text-xs text-muted-foreground'>Dilution % for SAFE rounds will be calculated upon conversion. The effective dilution depends on the terms of the next priced round.</p>
                        </>
                      )}

                      {round.isEnabled && round.roundType !== 'SAFE' && round.name !== 'Exit' && (
                        <>
                          <div className="space-y-1">
                            <Label htmlFor={`lpType-${index}`} className="flex items-center text-sm font-medium">
                              Liquidation Preference <InfoTip tipData={generalTooltips.liquidationPreference} />
                            </Label>
                            <Select
                              value={round.lpType || 'None'}
                              onValueChange={(value) => handleInputChange(index, 'lpType', value as string)}
                              disabled={!round.isEnabled}
                            >
                              <SelectTrigger id={`lpType-${index}`} className="w-full">
                                <SelectValue placeholder="Select LP Type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="None">None</SelectItem>
                                <SelectItem value="NonParticipating">1x Non-Participating</SelectItem>
                                <SelectItem value="Participating">Participating</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1">
                            <Label htmlFor={`lpMultiple-${index}`} className="flex items-center text-sm font-medium">
                              LP Multiple (x) <InfoTip tipData={generalTooltips.multiple} />
                            </Label>
                            <Input
                              type="number"
                              id={`lpMultiple-${index}`}
                              value={round.lpMultiple === null || round.lpMultiple === undefined ? '' : round.lpMultiple}
                              onChange={(e) => handleInputChange(index, 'lpMultiple', e.target.value)}
                              placeholder="e.g., 1"
                              className="w-full"
                              min="0"
                              disabled={!round.isEnabled || !round.lpType || round.lpType === 'NonParticipating'}
                            />
                            {round.lpType === 'NonParticipating' && <p className="text-xs text-muted-foreground">Multiple for Non-Participating is fixed at 1x.</p>}
                          </div>

                          <div className="space-y-1">
                            <Label htmlFor={`proRataRights-${index}`} className="flex items-center text-sm font-medium">
                              Pro-Rata Rights <InfoTip tipData={generalTooltips.proRataRights} />
                            </Label>
                            <Select
                              value={round.proRataRights === null ? '' : String(round.proRataRights)}
                              onValueChange={(value) => handleInputChange(index, 'proRataRights', value as string)}
                              disabled={!round.isEnabled}
                            >
                              <SelectTrigger id={`proRataRights-${index}`} className="w-full">
                                <SelectValue placeholder="Select option" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Yes</SelectItem>
                                <SelectItem value="false">No</SelectItem>
                                <SelectItem value="unspecified_pr">N/A (or Not Specified)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1">
                            <Label htmlFor={`antiDilution-${index}`} className="flex items-center text-sm font-medium">
                              Anti-Dilution <InfoTip tipData={generalTooltips.antiDilution} />
                            </Label>
                            <Select
                              value={round.antiDilution || 'None'}
                              onValueChange={(value) => handleInputChange(index, 'antiDilution', value as string)}
                              disabled={!round.isEnabled}
                            >
                              <SelectTrigger id={`antiDilution-${index}`} className="w-full">
                                <SelectValue placeholder="Select protection" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="None">None</SelectItem>
                                <SelectItem value="BroadBasedWA">Broad-Based WA</SelectItem>
                                <SelectItem value="FullRatchet">Full Ratchet</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1">
                            <Label htmlFor={`optionPoolPercent-${index}`} className="flex items-center text-sm font-medium">
                              Option Pool (Pre-Round %) <InfoTip tipData={generalTooltips.optionPool} />
                            </Label>
                            <Input
                              type="number"
                              id={`optionPoolPercent-${index}`}
                              value={round.optionPoolPercent === null || round.optionPoolPercent === undefined ? '' : round.optionPoolPercent}
                              onChange={(e) => handleInputChange(index, 'optionPoolPercent', e.target.value)}
                              placeholder="e.g., 10 or 15 (%)"
                              className="w-full"
                              min="0"
                              max="100"
                              disabled={!round.isEnabled}
                            />
                          </div>

                          <div className="space-y-1">
                            <Label htmlFor={`investorBoardSeats-${index}`} className="flex items-center text-sm font-medium">
                              Investor Board Seats <InfoTip tipData={generalTooltips.boardSeats} />
                            </Label>
                            <Input
                              type="number"
                              id={`investorBoardSeats-${index}`}
                              value={round.investorBoardSeats === null || round.investorBoardSeats === undefined ? '' : round.investorBoardSeats}
                              onChange={(e) => handleInputChange(index, 'investorBoardSeats', e.target.value)}
                              placeholder="e.g., 0, 1, or 2"
                              className="w-full"
                              min="0"
                              step="1"
                              disabled={!round.isEnabled}
                            />
                          </div>

                          {/* Protective Provisions - New */}
                          <div className="space-y-1">
                            <Label htmlFor={`protectiveProvisions-${index}`} className="flex items-center text-sm font-medium">
                              Protective Provisions <InfoTip tipData={generalTooltips.protectiveProvisions} />
                            </Label>
                            <Select
                              value={round.protectiveProvisions === null ? 'unspecified_pr' : String(round.protectiveProvisions)}
                              onValueChange={(value) => handleInputChange(index, 'protectiveProvisions', value as string)}
                              disabled={!round.isEnabled}
                            >
                              <SelectTrigger id={`protectiveProvisions-${index}`} className="w-full">
                                <SelectValue placeholder="Select option" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Yes (Standard)</SelectItem>
                                <SelectItem value="false">No</SelectItem>
                                <SelectItem value="unspecified_pr">N/A or Not Specified</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Drag-Along Rights - New */}
                          <div className="space-y-1">
                            <Label htmlFor={`dragAlongRights-${index}`} className="flex items-center text-sm font-medium">
                              Drag-Along Rights <InfoTip tipData={generalTooltips.dragAlongRights} />
                            </Label>
                            <Select
                              value={round.dragAlongRights === null ? 'unspecified_pr' : String(round.dragAlongRights)}
                              onValueChange={(value) => handleInputChange(index, 'dragAlongRights', value as string)}
                              disabled={!round.isEnabled}
                            >
                              <SelectTrigger id={`dragAlongRights-${index}`} className="w-full">
                                <SelectValue placeholder="Select option" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Yes (Standard)</SelectItem>
                                <SelectItem value="false">No</SelectItem>
                                <SelectItem value="unspecified_pr">N/A or Not Specified</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="md:col-span-2 lg:col-span-3 pt-2">
                             <p className="text-xs text-muted-foreground break-words">
                               Liquidation Preference: If &quot;None&quot;, global toggle applies. For SAFEs, terms convert from SAFE notes. Participating preferred gets preference AND shares with common.
                             </p>
                             <p className="text-xs text-muted-foreground break-words mt-1">
                               Note: Protective Provisions and Drag-Along Rights are important governance terms but do not directly change the financial calculations in this simulator. Anti-dilution (which can be relevant in down rounds) is modeled.
                             </p>
                          </div>
                        </>
                      )}
                      
                      {round.name === 'Exit' && (
                        <p className="md:col-span-2 lg:col-span-3 text-sm text-muted-foreground">
                          Exit Valuation is primary. Liquidation preferences & SAFE conversions are calculated against this.
                        </p>
                      )}

                      {!(round.name === 'Exit' || (round.roundType === 'SAFE' && (round.name === 'Pre-Seed' || round.name === 'Seed')) || (round.isEnabled && round.roundType !== 'SAFE' && round.name !== 'Exit') ) && (
                         <p className="md:col-span-2 lg:col-span-3 text-sm text-muted-foreground mt-4 pt-4 border-t border-border/50">
                          Additional advanced settings will appear based on selections.
                         </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          );
        })}
      </TableBody>
    </Table>
  );
}; 