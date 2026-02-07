const LYZR_BASE_URL = "https://agent-prod.studio.lyzr.ai/v3";

export interface LyzrChatResponse {
  response: string;
}

export async function lyzrChat(
  agentId: string,
  message: string,
  userId: string
): Promise<string> {
  const apiKey = process.env.LYZR_API_KEY;
  if (!apiKey) {
    throw new Error("LYZR_API_KEY is not configured. Add it to .env for Agent Mode.");
  }

  const sessionId = `${agentId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const response = await fetch(`${LYZR_BASE_URL}/inference/chat/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      user_id: userId,
      agent_id: agentId,
      session_id: sessionId,
      message,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    let errMessage = `Lyzr API error (${response.status})`;
    try {
      const errJson = JSON.parse(errText);
      errMessage = errJson.message || errJson.error || errMessage;
    } catch {
      if (errText) errMessage = errText.slice(0, 200);
    }
    throw new Error(errMessage);
  }

  const data = (await response.json()) as LyzrChatResponse;
  return data.response ?? "";
}
