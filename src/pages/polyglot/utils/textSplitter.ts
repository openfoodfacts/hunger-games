// Helper to detect if a string contains Arabic characters
export function hasArabicScript(str?: string): boolean {
  if (!str) return false;
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(str);
}

// Helper to detect if a string contains Latin characters
export function hasLatinScript(str?: string): boolean {
  if (!str) return false;
  return /[a-zA-ZÀ-ÿ]/.test(str);
}

// Intelligent splitter: splits mixed Arabic / Latin text into two streams
export function splitMixedArabicLatin(text: string): {
  arabicText: string;
  latinText: string;
} {
  const lines = text.split(/\n+/);
  const arabicParts: string[] = [];
  const latinParts: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const arabicMatch = hasArabicScript(trimmed);
    const latinMatch = hasLatinScript(trimmed);

    if (arabicMatch && !latinMatch) {
      arabicParts.push(trimmed);
    } else if (latinMatch && !arabicMatch) {
      latinParts.push(trimmed);
    } else {
      // Line is mixed: split by sentences or punctuation
      const segments = trimmed.split(/([.:;،!?]+)/);
      for (const segment of segments) {
        const segTrim = segment.trim();
        if (!segTrim) continue;
        if (hasArabicScript(segTrim)) {
          arabicParts.push(segTrim);
        } else if (hasLatinScript(segTrim)) {
          latinParts.push(segTrim);
        }
      }
    }
  }

  return {
    arabicText: arabicParts.join("\n"),
    latinText: latinParts.join("\n"),
  };
}
