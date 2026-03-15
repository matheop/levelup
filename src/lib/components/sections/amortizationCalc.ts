import type { DepreciationRow } from '$lib/calculations';
import type { Cost } from '$lib/domain';
import type { ProjectType, TaxRegimeName } from '$lib/dbTypes';

const TERRAIN_PERCENT = 0.15;
const STRUCTURE_PERCENT = 0.6;
const TECHNIQUES_PERCENT = 0.15;
const AGENCEMENTS_PERCENT = 0.25;
const STRUCTURE_YEARS = 30;
const TECHNIQUES_YEARS = 15;
const AGENCEMENTS_YEARS = 10;
const MEUBLES_YEARS = 5;
const HORIZON_20 = 20;

/** Info text for the amortization subsection (LMNP/SCI). */
export const AMORT_INFO =
	"<strong>Règles utilisées :</strong>\nPart terrain : 15 % non amortissable.\nBase bien (hors meubles) :\n- Achat : (prix d'achat + frais de notaire) × 0,85\n- Travaux seuls : coût des travaux × 0,85\n<strong>4 postes avec durées courtes :</strong>\n- Structure / gros œuvre : 60 % de la base bien, 30 ans\n- Installations techniques : 15 % de la base bien, 15 ans\n- Agencements intérieurs : 25 % de la base bien, 10 ans\n- Meubles : 100 % du coût meubles, 5 ans";

const AMORT_INFO_SCI_IS =
	"\n\n<strong>SCI à l'IS :</strong> les durées utilisées ici sont celles du LMNP (30/15/10/5 ans). En IS, les durées fiscales pour le bâti peuvent être plus longues (20 à 50 ans selon les cas).";

/** Returns amortization info content; appends SCI_IS note when regime is SCI_IS. */
export function getAmortizationInfoContent(taxRegime?: TaxRegimeName): string {
	return AMORT_INFO + (taxRegime === 'SCI_IS' ? AMORT_INFO_SCI_IS : '');
}

export interface AmortLine {
	label: string;
	percentLabel: string;
	base: number;
	duration: number;
	annualOnDuration: number;
	annualAvg20: number;
	monthlyOnDuration: number;
	monthlyAvg20: number;
}

function addLine(
	lines: AmortLine[],
	label: string,
	percentLabel: string,
	base: number,
	duration: number
) {
	if (base <= 0 || duration <= 0) {
		lines.push({
			label,
			percentLabel,
			base: 0,
			duration,
			annualOnDuration: 0,
			annualAvg20: 0,
			monthlyOnDuration: 0,
			monthlyAvg20: 0
		});
		return;
	}
	const annualOnDuration = base / duration;
	const annualAvg20 = duration >= HORIZON_20 ? annualOnDuration : base / HORIZON_20;
	lines.push({
		label,
		percentLabel,
		base,
		duration,
		annualOnDuration,
		annualAvg20,
		monthlyOnDuration: annualOnDuration / 12,
		monthlyAvg20: annualAvg20 / 12
	});
}

export function getAmortizationData(
	projectType: ProjectType,
	costs: Cost
): { lines: AmortLine[]; depreciationRows: DepreciationRow[] } {
	const baseBien =
		projectType === 'purchase'
			? (costs.purchasePrice + costs.notaryFees) * (1 - TERRAIN_PERCENT)
			: costs.renovationCost * (1 - TERRAIN_PERCENT);

	const lines: AmortLine[] = [];
	addLine(
		lines,
		'Structure / gros œuvre',
		'60 %',
		baseBien * STRUCTURE_PERCENT,
		STRUCTURE_YEARS
	);
	addLine(
		lines,
		'Installations techniques',
		'15 %',
		baseBien * TECHNIQUES_PERCENT,
		TECHNIQUES_YEARS
	);
	addLine(
		lines,
		'Agencements intérieurs',
		'25 %',
		baseBien * AGENCEMENTS_PERCENT,
		AGENCEMENTS_YEARS
	);
	addLine(lines, 'Meubles', '100 %', costs.furnitureCost || 0, MEUBLES_YEARS);

	const depreciationRows: DepreciationRow[] = lines.map((l) => ({
		depreciable_value: l.base,
		depreciation_period: l.duration
	}));

	return { lines, depreciationRows };
}
