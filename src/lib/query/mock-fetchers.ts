import {
  delegationTraceFixture,
  institutionalExceptionsFixture,
  institutionalPersonas,
  institutionalSubmissionsFixture,
} from "../mock/institutional";
import {
  mapLinkedRecommendationsFixture,
  socialConsentEdgeCasesFixture,
  socialModerationEdgeCasesFixture,
  socialPersonas,
} from "../mock/social";

export type MockState = "success" | "loading" | "error";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function mockFetch<T>(data: T, state: MockState = "success", ms = 0): Promise<T> {
  if (state === "loading") {
    await new Promise<never>(() => {});
  } else {
    await sleep(ms);
  }

  if (state === "error") {
    throw new Error(
      "Mock data source failed. Use ?mock=success and clear any ?mock.<scope>=error override to recover.",
    );
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
