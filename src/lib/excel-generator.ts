import type { UserStats, RecipeStats, AllergyStats, AdminProfile } from "@/models/admin-service";
import { CREDITS } from "@/lib/credit-config";

interface ExcelData {
  userStats: UserStats;
  recipeStats: RecipeStats;
  allergyStats: AllergyStats[];
  creditStats: { totalConsumed: number };
  profiles: AdminProfile[];
  recipeCountPerUser: Record<string, number>;
}

const C = {
  orange:      "EA580C",
  dark:        "1E1B18",
  white:       "FFFFFF",
  lightOrange: "FEF3EC",
  gray:        "F5F5F4",
  muted:       "78716C",
  border:      "D1D5DB",
} as const;

const BORDER = {
  top:    { style: "thin", color: { rgb: C.border } },
  bottom: { style: "thin", color: { rgb: C.border } },
  left:   { style: "thin", color: { rgb: C.border } },
  right:  { style: "thin", color: { rgb: C.border } },
};

function mkCell(v: string | number, bg: string, color: string, bold = false, sz = 10): any {
  return {
    v,
    t: typeof v === "number" ? "n" : "s",
    s: {
      fill: { patternType: "solid", fgColor: { rgb: bg } },
      font: { bold, color: { rgb: color }, sz, name: "Calibri" },
      border: BORDER,
      alignment: { horizontal: typeof v === "number" ? "right" : "left", vertical: "center" },
    },
  };
}

const hdr      = (v: string)                         => mkCell(v, C.orange,      C.white,  true,  10);
const dat      = (v: string | number, alt: boolean)  => mkCell(v, alt ? C.lightOrange : C.white, C.dark,   false, 10);
const kpiLabel = (v: string,          alt: boolean)  => mkCell(v, alt ? C.lightOrange : C.white, C.dark,   true,  10);
const kpiValue = (v: number,          alt: boolean)  => mkCell(v, alt ? C.lightOrange : C.white, C.orange, true,  12);

function setCell(XLSX: any, ws: any, r: number, c: number, cell: any): void {
  ws[XLSX.utils.encode_cell({ r, c })] = cell;
}

function buildStdSheet(XLSX: any, headers: string[], rows: (string | number)[][], colWidths: number[]): any {
  const ws: any = {};
  headers.forEach((h, c) => setCell(XLSX, ws, 0, c, hdr(h)));
  rows.forEach((row, r) => row.forEach((v, c) => setCell(XLSX, ws, r + 1, c, dat(v, r % 2 === 1))));
  ws["!ref"]  = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rows.length, c: headers.length - 1 } });
  ws["!cols"] = colWidths.map((w: number) => ({ wch: w }));
  ws["!rows"] = [{ hpt: 22 }, ...rows.map(() => ({ hpt: 18 }))];
  return ws;
}

function buildResumenSheet(
  XLSX: any,
  userStats: UserStats,
  recipeStats: RecipeStats,
  creditStats: { totalConsumed: number },
  today: string
): any {
  const ws: any = {};
  const sc = (r: number, c: number, cell: any) => setCell(XLSX, ws, r, c, cell);

  sc(0, 0, {
    v: "ELYSCHEF — INFORME DE ADMINISTRACIÓN", t: "s",
    s: { fill: { patternType: "solid", fgColor: { rgb: C.orange } }, font: { bold: true, color: { rgb: C.white }, sz: 14, name: "Calibri" }, alignment: { horizontal: "center", vertical: "center" } },
  });
  sc(0, 1, { v: "", t: "s", s: { fill: { patternType: "solid", fgColor: { rgb: C.orange } } } });

  sc(1, 0, {
    v: `Generado el: ${today}`, t: "s",
    s: { fill: { patternType: "solid", fgColor: { rgb: C.gray } }, font: { italic: true, color: { rgb: C.muted }, sz: 9, name: "Calibri" }, alignment: { horizontal: "left", vertical: "center" } },
  });
  sc(1, 1, { v: "", t: "s", s: { fill: { patternType: "solid", fgColor: { rgb: C.gray } } } });

  sc(2, 0, { v: "", t: "s" });
  sc(2, 1, { v: "", t: "s" });

  sc(3, 0, hdr("Indicador"));
  sc(3, 1, hdr("Valor"));

  const kpis: [string, number][] = [
    ["Total usuarios",                   userStats.total],
    ["Usuarios VIP",                     userStats.vip],
    ["Usuarios gratuitos",               userStats.free],
    ["Nuevos esta semana",               userStats.newThisWeek],
    ["Total recetas generadas",          recipeStats.total],
    ["Créditos consumidos (estimación)", creditStats.totalConsumed],
  ];
  kpis.forEach(([label, value], i) => {
    const alt = i % 2 === 1;
    sc(4 + i, 0, kpiLabel(label, alt));
    sc(4 + i, 1, kpiValue(value, alt));
  });

  ws["!ref"]    = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: 9, c: 1 } });
  ws["!cols"]   = [{ wch: 36 }, { wch: 14 }];
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } },
  ];
  ws["!rows"] = [{ hpt: 30 }, { hpt: 16 }, { hpt: 8 }, { hpt: 22 }, ...kpis.map(() => ({ hpt: 20 }))];

  return ws;
}

export async function downloadAdminExcel(data: ExcelData): Promise<void> {
  const xlsxMod = await import("xlsx-js-style");
  const XLSX = xlsxMod.default ?? xlsxMod;
  const { userStats, recipeStats, allergyStats, creditStats, profiles, recipeCountPerUser } = data;
  const wb    = XLSX.utils.book_new();
  const today = new Date().toISOString().slice(0, 10);
  const totalR = recipeStats.total || 1;
  const totalU = userStats.total || 1;

  XLSX.utils.book_append_sheet(wb, buildResumenSheet(XLSX, userStats, recipeStats, creditStats, today), "Resumen");

  XLSX.utils.book_append_sheet(
    wb,
    buildStdSheet(
      XLSX,
      ["Nombre", "Apellidos", "Email", "Plan", "Créditos restantes", "Créditos consumidos", "Recetas generadas", "Fecha de registro"],
      profiles.map((p) => {
        const initial = p.plan === "vip" ? CREDITS.INITIAL_VIP : CREDITS.INITIAL_FREE;
        return [p.nombre, p.apellidos, p.email, p.plan, p.credits, Math.max(0, initial - p.credits), recipeCountPerUser[p.id] || 0, p.created_at ? p.created_at.slice(0, 10) : ""];
      }),
      [15, 15, 28, 8, 16, 18, 16, 16]
    ),
    "Usuarios"
  );

  XLSX.utils.book_append_sheet(
    wb,
    buildStdSheet(
      XLSX,
      ["País", "Nº recetas", "% del total"],
      [...recipeStats.byCountry].sort((a, b) => b.count - a.count).map((r) => [r.country, r.count, ((r.count / totalR) * 100).toFixed(1) + "%"]),
      [24, 12, 12]
    ),
    "Países"
  );

  XLSX.utils.book_append_sheet(
    wb,
    buildStdSheet(
      XLSX,
      ["Categoría", "Nº recetas", "% del total"],
      [...recipeStats.byCategory].sort((a, b) => b.count - a.count).map((r) => [r.category, r.count, ((r.count / totalR) * 100).toFixed(1) + "%"]),
      [24, 12, 12]
    ),
    "Categorías"
  );

  XLSX.utils.book_append_sheet(
    wb,
    buildStdSheet(
      XLSX,
      ["Dieta", "Nº recetas", "% del total"],
      recipeStats.byDiet.map((r) => [r.diet, r.count, ((r.count / totalR) * 100).toFixed(1) + "%"]),
      [24, 12, 12]
    ),
    "Dietas"
  );

  XLSX.utils.book_append_sheet(
    wb,
    buildStdSheet(
      XLSX,
      ["Alergia", "Nº usuarios", "% sobre total usuarios"],
      [...allergyStats].sort((a, b) => b.count - a.count).map((a) => [a.name, a.count, ((a.count / totalU) * 100).toFixed(1) + "%"]),
      [24, 12, 20]
    ),
    "Alergias"
  );

  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `elyschef_informe_${today}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
