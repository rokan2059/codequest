import React from 'react';

const TrophyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
        <path d="M12 2L12 6" />
        <path d="M6 6L6 12" />
        <path d="M18 6L18 12" />
        <path d="M6 12A6 6 0 0 0 12 18A6 6 0 0 0 18 12" />
        <path d="M6 12H2" />
        <path d="M18 12H22" />
        <path d="M12 18V22" />
        <path d="M9 22H15" />
    </svg>
);

export default TrophyIcon;
