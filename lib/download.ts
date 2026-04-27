import type { Subject, Question } from './types';

interface ModuleGroup {
  name: string;
  questions: Question[];
}

function buildGroups(subject: Subject): ModuleGroup[] {
  const groups: ModuleGroup[] = subject.modules.map(m => ({
    name: m.name,
    questions: subject.questions.filter(q => q.module === m.id),
  }));
  const unknown = subject.questions.filter(q => !q.module || !subject.modules.find(m => m.id === q.module));
  if (unknown.length) groups.push({ name: 'Unclassified', questions: unknown });
  return groups.filter(g => g.questions.length > 0);
}

export async function downloadPDF(subject: Subject) {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const groups = buildGroups(subject);
  const title = subject.code ? `${subject.name} (${subject.code})` : subject.name;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Question Bank  ·  ${subject.questions.length} questions  ·  ${subject.modules.length} modules`, 14, 25);
  doc.setTextColor(0);

  let y = 30;

  for (const group of groups) {
    autoTable(doc, {
      startY: y,
      head: [[{ content: group.name, colSpan: 3, styles: { fillColor: [30, 30, 30], textColor: 255, fontStyle: 'bold', fontSize: 10 } }],
             ['Sr', 'Question', 'Marks']],
      body: group.questions.map((q, i) => [
        String(q.sr ?? i + 1),
        q.question,
        q.marks ? String(q.marks) : '—',
      ]),
      columnStyles: {
        0: { cellWidth: 10, halign: 'center', fontSize: 8 },
        1: { cellWidth: 'auto', fontSize: 8 },
        2: { cellWidth: 14, halign: 'center', fontSize: 8 },
      },
      headStyles: { fontSize: 8, fillColor: [80, 80, 80] },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      margin: { left: 14, right: 14 },
      styles: { overflow: 'linebreak', cellPadding: 3 },
      didDrawPage: () => { y = 20; },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  doc.save(`${subject.name.replace(/[^a-z0-9]/gi, '_')}_questions.pdf`);
}

export async function downloadDocx(subject: Subject) {
  const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, BorderStyle, WidthType, AlignmentType } = await import('docx');

  const groups = buildGroups(subject);
  const title = subject.code ? `${subject.name} (${subject.code})` : subject.name;

  const noBorder = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
  const cellBorder = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

  const children: any[] = [
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({ text: `Question Bank · ${subject.questions.length} questions · ${subject.modules.length} modules`, color: '888888', size: 18 })],
      spacing: { after: 240 },
    }),
  ];

  for (const group of groups) {
    children.push(
      new Paragraph({
        text: group.name,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
      })
    );

    const headerRow = new TableRow({
      tableHeader: true,
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Sr', bold: true, size: 18 })] })], width: { size: 8, type: WidthType.PERCENTAGE }, borders: cellBorder }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Question', bold: true, size: 18 })] })], width: { size: 82, type: WidthType.PERCENTAGE }, borders: cellBorder }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Marks', bold: true, size: 18 })] }), ], width: { size: 10, type: WidthType.PERCENTAGE }, borders: cellBorder }),
      ],
    });

    const dataRows = group.questions.map((q, i) =>
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: String(q.sr ?? i + 1), alignment: AlignmentType.CENTER })], width: { size: 8, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph({ text: q.question })], width: { size: 82, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph({ text: q.marks ? String(q.marks) : '—', alignment: AlignmentType.CENTER })], width: { size: 10, type: WidthType.PERCENTAGE } }),
        ],
      })
    );

    children.push(new Table({ rows: [headerRow, ...dataRows], width: { size: 100, type: WidthType.PERCENTAGE } }));
    children.push(new Paragraph({ text: '' }));
  }

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${subject.name.replace(/[^a-z0-9]/gi, '_')}_questions.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
