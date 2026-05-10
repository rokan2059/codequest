import { deletePuzzle, getPuzzles } from './lib/puzzleService.ts';

async function test() {
    try {
        const puzzles = await getPuzzles();
        console.log("Puzzles before:", Object.values(puzzles).flat().map(p => p.id));
        
        const firstPuzzleId = Object.values(puzzles).flat()[0]?.id;
        if (!firstPuzzleId) {
            console.log("No puzzles to delete");
            return;
        }

        console.log(`Attempting to delete puzzle: ${firstPuzzleId}`);
        await deletePuzzle(firstPuzzleId);
        console.log("Delete called without throwing.");

        const puzzlesAfter = await getPuzzles();
        console.log("Puzzles after:", Object.values(puzzlesAfter).flat().map(p => p.id));
    } catch (e) {
        console.error("Error:", e);
    }
}

test();
