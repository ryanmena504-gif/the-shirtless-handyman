const COLE = {
  skin: "#C4A07A",
  hair: "#2A2118",
  shirt: "#3D4A3A",
  accent: "#D97757",
};

const AVERY = {
  skin: "#D8B396",
  hair: "#4A2C1A",
  shirt: "#5C3A32",
  accent: "#E8B86D",
};

export const ViewTubeCoachPortrait = ({ coachId, className = "", alt }) => {
  const palette = coachId === "avery" ? AVERY : COLE;
  const label = alt || (coachId === "avery" ? "Avery, AI coach" : "Cole, AI coach");

  return (
    <svg
      viewBox="0 0 160 200"
      className={className}
      role="img"
      aria-label={label}
      data-testid={`viewtube-portrait-${coachId}`}
    >
      <rect width="160" height="200" fill="#161616" />
      <circle cx="80" cy="168" r="70" fill={palette.shirt} />
      <ellipse cx="80" cy="92" rx="38" ry="46" fill={palette.skin} />
      {coachId === "avery" ? (
        <>
          <path d="M38 88 C40 40 120 40 122 88 L118 120 C100 108 60 108 42 120 Z" fill={palette.hair} />
          <path d="M44 70 C70 48 110 52 116 78" fill="none" stroke={palette.hair} strokeWidth="14" />
        </>
      ) : (
        <>
          <path d="M44 70 C50 38 110 38 116 70 L112 86 C96 72 64 72 48 86 Z" fill={palette.hair} />
          <rect x="46" y="78" width="10" height="22" rx="4" fill={palette.hair} />
          <rect x="104" y="78" width="10" height="22" rx="4" fill={palette.hair} />
        </>
      )}
      <circle cx="66" cy="90" r="3.2" fill="#1A1A1A" />
      <circle cx="94" cy="90" r="3.2" fill="#1A1A1A" />
      <path d="M70 108 Q80 114 90 108" fill="none" stroke="#5A4030" strokeWidth="2.2" strokeLinecap="round" />
      <rect x="0" y="176" width="160" height="24" fill="rgba(0,0,0,0.45)" />
      <text x="12" y="193" fill={palette.accent} fontSize="11" letterSpacing="2.4" fontFamily="ui-sans-serif, system-ui">
        AI COACH
      </text>
    </svg>
  );
};
