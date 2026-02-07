function sanitizeControlCharsInStrings(str: string): string {
  let result = "";
  let inString = false;
  let escapeNext = false;

  for (let i = 0; i < str.length; i++) {
    const c = str[i];

    if (escapeNext) {
      result += c;
      escapeNext = false;
      continue;
    }

    if (c === "\\" && inString) {
      result += c;
      escapeNext = true;
      continue;
    }

    if (c === '"') {
      inString = !inString;
      result += c;
      continue;
    }

    if (inString && /[\x00-\x1F\x7F]/.test(c)) {
      if (c === "\n") result += "\\n";
      else if (c === "\r") result += "\\r";
      else if (c === "\t") result += "\\t";
      else result += `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`;
      continue;
    }

    result += c;
  }

  return result;
}

export function safeParseJson<T = unknown>(text: string): T {
  const jsonText = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  try {
    return JSON.parse(jsonText) as T;
  } catch (firstError) {
    try {
      const sanitized = sanitizeControlCharsInStrings(jsonText);
      return JSON.parse(sanitized) as T;
    } catch {
      throw new Error(
        `Invalid JSON response from AI${firstError instanceof Error ? `: ${firstError.message}` : ""}`
      );
    }
  }
}
