import React from 'react';

const PuzzleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M19.1 8.3a3.5 3.5 0 0 0-2.1-5.8 3.5 3.5 0 0 0-3.5 3.5c0 1.2.6 2.3 1.5 3L12 12l-2-2a3.5 3.5 0 1 0-5 0l5 5-2.5 2.5a3.5 3.5 0 1 0 5 0L18 12l-2.9-2.9a3.5 3.5 0 0 0 4-1.8z" />
    </svg>
);

export default PuzzleIcon;
