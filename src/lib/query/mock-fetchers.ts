import {
  delegationTraceFixture,
  institutionalExceptionsFixture,
  institutionalPersonas,
  institutionalSubmissionsFixture,
} from "@/mocks/institutional";
import {
  mapLinkedRecommendationsFixture,
  socialConsentEdgeCasesFixture,
  socialModerationEdgeCasesFixture,
  socialPersonas,
} from "@/mocks/social";

export type MockState = "success" | "loading" | "error";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function mockFetch<T>(data: T, state: MockState = "success", ms = 350): Promise<T> {
  if (state === "loading") {
    await sleep(1400);
  } else {
    await sleep(ms);
  }

  if (state === "error") {
    throw new Error("Mock data source failed. Use ?mock=success to recover.");
  }

  return data;
}

export const mockFetchers = {
  institutionalOverview: (state?: MockState) =>
    mockFetch({
      personas: institutionalPersonas,
      submissions: institutionalSubmissionsFixture,
      exceptions: institutionalExceptionsFixture,
      delegations: delegationTraceFixture,
    }, state),
  socialOverview: (state?: MockState) =>
    mockFetch({
      personas: socialPersonas,
      moderation: socialModerationEdgeCasesFixture,
      consent: socialConsentEdgeCasesFixture,
      map: mapLinkedRecommendationsFixture,
    }, state),
};
