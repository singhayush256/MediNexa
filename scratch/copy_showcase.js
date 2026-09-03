const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\Tushar\\.gemini\\antigravity\\brain\\a1ba3dda-f0ae-4752-9524-1764a946c7e5';
const webPublicShowcase = path.join(__dirname, '..', 'apps', 'web', 'public', 'showcase');
const rootPublicShowcase = path.join(__dirname, '..', 'public', 'showcase');

fs.mkdirSync(webPublicShowcase, { recursive: true });
fs.mkdirSync(rootPublicShowcase, { recursive: true });

const images = [
  { src: 'homepage_showcase_1788465193576.jpg', dest: '01-homepage.jpg' },
  { src: 'dashboard_showcase_1788465209557.jpg', dest: '02-dashboard-command-center.jpg' },
  { src: 'patient_workflow_showcase_1788465224516.jpg', dest: '03-patient-portal-workflow.jpg' },
  { src: 'doctor_workflow_showcase_1788465250943.jpg', dest: '04-doctor-clinical-workstation.jpg' },
  { src: 'billing_showcase_1788465265832.jpg', dest: '05-billing-gst-invoice.jpg' },
  { src: 'insurance_showcase_1788465281899.jpg', dest: '06-tpa-insurance-claims.jpg' },
  { src: 'ai_assistant_showcase_1788465298249.jpg', dest: '07-ai-clinical-assistant.jpg' },
];

for (const img of images) {
  const sourcePath = path.join(brainDir, img.src);
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, path.join(webPublicShowcase, img.dest));
    fs.copyFileSync(sourcePath, path.join(rootPublicShowcase, img.dest));
    console.log(`[COPIED] ${img.dest} (${fs.statSync(sourcePath).size} bytes)`);
  } else {
    console.error(`[NOT FOUND] ${sourcePath}`);
  }
}

console.log('\nAll showcase screenshots successfully copied!');
