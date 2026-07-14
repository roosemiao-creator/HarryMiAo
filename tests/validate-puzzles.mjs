import assert from 'assert';
import { readFileSync } from 'fs';

const source = readFileSync(new URL('../assets/scripts/data/Puzzles.ts', import.meta.url), 'utf8');
const challengeBlock = source.match(/const challengeThemes: Theme\[] = \[([\s\S]*?)\n\] as Theme\[];/)?.[1] ?? '';
const storyBlock = source.match(/const storyThemes: Theme\[] = \[([\s\S]*?)\n\] as Theme\[];/)?.[1] ?? '';

assert.equal((challengeBlock.match(/^  \[/gm) ?? []).length, 10, 'must ship ten challenge puzzles');
assert.equal((storyBlock.match(/^  \[/gm) ?? []).length, 10, 'must ship ten story puzzles');
assert.match(source, /const groups = \[clues\.slice\(0, 2\), clues\.slice\(2, 4\), clues\.slice\(4, 6\), clues\.slice\(6, 9\)\]/, 'puzzles must expose evidence in 2/2/2/3 stages');
assert.match(source, /previousStageComplete: true/, 'later evidence must depend on prior evidence being completed');
assert.match(source, /requiredCells: groups\[index - 1\]/, 'stage unlocks must be linked to verified assignments');

const engine = readFileSync(new URL('../assets/scripts/core/PuzzleEngine.ts', import.meta.url), 'utf8');
assert.match(engine, /getHint\(\)/, 'engine must provide a hint path');
assert.match(engine, /this\.lives -= 1/, 'engine must immediately penalize a wrong answer');
assert.match(engine, /while \(this\.activeStageIndex \+ 1/, 'engine must unlock all newly reachable stages');

console.log('Puzzle data structure validated: 20 levels, staged evidence, hint and life rules present.');
