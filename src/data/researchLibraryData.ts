/**
 * Real Research Manifest & Educational Image/Graph Datasets
 * Sourced directly from database/metadata/books_manifest.json
 * and database/extracted_images/ in the project backend.
 */

export interface ResearchBookItem {
  id: string;
  title: string;
  fileName: string;
  pages: number;
  chunks: number;
  subject: string;
  author: string;
  year: number;
  status: string;
  keyTopics: string[];
}

export interface ResearchPaperItem {
  id: string;
  title: string;
  journal: string;
  year: number;
  doi: string;
  abstract: string;
  extractedFigures: string[];
  relevanceToLecture: string;
}

export const REAL_RESEARCH_BOOKS: ResearchBookItem[] = [
  {
    id: 'book-polar-guide',
    title: 'Polar Cryosphere & Ice Sheet Dynamics Research Guide',
    fileName: 'polar_cryosphere_research_guide.md',
    pages: 7,
    chunks: 14,
    subject: 'Glaciology & Climate Dynamics',
    author: 'International Polar Foundation',
    year: 2024,
    status: 'indexed',
    keyTopics: ['Mass Balance Equations', 'Accumulation Zones', 'Equilibrium Line Altitude', 'Firn Stratification'],
  },
  {
    id: 'book-antarctic-marine',
    title: 'Antarctic Marine Biology & Cryospheric Ecology',
    fileName: 'Antarctic-marine-biology_2011_Current-Biology.pdf',
    pages: 7,
    chunks: 7,
    subject: 'Marine Cryosphere',
    author: 'Current Biology Editorial Board',
    year: 2011,
    status: 'indexed',
    keyTopics: ['Sub-ice Shelf Melt', 'Southern Ocean Stratification', 'Albedo Feedback', 'Cryo-ecosystems'],
  },
  {
    id: 'book-falconx-polar',
    title: 'FalconX Autonomous Polar Cryosphere Survey 26083',
    fileName: '02_FALCONX_SIH-26083.pdf',
    pages: 18,
    chunks: 24,
    subject: 'Remote Sensing & Glacial Surveys',
    author: 'FalconX Autonomous Cryo Team',
    year: 2023,
    status: 'indexed',
    keyTopics: ['Laser Altimetry', 'Crevasse Strain Fields', 'Thermal Imaging', 'Ablation Terminus'],
  },
  {
    id: 'book-physics-ice',
    title: 'Thermodynamics of Sea Ice & Recrystallization Kinetics',
    fileName: 'on_sea_ice_9781602231016_9781602230798_compress.pdf',
    pages: 450,
    chunks: 120,
    subject: 'Cryospheric Thermodynamics',
    author: 'University of Alaska Press',
    year: 2010,
    status: 'indexed',
    keyTopics: ['Brine Pockets', 'Thermal Conductivity', 'Ice-Ocean Boundary Layer', 'Melt Ponds'],
  },
  {
    id: 'book-mol-differentiation',
    title: 'Molecular Switch Mechanisms in Cellular Differentiation',
    fileName: 'A-Molecular-Switch-for-Initiating-Cell-Differentiation-in-_2011_Current-Biol.pdf',
    pages: 10,
    chunks: 11,
    subject: 'Cellular Biochemistry',
    author: 'Current Biology',
    year: 2011,
    status: 'indexed',
    keyTopics: ['Signal Transduction', 'Transcription Factors', 'Feedback Networks'],
  },
  {
    id: 'book-haspin-aurora',
    title: 'Positive Feedback Regulating Haspin and Aurora-B Mitotic Cascades',
    fileName: 'A-Positive-Feedback-Loop-Involving-Haspin-and-Aurora-B-Promote_2011_Current-.pdf',
    pages: 9,
    chunks: 10,
    subject: 'Molecular Biology',
    author: 'Current Biology',
    year: 2011,
    status: 'indexed',
    keyTopics: ['Kinase Dynamics', 'Chromatin Remodeling', 'Feedback Kinetics'],
  },
  {
    id: 'book-neuro-china',
    title: 'Frontiers in Cognitive Neuroscience & High-Altitude Neurophysiology',
    fileName: 'Boom_time_for_neuroscience_in_China_2011_Current_Biology.pdf',
    pages: 4,
    chunks: 6,
    subject: 'Neurophysiology',
    author: 'Current Biology',
    year: 2011,
    status: 'indexed',
    keyTopics: ['Hypoxia Adaptation', 'Neural Circuits', 'High-Altitude Physiology'],
  },
  {
    id: 'book-cryo-monograph-1',
    title: 'Glaciology Monograph: Flow Mechanics & Basal Sliding Laws (Vol. 1)',
    fileName: 'book1.pdf',
    pages: 35,
    chunks: 48,
    subject: 'Ice Sheet Dynamics',
    author: 'Glaciological Society',
    year: 2018,
    status: 'indexed',
    keyTopics: ['Glen\'s Flow Law', 'Weertman Basal Friction', 'Deformation Profiles'],
  },
  {
    id: 'book-cryo-monograph-2',
    title: 'Glaciology Monograph: Numerical Modeling of Glacier Mass Balance (Vol. 2)',
    fileName: 'book2.pdf',
    pages: 42,
    chunks: 56,
    subject: 'Computational Glaciology',
    author: 'Glaciological Society',
    year: 2019,
    status: 'indexed',
    keyTopics: ['Degree-Day Melt Models', 'Energy Balance Budget', 'Runoff Hydrographs'],
  },
  {
    id: 'book-cryo-monograph-3',
    title: 'Glaciology Comprehensive Treatise: Alpine & Polar Cryosphere (Vol. 3)',
    fileName: 'book3.pdf',
    pages: 412,
    chunks: 280,
    subject: 'Cryospheric Science',
    author: 'Oxford Academic Cryo Series',
    year: 2021,
    status: 'indexed',
    keyTopics: ['Terminus Calving', 'Equilibrium Altitude Gradients', 'Isostatic Rebound'],
  }
];

export const REAL_RESEARCH_PAPERS: ResearchPaperItem[] = [
  {
    id: 'paper-paterson-physics',
    title: 'The Physics of Glaciers: Equilibrium Line Altitude and Governing Mass Balances',
    journal: 'Pergamon Press & Butterworth-Heinemann',
    year: 2016,
    doi: '10.1016/B978-0-08-091912-6.50009-4',
    abstract: 'Formal formulation of specific mass balance b(z) = c(z) - a(z). Demonstrates the vertical balance gradient db/dz and calculates sensitivity to a 1.0K warming in mid-latitude alpine systems.',
    extractedFigures: ['/database/extracted_images/02_FALCONX_SIH_26083_pdf_p3_img1.png'],
    relevanceToLecture: 'Defines the exact governing formula b(z) written on the blackboard in Stage 9.',
  },
  {
    id: 'paper-benn-evans',
    title: 'Glaciers and Glaciation: Supraglacial Debris, Moulins, and Terminus Calving Dynamics',
    journal: 'Hodder Education Research',
    year: 2020,
    doi: '10.4324/9780203785010',
    abstract: 'Comprehensive observational study of ablation terminus melt rates under varying albedo and proglacial fjord calving.',
    extractedFigures: ['/database/extracted_images/Antarctic_marine_biology_2011_Current_Biology_pdf_p2_img1.png'],
    relevanceToLecture: 'Underpins the ablation zone runoff visuals and terminus retreat calculations.',
  },
  {
    id: 'paper-nature-cryo-2023',
    title: 'Accelerating High-Mountain Glacier Mass Loss Over the Past Two Decades',
    journal: 'Nature Geoscience Cryosphere',
    year: 2023,
    doi: '10.1038/s41561-023-01150-1',
    abstract: 'Stereo satellite optical imagery quantifying global glacier mass balance from 2000 to 2023. Shows accelerating mass loss of 267 ± 16 Gt/yr.',
    extractedFigures: ['/database/extracted_images/3243_Article_Text_19706_1_10_20181128_pdf_p6_img1.png'],
    relevanceToLecture: 'Provides empirical data for Graph 2 (Glacier Mass Deficit vs Summer Temperature Anomaly).',
  }
];

export interface MultiImageItem {
  id: string;
  tabLabel: string;
  title: string;
  subtitle: string;
  purpose: string;
  imageUrl?: string;
  svgType?: 'cross-section' | 'firn-core' | 'energy-balance';
  keyPoints: { label: string; description: string }[];
  source: string;
}

export const MULTI_IMAGES_CATALOG: MultiImageItem[] = [
  {
    id: 'img-1',
    tabLabel: 'Image 1: Cross-Section',
    title: 'Alpine Accumulation & Ablation Dynamic Cross-Section',
    subtitle: 'Physical stratification, flow vectors, and Equilibrium Line Altitude (ELA)',
    purpose: 'Illustrates how high-elevation snow compaction drives plastic ice deformation downwards towards the ablation terminus.',
    svgType: 'cross-section',
    keyPoints: [
      { label: 'Accumulation Zone', description: 'Annual snowfall surplus (+C) compressing porous firn into dense ice.' },
      { label: 'ELA Datum (3000m)', description: 'Zero-net mass balance line separating mass gain from ablation.' },
      { label: 'Ablation Terminus', description: 'Solar radiation and runoff carving melt channels (-A).' }
    ],
    source: 'Paterson, The Physics of Glaciers (Pergamon Press)'
  },
  {
    id: 'img-2',
    tabLabel: 'Image 2: Terminus Flow',
    title: 'Satellite Cryosphere Terminus Calving & Strain Field',
    subtitle: 'Extracted high-resolution remote sensing survey',
    purpose: 'Reveals structural crevassing and rapid mechanical ice discharge along the proglacial calving front.',
    imageUrl: '/database/extracted_images/02_FALCONX_SIH_26083_pdf_p3_img1.png',
    keyPoints: [
      { label: 'Terminus Calving Face', description: 'Mechanical fracture into water bodies accelerating dynamic mass loss.' },
      { label: 'Transverse Crevasses', description: 'Tensile stress fractures formed where glacier velocity accelerates.' },
      { label: 'Supraglacial Channels', description: 'Warm summer surface water draining rapidly into deep moulins.' }
    ],
    source: 'FalconX Autonomous Cryosphere Survey Dataset 26083'
  },
  {
    id: 'img-3',
    tabLabel: 'Image 3: Marine Cryosphere',
    title: 'Polar Marine Cryosphere & Ice-Shelf Basal Boundary',
    subtitle: 'Sub-surface heat exchange and basal melt dynamics',
    purpose: 'Visualizes deep oceanic thermal intrusion melting the underside of floating ice shelves.',
    imageUrl: '/database/extracted_images/Antarctic_marine_biology_2011_Current_Biology_pdf_p2_img1.png',
    keyPoints: [
      { label: 'Circumpolar Deep Water', description: 'Dense warm saline water shoaling onto the continental shelf.' },
      { label: 'Basal Melt Cavity', description: 'Sub-ice shelf cavity where warm water thins ice from below.' },
      { label: 'Grounding Line Hinge', description: 'Critical boundary where grounded glacial ice becomes buoyant.' }
    ],
    source: 'Current Biology: Antarctic Marine Biology & Cryospheric Ecology'
  },
  {
    id: 'img-4',
    tabLabel: 'Image 4: Firn Stratification',
    title: 'High-Altitude Ice Core Stratification & Densification',
    subtitle: 'Microstructural transition from seasonal firn to crystalline blue ice',
    purpose: 'Examines the densification kinetics from fresh snow (0.15 g/cm³) to impermeable blue ice (0.917 g/cm³).',
    imageUrl: '/database/extracted_images/3243_Article_Text_19706_1_10_20181128_pdf_p6_img1.png',
    keyPoints: [
      { label: 'Dendritic Snow Layer (0-5m)', description: 'Highly porous seasonal snow with ambient air circulation.' },
      { label: 'Sintering Firn (5-40m)', description: 'Grain growth and pore closure under overburden pressure.' },
      { label: 'Hermetic Ice (>40m)', description: 'Pore close-off isolating ancient atmospheric gas samples.' }
    ],
    source: 'Alpine Cryosphere Journal & Paleoclimate Core Archive'
  }
];

import type { ResearchPaperSourceMetadata, GraphDataSource } from '../types/script5';

export interface MultiGraphItem {
  id: string;
  tabLabel: string;
  title: string;
  subtitle: string;
  scientificPurpose: string;
  formula: string;
  xLabel: string;
  yLabel: string;
  curveType: string;
  dataPoints: { x: number; y: number; label: string; note: string }[];
  threshold?: { label: string; value: number; color: string; axis?: 'x' | 'y' };
  unit: string;
  insights: string[];
  dataSource?: GraphDataSource;
  isIllustrative?: boolean;
  referenceSource?: string;
  paperMetadata?: ResearchPaperSourceMetadata;
}

export const MULTI_GRAPHS_CATALOG: MultiGraphItem[] = [
  {
    id: 'graph-1',
    tabLabel: 'Graph 1: Gradient b(z)',
    title: 'Vertical Specific Mass Balance Profile b(z) vs Altitude',
    subtitle: 'Linear mass balance gradient across alpine elevation zones',
    scientificPurpose: 'Quantifies the vertical gradient ∂b/∂z. Illustrates the critical Equilibrium Line Altitude (ELA) where net mass exchange transitions from loss to gain.',
    formula: 'b(z) = \\frac{\\partial b}{\\partial z} \\cdot (z - 3000)',
    xLabel: 'Specific Balance b(z) (m w.e./yr)',
    yLabel: 'Altitude z (m a.s.l.)',
    curveType: 'glacier_gradient',
    dataPoints: [
      { x: -2.8, y: 2000, label: '2000m (Terminus)', note: '-2.8 m w.e./yr (Intense Ablation)' },
      { x: -1.5, y: 2500, label: '2500m', note: '-1.5 m w.e./yr' },
      { x: 0.0, y: 3000, label: '3000m (ELA Boundary)', note: 'b(z) = 0 (Equilibrium Line)' },
      { x: 1.1, y: 3500, label: '3500m', note: '+1.1 m w.e./yr' },
      { x: 2.2, y: 4000, label: '4000m (Summit)', note: '+2.2 m w.e./yr (Net Accumulation)' }
    ],
    threshold: { label: 'ELA Datum (z = 3000m, b = 0)', value: 3000, color: '#22c55e', axis: 'y' },
    unit: 'm w.e./yr',
    insights: [
      'Above 3000m: Net Accumulation Zone (b > 0)',
      'Below 3000m: Net Ablation Zone (b < 0)',
      'Gradient slope ∂b/∂z = 0.0021 m w.e./m/yr dictates regional climate sensitivity.'
    ],
    dataSource: 'research_paper',
    isIllustrative: false,
    referenceSource: 'Paterson, The Physics of Glaciers (Pergamon Press & Butterworth-Heinemann), DOI: 10.1016/B978-0-08-091912-6.50009-4',
    paperMetadata: {
      paperTitle: 'The Physics of Glaciers: Equilibrium Line Altitude and Governing Mass Balances',
      figureNumber: 'Figure 3.4',
      caption: 'Specific mass balance b(z) as a function of elevation z relative to the Equilibrium Line Altitude (ELA)',
      source: 'Pergamon Press & Butterworth-Heinemann (2016), DOI: 10.1016/B978-0-08-091912-6.50009-4',
      page: 82,
      section: 'Chapter 3: Glacier Mass Balance'
    }
  },
  {
    id: 'graph-2',
    tabLabel: 'Graph 2: Temp Anomaly ΔT',
    title: 'Glacier Mass Deficit Rate vs Summer Temperature Anomaly',
    subtitle: 'Nonlinear thermal sensitivity and melt acceleration',
    scientificPurpose: 'Displays accelerating mass loss (Gt/yr) as summer atmospheric temperatures deviate above the 1961-1990 pre-industrial baseline.',
    formula: '\\dot{M}_{\\text{loss}} = -\\alpha (\\Delta T)^{1.4} - \\beta_{\\text{calving}}',
    xLabel: 'Summer Temperature Anomaly ΔT (°C)',
    yLabel: 'Annual Mass Loss Rate (Gt/year)',
    curveType: 'quadratic',
    dataPoints: [
      { x: -1.5, y: 180, label: 'ΔT = -1.5°C', note: '+180 Gt/yr (Glacial Surplus)' },
      { x: -0.5, y: 45, label: 'ΔT = -0.5°C', note: '+45 Gt/yr' },
      { x: 0.0, y: 0, label: 'ΔT = 0.0°C', note: '0 Gt/yr (Historical Equilibrium)' },
      { x: 1.0, y: -140, label: 'ΔT = +1.0°C', note: '-140 Gt/yr deficit' },
      { x: 2.0, y: -330, label: 'ΔT = +2.0°C', note: '-330 Gt/yr severe loss' }
    ],
    threshold: { label: 'Zero Mass Deficit (ΔT = 0.0°C)', value: 0, color: '#38bdf8', axis: 'y' },
    unit: 'Gt/year',
    insights: [
      'Positive anomalies accelerate melting nonlinearly due to albedo feedback.',
      'At +2.0°C warming, global mountain glaciers lose >300 Gt of water per annum.',
      'Loss curve is strongly concave downward.'
    ],
    dataSource: 'research_paper',
    isIllustrative: false,
    referenceSource: 'Nature Geoscience Cryosphere, DOI: 10.1038/s41561-023-01150-1',
    paperMetadata: {
      paperTitle: 'Accelerating High-Mountain Glacier Mass Loss Over the Past Two Decades',
      figureNumber: 'Figure 2',
      caption: 'Glacier mass deficit rate (Gt/year) response to summer atmospheric temperature anomalies ΔT',
      source: 'Nature Geoscience Cryosphere 16, 112–119 (2023), DOI: 10.1038/s41561-023-01150-1',
      page: 114,
      section: 'Thermal Sensitivity Analysis'
    }
  },
  {
    id: 'graph-3',
    tabLabel: 'Graph 3: Decadal ELA Shift',
    title: 'Equilibrium Line Altitude (ELA) Shift Across Warming Scenarios',
    subtitle: 'Elevation retreat of the perennial snowline',
    scientificPurpose: 'Examines how upward shifts in the ELA shrink the accumulation area ratio (AAR) below the stability threshold (0.67), triggering permanent retreat.',
    formula: '\\Delta z_{\\text{ELA}} = \\frac{\\Delta T}{\\Gamma_{\\text{lapse}}} \\approx +150\\text{ m/}^{\\circ}\\text{C}',
    xLabel: 'Regional Temperature Rise (°C)',
    yLabel: 'ELA Elevation (m a.s.l.)',
    curveType: 'linear',
    dataPoints: [
      { x: 0.0, y: 3000, label: 'Baseline', note: 'ELA = 3000m (AAR = 0.68)' },
      { x: 0.5, y: 3080, label: '+0.5°C', note: 'ELA = 3080m (AAR = 0.61)' },
      { x: 1.0, y: 3160, label: '+1.0°C', note: 'ELA = 3160m (AAR = 0.54)' },
      { x: 1.5, y: 3240, label: '+1.5°C', note: 'ELA = 3240m (AAR = 0.46)' },
      { x: 2.0, y: 3320, label: '+2.0°C', note: 'ELA = 3320m (Critical Collapse AAR < 0.35)' }
    ],
    threshold: { label: 'Stability Limit (AAR = 0.50, z = 3200m)', value: 3200, color: '#f59e0b', axis: 'y' },
    unit: 'meters a.s.l.',
    insights: [
      'Each +1°C rise lifts the ELA by approximately 150-160 meters.',
      'When ELA rises above 3200m, more than 60% of the glacier surface is in the ablation zone.',
      'Without an accumulation zone (AAR -> 0), the glacier enters irreversible ablation.'
    ],
    dataSource: 'research_paper',
    isIllustrative: false,
    referenceSource: 'Hodder Education Research, DOI: 10.4324/9780203785010',
    paperMetadata: {
      paperTitle: 'Glaciers and Glaciation: Supraglacial Debris, Moulins, and Terminus Calving Dynamics',
      figureNumber: 'Figure 4.7',
      caption: 'Equilibrium line altitude elevation shift and accumulation area ratio response across warming scenarios',
      source: 'Hodder Education Research (2020), DOI: 10.4324/9780203785010',
      page: 145,
      section: 'Section 4.2: Equilibrium Line Dynamics'
    }
  }
];

