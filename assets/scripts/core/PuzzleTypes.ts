export type GameMode = 'challenge' | 'story';

export interface Entity {
  id: string;
  name: string;
  icon: string;
}

export interface AttributeOption {
  id: string;
  label: string;
  icon: string;
}

export interface AttributeCategory {
  id: string;
  label: string;
  options: AttributeOption[];
}

export interface CellRef {
  entityId: string;
  categoryId: string;
}

export interface Assignment extends CellRef {
  optionId: string;
}

export interface Clue {
  id: string;
  text: string;
  /** The correct cells that make this piece of evidence understood. */
  completesWhen: Assignment[];
}

export interface UnlockCondition {
  /** All listed cells must be confirmed correctly. */
  requiredCells?: Assignment[];
  /** A stage may be gated by the number of finished clues, too. */
  completedCluesAtLeast?: number;
  /** Used by the supplied levels to make evidence appear as a chain. */
  previousStageComplete?: boolean;
}

export interface ClueStage {
  id: string;
  narrator?: string;
  clues: Clue[];
  unlock: UnlockCondition;
}

export interface PuzzleDefinition {
  id: string;
  mode: GameMode;
  chapter?: number;
  order: number;
  title: string;
  subtitle: string;
  entities: Entity[];
  categories: AttributeCategory[];
  solution: Assignment[];
  initialAssignments?: Assignment[];
  stages: ClueStage[];
  lives: number;
}

export const cellKey = (cell: CellRef): string => `${cell.entityId}:${cell.categoryId}`;
