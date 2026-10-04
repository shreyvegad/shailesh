import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Business } from "@/core/types";
export interface PdfLine {
  name: string;
  type: string;
  price: number;
  size: string;
  total: number;
}
export function generatePdf(
  customer: string,
  lines: PdfLine[],
  total: number,
  b: Business,
) {
  const doc = new jsPDF();
  const W = doc.internal.pageSize.getWidth();
  doc.setFillColor(110, 62, 28);
  doc.rect(0, 0, W, 32, "F");
  doc.setTextColor(255);
  doc.setFontSize(20);
  doc.text(b.name, 14, 15);
  doc.setFontSize(10);
  doc.text(`${b.phone}  |  ${b.address}`, 14, 24);
  doc.setFontSize(16);
  doc.text("", W - 14, 15, { align: "right" });
  doc.setFontSize(10);
  doc.text(new Date().toLocaleDateString("en-IN"), W - 14, 24, {
    align: "right",
  });
  doc.setTextColor(30);
  doc.setFontSize(12);
  doc.text(`Customer: ${customer || "-"}`, 14, 44);
  autoTable(doc, {
    startY: 50,
    theme: "striped",
    headStyles: { fillColor: [110, 62, 28] },
    head: [["Item", "Type", "Price", "Item or Size", "Total"]],
    body: lines.map((l) => [
      l.name,
      l.type,
      l.price.toFixed(2),
      l.size,
      l.total.toFixed(2),
    ]),
    foot: [
      ["Grand Total", "", "", "", `${b.currencySymbol} ${total.toFixed(2)}`],
    ],
    footStyles: { fillColor: [240, 236, 230], textColor: 30 },
    didParseCell: (data) => {
      if (data.column.index === 2 || data.column.index === 4) {
        data.cell.styles.halign = "center";
      }
    },
  });
  doc.save(`quotation-${(customer || "customer").replace(/\s+/g, "-")}.pdf`);
}
