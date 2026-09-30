/**
 * Visual Necessity Analyzer (TypeScript Client Engine)
 * ---------------------------------------------------
 * Intelligent Pedagogical Decision Engine for Visual Learning Assets.
 *
 * Principle:
 * "Does this image improve learning?"
 * If NO -> do not show it.
 *
 * Images must NOT be mandatory for every teaching step.
 * The system intelligently decides:
 *   SHOW IMAGE vs. DO NOT SHOW IMAGE
 * based on whether an image genuinely improves understanding.
 */

import type {
  VisualNecessityDecision,
  VisualNecessityDecisionType,
} from '../types/script5';

export class VisualNecessityAnalyzer {
  public static readonly VALID_DECISIONS: VisualNecessityDecisionType[] = [
    'NO IMAGE',
    'ONE IMAGE',
    'MULTIPLE IMAGES',
    'GENERATED IMAGE',
    'DATABASE IMAGE',
    'DATABASE + GENERATED IMAGE',
  ];

  private static readonly NO_IMAGE_SECTIONS = new Set([
    'definition',
    'research_definition',
    'formal_definition',
    'learning_objective',
    'prerequisites',
    'step_by_step_derivation',
    'derivation',
    'mathematical_formulation',
    'variables_and_assumptions',
    'mass_conservation',
    'example_calculation',
    'worked_example',
    'numerical_example',
    'units',
    'units_and_dimensional_standards',
    'limitations',
    'limitations_and_uncertainties',
    'relevant_research_literature',
    'literature_source_discussion',
    'student_check_question',
    'summary',
  ]);

  private static readonly COMPARATIVE_MULTI_IMAGE_SECTIONS = new Set([
    'accumulation_processes',
    'ablation_processes',
    'surface_mass_balance',
    'positive_negative_balance',
    'seasonal_cycle',
    'multiple_visual_interpretations',
    'accumulation_vs_ablation',
  ]);

  private static readonly METHODOLOGY_DIAGRAM_SECTIONS = new Set([
    'measurement_methods',
    'measurement_methodology',
    'research_methodology',
    'internal_basal_processes',
    'research_applications',
    'instrumentation',
  ]);

  private static readonly PHYSICAL_MORPHOLOGY_SECTIONS = new Set([
    'physical_interpretation',
    'glacier_morphology',
    'complex_glacier_morphology',
    'morphology',
    'historical_archive',
    'climate_relationship',
    'real_world_application',
  ]);

  /**
   * Evaluates pedagogical visual necessity for a teaching section.
   */
  public static analyzeSection(params: {
    sectionType: string;
    sectionTitle: string;
    topic: string;
    speechText?: string;
    hasFormula?: boolean;
    hasGraph?: boolean;
    dbCandidatesCount?: number;
  }): VisualNecessityDecision {
    const secClean = (params.sectionType || '').trim().toLowerCase();
    const titleClean = (params.sectionTitle || '').trim().toLowerCase();
    const speechClean = (params.speechText || '').trim().toLowerCase();
    const dbCount = params.dbCandidatesCount ?? 0;

    // ── 1. DEFINITIONS: Usually No Image Required ─────────────────────────────
    const isDefinition =
      this.NO_IMAGE_SECTIONS.has(secClean) ||
      /\b(definition|definitions|define|axiomatic|prerequisite|prerequisites|introduction|terminology)\b/i.test(titleClean);

    if (isDefinition && !/\b(morphology|methodology|history|historical)\b/i.test(titleClean)) {
      return {
        image_needed: false,
        decision: 'NO IMAGE',
        image_reason:
          'Foundational axioms and formal definitions require intense focus on exact verbal terminology and chalkboard nomenclature. An image here creates cognitive distraction without improving clarity.',
        image_type: 'none',
        image_count: 0,
        image_source: 'NONE',
        display_duration: 0,
        pedagogical_focus: 'blackboard_chalk',
      };
    }

    // ── 2. MATHEMATICAL DERIVATION / CONTINUITY EQUATIONS / CALCULATION ───────
    const isMath =
      [
        'step_by_step_derivation',
        'derivation',
        'mathematical_formulation',
        'variables_and_assumptions',
        'mass_conservation',
        'example_calculation',
        'worked_example',
        'numerical_example',
        'formula',
      ].includes(secClean) ||
      /\b(derivation|derivations|equation|equations|continuity|calculation|calculations|worked problem|proof|formula)\b/i.test(titleClean) ||
      Boolean(params.hasFormula);

    if (isMath && !/\b(morphology|methodology|history|historical|vs)\b/i.test(titleClean)) {
      return {
        image_needed: false,
        decision: 'NO IMAGE',
        image_reason:
          'Mathematical derivations, continuum conservation laws, and numerical substitutions require step-by-step analytical concentration on chalkboard LaTeX equations. A pictorial image would obstruct the board.',
        image_type: 'none',
        image_count: 0,
        image_source: 'NONE',
        display_duration: 0,
        pedagogical_focus: 'mathematical_derivation',
      };
    }

    // ── 3. UNITS & DIMENSIONAL STANDARDS: No Image Required ──────────────────
    if (secClean.includes('unit') || /\b(unit|units|dimensional standards|dimensions)\b/i.test(titleClean)) {
      return {
        image_needed: false,
        decision: 'NO IMAGE',
        image_reason:
          'Units and dimensional standards (m w.e. a⁻¹ vs kg m⁻² a⁻¹) represent taxonomic conventions; chalkboard tabular breakdown is pedagogically superior.',
        image_type: 'none',
        image_count: 0,
        image_source: 'NONE',
        display_duration: 0,
        pedagogical_focus: 'blackboard_chalk',
      };
    }

    // ── 4. LIMITATIONS, LITERATURE CITATIONS & CHECK QUESTIONS ────────────────
    if (
      ['limitations', 'limitations_and_uncertainties', 'relevant_research_literature', 'literature_source_discussion', 'student_check_question', 'summary'].includes(secClean) ||
      /\b(limitation|limitations|uncertainty|uncertainties|literature|citation|checkpoint|check question|summary)\b/i.test(titleClean)
    ) {
      return {
        image_needed: false,
        decision: 'NO IMAGE',
        image_reason:
          'Critical literature grounding, uncertainty bounds, and Socratic reflection necessitate student active textual recall and contemplation rather than passive visual browsing.',
        image_type: 'none',
        image_count: 0,
        image_source: 'NONE',
        display_duration: 0,
        pedagogical_focus: 'blackboard_chalk',
      };
    }

    // ── 5. COMPARATIVE PROCESSES: Multiple Images Useful ──────────────────────
    const isComparative =
      this.COMPARATIVE_MULTI_IMAGE_SECTIONS.has(secClean) ||
      /\b(accumulation.*ablation|ablation.*accumulation|vs|versus|comparison|contrasting|positive\/negative|seasonal cycle)\b/i.test(titleClean) ||
      (speechClean.includes('accumulation') && speechClean.includes('ablation')) ||
      (titleClean.includes('accumulation') && titleClean.includes('ablation'));

    if (isComparative) {
      const decisionVal: VisualNecessityDecisionType = dbCount >= 1 ? 'DATABASE + GENERATED IMAGE' : 'MULTIPLE IMAGES';
      return {
        image_needed: true,
        decision: decisionVal,
        image_reason:
          'Contrasting dual physical domains (e.g., upper accumulation snowfields vs. lower ablation meltwater calving fronts) fundamentally requires comparative visual juxtaposition to cement spatial and mass-transfer understanding.',
        image_type: 'comparative_morphology',
        image_count: 2,
        image_source: dbCount >= 1 ? 'DATABASE_AND_GENERATED' : 'DATABASE',
        display_duration: 24000,
        pedagogical_focus: 'comparative_analysis',
        recommended_query: `${params.topic} accumulation ablation comparison`,
      };
    }

    // ── 6. RESEARCH METHODOLOGY: Diagram Superior to Photograph ───────────────
    const isMethodology =
      this.METHODOLOGY_DIAGRAM_SECTIONS.has(secClean) ||
      /\b(method|methodology|measurement|instrument|instrumentation|geodetic|stake|stakes|lidar|radar|technique|protocol|workflow|schematic)\b/i.test(titleClean);

    if (isMethodology) {
      const decisionVal: VisualNecessityDecisionType = dbCount === 0 ? 'GENERATED IMAGE' : 'DATABASE IMAGE';
      return {
        image_needed: true,
        decision: decisionVal,
        image_reason:
          'Research methodology is clarified by a technical instrumentation diagram or workflow schematic (e.g., ablation stake array & geodetic DEM differencing) rather than an aesthetic photograph.',
        image_type: 'diagram',
        image_count: 1,
        image_source: dbCount === 0 ? 'GENERATED' : 'DATABASE',
        display_duration: 22000,
        pedagogical_focus: 'methodology_diagram',
        recommended_query: `${params.topic} measurement methodology diagram`,
      };
    }

    // ── 7. HISTORICAL SCIENTIFIC PROCESS ──────────────────────────────────────
    const isHistorical =
      ['history', 'historical_archive', 'historical'].includes(secClean) ||
      /\b(history|historical|discovery|evolution|pioneer|repeat photography|century|archive|expedition)\b/i.test(titleClean);

    if (isHistorical) {
      const decisionVal: VisualNecessityDecisionType = dbCount >= 1 ? 'DATABASE IMAGE' : 'ONE IMAGE';
      return {
        image_needed: true,
        decision: decisionVal,
        image_reason:
          'Historical scientific processes benefit from archival repeat photography and expedition surveys, providing indispensable empirical evidence of secular cryospheric and landscape transformations.',
        image_type: 'historical_archive',
        image_count: 1,
        image_source: 'DATABASE',
        display_duration: 18000,
        pedagogical_focus: 'visual_morphology',
        recommended_query: `${params.topic} historical repeat photography`,
      };
    }

    // ── 8. COMPLEX PHYSICAL MORPHOLOGY & ANATOMY ──────────────────────────────
    const isMorphology =
      this.PHYSICAL_MORPHOLOGY_SECTIONS.has(secClean) ||
      /\b(morphology|structure|anatomy|physical interpretation|firn|internal structure|climate relationship|landscape|crevasse|crevasses|ogive|ogives|moraine|moraines|serac|seracs)\b/i.test(titleClean);

    if (isMorphology) {
      const decisionVal: VisualNecessityDecisionType = dbCount >= 1 ? 'DATABASE IMAGE' : 'ONE IMAGE';
      return {
        image_needed: true,
        decision: decisionVal,
        image_reason:
          'Complex physical morphology (firn compaction layers, crevasse geometry, moraine formations, thermal basal regimes) cannot be adequately grasped through verbal abstraction alone; an authentic visual grounds physical intuition.',
        image_type: 'photographic_observation',
        image_count: 1,
        image_source: dbCount >= 1 ? 'DATABASE' : 'GENERATED',
        display_duration: 20000,
        pedagogical_focus: 'visual_morphology',
        recommended_query: `${params.topic} ${params.sectionTitle} structural morphology`,
      };
    }

    // ── 9. GRAPH INTERPRETATION: Coordinate Plane is Primary Visual ───────────
    const isGraph =
      ['graph_interpretation', 'graph', 'graph_and_data_interpretation'].includes(secClean) ||
      /\b(graph|graphs|coordinate plane|plotting curves|data interpretation)\b/i.test(titleClean);

    if (isGraph) {
      return {
        image_needed: false,
        decision: 'NO IMAGE',
        image_reason:
          'The scientific coordinate plane and curve progression are already actively utilizing the visual reasoning track; displaying an image alongside would visually overwhelm the coordinate axes.',
        image_type: 'none',
        image_count: 0,
        image_source: 'NONE',
        display_duration: 0,
        pedagogical_focus: 'graph_plane',
      };
    }

    // ── 10. DEFAULT CONSERVATIVE PEDAGOGICAL DECISION: NO IMAGE ───────────────
    return {
      image_needed: false,
      decision: 'NO IMAGE',
      image_reason:
        'This section does not demonstrate a compelling visual necessity; instruction is prioritized on verbal exposition and chalkboard structure to maximize cognitive focus.',
      image_type: 'none',
      image_count: 0,
      image_source: 'NONE',
      display_duration: 0,
      pedagogical_focus: 'blackboard_chalk',
    };
  }

  /**
   * Simple boolean query: "Does this image improve learning?"
   */
  public static shouldShowImage(sectionType: string, sectionTitle: string, topic: string): boolean {
    const decision = this.analyzeSection({ sectionType, sectionTitle, topic });
    return decision.image_needed;
  }
}
