// ------------------------------------------------------------
// ANTI-CHEAT CONFIGURATION
// ------------------------------------------------------------

export const MAX_STRIKES = 3;
export const RETURN_COUNTDOWN_SEC = 10;

export const STRIKE_MESSAGES = [
  {
    title: "Warning: Violation Detected!",
    description:
      "Switching tabs, minimising the window, or exiting fullscreen during the exam is not allowed. This incident has been recorded.",
    level: "warning" as const,
  },
  {
    title: "Final Warning: Violation Detected!",
    description:
      "This is your LAST warning. One more violation and your test will be auto-submitted and your session terminated.",
    level: "critical" as const,
  },
  {
    title: "Session Terminated",
    description:
      "You have exceeded the maximum number of violations. Your test has been automatically submitted and your session terminated.",
    level: "terminated" as const,
  },
];

export type StrikeMessage = (typeof STRIKE_MESSAGES)[number];
