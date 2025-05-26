import { RoundInput } from "./types";

export interface TipData {
  title: string;
  explanation: string;
  placeholder?: string;
  typicalRange?: string; // New field for typical ranges
  detailsLink?: string; // Optional link for more detailed explanation
}

export type RoundName = RoundInput['name'];
export type RoundField = keyof RoundInput;

// General tooltips not specific to a round/field combination
export const generalTooltips: Record<string, TipData> = {
  roundSize: {
    title: "Round Size ($)",
    explanation: "The total amount of capital being raised in this funding round. Ranges vary significantly by stage.",
  },
  dilution: {
    title: "Dilution (%)",
    explanation: "The percentage of the company given up to new investors in this round. For SAFEs, this is an effective dilution calculated upon conversion. Typical dilution also varies by stage.",
  },
  arrMultiple: {
    title: "ARR Multiple (x)",
    explanation: "The multiple applied to Annual Recurring Revenue (ARR) to determine valuation. For the Exit row, this multiple is applied to the final ARR to calculate Exit Valuation. Not always applicable for early stages like Pre-Seed.",
  },
  advancedSettings: {
    title: "Advanced Settings",
    explanation: "Click to configure more detailed terms for this round, such as SAFE parameters, liquidation preferences, and other common investor rights."
  },
  safeGeneral: {
    title: "SAFE (Simple Agreement for Future Equity)",
    explanation: "A SAFE is an agreement where an investor provides capital for the right to equity in a future priced round, typically at a discount or subject to a valuation cap."
  },
  convertibleNoteGeneral: {
    title: "Convertible Note",
    explanation: "A loan that converts into equity at a future priced round. Similar to a SAFE, but it is debt with a maturity date and interest rate. For simplicity in this simulator, we treat its conversion mechanics like a SAFE (cap & discount)."
  },
  pricedRoundGeneral: {
    title: "Priced Round",
    explanation: "A fundraising round where a specific per-share price is set, and investors purchase preferred stock at that price."
  },
  exitScenario: {
    title: "Exit Scenario",
    explanation: "Configuration for the company's exit event (e.g., acquisition or IPO). The Exit Valuation is key to calculating returns for all shareholders."
  },
  valuationCap: {
    title: "Valuation Cap (SAFE/Convertible)",
    explanation: "The maximum valuation at which the SAFE or Convertible Note converts into equity. Protects early investors if the company\'s valuation skyrockets in the next priced round."
  },
  discountRate: {
    title: "Discount Rate (SAFE/Convertible)",
    explanation: "A percentage discount (e.g., 20%) applied to the share price of the subsequent priced round when the SAFE or Convertible Note converts. Rewards early risk."
  },
  liquidationPreference: {
    title: "Liquidation Preference",
    explanation: "In a sale/acquisition, preferred stockholders get their money back (e.g., 1x their investment) before common stockholders. Can be Non-Participating (investor chooses preference OR converts to common) or Participating (investor gets preference AND shares with common)."
  },
  multiple: {
    title: "Liquidation Multiple (x)",
    explanation: "The multiple of their investment that preferred stockholders receive as their liquidation preference (e.g., 1x, 2x). For Non-Participating, it is typically 1x. For Participating, this is the preference amount received before also sharing with common."
  },
  proRataRights: {
    title: "Pro-Rata Rights",
    explanation: "The right for an investor to purchase their pro-rata share of securities in subsequent funding rounds, allowing them to maintain their ownership percentage. Standard for major investors in priced rounds."
  },
  antiDilution: {
    title: "Anti-Dilution Protection",
    explanation: "Protects investors if the company issues shares in a subsequent round at a lower price (\'down round\'). Broad-Based Weighted Average (common, founder-friendly) adjusts conversion price moderately. Full Ratchet (rare, harsh) resets to the new lower price."
  },
  optionPool: {
    title: "Option Pool (ESOP %)",
    explanation: "Employee Stock Option Pool. Shares set aside for future employees. Investors typically require this pool to be created/topped up pre-investment, diluting existing shareholders. Enter the target percentage of the post-money fully diluted cap table."
  },
  boardSeats: {
    title: "Investor Board Seats",
    explanation: "The number of seats on the Board of Directors allocated to investors from this round. Lead investors in priced rounds often get one seat."
  },
  globalEsopDefault: {
    title: "Default Target ESOP % (Priced Rounds)",
    explanation: "This is the default target for the Employee Stock Option Pool (ESOP) specifically for priced funding rounds, if not overridden by a per-round setting in the advanced section. The ESOP is typically established or expanded *before* new investment in a priced round, diluting all then-current shareholders. The percentage is usually of the post-money, fully-diluted capitalization."
  },
  globalLiquidationPreference: {
    title: "Global Liquidation Preference (Default)",
    explanation: "This toggle enables a default 1x Non-Participating Liquidation Preference for all investors in rounds where specific Liquidation Preference terms are not set in that round's advanced settings. Non-Participating means investors choose either their preference amount OR to convert to common and share pro-rata, whichever is greater. It does not apply to Founders or ESOP shares."
  },
  protectiveProvisions: {
    title: "Protective Provisions",
    explanation: "Rights granted to preferred stockholders requiring their consent for certain major company actions (e.g., selling the company, issuing stock with superior rights, taking on significant debt). While crucial for governance, these provisions do not directly alter the numerical outputs in this simulator."
  },
  dragAlongRights: {
    title: "Drag-Along Rights",
    explanation: "Allows a majority of stockholders (often defined as a majority of preferred and a majority of common voting together) to force minority stockholders to agree to a sale of the company. Important for facilitating acquisitions. This term does not directly alter the numerical outputs in this simulator."
  }
};

// ... (rest of tips.ts, including specific tips and getTip function) ...

export const tips: Partial<Record<RoundName, Partial<Record<RoundField, TipData>>>> = {
  "Pre-Seed": {
    roundSize: {
      title: "Pre-Seed Investment Size",
      explanation: "Typical Pre-Seed rounds fund initial development and market validation.",
      placeholder: "e.g., $500K",
      typicalRange: "$50k - $1M"
    },
    dilutionPercent: {
      title: "Pre-Seed Dilution",
      explanation: "Equity given up in a Pre-Seed round, often via SAFEs/notes where dilution is deferred.",
      placeholder: "e.g., 10-20%", // Placeholder can also hint at range
      typicalRange: "10-20% (effective if SAFE/note)"
    },
    roundType: {
        title: "Primary Instrument for Pre-Seed",
        explanation: "Pre-Seed rounds commonly use SAFEs or Convertible Notes due to their simplicity and speed, deferring valuation discussions.",
    },
    valuationCap: {
        title: "SAFE Valuation Cap (Pre-Seed)",
        explanation: "For Pre-Seed SAFEs, valuation caps often range from $3M to $15M.",
        placeholder: "e.g., 6000000"
    },
    discountRate: {
        title: "SAFE Discount Rate (Pre-Seed)",
        explanation: "A common discount rate for Pre-Seed SAFEs is 10-30%, with 20% being frequent.",
        placeholder: "e.g., 20"
    },
  },
  "Seed": {
    roundSize: {
      title: "Seed Investment Size",
      explanation: "Seed rounds aim to achieve product-market fit and build initial traction.",
      placeholder: "e.g., 2M",
      typicalRange: "$500k - $5M"
    },
    dilutionPercent: {
      title: "Seed Dilution",
      explanation: "Dilution in Seed rounds, can be priced or via convertibles.",
      placeholder: "e.g., 15-25%",
      typicalRange: "15-25%"
    },
    arrMultiple: {
      title: "Seed ARR Multiple",
      explanation: "ARR multiples may be used if revenue is present, but other factors are key.",
      placeholder: "e.g., 30x",
      typicalRange: "20x - 50x (on early ARR)"
    },
    roundType: {
        title: "Primary Instrument for Seed",
        explanation: "Seed rounds use SAFEs, Convertible Notes, or sometimes an early priced round (Seed Preferred Stock).",
    },
    valuationCap: {
        title: "SAFE Valuation Cap (Seed)",
        explanation: "For Seed SAFEs, valuation caps often range from $8M to $20M.",
        placeholder: "e.g., 15000000"
    },
    discountRate: {
        title: "SAFE Discount Rate (Seed)",
        explanation: "A common discount rate for Seed SAFEs is 15-25%.",
        placeholder: "e.g., 20"
    },
  },
  "Series A": {
    roundSize: {
      title: "Series A Investment Size",
      explanation: "Series A rounds are for scaling the business and growing market share.",
      placeholder: "e.g., 10M",
      typicalRange: "$5M - $20M"
    },
    dilutionPercent: {
      title: "Series A Dilution",
      explanation: "Typical dilution for a Series A priced round.",
      placeholder: "e.g., 15-25%",
      typicalRange: "15-25%"
    },
    arrMultiple: {
      title: "Series A ARR Multiple",
      explanation: "Valuation heavily influenced by ARR and growth metrics.",
      placeholder: "e.g., 20x",
      typicalRange: "15x - 30x"
    }
  },
  "Series B": {
    roundSize: {
      title: "Series B Investment Size",
      explanation: "Series B is for significant expansion and scaling operations.",
      placeholder: "e.g., 30M",
      typicalRange: "$15M - $50M"
    },
    dilutionPercent: {
      title: "Series B Dilution",
      explanation: "Dilution tends to decrease slightly in later stages.",
      placeholder: "e.g., 10-20%",
      typicalRange: "10-20%"
    },
    arrMultiple: {
      title: "Series B ARR Multiple",
      explanation: "ARR multiples reflect established product-market fit and scaling revenue.",
      placeholder: "e.g., 15x",
      typicalRange: "10x - 20x"
    }
  },
  "Series C": {
    roundSize: {
      title: "Series C Investment Size",
      explanation: "Series C aims for market leadership and late-stage growth.",
      placeholder: "e.g., 50M",
      typicalRange: "$30M - $100M+"
    },
    dilutionPercent: {
      title: "Series C Dilution",
      explanation: "Further decrease in dilution as company matures.",
      placeholder: "e.g., 5-15%",
      typicalRange: "5-15%"
    },
    arrMultiple: {
      title: "Series C ARR Multiple",
      explanation: "Multiples may compress unless growth is exceptional.",
      placeholder: "e.g., 10x",
      typicalRange: "8x - 12x"
    }
  },
  "Exit": {
    roundSize: { // Represents Exit Valuation
        title: "Exit Valuation ($)",
        explanation: "The total valuation of the company at exit.",
        placeholder: "e.g., 500M",
        typicalRange: "Highly variable"
    },
    arrMultiple: {
        title: "Exit ARR Multiple",
        explanation: "The multiple of ARR used to determine Exit Valuation.",
        placeholder: "e.g., 5-15x+",
        typicalRange: "5x - 15x+"
    }
  }
};

export const getTip = (roundName: RoundName, field: RoundField): TipData | undefined => {
  return tips[roundName]?.[field];
}; 