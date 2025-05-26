"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useRef } from 'react';
import { RoundInput, SummaryMetrics } from '@/lib/types';
import { calculateAllRounds, CalculationResult } from '@/lib/calculations';
import { InputParametersTable } from '@/components/InputParametersTable';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { OwnershipChart } from "@/components/OwnershipChart";
import { OwnershipTable } from "@/components/OwnershipTable";
import { RevenueGrowthTable } from "@/components/RevenueGrowthTable";
import { InvestorReturnsTable } from "@/components/InvestorReturnsTable";
import { SummaryView } from "@/components/SummaryView";
import { Switch } from "@/components/ui/switch";
import { generalTooltips } from "@/lib/tips";
import { InfoTip } from "@/components/InfoTip";
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
// import { Download } from 'lucide-react';
// import { Canvg } from 'canvg';
// import dynamic from 'next/dynamic';
// import { Document, Page, Text, View, StyleSheet as PdfStyleSheet } from '@react-pdf/renderer';

// DYNAMIC IMPORTS FOR REACT-PDF RENDERER COMPONENTS
// const PDFViewerWithNoSSR = dynamic(
//   () => import('@react-pdf/renderer').then(mod => mod.PDFViewer),
//   { ssr: false }
// );

// const PDFDownloadLinkWithNoSSR = dynamic(
//   () => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink),
//   { ssr: false }
// );

// const ReportPDFWithNoSSR = dynamic(
//   () => import('@/components/ReportPDF'),
//   { ssr: false }
// );

// Define a very simple PDF document for testing
// const MinimalPdfDocument = () => (
//   <Document>
//     <Page size="A4" style={{ paddingTop: 35, paddingBottom: 50, paddingHorizontal: 35 }}>
//       <View>
//         <Text style={{ fontSize: 24, textAlign: 'center', color: 'blue' }}>Minimal PDF Test</Text>
//         <Text style={{ fontSize: 12, marginTop: 20 }}>If you see this, PDFViewer is working with a basic document.</Text>
//       </View>
//     </Page>
//   </Document>
// );

// Define a simplified version of ReportPDF for testing
// const SimplifiedReportPDF = ({ companyName = "Test Company" }: { companyName?: string }) => (
//   <Document>
//     <Page size="A4" style={{ paddingTop: 35, paddingBottom: 50, paddingHorizontal: 35 }}>
//       <View style={{ marginBottom: 20, paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: '#FF7A00' }}>
//         <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#FF7A00', textAlign: 'center' }}>
//           {companyName} - Fundraising Strategy
//         </Text>
//         <Text style={{ fontSize: 11, color: '#4A4A4A', marginTop: 4, textAlign: 'center' }}>
//           Report Generated: {new Date().toLocaleDateString()}
//         </Text>
//       </View>
//       
//       <View style={{ marginVertical: 10 }}>
//         <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1A202C', marginBottom: 10 }}>
//           Introduction
//         </Text>
//         <Text style={{ fontSize: 10, marginBottom: 4, lineHeight: 1.5, color: '#4A5568' }}>
//           This is a simplified test of the ReportPDF structure. If you see this, basic PDF structure works.
//         </Text>
//       </View>

//       <Text style={{ position: 'absolute', fontSize: 9, bottom: 25, left: 0, right: 0, textAlign: 'center', color: 'grey' }}>
//         Page 1
//       </Text>
//     </Page>
//   </Document>
// );

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
    summaryMetrics: {} as SummaryMetrics,
  });
  const [acv, setAcv] = useState<number>(50000);
  const [isClient, setIsClient] = useState(false);

  const ownershipChartRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isConfigurationOpen, setIsConfigurationOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
    let parsedValue: string | number | boolean | null = value;

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
        const numValue = value === '' ? null : parseFloat(value);
        if (value !== '' && isNaN(numValue as number)) return; // Ignore if not a valid number
        parsedValue = numValue;
        if (numValue !== null) {
          if (field === 'dilutionPercent' || field === 'discountRate' || field === 'optionPoolPercent') {
            if (numValue < 0 || numValue > 100) return; // Clamp between 0-100
          } else if (field === 'investorBoardSeats') {
            if (numValue < 0 || !Number.isInteger(numValue)) return; // Non-negative integer
          } else if (numValue < 0) {
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

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;
      let yPosition = 25;

      // Helper function to add a footer
      const addFooter = () => {
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor('#999999');
        pdf.text('A Harrison Knoll Production', pageWidth / 2, pageHeight - 10, { align: 'center' });
      };

      // Helper function to check if we need a new page
      const checkPageBreak = (neededHeight: number) => {
        if (yPosition + neededHeight > pageHeight - 25) { // Account for footer space
          addFooter();
          pdf.addPage();
          yPosition = 25;
          return true;
        }
        return false;
      };

      // Helper function to add text with automatic page breaks
      const addText = (text: string, fontSize: number = 10, isBold: boolean = false, color: string = '#000000') => {
        checkPageBreak(fontSize + 5);
        pdf.setFontSize(fontSize);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        pdf.setTextColor(color);
        pdf.text(text, margin, yPosition);
        yPosition += fontSize * 0.6 + 3;
      };

      // Helper function to add a section title
      const addSectionTitle = (title: string) => {
        checkPageBreak(25);
        yPosition += 8;
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor('#FF7A00');
        pdf.text(title, margin, yPosition);
        yPosition += 8;
        // Add orange line
        pdf.setDrawColor(255, 122, 0);
        pdf.setLineWidth(0.5);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;
      };

      // HEADER
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor('#FF7A00');
      pdf.text('Startup Fundraising Simulator', pageWidth / 2, 30, { align: 'center' });
      
      // Orange line under title
      pdf.setDrawColor(255, 122, 0);
      pdf.setLineWidth(1);
      pdf.line(margin, 35, pageWidth - margin, 35);
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor('#666666');
      pdf.text('Model your startup\'s fundraising journey from pre-seed to exit.', pageWidth / 2, 42, { align: 'center' });
      pdf.text('Understand dilution, ESOP impact, and investor returns.', pageWidth / 2, 48, { align: 'center' });
      
      pdf.setFontSize(9);
      pdf.text('Brought to you by Harrison Knoll', pageWidth / 2, 55, { align: 'center' });
      pdf.text('LinkedIn: https://www.linkedin.com/in/scienceknoll/', pageWidth / 2, 60, { align: 'center' });
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 65, { align: 'center' });

      yPosition = 80;

      // 1. KEY METRICS AT EXIT (Most Important)
      addSectionTitle('Key Metrics at Exit');
      const exitRound = calculationResult.calculatedRounds.find(r => r.name === 'Exit' && r.isEnabled);
      const exitStage = calculationResult.ownershipStages.find(s => s.stageName === 'Exit');
      const foundersExitShare = exitStage?.shares.find(sh => sh.name === 'Founders');
      const esopExitShare = exitStage?.shares.find(sh => sh.name === 'ESOP');

      if (exitRound && exitStage) {
        addText(`Target Exit Valuation: $${exitRound.roundSize?.toLocaleString() || 'N/A'}`, 11, true);
        addText(`Founders' Ownership at Exit: ${foundersExitShare?.percentage.toFixed(2) || 'N/A'}%`, 11, true);
        addText(`Founders' Value at Exit: $${foundersExitShare?.valueAtExit?.toLocaleString() || 'N/A'}`, 11, true);
        addText(`Total ESOP at Exit: ${esopExitShare?.percentage.toFixed(2) || 'N/A'}%`, 11, true);
      } else {
        addText('Exit scenario not fully defined or calculated.', 10);
      }

      // 2. OWNERSHIP BREAKDOWN AT EXIT (as a proper table)
      addSectionTitle('Ownership Breakdown at Exit');
      if (exitStage) {
        const ownershipColWidths = [50, 30, 50]; // Name, Percentage, Value
        const ownershipRowHeight = 8;
        const tableWidth = ownershipColWidths.reduce((sum, width) => sum + width, 0);
        const tableStartX = margin + (contentWidth - tableWidth) / 2; // Center the table
        
        // Table headers
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor('#000000'); // Black text for headers
        pdf.setFillColor(247, 250, 252);
        pdf.rect(tableStartX, yPosition, tableWidth, ownershipRowHeight, 'F');
        
        let xPos = tableStartX + 2;
        pdf.text('Stakeholder', xPos, yPosition + 5);
        xPos += ownershipColWidths[0];
        pdf.text('Ownership %', xPos, yPosition + 5);
        xPos += ownershipColWidths[1];
        pdf.text('Value at Exit', xPos, yPosition + 5);
        
        yPosition += ownershipRowHeight;
        
        // Table rows
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor('#000000'); // Black text for content
        exitStage.shares.forEach((share, index) => {
          checkPageBreak(ownershipRowHeight + 5);
          
          if (index % 2 === 1) {
            pdf.setFillColor(249, 250, 251);
            pdf.rect(tableStartX, yPosition, tableWidth, ownershipRowHeight, 'F');
          }
          
          xPos = tableStartX + 2;
          // Make stakeholder name bold
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor('#000000'); // Black text for stakeholder names
          pdf.text(share.name, xPos, yPosition + 5);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor('#000000'); // Black text for values
          xPos += ownershipColWidths[0];
          pdf.text(`${share.percentage.toFixed(1)}%`, xPos, yPosition + 5);
          xPos += ownershipColWidths[1];
          pdf.text(`$${Math.round(share.valueAtExit || 0).toLocaleString()}`, xPos, yPosition + 5);
          
          yPosition += ownershipRowHeight;
        });
        
        yPosition += 5; // Add some space after table
      }

      // 3. OWNERSHIP CHART TITLE (but force chart to next page)
      addSectionTitle('Ownership Chart');
      
      // Force the chart itself to start on the next page
      addFooter();
      pdf.addPage();
      yPosition = 25;
      
      // Switch to ownership tab first
      const ownershipTabButton = document.querySelector('[value="ownership"]') as HTMLElement;
      if (ownershipTabButton) {
        ownershipTabButton.click();
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const resultsElement = document.getElementById('results');
      if (resultsElement) {
        try {
          const canvas = await html2canvas(resultsElement, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            scale: 1.5,
            logging: false,
            width: resultsElement.scrollWidth,
            height: resultsElement.scrollHeight
          });
          
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = contentWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Scale down if too large
          if (imgHeight > 200) {
            const scaledHeight = 200;
            const scaledWidth = (canvas.width * scaledHeight) / canvas.height;
            pdf.addImage(imgData, 'PNG', margin, yPosition, Math.min(scaledWidth, contentWidth), scaledHeight);
            yPosition += scaledHeight + 10;
          } else {
            pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight + 10;
          }
        } catch (error) {
          console.error('Error capturing ownership chart:', error);
          addText('Error capturing ownership chart', 10);
        }
      }

      // 4. ROUND CONFIGURATIONS
      addSectionTitle('Round Configurations');
      
      const enabledRounds = calculationResult.calculatedRounds.filter(r => r.isEnabled && r.name !== 'Exit');
      
      enabledRounds.forEach((round) => {
        checkPageBreak(50); // Check if we need space for round details
        
        // Round name as subheader
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor('#FF7A00');
        pdf.text(`${round.name}`, margin, yPosition);
        yPosition += 10;
        
        if (round.roundType === 'SAFE') {
          // SAFE rounds table - 2 columns, multiple rows
          const safeRowHeight = 7;
          const safeColWidths = [60, 70];
          
          const safeData = [
            ['Round Size', `$${round.roundSize?.toLocaleString() || 'N/A'}`],
            ['Round Type', round.roundType || 'N/A'],
            ['Dilution', `${round.dilutionPercent?.toFixed(1) || 'N/A'}%`],
            ['Valuation Cap', round.valuationCap ? `$${round.valuationCap.toLocaleString()}` : 'N/A'],
            ['Discount Rate', round.discountRate ? `${round.discountRate}%` : 'N/A'],
            ['ARR Multiple', round.arrMultiple ? `${round.arrMultiple}x` : 'N/A'],
            ['Required ARR', round.requiredARR ? `$${round.requiredARR.toLocaleString()}` : 'N/A']
          ];
          
          pdf.setFontSize(8);
          safeData.forEach((row, rowIndex) => {
            if (rowIndex % 2 === 0) {
              pdf.setFillColor(249, 250, 251);
              pdf.rect(margin, yPosition, safeColWidths[0] + safeColWidths[1], safeRowHeight, 'F');
            }
            
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor('#000000');
            pdf.text(row[0], margin + 2, yPosition + 4);
            
            pdf.setFont('helvetica', 'normal');
            pdf.text(row[1], margin + safeColWidths[0] + 2, yPosition + 4);
            
            yPosition += safeRowHeight;
          });
          
        } else if (round.roundType === 'Priced') {
          // Priced rounds table - 3 columns to fit more data
          const pricedRowHeight = 7;
          const pricedColWidths = [45, 40, 45];
          
          const pricedData = [
            ['Round Size', `$${round.roundSize?.toLocaleString() || 'N/A'}`, 'Round Type', round.roundType || 'N/A'],
            ['Dilution', `${round.dilutionPercent?.toFixed(1) || 'N/A'}%`, 'Pre-Money', `$${round.preMoneyValuation?.toLocaleString() || 'N/A'}`],
            ['Post-Money', `$${round.postMoneyValuation?.toLocaleString() || 'N/A'}`, 'LP Type', round.lpType || 'N/A'],
            ['LP Multiple', round.lpMultiple ? `${round.lpMultiple}x` : 'N/A', 'Anti-Dilution', round.antiDilution || 'N/A'],
            ['Option Pool', round.optionPoolPercent ? `${round.optionPoolPercent}%` : 'N/A', 'Board Seats', round.investorBoardSeats ? `${round.investorBoardSeats}` : 'N/A'],
            ['Pro-Rata', round.proRataRights !== null ? (round.proRataRights ? 'Yes' : 'No') : 'N/A', 'Protective Prov.', round.protectiveProvisions !== null ? (round.protectiveProvisions ? 'Yes' : 'No') : 'N/A'],
            ['Drag-Along', round.dragAlongRights !== null ? (round.dragAlongRights ? 'Yes' : 'No') : 'N/A', 'ARR Multiple', round.arrMultiple ? `${round.arrMultiple}x` : 'N/A'],
            ['Required ARR', round.requiredARR ? `$${round.requiredARR.toLocaleString()}` : 'N/A', '', '']
          ];
          
          pdf.setFontSize(8);
          pricedData.forEach((row, rowIndex) => {
            if (rowIndex % 2 === 0) {
              pdf.setFillColor(249, 250, 251);
              pdf.rect(margin, yPosition, contentWidth, pricedRowHeight, 'F');
            }
            
            // First pair (columns 1-2)
            if (row[0]) {
              pdf.setFont('helvetica', 'bold');
              pdf.setTextColor('#000000');
              pdf.text(row[0], margin + 2, yPosition + 4);
              
              pdf.setFont('helvetica', 'normal');
              pdf.text(row[1], margin + pricedColWidths[0] + 2, yPosition + 4);
            }
            
            // Second pair (columns 3-4)
            if (row[2]) {
              pdf.setFont('helvetica', 'bold');
              pdf.text(row[2], margin + pricedColWidths[0] + pricedColWidths[1] + 10, yPosition + 4);
              
              pdf.setFont('helvetica', 'normal');
              pdf.text(row[3], margin + pricedColWidths[0] + pricedColWidths[1] + pricedColWidths[2] + 12, yPosition + 4);
            }
            
            yPosition += pricedRowHeight;
          });
        }
        
        yPosition += 10; // Space between rounds
      });
      
      // Global settings
      checkPageBreak(30);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor('#FF7A00');
      pdf.text('Global Settings', margin, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor('#000000');
      addText(`Default Target ESOP %: ${esopPercentage}%`, 9);
      addText(`Liquidation Preference: ${liquidationPreferenceEnabled ? 'Enabled (1x Non-Participating)' : 'Disabled'}`, 9);
      addText(`Annual Contract Value: $${acv.toLocaleString()}`, 9);

      // Add footer to last page
      addFooter();

      // Save the PDF
      pdf.save('Fundraising_Strategy.pdf');
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // const generateChartImage = async () => {
  //   setTimeout(async () => {
  //     if (ownershipChartRef.current) {
  //       const svgElement = ownershipChartRef.current.querySelector('svg');
  //       if (svgElement) {
  //         console.log("SVG element FOUND after delay. Proceeding with Canvg.");
  //         try {
  //           const svgString = new XMLSerializer().serializeToString(svgElement);
  //           const canvas = document.createElement('canvas');
  //           const chartContainerWidth = ownershipChartRef.current.offsetWidth || 600;
  //           const chartHeight = 400;

  //           canvas.width = chartContainerWidth * 2;
  //           canvas.height = chartHeight * 2;
            
  //           const ctx = canvas.getContext('2d');
  //           if (ctx) {
  //             console.log("Attempting to generate chart image with Canvg...");
  //             const v = Canvg.fromString(ctx, svgString, {
  //               scaleWidth: canvas.width,
  //               scaleHeight: canvas.height,
  //               ignoreClear: true,
  //             });
  //             await v.render();
  //             const imageDataUrl = canvas.toDataURL('image/png');
  //             console.log("Chart image generated, first 50 chars:", imageDataUrl.substring(0,50));
  //             setOwnershipChartImage(imageDataUrl);
  //           } else {
  //             console.error("Could not get 2D context from canvas.");
  //             setOwnershipChartImage(null);
  //           }
  //         } catch (error) {
  //           console.error("Error during Canvg processing or canvas conversion:", error);
  //           setOwnershipChartImage(null);
  //         }
  //       } else {
  //         console.log("SVG element NOT FOUND within ownershipChartRef.current even after delay.");
  //         setOwnershipChartImage(null);
  //       }
  //     } else {
  //       console.log("ownershipChartRef.current is null in generateChartImage (after delay). This shouldn't happen.");
  //       setOwnershipChartImage(null);
  //     }
  //   }, 100);
  // };
  
  // useEffect(() => {
  //   console.log("Chart generation useEffect triggered. isClient:", isClient, "ownershipStages length:", calculationResult.ownershipStages.length, "ownershipChartRef.current:", ownershipChartRef.current);
  //   if (isClient && calculationResult.ownershipStages.length > 0 && ownershipChartRef.current) {
  //     console.log("Chart generation conditions met, calling generateChartImage().");
  //     generateChartImage();
  //   } else {
  //     console.log("Chart generation conditions NOT MET. isClient:", isClient, "ownershipStages length:", calculationResult.ownershipStages.length, "ownershipChartRef.current:", ownershipChartRef.current);
  //   }
  // }, [calculationResult.ownershipStages, isClient]);

  return (
    <main className="container mx-auto p-8">
      <header className="text-center my-8 md:my-12 lg:my-16">
        <h1 className="relative text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--header-gradient-start)] to-[var(--header-gradient-end)] animate-underline-draw pb-2">Startup Fundraising Simulator</h1>
        <p className="text-lg text-muted-foreground mt-3 md:mt-4 max-w-2xl mx-auto">
          Model your startup&apos;s fundraising journey from pre-seed to Series C and beyond. Understand dilution, ESOP impact, and investor returns.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          brought to you by <a href="https://www.linkedin.com/in/scienceknoll/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Harrison Knoll</a>
        </p>
        {isClient && calculationResult.calculatedRounds.length > 0 && (
          <div className="mt-6">
            <Button 
              onClick={generatePDF}
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? 'Generating PDF...' : 'Export PDF Report'}
            </Button>
          </div>
        )}
        {/* {isClient && calculationResult.calculatedRounds.length > 0 && ownershipChartImage !== null && (
          <div className="mt-6">
            <PDFDownloadLinkWithNoSSR
              document={
                <SimplifiedReportPDF companyName="My Startup Inc." />
              }
              fileName="Fundraising_Strategy.pdf"
            >
              {({ blob, url, loading, error }) =>
                loading ? (
                  <Button disabled>
                    Generating PDF...
                  </Button>
                ) : (
                  <Button>
                    Export PDF
                  </Button>
                )
              }
            </PDFDownloadLinkWithNoSSR>
          </div>
        )}
        {isClient && calculationResult.calculatedRounds.length > 0 && ownershipChartImage === null && (
            <div className="mt-6">
                <Button disabled>
                    Generating Chart for PDF...
                </Button>
            </div>
        )} */}
      </header>

      <section id="input-parameters" className="my-12 p-6 rounded-lg bg-card border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-foreground">Fundraising Rounds & Growth</h2>
        </div>
        <InputParametersTable 
            roundsData={calculationResult.calculatedRounds} 
            handleInputChange={handleInputChange}
            handleRoundEnabledChange={handleRoundEnabledChange}
        />
      </section>

      <section id="configuration" className="my-12 p-6 rounded-lg bg-card border">
        <Collapsible open={isConfigurationOpen} onOpenChange={setIsConfigurationOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex items-center justify-between w-full p-0 h-auto">
              <h2 className="text-2xl font-semibold text-foreground">Configuration</h2>
              <ChevronDown 
                className={`h-5 w-5 transition-transform duration-200 ${
                  isConfigurationOpen ? 'transform rotate-180' : ''
                }`}
              />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
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
          </CollapsibleContent>
        </Collapsible>
      </section>

      <section id="results" className="my-12 p-6 rounded-lg bg-card border">
        <h2 className="text-2xl font-semibold mb-4 text-foreground">Simulation Results</h2>
        <Tabs defaultValue="ownership" className="w-full">
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
                <div ref={ownershipChartRef}>
                  <OwnershipChart ownershipStages={calculationResult.ownershipStages} />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Cap Table by Stage</h3>
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

      <footer className="text-center text-sm text-muted-foreground my-8 md:my-12 py-8 border-t border-border">
        © {new Date().getFullYear()} A Harrison Knoll Production. All rights reserved. This tool is for illustrative purposes only.
      </footer>
    </main>
  );
}
