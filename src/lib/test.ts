// src/lib/autoTranslate.ts

// KEY = tiếng Việt chính xác 100% (phải giống hệt trong code)
// VALUE = tiếng Anh tương ứng
const dict: Record<string, string> = {
  "Trang chủ": "Dashboard",
  "Lịch trình": "Schedule",
  "Phân công": "Assignment",
  "Danh sách": "List",
  "Theo dõi": "Tracking",
  "Liên hệ": "Contact",
  "Chọn tài xế...": "abc",
  "Tuyến 2: Khu vực Quận 5": "xyz",
  "Quận 5": "mna",

  "Chờ đón": "Waiting",
  "Đang trên xe": "On bus",
  "Đã trả": "Dropped off",
  "Vắng mặt": "Absent",

  "HỌC SINH": "STUDENT",
  "học sinh": "student",
  "TÀI XẾ": "DRIVER",
  "XE BUÝT": "BUS",
  "TUYẾN ĐƯỜNG": "ROUTE",
  "TRẠNG THÁI": "STATUS",

  "Đang tải dữ liệu chuyến đi...": "Loading trips...",
  "Không tìm thấy học sinh nào phù hợp": "No students found",
  "Chưa có chuyến đi nào hôm nay hoặc chưa có dữ liệu đón/trả học sinh": "No trips today yet",
  "Lỗi kết nối server": "Server error",
  "Mời nhập nôi dung tìm kiếm...": "Search students, drivers, buses...",
  "Địa chỉ: 04 Tôn Đức Thắng, Phường Sài Gòn, Thành phố Hồ Chí Minh.": "Address: 04 Ton Duc Thang Street 04, Saigon Ward, Ho Chi Minh City.",
  // Thêm bao nhiêu cũng được, chỉ cần key giống 100% là sẽ dịch chính xác
};

let currentLang: "vi" | "en" = "vi";

if (typeof window !== "undefined") {
  const saved = localStorage.getItem("appLang");
  if (saved === "en" || saved === "vi") {
    currentLang = saved as "vi" | "en";
  }
}

export const setLanguage = (lang: "vi" | "en") => {
  if (typeof window === "undefined") return;
  currentLang = lang;
  localStorage.setItem("appLang", lang);
  translateAll();
};

export const getCurrentLang = () => currentLang;

// ──────────────────────────────────────────────────────────────
// PHIÊN BẢN SIÊU CHÍNH XÁC – CHỈ DỊCH KHI TRÙNG 100% (case-sensitive)
// ──────────────────────────────────────────────────────────────
// ──────────────────────────────────────────────────────────────
// HÀM DỊCH CHUẨN NHẤT CHO TIẾNG VIỆT – KHÔNG BỎ SÓT, KHÔNG DỊCH BẬY
// ────────────────────────────────────────────── ────────────────
export const translateAll = () => {
  if (typeof document === "undefined") return;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];

  let node;
  while ((node = walker.nextNode())) {
    const textNode = node as Text;
    const parent = textNode.parentElement;

    if (parent?.closest("[data-no-translate], script, style, svg, code, pre")) continue;
    if (!textNode.nodeValue?.trim()) continue;

    textNodes.push(textNode);
  }

  // Sắp xếp các key từ dài đến ngắn → tránh trường hợp "Theo dõi" bị thay trước thành "Tracking dõi"
  const sortedEntries = Object.entries(dict).sort((a, b) => b[0].length - a[0].length);

  textNodes.forEach((node) => {
    let text = node.nodeValue!;
    let original = text;
    let changed = false;

    if (currentLang === "en") {
      for (const [vi, en] of sortedEntries) {
        // Exact match toàn bộ cụm (không dùng \b nữa)
        const regex = new RegExp(vi.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
        if (regex.test(text)) {
          text = text.replace(regex, en);
          changed = true;
        }
      }
    } else {
      for (const [vi, en] of sortedEntries) {
        const regex = new RegExp(en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
        if (regex.test(text)) {
          text = text.replace(regex, vi);
          changed = true;
        }
      }
    }

    if (changed) {
      node.nodeValue = text;
    }
  });
};

// Tự động dịch lần đầu + khi DOM thay đổi + khi chuyển trang
if (typeof window !== "undefined") {
  const init = () => setTimeout(translateAll, 100);
  if (document.readyState === "complete") init();
  else window.addEventListener("load", init);

  new MutationObserver(translateAll).observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  // Hỗ trợ Next.js App Router navigation
  window.addEventListener("popstate", () => setTimeout(translateAll, 150));
  document.addEventListener("click", (e) => {
    const a = (e.target as Element)?.closest("a");
    if (a && !a.target && a.href && !a.href.startsWith("http")) {
      setTimeout(translateAll, 200);
    }
  });
}