/** Total round time in seconds (5 minutes). */
export const GAME_DURATION = 300;

/** Seconds deducted from the timer when a puzzle is skipped. */
export const SKIP_PENALTY_SECONDS = 5;

/** Star thresholds based on time *used* (seconds elapsed). */
export const STAR_3_MAX_TIME = 120; // under 2:00 → 3 stars
export const STAR_2_MAX_TIME = 210; // under 3:30 → 2 stars

export function starsForTimeUsed(timeUsed: number): number {
  if (timeUsed < STAR_3_MAX_TIME) return 3;
  if (timeUsed < STAR_2_MAX_TIME) return 2;
  return 1;
}
