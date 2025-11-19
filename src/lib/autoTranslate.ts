// src/lib/autoTranslate.ts
import translations from "./translations.json";
const dict: Record<string, string> = translations;

let currentLang: "vi" | "en" = "vi";

// Khôi phục ngôn ngữ
if (typeof window !== "undefined") {
  const saved = localStorage.getItem("appLang");
  if (saved === "en" || saved === "vi") currentLang = saved as any;
}

export const setLanguage = (lang: "vi" | "en") => {
  if (typeof window === "undefined") return;
  currentLang = lang;
  localStorage.setItem("appLang", lang);
  translateAll();
};

export const getCurrentLang = () => currentLang;

// ──────────────────────────────────────────────────────────────
// PHIÊN BẢN TỐI ƯU NHẤT 2025 – KHÔNG LAG, MƯỢT NHƯ BƠ
// ──────────────────────────────────────────────────────────────
let scheduled = false;
const scheduleTranslate = () => {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    performTranslate();
  });
};

const performTranslate = () => {
  if (typeof document === "undefined") return;

  const sortedEntries = Object.entries(dict).sort((a, b) => b[0].length - a[0].length);

  const translateString = (str: string): string => {
    let result = str;
    const entries = currentLang === "en" ? sortedEntries : sortedEntries.map(([vi, en]) => [en, vi] as [string, string]);
    for (const [from, to] of entries) {
      const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      result = result.replace(new RegExp(escaped, "g"), to);
    }
    return result;
  };

  // 1. TEXT NODES – chỉ duyệt visible + nhanh gấp 5 lần
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        const p = (node as Text).parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        if (p.closest("[data-no-translate], script, style, svg, code, pre")) return NodeFilter.FILTER_REJECT;
        if (p.tagName === "TD" && p.querySelector("a")) return NodeFilter.FILTER_REJECT;
        if (!node.nodeValue?.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  let node;
  while ((node = walker.nextNode())) {
    const textNode = node as Text;
    const newText = translateString(textNode.nodeValue!);
    if (textNode.nodeValue !== newText) {
      textNode.nodeValue = newText;
    }
  }

  // 2. PLACEHOLDER – cực nhẹ, chỉ 1-2 phần tử
  document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(el => {
    const old = el.getAttribute("placeholder")!;
    const newer = translateString(old);
    if (old !== newer) {
      el.setAttribute("placeholder", newer);
      if ("placeholder" in el) (el as any).placeholder = newer;
    }
  });
};

// Public function – gọi khi đổi ngôn ngữ
export const translateAll = scheduleTranslate;

// Auto run lần đầu + khi DOM thay đổi (NHƯNG CHỈ SCHEDULE, KHÔNG GỌI NGAY → KHÔNG LAG)
if (typeof window !== "undefined") {
  // Lần đầu
  const init = () => setTimeout(scheduleTranslate, 150);
  if (document.readyState === "complete") init();
  else window.addEventListener("load", init);

  // MutationObserver siêu nhẹ: chỉ schedule, không gọi ngay
  new MutationObserver(scheduleTranslate).observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["placeholder"] // thêm để bắt thay đổi placeholder động
  });

  // Next.js navigation – debounce tự nhiên
  window.addEventListener("popstate", () => setTimeout(scheduleTranslate, 100));
  let clickTimeout: any;
  document.addEventListener("click", (e) => {
    const a = (e.target as Element)?.closest("a");
    if (a && !a.target && a.href && !a.href.startsWith("http")) {
      clearTimeout(clickTimeout);
      clickTimeout = setTimeout(scheduleTranslate, 150);
    }
  });
}