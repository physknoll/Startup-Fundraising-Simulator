import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { CalculationResult, RoundInput } from '@/lib/types';
import { generalTooltips } from '@/lib/tips';

// --- Font Registration (Optional but Recommended for Custom Fonts) ---
// If you want to use Geist Sans/Mono in your PDF, you'll need the .ttf files.
// Place them in your `public/fonts` directory (create if it doesn't exist).
// Example:
// Font.register({
//   family: 'Geist Sans',
//   fonts: [
//     { src: '/fonts/Geist-Regular.ttf' }, // Ensure this path is correct if you host them
//     { src: '/fonts/Geist-Bold.ttf', fontWeight: 'bold' },
//   ],
// });
// Font.register({
//   family: 'Geist Mono',
//   fonts: [
//     { src: '/fonts/GeistMono-Regular.ttf' },
//   ]
// });
// For @react-pdf/renderer, font sources often need to be absolute URLs or fetched/embedded.
// For simplicity, we'll proceed assuming default fonts or that you'll configure this.

// --- Styles Definition ---
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    paddingTop: 35,
    paddingBottom: 50, // Space for page number
    paddingHorizontal: 35,
    // fontFamily: 'Geist Sans', // Uncomment if font is registered
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#FF7A00', // Your primary color
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF7A00', // Primary color
    // fontFamily: 'Geist Sans', // With bold weight
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 11,
    color: '#4A4A4A',
    marginTop: 4,
  },
  section: {
    marginVertical: 10,
    paddingVertical: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A202C', // Darker text
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0', // Light border
  },
  h3: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 6,
    marginTop: 8,
  },
  text: {
    fontSize: 10,
    marginBottom: 4,
    lineHeight: 1.5,
    color: '#4A5568',
  },
  table: {
    // @ts-expect-error - react-pdf doesn't have display table in types but supports it
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 0.5,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: '#F7FAFC', // Light gray for header
    borderBottomWidth: 1,
    borderBottomColor: '#CBD5E0',
  },
  tableColHeader: {
    // width is set dynamically
    borderStyle: "solid",
    borderRightWidth: 0.5,
    borderRightColor: '#E2E8F0',
    padding: 6,
  },
  tableCol: {
    // width is set dynamically
    borderStyle: "solid",
    borderRightWidth: 0.5,
    borderRightColor: '#E2E8F0',
    padding: 6,
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  tableCell: {
    fontSize: 9,
    color: '#4A5568',
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 9,
    bottom: 25,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'grey',
  },
  infoTipExplanation: {
    fontSize: 8.5,
    color: '#718096', // Muted color
    fontStyle: 'italic',
    marginTop: 2,
    marginBottom: 6,
    paddingLeft: 10,
    lineHeight: 1.3,
  },
  settingItem: {
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingHorizontal: 2,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#4A5568',
  },
  summaryValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  chartImage: {
    width: '100%',
    height: 280,
    alignSelf: 'center',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  roundSettingItem: {
    marginBottom: 7,
  },
  settingLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333333',
  },
  settingValue: {
    fontWeight: 'normal',
    color: '#555555',
  },
  calculatedValueText: {
    fontSize: 10, color: '#4A5568', marginBottom: 3, marginLeft: 10
  },
  // More styles will be added per phase
});

// --- Props Interface ---
interface ReportPDFProps {
  calculationResult: CalculationResult;
  inputRounds: RoundInput[];
  esopPercentage: number;
  liquidationPreferenceEnabled: boolean;
  acv: number;
  ownershipChartImage: string | null; // For the chart image data URI
  companyName?: string;
  reportDate?: string;
}

// --- Helper Functions for Formatting ---
const formatCurrencyPDF = (value: number | null | undefined, defaultValue: string = 'N/A') => {
  if (value === null || value === undefined || isNaN(value)) return defaultValue;
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};
const formatPercentagePDF = (value: number | null | undefined, digits: number = 2, defaultValue: string = 'N/A') => {
  if (value === null || value === undefined || isNaN(value)) return defaultValue;
  return `${value.toFixed(digits)}%`;
};


// --- Main PDF Component ---
const ReportPDF: React.FC<ReportPDFProps> = ({
  calculationResult,
  esopPercentage,
  liquidationPreferenceEnabled,
  acv,
  ownershipChartImage,
  companyName = "Your Startup",
  reportDate = new Date().toLocaleDateString(),
}) => {
  const { calculatedRounds, ownershipStages } = calculationResult;
  console.log("ReportPDF ownershipChartImage:", ownershipChartImage);

  return (
    <Document author="Startup Fundraising Simulator" title={`${companyName} - Fundraising Strategy`}>
      <Page size="A4" style={styles.page}>
        {/* Page 1: Header and Overview */}
        <View style={styles.header}>
          {/* Consider adding a logo using <Image /> if you have one */}
          {/* <Image src="URL_TO_LOGO_OR_BASE64_DATA_URI" style={{ width: 100, marginBottom: 10 }} /> */}
          <Text style={styles.title}>{companyName} - Fundraising Strategy</Text>
          <Text style={styles.subtitle}>Report Generated: {reportDate}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Introduction</Text>
          <Text style={styles.text}>
            This report provides a comprehensive overview of the simulated fundraising journey for {companyName}.
            It includes details on each funding round, capitalization changes, ownership dilution, key financial metrics,
            and explanations of common term sheet parameters.
          </Text>
        </View>
        
        {/* --- Global Configuration Section --- UNCOMMENTED PREVIOUSLY COMMENTED BLOCK */}
        <View style={styles.section} wrap={false}> 
          <Text style={styles.sectionTitle}>Global Configuration</Text>
          <View style={styles.settingItem}>
            <Text style={styles.h3}>Default ESOP Target (Priced Rounds)</Text>
            <Text style={styles.text}>{esopPercentage}%</Text>
            <Text style={styles.infoTipExplanation}>{generalTooltips.globalEsopDefault.explanation}</Text>
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.h3}>Global Liquidation Preference (Default)</Text>
            <Text style={styles.text}>
              {liquidationPreferenceEnabled
                ? "Enabled (1x Non-Participating for Investors)"
                : "Disabled / Per-Round Setting"}
            </Text>
            <Text style={styles.infoTipExplanation}>{generalTooltips.globalLiquidationPreference.explanation}</Text>
          </View>
           <View style={styles.settingItem}>
            <Text style={styles.h3}>Annual Contract Value (ACV) for Growth Metrics</Text>
            <Text style={styles.text}>{formatCurrencyPDF(acv)}</Text>
          </View>
        </View>
        
        
        {/* --- Key Metrics at Exit Section (from SummaryView) --- UNCOMMENTED */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Key Metrics at Exit</Text>
          {(() => { 
            const exitRound = calculatedRounds.find(r => r.name === 'Exit' && r.isEnabled);
            const exitStage = ownershipStages.find(s => s.stageName === 'Exit');
            const foundersExitShare = exitStage?.shares.find(sh => sh.name === 'Founders');
            const esopExitShare = exitStage?.shares.find(sh => sh.name === 'ESOP');

            if (!exitRound || !exitStage) {
              return <Text style={styles.text}>Exit scenario not fully defined or calculated.</Text>;
            }

            return (
              <>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Target Exit Valuation:</Text>
                  <Text style={styles.summaryValue}>{formatCurrencyPDF(exitRound?.roundSize)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Founders&apos; Ownership at Exit:</Text>
                  <Text style={styles.summaryValue}>{formatPercentagePDF(foundersExitShare?.percentage)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Founders&apos; Value at Exit:</Text>
                  <Text style={styles.summaryValue}>{formatCurrencyPDF(foundersExitShare?.valueAtExit)}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total ESOP at Exit:</Text>
                  <Text style={styles.summaryValue}>{formatPercentagePDF(esopExitShare?.percentage)}</Text>
                </View>
              </>
            );
          })()}
        </View>
        
        {/* --- Round Summary Table (from SummaryView) --- MODIFIED */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Fundraising Round Summary</Text>
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <View style={{...styles.tableColHeader, width: "20%"}}><Text style={styles.tableCellHeader}>Round</Text></View>
              <View style={{...styles.tableColHeader, width: "20%", textAlign: 'right'}}><Text style={styles.tableCellHeader}>Valuation/Size</Text></View>
              <View style={{...styles.tableColHeader, width: "20%", textAlign: 'right'}}><Text style={styles.tableCellHeader}>Dilution</Text></View>
              <View style={{...styles.tableColHeader, width: "20%", textAlign: 'right'}}><Text style={styles.tableCellHeader}>Post-Money</Text></View>
              <View style={{...styles.tableColHeader, width: "20%", textAlign: 'right'}}><Text style={styles.tableCellHeader}>Req. ARR</Text></View>
            </View>
            {calculatedRounds.filter(r => r.isEnabled).map(round => (
              <View style={styles.tableRow} key={`summary-${round.name}`}>
                <View style={{...styles.tableCol, width: "20%"}}><Text style={styles.tableCell}>{round.name}</Text></View>
                <View style={{...styles.tableCol, width: "20%", textAlign: 'right'}}>
                    <Text style={styles.tableCell}>{formatCurrencyPDF(round.roundSize)}</Text>
                </View>
                <View style={{...styles.tableCol, width: "20%", textAlign: 'right'}}>
                    <Text style={styles.tableCell}>{round.name === 'Exit' ? 'N/A' : formatPercentagePDF(round.dilutionPercent)}</Text>
                </View>
                <View style={{...styles.tableCol, width: "20%", textAlign: 'right'}}>
                    <Text style={styles.tableCell}>{formatCurrencyPDF(round.postMoneyValuation)}</Text>
                </View>
                <View style={{...styles.tableCol, width: "20%", textAlign: 'right'}}>
                    <Text style={styles.tableCell}>{round.name === 'Exit' && round.arrMultiple === null ? 'N/A' : formatCurrencyPDF(round.requiredARR)}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        
        {/* --- Ownership Chart Section --- */}
        <View style={styles.section} break>
          <Text style={styles.sectionTitle}>Ownership Progression</Text>
          {ownershipChartImage ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image src={ownershipChartImage} style={styles.chartImage} />
          ) : (
            <Text style={styles.text}>Ownership chart is being generated or was unavailable.</Text>
          )}
        </View>
        
        {/* --- Ownership Table Section --- COMMENTED OUT FOR DEBUGGING
// ... rest of the file, other sections still commented ...
        */}

        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} fixed />
      </Page>

      {/* Detailed Round Information Section remains commented out */}
    </Document>
  );
};

export default ReportPDF; 