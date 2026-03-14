import type { DepreciationRow } from '$lib/calculations';
import type { Cost } from '$lib/domain';
import type { ProjectType } from './sectionTypes';

const TERRAIN_PERCENT = 0.15;
const STRUCTURE_PERCENT = 0.6;
const TECHNIQUES_PERCENT = 0.15;
const AGENCEMENTS_PERCENT = 0.25;
const STRUCTURE_YEARS = 30;
const TECHNIQUES_YEARS = 15;
const AGENCEMENTS_YEARS = 10;
const MEUBLES_YEARS = 5;
const HORIZON_20 = 20;

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
