const PdfPrinter = require('pdfmake');
const fs = require('fs');
const fonts = { Helvetica: { normal: 'Helvetica', bold: 'Helvetica-Bold' } };
const printer = new PdfPrinter(fonts);
const doc = printer.createPdfKitDocument({ content: 'test', defaultStyle: { font: 'Helvetica' } });
doc.pipe(fs.createWriteStream('test.pdf'));
doc.end();
