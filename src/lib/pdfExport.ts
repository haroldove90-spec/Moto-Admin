import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const exportToPDF = (title: string, columns: string[], data: any[][], fileName: string) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text("MOTO-TECH PRO", 14, 20);
  
  doc.setFontSize(14);
  doc.setTextColor(100);
  doc.text(title, 14, 30);
  
  doc.setFontSize(10);
  doc.text(`Fecha de exportación: ${new Date().toLocaleDateString()}`, 14, 37);

  // Table
  autoTable(doc, {
    startY: 45,
    head: [columns],
    body: data,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59] }, // slate-800
    alternateRowStyles: { fillColor: [248, 250, 252] }, // slate-50
  });

  doc.save(`${fileName}_${new Date().getTime()}.pdf`);
};
