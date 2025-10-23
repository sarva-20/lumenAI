export type SubsidyDetail = {
    title: string;
    content: string;
};

export type SubsidyCategory = {
    id: string;
    name: string;
    description: string;
    category: 'Central Government Schemes' | 'Tamil Nadu State Schemes' | 'Banks & Financial Institutions' | 'How to Apply & Checklists';
    tags?: string[];
    link?: string;
    details: SubsidyDetail[];
    checklist?: string[];
};

export const subsidies: SubsidyCategory[] = [
    {
        id: "pmsuryaghar",
        name: "PM Surya Ghar: Muft Bijli Yojana",
        category: "Central Government Schemes",
        description: "A national program providing Central Financial Assistance (CFA) for residential rooftop solar installations. Aims to provide free electricity up to 300 units per month.",
        tags: ["Residential", "National", "CFA Subsidy"],
        link: "https://pmsuryaghar.gov.in",
        details: [
            { title: "Eligibility", content: "Residential consumers with grid-tied rooftop systems, installed by empanelled vendors." },
            { title: "Subsidy Amount", content: "₹30,000 per kW for the first kW, ₹18,000 for the second kW, and a total of ₹78,000 for systems 3 kW and larger." },
            { title: "Application", content: "Register and apply on the national portal or through your local DISCOM's website." }
        ]
    },
    {
        id: "pmkusum",
        name: "PM-KUSUM Scheme",
        category: "Central Government Schemes",
        description: "A central scheme for farmers to promote solar agriculture pumps and decentralized solar power plants.",
        tags: ["Farmers", "Agriculture", "Pumps"],
        link: "https://mnre.gov.in/solar/pm-kusum-scheme/",
        details: [
            { title: "Eligibility", content: "Farmers, farmer groups, panchayats, and agro-entrepreneurs." },
            { title: "Support", content: "Provides Central Financial Assistance (CFA) up to 30% for solar pumps, with additional top-ups often provided by states." },
            { title: "Components", content: "(A) Decentralized solar plants, (B) Standalone solar pumps, (C) Solarisation of existing grid-connected pumps." }
        ]
    },
    {
        id: "tn-cm-incentive",
        name: "Chief Minister’s Solar Rooftop Capital Incentive Scheme",
        category: "Tamil Nadu State Schemes",
        description: "A Tamil Nadu state-level incentive designed to be stacked with the central subsidy, making rooftop solar more affordable for residents.",
        tags: ["Residential", "Tamil Nadu", "State Incentive"],
        details: [
            { title: "Eligibility", content: "Domestic consumers with a TANGEDCO/TNPDCL connection using an empanelled vendor." },
            { title: "Incentive Amount", content: "₹20,000 per kW, in addition to the central subsidy." },
            { title: "Application", content: "Apply through TANGEDCO/TEDA or via the national portal as directed by TN authorities. Vendors often assist with this." }
        ]
    },
    {
        id: "tn-msme-concession",
        name: "MSME Rooftop Network Charge Concession (TN)",
        category: "Tamil Nadu State Schemes",
        description: "A policy in Tamil Nadu that reduces rooftop solar network charges for Micro, Small, and Medium Enterprises (MSMEs) to encourage industrial adoption.",
        tags: ["MSME", "Industrial", "Network Charges"],
        details: [
            { title: "Benefit", content: "A reported 50% reduction in network charges for MSMEs with rooftop solar installations." },
            { title: "Eligibility", content: "MSMEs as defined by state guidelines. Check with your local DISCOM for precise eligibility and usage caps." }
        ]
    },
    {
        id: "sbi-surya-ghar-loan",
        name: "SBI - PM Surya Ghar Solar Roof Top Loan",
        category: "Banks & Financial Institutions",
        description: "A dedicated loan product from the State Bank of India for residential rooftop solar systems, integrated with the national portal.",
        tags: ["Loan", "Residential", "SBI"],
        link: "https://sbi.co.in/web/personal-banking/loans/suryaghar-yojana",
        details: [
            { title: "Eligibility", content: "Residential homeowners, subject to bank credit rules. No collateral required for smaller loans." },
            { title: "Loan Limits", content: "Up to ₹2 lakh and up to ₹6 lakh depending on the slab. Interest rates vary from ~6.00% to ~8.15% p.a." },
            { title: "Tenure", content: "Up to 10 years." }
        ]
    },
    {
        id: "ireda-loan",
        name: "IREDA Loans for Rooftop Solar",
        category: "Banks & Financial Institutions",
        description: "Financing from the Indian Renewable Energy Development Agency, primarily for commercial, industrial, and large-scale aggregator projects.",
        tags: ["Loan", "Commercial", "IREDA"],
        link: "https://www.ireda.in/home",
        details: [
            { title: "Eligibility", content: "Institutional, commercial, industrial, and aggregator projects. Some products available for residential aggregators." },
            { title: "Offerings", content: "Provides dedicated loans, bridge finance, and credit enhancement for larger rooftop portfolios." }
        ]
    },
    {
        id: "other-banks",
        name: "Other Major Banks (Union, Canara, PNB)",
        category: "Banks & Financial Institutions",
        description: "Most major public and private banks in India offer dedicated 'green loans' or 'solar loans' for rooftop installations.",
        tags: ["Loan", "Residential", "Multiple Banks"],
        details: [
            { title: "Features", content: "Often feature digital application processes, low documentation requirements for small amounts, and tie-ups with vendors." },
            { title: "How to find", content: "Search online for 'rooftop solar loan' followed by the bank's name or inquire at your local branch." }
        ]
    },
    {
        id: "quick-checklist",
        name: "Quick Checklist for Applying",
        category: "How to Apply & Checklists",
        description: "A general checklist of steps and documents required for most subsidy and loan applications in India.",
        tags: ["Checklist", "Application Process"],
        details: [],
        checklist: [
            "Choose an empanelled vendor from the TEDA/DISCOM or national portal list.",
            "Get a detailed quotation and technical diagram (SDS) from the vendor.",
            "Register on the national portal (pmsuryaghar.gov.in) or the local DISCOM portal.",
            "Apply for a bank loan if needed, submitting KYC, electricity bill, and vendor quote.",
            "Complete installation, which is followed by a DISCOM inspection and net-meter installation.",
            "Vendor submits subsidy claim; subsidy is then credited to your bank or loan account."
        ]
    },
    {
        id: "doc-checklist",
        name: "Document Checklist (Comprehensive)",
        category: "How to Apply & Checklists",
        description: "A comprehensive list of documents typically required for solar subsidy and loan applications.",
        tags: ["Documents", "Checklist"],
        details: [],
        checklist: [
            "Latest electricity bill (mandatory for all rooftop schemes).",
            "Aadhaar, PAN, passport-sized photo, and signed application forms.",
            "Bank passbook or cancelled cheque for subsidy credit.",
            "Proof of property/roof ownership or a No-Objection Certificate (NOC) from the owner.",
            "Vendor quotation with detailed system specifications.",
            "For PM-KUSUM (pumps): Farmer ID, land/pump ownership proof."
        ]
    }
];
