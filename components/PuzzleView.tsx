import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion, AnimatePresence } from 'framer-motion';
import { Puzzle } from '../lib/types';
import { useAppContext } from '../context/AppContext';
import confetti from 'canvas-confetti';
import LockIcon from './icons/LockIcon';

interface PuzzleViewProps {
    puzzle: Puzzle;
}

const PuzzleView: React.FC<PuzzleViewProps> = ({ puzzle }) => {
    const { state, dispatch, addToast, completePuzzle } = useAppContext();
    const [userAnswer, setUserAnswer] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    const isAlreadySolved = state.user?.solvedPuzzleIds.includes(puzzle.id) ?? false;

    const getRequiredLevel = (p: Puzzle) => {
        if (p.requiredLevel !== undefined && p.requiredLevel > 0) {
            return p.requiredLevel;
        }
        let req = 1;
        if (p.difficulty === 'Medium') req = 10;
        if (p.difficulty === 'Hard') req = 25;
        return req;
    };

    const requiredLevel = getRequiredLevel(puzzle);
    const isLocked = (state.user?.level || 1) < requiredLevel;

    const onBack = () => dispatch({ type: 'SET_VIEW', payload: 'puzzles' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isCorrect === true) return;

        const correct = userAnswer.trim().replace(/\s/g, '') === puzzle.answer.trim().replace(/\s/g, '');
        
        if (correct) {
            setSubmitted(true);
            setIsCorrect(true);
            
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            });

            if (isAlreadySolved) {
                 addToast(`Correct again! You've already earned points for this puzzle.`, 'success');
            } else {
                addToast(`Correct! +${puzzle.points} Points and +${puzzle.xp} XP`, 'success');
                await completePuzzle(puzzle.id, puzzle.points, puzzle.xp);
            }
        } else {
            addToast('Not quite, try again!', 'error');
        }
    };

    return (
        <div className="container mx-auto max-w-4xl">
            <header className="mb-8">
                <button onClick={onBack} className="text-secondary hover:text-green-700 mb-4 transition-colors font-semibold">
                    &larr; Back to Puzzles
                </button>
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-100">{puzzle.title}</h1>
                    <div className="flex flex-col items-end gap-1">
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                            puzzle.difficulty === 'Easy' ? 'bg-green-500/20 text-green-300' :
                            puzzle.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-red-500/20 text-red-300'
                        }`}>{puzzle.difficulty}</span>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-yellow-400">◈ {puzzle.points} Points</span>
                            <span className="text-sm font-bold text-blue-400">⚡ {puzzle.xp} XP</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="bg-neutral-900/50 backdrop-blur-md rounded-xl border border-primary p-6">
                
                {isAlreadySolved && !submitted && (
                    <div className="mb-6 p-4 rounded-lg border bg-secondary/20 border-secondary text-green-200">
                        <p className="font-semibold">Puzzle Already Solved!</p>
                        <p className="text-sm">You can try this puzzle again for practice, but you won't earn additional XP.</p>
                    </div>
                )}
                
                <p className="text-gray-300 text-lg mb-6">{puzzle.description}</p>

                <div className="bg-background rounded-lg font-mono text-sm border border-primary mb-6 overflow-x-auto">
                    <SyntaxHighlighter language="javascript" style={vscDarkPlus} customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}>
                        {puzzle.code}
                    </SyntaxHighlighter>
                </div>

                {isLocked ? (
                    <div className="mt-6 p-4 rounded-lg bg-neutral-900 border border-primary text-center">
                        <LockIcon className="w-8 h-8 mx-auto text-gray-500 mb-2" />
                        <h3 className="text-gray-300 font-medium">Puzzle Locked</h3>
                        <p className="text-sm text-gray-400">Reach Level {requiredLevel} to attempt this challenge.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="answer" className="block text-lg font-medium text-gray-300 mb-2">
                            Your Answer:
                        </label>
                        <textarea
                            id="answer"
                            rows={3}
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            disabled={isCorrect === true}
                            className="w-full px-4 py-3 bg-neutral-900 border border-primary rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition duration-200 disabled:bg-neutral-950 disabled:cursor-not-allowed"
                            placeholder="What is the final output?"
                        />
                         <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isCorrect === true}
                            className="mt-4 w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-secondary hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-secondary disabled:bg-green-950 disabled:cursor-not-allowed transition-all duration-300"
                        >
                            Submit Answer
                        </motion.button>
                    </form>
                )}

                {submitted && isCorrect === true && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-4 rounded-lg border bg-secondary/20 border-secondary text-green-200"
                    >
                        <h3 className="font-bold text-lg mb-2">Correct! 🎉</h3>
                        <p>{isAlreadySolved ? "Great job solving it again! You have already claimed the rewards for this puzzle." : `Success! You earned +${puzzle.points} Points and +${puzzle.xp} XP. Your profile has been updated.`}</p>
                        
                        <div className="flex gap-3 mt-4">
                            <button onClick={onBack} className="bg-primary hover:bg-red-900 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                                Back to List
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default PuzzleView;