export const delay = (ms = 700) => new Promise((resolve) => setTimeout(resolve, ms));

export const withLatency = async <T,>(fn: () => T | Promise<T>, ms?: number): Promise<T> => {
  await delay(ms);
  return await fn();
};

export const assertOutcome = (result: { outcome: "success" | "blocked"; details: string }) => {
  if (result.outcome === "blocked") {
    throw new Error(result.details);
  }
  return result;
};
