import { Puzzle } from '../lib/types';

export const puzzles: Record<string, Puzzle[]> = {
    'JavaScript Basics': [
        { 
            id: 'js1',
            title: 'Variable Scope', 
            difficulty: 'Easy', 
            points: 10,
            xp: 10,
            category: 'JavaScript Basics',
            description: 'What will be logged to the console?',
            code: `let x = 10;\nfunction checkScope() {\n  let x = 20;\n}\ncheckScope();\nconsole.log(x);`,
            answer: '10',
            requiredLevel: 1,
            hint: 'The inner x is scoped to the function and does not modify the outer x.'
        },
        { 
            id: 'js2',
            title: 'Type Coercion', 
            difficulty: 'Easy', 
            points: 10,
            xp: 10,
            category: 'JavaScript Basics',
            description: 'What is the result of this expression?',
            code: `console.log(1 + "2" + 3);`,
            answer: '123',
            requiredLevel: 1,
            hint: 'When you add a number to a string in JS, it concatenates them.'
        },
        { 
            id: 'js3',
            title: 'Closures', 
            difficulty: 'Medium', 
            points: 25,
            xp: 25,
            category: 'JavaScript Basics',
            description: 'What will this code log to the console?',
            code: `function outer() {\n  let count = 0;\n  return function inner() {\n    count++;\n    return count;\n  }\n}\nconst counter = outer();\nconsole.log(counter());\nconsole.log(counter());`,
            answer: '1\n2',
            requiredLevel: 10,
            hint: 'The inner function remembers the variables from its outer scope.'
        },
    ],
    'Array Methods': [
        { 
            id: 'arr1',
            title: 'Map vs. ForEach', 
            difficulty: 'Medium', 
            points: 30,
            xp: 30,
            category: 'Array Methods',
            description: 'What will `newArray` contain after this code runs?',
            code: `const arr = [1, 2, 3];\nconst newArray = arr.map(num => num * 2);\nconsole.log(newArray);`,
            answer: '[2,4,6]',
            requiredLevel: 10,
            hint: 'The map method creates a new array populated with the results of calling a provided function on every element.'
        },
    ],
    'Asynchronous JS': [
        { 
            id: 'async1',
            title: 'Event Loop', 
            difficulty: 'Hard', 
            points: 50,
            xp: 50,
            category: 'Asynchronous JS',
            description: 'In what order will the numbers be logged?',
            code: `console.log(1);\nsetTimeout(() => console.log(2), 0);\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);`,
            answer: '1\n4\n3\n2',
            requiredLevel: 25,
            hint: 'Microtasks (Promises) run before Macrotasks (setTimeout).'
        },
    ],
};
