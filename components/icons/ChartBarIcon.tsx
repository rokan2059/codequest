import React from 'react';

const ChartBarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
        <path d="M3 3v18h18" />
        <path d="M7 12h4v8H7z" />
        <path d="M12 8h4v12h-4z" />
        <path d="M17 16h4v4h-4z" />
    </svg>
);

export default ChartBarIcon;
