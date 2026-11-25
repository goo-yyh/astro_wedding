import type { Level, RuleId, Rating } from "./calendar";
export type Proposal = {
  type: RuleId | "schedule" | "question";
  name: string;
  level: Level;
  weekdays: number[];
  dates: string;
  include: boolean;
  small: boolean;
};
export type Fact = {
  id: string;
  label: string;
  level: string;
  a: string;
  b: string;
};
export type Comparison = {
  dates: Rating[];
  facts: Fact[];
};
export async function askAnalysis<T>(payload: object): Promise<T> {
  try {
    const res = await fetch("/api/analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(40000),
    });
    const body = await res.json().catch(() => null);
    if (body?.version !== 1 || !res.ok || !body.ok || !body.data)
      throw Error(
        body?.error?.message || "暂时无法生成解读，可重试或手动设置条件。",
      );
    return body.data as T;
  } catch (error) {
    if (error instanceof TypeError || error instanceof DOMException)
      throw Error("网络或服务响应超时，可重试或手动设置条件。");
    throw error;
  }
}
