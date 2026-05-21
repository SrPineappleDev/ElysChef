// Generador de PDF para recetas.
// Construye documentos A4 con diseño de marca ElysChef usando jsPDF.
// Soporta exportar una receta individual o todas las recetas favoritas en un solo PDF.

import { jsPDF } from "jspdf";
import type { Recipe } from "@/lib/types";

const BRAND = "ElysChef";
const PRIMARY = [234, 88, 12] as const;   // naranja principal (#ea580c)
const DARK    = [30, 27, 24] as const;    // texto oscuro
const MUTED   = [120, 113, 108] as const; // texto secundario
const LIGHT   = [245, 245, 244] as const; // fondo suave

// Capitaliza la primera letra alfabética, aunque el string empiece por número o símbolo
const capitalize = (s: string) =>
  s.replace(/^([^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]*)([a-zA-ZáéíóúüñÁÉÍÓÚÜÑ])/, (_, pre, letter) => pre + letter.toUpperCase());

function formatDate(): string {
  return new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
}

function drawHeader(doc: jsPDF, pageWidth: number): number {
  // Franja de cabecera
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, pageWidth, 22, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(BRAND, 14, 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(255, 220, 190);
  doc.text(formatDate(), pageWidth - 14, 14, { align: "right" });

  return 30; // posición y inicial del área de contenido
}

function drawFooter(doc: jsPDF, pageWidth: number, pageHeight: number) {
  doc.setFillColor(...LIGHT);
  doc.rect(0, pageHeight - 14, pageWidth, 14, "F");
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(`Generado por ${BRAND}`, pageWidth / 2, pageHeight - 5, { align: "center" });
}

function drawSectionTitle(doc: jsPDF, text: string, x: number, y: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...PRIMARY);
  doc.text(text.toUpperCase(), x, y);

  doc.setDrawColor(...PRIMARY);
  doc.setLineWidth(0.4);
  doc.line(x, y + 2, x + 60, y + 2);

  return y + 8;
}

function buildRecipePage(doc: jsPDF, recipe: Recipe, startY: number): void {
  const pageWidth  = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentW = pageWidth - margin * 2;
  let y = startY;

  const checkPageBreak = (needed: number) => {
    if (y + needed > pageHeight - 20) {
      doc.addPage();
      drawFooter(doc, pageWidth, pageHeight);
      y = drawHeader(doc, pageWidth);
    }
  };

  // Título
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...DARK);
  const titleLines = doc.splitTextToSize(recipe.title, contentW) as string[];
  doc.text(titleLines, margin, y);
  y += titleLines.length * 7 + 3;

  // Descripción (si existe)
  if (recipe.description) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    const descLines = doc.splitTextToSize(recipe.description, contentW) as string[];
    doc.text(descLines, margin, y);
    y += descLines.length * 5 + 4;
  }

  // Etiquetas: categoría, país, dieta
  const badges = [recipe.category, recipe.country, recipe.diet].filter(Boolean).map(capitalize) as string[];
  if (badges.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(badges.join("  •  "), margin, y);
    y += 6;
  }

  // Separador
  doc.setDrawColor(...LIGHT);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Datos rápidos: calorías, tiempo, porciones
  const infoItems = [
    { label: "Calorías", value: `${recipe.calories} kcal` },
    { label: "Tiempo",   value: recipe.time },
    { label: "Porciones", value: `${recipe.servings}` },
  ];
  const colW = contentW / infoItems.length;
  infoItems.forEach((item, i) => {
    const cx = margin + i * colW + colW / 2;
    doc.setFillColor(...LIGHT);
    doc.roundedRect(margin + i * colW + 1, y - 4, colW - 2, 16, 2, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...DARK);
    doc.text(item.value, cx, y + 4, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text(item.label, cx, y + 9, { align: "center" });
  });
  y += 22;

  // Nutrición
  checkPageBreak(30);
  y = drawSectionTitle(doc, "Nutrición", margin, y);

  const nutrients = [
    { label: "Proteínas",      value: recipe.protein },
    { label: "Carbohidratos",  value: recipe.carbs },
    { label: "Grasas",         value: recipe.fat },
  ];
  const nColW = contentW / nutrients.length;
  nutrients.forEach((n, i) => {
    const cx = margin + i * nColW + nColW / 2;
    doc.setFillColor(250, 245, 240);
    doc.roundedRect(margin + i * nColW + 1, y - 4, nColW - 2, 16, 2, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...PRIMARY);
    doc.text(n.value, cx, y + 4, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.text(n.label, cx, y + 9, { align: "center" });
  });
  y += 22;

  // Ingredientes
  checkPageBreak(20);
  y = drawSectionTitle(doc, "Ingredientes", margin, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...DARK);

  const halfW = contentW / 2 - 4;
  recipe.ingredients.forEach((ing, i) => {
    checkPageBreak(8);
    const col = i % 2;
    const row = Math.floor(i / 2);
    const ix = margin + col * (halfW + 8);
    const iy = y + row * 7;

    doc.setFillColor(...PRIMARY);
    doc.circle(ix + 2, iy - 1.5, 1, "F");
    doc.text(doc.splitTextToSize(capitalize(ing), halfW - 6)[0], ix + 6, iy);
  });
  y += Math.ceil(recipe.ingredients.length / 2) * 7 + 6;

  // Calorías por ingrediente (si existen)
  if (recipe.calories_per_ingredient && Object.keys(recipe.calories_per_ingredient).length > 0) {
    checkPageBreak(20);
    y = drawSectionTitle(doc, "Calorías por ingrediente", margin, y);

    const entries = Object.entries(recipe.calories_per_ingredient);
    entries.forEach(([name, cal], i) => {
      checkPageBreak(7);
      const col = i % 2;
      const row = Math.floor(i / 2);
      const ix = margin + col * (halfW + 8);
      const iy = y + row * 7;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...DARK);
      doc.text(doc.splitTextToSize(capitalize(name), halfW - 30)[0], ix, iy);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...PRIMARY);
      doc.text(`${cal} kcal`, ix + halfW, iy, { align: "right" });
    });
    y += Math.ceil(entries.length / 2) * 7 + 6;
  }

  // Preparación
  checkPageBreak(20);
  y = drawSectionTitle(doc, "Preparación", margin, y);

  recipe.steps.forEach((step, i) => {
    checkPageBreak(14);

    // Número del paso
    doc.setFillColor(...PRIMARY);
    doc.circle(margin + 4, y - 1, 4, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(`${i + 1}`, margin + 4, y + 1, { align: "center" });

    // Texto del paso
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    const lines = doc.splitTextToSize(step, contentW - 14) as string[];
    doc.text(lines, margin + 12, y);
    y += lines.length * 5 + 5;
  });
}

export function downloadRecipePdf(recipe: Recipe): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth  = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const startY = drawHeader(doc, pageWidth);
  drawFooter(doc, pageWidth, pageHeight);
  buildRecipePage(doc, recipe, startY);

  const fileName = recipe.title.toLowerCase().replace(/\s+/g, "_").replace(/[^\w_]/g, "");
  doc.save(`${fileName}.pdf`);
}

export function downloadAllFavoritesPdf(recipes: Recipe[]): void {
  if (recipes.length === 0) return;

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth  = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  recipes.forEach((recipe, index) => {
    if (index > 0) doc.addPage();
    const startY = drawHeader(doc, pageWidth);
    drawFooter(doc, pageWidth, pageHeight);
    buildRecipePage(doc, recipe, startY);
  });

  doc.save("mis_favoritos_elyschef.pdf");
}
