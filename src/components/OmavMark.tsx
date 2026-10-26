import React from 'react';

interface OmavMarkProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  idPrefix?: string;
}

export const OmavMark: React.FC<OmavMarkProps> = ({
  width = 46,
  height = 34,
  className = '',
  idPrefix = 'omavNav',
}) => {
  const clipId = `omavDiscClip_${idPrefix}`;

  return (
    <svg
      viewBox="-150 -104 300 218"
      width={width}
      height={height}
      aria-hidden="true"
      className={className}
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="0" cy="0" r="100" />
        </clipPath>
      </defs>
      <g style={{ clipPath: `url(#${clipId})` }}>
        <rect x="-100" y="-100" width="200" height="23.5" fill="#A9B2BE" />
        <rect x="-100" y="-74.3" width="200" height="29.8" fill="#A9B2BE" />
        <rect x="-100" y="-42.3" width="200" height="24.3" fill="#A9B2BE" />
        <rect x="-100" y="-15.8" width="200" height="19.8" fill="#A9B2BE" />
        <rect x="-100" y="6.2" width="200" height="15.8" fill="#A9B2BE" />
        <rect x="-100" y="24.2" width="200" height="11.8" fill="#A9B2BE" />
        <rect x="-100" y="38.2" width="200" height="8.3" fill="#A9B2BE" />
        <rect x="-100" y="48.7" width="200" height="6.3" fill="#A9B2BE" />
        <rect x="-100" y="57.2" width="200" height="42.8" fill="#626B79" />
      </g>
      <circle
        cx="0"
        cy="0"
        r="20"
        fill="#2B2E6E"
        stroke="#E4E8EE"
        strokeWidth="3"
      />
      <path
        d="M -143 25 C -128 12 -108 6 -88 6 C -58 6 -22 30 0 57 C 22 30 58 6 88 6 C 108 6 128 12 143 25 C 126 22 108 25 92 27 C 60 31 28 52 7.5 80 L -7.5 80 C -28 52 -60 31 -92 27 C -108 25 -126 22 -143 25 Z"
        fill="#4A5260"
        transform="translate(0 4.5)"
      />
      <path
        d="M -143 25 C -128 12 -108 6 -88 6 C -58 6 -22 30 0 57 C 22 30 58 6 88 6 C 108 6 128 12 143 25 C 126 22 108 25 92 27 C 60 31 28 52 7.5 80 L -7.5 80 C -28 52 -60 31 -92 27 C -108 25 -126 22 -143 25 Z"
        fill="#DDE2E9"
        stroke="#05070B"
        strokeWidth="2.5"
      />
      <rect x="-7.5" y="79" width="15" height="5" fill="#DDE2E9" />
      <path d="M -6 84 L 6 84 L 0 99 Z" fill="#DDE2E9" />
      <circle cx="0" cy="88.6" r="1.8" fill="#05070B" />
      <circle cx="0" cy="107" r="2.6" fill="#DDE2E9" />
    </svg>
  );
};
