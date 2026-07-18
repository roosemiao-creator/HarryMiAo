/**
 * Original 331-level campaign blueprint.
 *
 * This deliberately models only abstract pacing information (board size,
 * clue budget and constraint families). Names, solutions, clue text and art
 * are authored independently by this project.
 */
export type CampaignDifficulty = 'Onboarding' | 'Easy' | 'Medium' | 'Hard' | 'Very Hard' | 'Daily Challenge';
export type ConstraintFamily = 'binding' | 'exclusion' | 'adjacency' | 'comparison' | 'ordering' | 'count';

export interface CampaignProfile {
  index: number;
  id: string;
  difficulty: CampaignDifficulty;
  subjectCount: number;
  traitCount: number;
  clueBudget: number;
  openingFacts: number;
  stagedBatches: number[];
  constraintFamilies: ConstraintFamily[];
}

const profileFor = (index: number): CampaignProfile => {
  let difficulty: CampaignDifficulty;
  if (index <= 3) difficulty = 'Onboarding';
  else if (index % 29 === 0) difficulty = 'Daily Challenge';
  else if (index % 17 === 0) difficulty = 'Very Hard';
  else if (index % 5 === 0) difficulty = 'Hard';
  else if (index % 2 === 0 || index % 7 === 0) difficulty = 'Medium';
  else difficulty = 'Easy';

  switch (difficulty) {
    case 'Onboarding':
      return { index, id: `campaign-${index}`, difficulty, subjectCount: index === 2 ? 3 : 2, traitCount: index === 3 ? 3 : 2, clueBudget: 4, openingFacts: 1, stagedBatches: [2, 2], constraintFamilies: ['binding', 'exclusion'] };
    case 'Easy':
      return { index, id: `campaign-${index}`, difficulty, subjectCount: 3 + (index % 2), traitCount: 3 + (index % 3 === 0 ? 1 : 0), clueBudget: 6 + (index % 3), openingFacts: 1, stagedBatches: [3, 3, 2], constraintFamilies: ['binding', 'exclusion'] };
    case 'Medium':
      return { index, id: `campaign-${index}`, difficulty, subjectCount: 4 + (index % 3 === 0 ? 1 : 0), traitCount: 4 + (index % 4 === 0 ? 1 : 0), clueBudget: 10 + (index % 3), openingFacts: 1, stagedBatches: [3, 3, 3, 2], constraintFamilies: ['binding', 'exclusion', 'ordering'] };
    case 'Hard':
      return { index, id: `campaign-${index}`, difficulty, subjectCount: 5, traitCount: 5, clueBudget: 15 + (index % 3), openingFacts: 1, stagedBatches: [4, 4, 4, 3], constraintFamilies: ['binding', 'exclusion', 'adjacency', 'comparison'] };
    case 'Very Hard':
      return { index, id: `campaign-${index}`, difficulty, subjectCount: 5, traitCount: 6, clueBudget: 18 + (index % 3), openingFacts: 2, stagedBatches: [4, 4, 4, 4, 3], constraintFamilies: ['binding', 'exclusion', 'adjacency', 'comparison', 'ordering'] };
    case 'Daily Challenge':
      return { index, id: `campaign-${index}`, difficulty, subjectCount: 6, traitCount: 6 + (index % 2), clueBudget: 20 + (index % 4), openingFacts: 2, stagedBatches: [5, 4, 4, 4, 4], constraintFamilies: ['binding', 'exclusion', 'adjacency', 'comparison', 'ordering', 'count'] };
  }
};

export const ORIGINAL_CAMPAIGN: CampaignProfile[] = Array.from({ length: 331 }, (_, offset) => profileFor(offset + 1));
