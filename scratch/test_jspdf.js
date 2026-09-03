const { jsPDF } = require('jspdf');

const doc = new jsPDF();
doc.text('MediNexa Diagnostic Lab Report', 10, 10);
const output = doc.output('datauristring');
console.log('jsPDF successfully instantiated. Output length:', output.length);
