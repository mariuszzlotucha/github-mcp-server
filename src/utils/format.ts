export function stripHtmlComments(text: string): string {
    return text.replace(/<!--[\s\S]*?-->/g, '');
}

export function collapseWhitespace(text: string): string {
    return text
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map((line) => line.trimEnd())
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

export function truncate(
    text: string,
    maxChars = 4000
): { text: string; truncated: boolean; originalLength: number } {
    const originalLength = text.length;
    if (originalLength <= maxChars) {
        return { text, truncated: false, originalLength };
    }
    return {
        text: `${text.slice(0, maxChars)}\n\n[...obcięto, oryginał ma ${originalLength} znaków...]`,
        truncated: true,
        originalLength
    };
}

export function cleanBody(
    raw: string | null | undefined,
    maxChars = 4000
): { text: string; truncated: boolean; originalLength: number } {
    const cleaned = collapseWhitespace(stripHtmlComments(raw ?? ''));
    return truncate(cleaned, maxChars);
}