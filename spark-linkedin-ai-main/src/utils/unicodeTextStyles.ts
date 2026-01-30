/**
 * Unicode text style transformations for LinkedIn-style formatting.
 * Uses Mathematical Alphanumeric Symbols and related Unicode blocks.
 * LinkedIn does not support native bold/italic; these symbols render as styled text.
 */

// Code point bases (decimal) for Mathematical Alphanumeric Symbols
const BOLD_A = 0x1d400;
const BOLD_a = 0x1d41a;
const BOLD_0 = 0x1d7ce;

const ITALIC_A = 0x1d434;
const ITALIC_a = 0x1d44e;
const ITALIC_0 = 0x1d7e2;

const BOLD_ITALIC_A = 0x1d468;
const BOLD_ITALIC_a = 0x1d482;

const SCRIPT_A = 0x1d49c;
const SCRIPT_a = 0x1d4b6;

const SANSSERIF_A = 0x1d5a0;
const SANSSERIF_a = 0x1d5ba;

const SANSSERIF_BOLD_A = 0x1d5d4;
const SANSSERIF_BOLD_a = 0x1d5ee;

const SANSSERIF_ITALIC_A = 0x1d608;
const SANSSERIF_ITALIC_a = 0x1d622;

const SANSSERIF_BOLD_ITALIC_A = 0x1d63c;
const SANSSERIF_BOLD_ITALIC_a = 0x1d656;

const DOUBLESTRUCK_A = 0x1d538;
const DOUBLESTRUCK_a = 0x1d552;

// Fullwidth (FF block)
const FULLWIDTH_A = 0xff21;
const FULLWIDTH_a = 0xff41;
const FULLWIDTH_0 = 0xff10;

// Combining characters
const COMBINING_UNDERLINE = "\u0332";
const COMBINING_STRIKETHROUGH = "\u0336";

function mapChar(
  c: string,
  baseUpper: number,
  baseLower: number,
  baseDigit: number | null
): string {
  const code = c.charCodeAt(0);
  if (code >= 65 && code <= 90)
    return String.fromCodePoint(baseUpper + (code - 65));
  if (code >= 97 && code <= 122)
    return String.fromCodePoint(baseLower + (code - 97));
  if (code >= 48 && code <= 57 && baseDigit != null)
    return String.fromCodePoint(baseDigit + (code - 48));
  return c;
}

function transform(
  text: string,
  baseUpper: number,
  baseLower: number,
  baseDigit: number | null
): string {
  return [...text].map((c) => mapChar(c, baseUpper, baseLower, baseDigit)).join("");
}

function withCombining(text: string, combining: string): string {
  return [...text].map((c) => c + combining).join("");
}

export function toBold(text: string): string {
  return transform(text, BOLD_A, BOLD_a, BOLD_0);
}

export function toItalic(text: string): string {
  return transform(text, ITALIC_A, ITALIC_a, ITALIC_0);
}

export function toBoldItalic(text: string): string {
  return transform(text, BOLD_ITALIC_A, BOLD_ITALIC_a, null);
}

export function toScript(text: string): string {
  return transform(text, SCRIPT_A, SCRIPT_a, null);
}

export function toSans(text: string): string {
  return transform(text, SANSSERIF_A, SANSSERIF_a, null);
}

export function toSansBold(text: string): string {
  return transform(text, SANSSERIF_BOLD_A, SANSSERIF_BOLD_a, null);
}

export function toSansItalic(text: string): string {
  return transform(text, SANSSERIF_ITALIC_A, SANSSERIF_ITALIC_a, null);
}

export function toSansBoldItalic(text: string): string {
  return transform(text, SANSSERIF_BOLD_ITALIC_A, SANSSERIF_BOLD_ITALIC_a, null);
}

export function toDoublestruck(text: string): string {
  return transform(text, DOUBLESTRUCK_A, DOUBLESTRUCK_a, null);
}

export function toFullwidth(text: string): string {
  return transform(text, FULLWIDTH_A, FULLWIDTH_a, FULLWIDTH_0);
}

export function toUnderline(text: string): string {
  return withCombining(text, COMBINING_UNDERLINE);
}

export function toStrikethrough(text: string): string {
  return withCombining(text, COMBINING_STRIKETHROUGH);
}

export function toBoldUnderline(text: string): string {
  return withCombining(toBold(text), COMBINING_UNDERLINE);
}

export function toBoldStrikethrough(text: string): string {
  return withCombining(toBold(text), COMBINING_STRIKETHROUGH);
}

// List styles: wrap each line with prefix
export function toNumberedList(text: string): string {
  const lines = text.split(/\n/).filter((l) => l.trim().length > 0);
  return lines.map((line, i) => `${i + 1}. ${line.trim()}`).join("\n");
}

export function toBulletPoints(text: string): string {
  const lines = text.split(/\n/).filter((l) => l.trim().length > 0);
  return lines.map((line) => `• ${line.trim()}`).join("\n");
}

export function toChecklist(text: string): string {
  const lines = text.split(/\n/).filter((l) => l.trim().length > 0);
  return lines.map((line) => `☑ ${line.trim()}`).join("\n");
}

export function toAscendingList(text: string): string {
  const lines = text.split(/\n/).filter((l) => l.trim().length > 0);
  const symbols = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"];
  return lines
    .map((line, i) => `${symbols[i] || `${i + 1}.`} ${line.trim()}`)
    .join("\n");
}

export function toDescendingList(text: string): string {
  const lines = text.split(/\n/).filter((l) => l.trim().length > 0);
  const symbols = ["❶", "❷", "❸", "❹", "❺", "❻", "❼", "❽", "❾", "❿"];
  return lines
    .map((line, i) => `${symbols[i] || `${i + 1}.`} ${line.trim()}`)
    .join("\n");
}

export function toUppercase(text: string): string {
  return text.toUpperCase();
}

export function toLowercase(text: string): string {
  return text.toLowerCase();
}

export type StyleId =
  | "normal"
  | "bold"
  | "boldSans"
  | "italic"
  | "italicSans"
  | "boldItalic"
  | "boldItalicSans"
  | "sans"
  | "underline"
  | "strikethrough"
  | "boldUnderline"
  | "boldStrikethrough"
  | "script"
  | "doublestruck"
  | "fullwidth"
  | "uppercase"
  | "lowercase"
  | "numberedList"
  | "bulletPoints"
  | "checklist"
  | "ascendingList"
  | "descendingList";

export function applyStyle(text: string, styleId: StyleId): string {
  if (!text.trim()) return text;
  switch (styleId) {
    case "normal":
      return text;
    case "bold":
      return toBold(text);
    case "boldSans":
      return toSansBold(text);
    case "italic":
      return toItalic(text);
    case "italicSans":
      return toSansItalic(text);
    case "boldItalic":
      return toBoldItalic(text);
    case "boldItalicSans":
      return toSansBoldItalic(text);
    case "sans":
      return toSans(text);
    case "underline":
      return toUnderline(text);
    case "strikethrough":
      return toStrikethrough(text);
    case "boldUnderline":
      return toBoldUnderline(text);
    case "boldStrikethrough":
      return toBoldStrikethrough(text);
    case "script":
      return toScript(text);
    case "doublestruck":
      return toDoublestruck(text);
    case "fullwidth":
      return toFullwidth(text);
    case "uppercase":
      return toUppercase(text);
    case "lowercase":
      return toLowercase(text);
    case "numberedList":
      return toNumberedList(text);
    case "bulletPoints":
      return toBulletPoints(text);
    case "checklist":
      return toChecklist(text);
    case "ascendingList":
      return toAscendingList(text);
    case "descendingList":
      return toDescendingList(text);
    default:
      return text;
  }
}
