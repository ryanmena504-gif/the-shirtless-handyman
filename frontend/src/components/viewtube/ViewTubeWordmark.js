export const ViewTubeWordmark = ({ size = "md", invert = false, testId = "viewtube-wordmark" }) => {
  const sizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-5xl md:text-7xl",
    xl: "text-6xl md:text-8xl",
  };
  const view = invert ? "text-white" : "text-foreground";
  const tube = "text-[#D97757]";

  return (
    <span
      data-testid={testId}
      className={`${sizes[size]} font-semibold tracking-tight leading-none`}
      style={{ fontFamily: "'Fraunces', serif" }}
    >
      <span className={view}>view</span>
      <span className={tube}>Tube</span>
    </span>
  );
};
