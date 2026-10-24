/** Motion tokens of the upstream Activity Heatmap (21st.dev · @kuratlielia), recovered from its published preview. */
export const motionTokens = {
  duration: { fast: 0.16 },
  ease: {
    enter: [0.16, 1, 0.3, 1],
    standard: [0.22, 1, 0.36, 1],
  },
  spring: {
    snappy: { type: "spring", visualDuration: 0.26, bounce: 0.12 },
    morph: { type: "spring", visualDuration: 0.42, bounce: 0.16 },
  },
  blur: { subtle: 2, soft: 4 },
} as const;
