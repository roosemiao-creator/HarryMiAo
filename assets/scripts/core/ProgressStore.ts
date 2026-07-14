import { sys } from 'cc';
import { GameMode, PuzzleDefinition } from './PuzzleTypes';

interface ProgressData {
  completed: string[];
  hints: number;
  erasers: number;
}

const STORAGE_KEY = 'fairytale-detective-progress-v1';

export class ProgressStore {
  private data: ProgressData;

  constructor() {
    try {
      this.data = JSON.parse(sys.localStorage.getItem(STORAGE_KEY) ?? '') as ProgressData;
    } catch {
      this.data = { completed: [], hints: 3, erasers: 2 };
    }
    this.data.completed ??= [];
    this.data.hints ??= 3;
    this.data.erasers ??= 2;
  }

  isComplete(id: string): boolean { return this.data.completed.includes(id); }
  complete(puzzle: PuzzleDefinition): void {
    if (!this.isComplete(puzzle.id)) this.data.completed.push(puzzle.id);
    this.save();
  }
  isUnlocked(puzzle: PuzzleDefinition, allInMode: PuzzleDefinition[]): boolean {
    if (puzzle.order === 1) return true;
    const prior = allInMode.find((item) => item.order === puzzle.order - 1);
    return !!prior && this.isComplete(prior.id);
  }
  get hints(): number { return this.data.hints; }
  get erasers(): number { return this.data.erasers; }
  consumeHint(): boolean { if (this.data.hints <= 0) return false; this.data.hints -= 1; this.save(); return true; }
  consumeEraser(): boolean { if (this.data.erasers <= 0) return false; this.data.erasers -= 1; this.save(); return true; }
  reset(): void { this.data = { completed: [], hints: 3, erasers: 2 }; this.save(); }
  private save(): void { sys.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data)); }
}
