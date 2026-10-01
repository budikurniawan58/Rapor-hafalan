import React from 'react';

interface SchoolLogoProps {
  customLogoUrl?: string | null;
  className?: string;
  size?: number;
}

export const SchoolLogo: React.FC<SchoolLogoProps> = ({
  customLogoUrl,
  className = 'w-16 h-16',
  size = 64,
}) => {
  if (customLogoUrl) {
    return (
      <img
        src={customLogoUrl}
        alt="Logo Madrasah"
        className={`object-contain ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  // Crisp Vector SVG resembling the Madrasah Ibtidaiyah Raudlatul Hikmah crest
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer Pentagon Shield */}
      <polygon
        points="60,4 114,43 93,108 27,108 6,43"
        fill="#1e824c"
        stroke="#145a32"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Inner White Shield Line */}
      <polygon
        points="60,9 108,45 89,103 31,103 12,45"
        fill="#27ae60"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Central Radiating Star / Rays */}
      <circle cx="60" cy="52" r="28" fill="#ffffff" fillOpacity="0.15" />

      {/* Decorative Golden / White Stars */}
      <g fill="#f1c40f">
        <polygon points="60,20 62,25 67,26 63,29 64,34 60,31 56,34 57,29 53,26 58,25" />
        <polygon points="46,24 47.5,28 51.5,28.5 48.5,31 49.5,35 46,32.5 42.5,35 43.5,31 40.5,28.5 44.5,28" transform="scale(0.8) translate(12, 4)" />
        <polygon points="74,24 75.5,28 79.5,28.5 76.5,31 77.5,35 74,32.5 70.5,35 71.5,31 68.5,28.5 72.5,28" transform="scale(0.8) translate(18, 4)" />
      </g>

      {/* Islamic Crescent & Light */}
      <path
        d="M60 26 C64 26 67 29 67 33 C67 37 64 40 60 40 C57.5 40 55.5 38.5 54.5 36.5 C56.5 37.5 59 36.5 59.5 34 C60 31.5 58.5 29.5 56.5 29 C57.5 27 58.5 26 60 26 Z"
        fill="#f4d03f"
      />

      {/* Open Holy Qur'an on Rehal Stand */}
      {/* Rehal (X-cross stand) */}
      <path
        d="M48 68 L72 68 M52 64 L68 76 M68 64 L52 76"
        stroke="#d4ac0d"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Book Base (Green & White Pages) */}
      <path
        d="M60 52 C54 48 42 49 38 52 C37 57 37 61 38 65 C43 62 54 61 60 64 C66 61 77 62 82 65 C83 61 83 57 82 52 C78 49 66 48 60 52 Z"
        fill="#ffffff"
        stroke="#2c3e50"
        strokeWidth="1.2"
      />
      {/* Book Spine Center Line */}
      <path d="M60 52 L60 64" stroke="#16a085" strokeWidth="1.5" />
      {/* Book Inner Page Curves */}
      <path d="M41 54 C48 52 55 53 59 55" stroke="#7f8c8d" strokeWidth="0.8" />
      <path d="M41 58 C48 56 55 57 59 59" stroke="#7f8c8d" strokeWidth="0.8" />
      <path d="M79 54 C72 52 65 53 61 55" stroke="#7f8c8d" strokeWidth="0.8" />
      <path d="M79 58 C72 56 65 57 61 59" stroke="#7f8c8d" strokeWidth="0.8" />

      {/* Bottom Ribbon / Banner */}
      <path
        d="M20 90 L26 84 L94 84 L100 90 L94 96 L26 96 Z"
        fill="#145a32"
        stroke="#ffffff"
        strokeWidth="1"
      />
      {/* Banner Ribbon Tails */}
      <polygon points="20,90 26,84 26,96" fill="#0e3f23" />
      <polygon points="100,90 94,84 94,96" fill="#0e3f23" />

      {/* Text on Banner */}
      <text
        x="60"
        y="92"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="6.5"
        fontWeight="800"
        fontFamily="Arial, sans-serif"
        letterSpacing="0.6"
      >
        RAUDLATUL HIKMAH
      </text>

      {/* Arabic Calligraphy hint above Quran */}
      <path
        d="M48 43 Q 60 41 72 43"
        stroke="#ffffff"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
};
