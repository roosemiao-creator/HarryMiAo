import { Assignment, CellRef, Clue, ClueStage, PuzzleDefinition, UnlockCondition, cellKey } from './PuzzleTypes';

export type FillResult = 'correct' | 'incorrect' | 'blocked' | 'complete';

/**
 * UI-free game state. Keeping it independent of Cocos makes every level
 * deterministic and lets the same data work for challenge and story modes.
 */
export class PuzzleEngine {
  readonly puzzle: PuzzleDefinition;
  readonly answers = new Map<string, string>();
  readonly solution = new Map<string, string>();
  readonly completedClueIds = new Set<string>();
  activeStageIndex = 0;
  lives: number;
  mistakes = 0;

  constructor(puzzle: PuzzleDefinition) {
    this.puzzle = puzzle;
    this.lives = puzzle.lives;
    for (const assignment of puzzle.solution) this.solution.set(cellKey(assignment), assignment.optionId);
    for (const assignment of puzzle.initialAssignments ?? []) this.answers.set(cellKey(assignment), assignment.optionId);
    this.refreshCluesAndStages();
  }

  get activeStage(): ClueStage { return this.puzzle.stages[this.activeStageIndex]; }
  get isGameOver(): boolean { return this.lives <= 0; }
  get isComplete(): boolean { return this.answers.size === this.solution.size; }
  /**
   * Keep only a small evidence stack on screen. Unsolved evidence from an
   * earlier batch stays visible, so a newly revealed card never erases a
   * relationship the player still needs to reason about.
   */
  get shownClues(): Clue[] {
    return this.puzzle.stages
      .slice(0, this.activeStageIndex + 1)
      .reduce<Clue[]>((all, stage) => all.concat(stage.clues), [])
      .filter((clue) => !this.completedClueIds.has(clue.id))
      .slice(-3);
  }
  get unlockedClueCount(): number {
    return this.puzzle.stages.slice(0, this.activeStageIndex + 1).reduce((sum, stage) => sum + stage.clues.length, 0);
  }
  get totalClueCount(): number { return this.puzzle.stages.reduce((sum, stage) => sum + stage.clues.length, 0); }

  getAnswer(cell: CellRef): string | undefined { return this.answers.get(cellKey(cell)); }
  isCorrect(assignment: Assignment): boolean { return this.solution.get(cellKey(assignment)) === assignment.optionId; }

  fill(assignment: Assignment): FillResult {
    const key = cellKey(assignment);
    if (this.isGameOver || this.answers.has(key)) return 'blocked';
    if (!this.isCorrect(assignment)) {
      this.lives -= 1;
      this.mistakes += 1;
      return 'incorrect';
    }
    this.answers.set(key, assignment.optionId);
    this.refreshCluesAndStages();
    return this.isComplete ? 'complete' : 'correct';
  }

  erase(cell: CellRef): boolean {
    const key = cellKey(cell);
    if ((this.puzzle.initialAssignments ?? []).some((item) => cellKey(item) === key)) return false;
    return this.answers.delete(key);
  }

  /** Returns a still-empty solution cell that is supported by visible evidence. */
  getHint(): Assignment | undefined {
    const visible = this.shownClues.reduce<Assignment[]>((all, clue) => all.concat(clue.completesWhen), []);
    return visible.find((assignment) => !this.answers.has(cellKey(assignment)))
      ?? this.puzzle.solution.find((assignment) => !this.answers.has(cellKey(assignment)));
  }

  private refreshCluesAndStages(): void {
    for (const stage of this.puzzle.stages) {
      for (const clue of stage.clues) {
        if (clue.completesWhen.every((assignment) => this.answers.get(cellKey(assignment)) === assignment.optionId)) {
          this.completedClueIds.add(clue.id);
        }
      }
    }
    while (this.activeStageIndex + 1 < this.puzzle.stages.length && this.canUnlock(this.puzzle.stages[this.activeStageIndex + 1])) {
      this.activeStageIndex += 1;
    }
  }

  private canUnlock(stage: ClueStage): boolean {
    const condition = stage.unlock;
    const previous = this.puzzle.stages[this.activeStageIndex];
    if (condition.previousStageComplete && !previous.clues.every((clue) => this.completedClueIds.has(clue.id))) return false;
    if (condition.completedCluesAtLeast && this.completedClueIds.size < condition.completedCluesAtLeast) return false;
    return (condition.requiredCells ?? []).every((assignment) => this.answers.get(cellKey(assignment)) === assignment.optionId);
  }
}
