const fs = require('fs');

const files = [
  'src/App.tsx',
  'src/components/DashboardView.tsx',
  'src/components/ChildOnboardingView.tsx',
  'src/components/AuthView.tsx'
];

const replacements = [
  { regex: /\bbg-slate-100\b(?! dark)/g, replacement: "bg-slate-100 dark:bg-slate-800" },
  { regex: /\bhover:bg-slate-100\b(?! dark)/g, replacement: "hover:bg-slate-100 dark:hover:bg-slate-700" },
  { regex: /\bhover:bg-slate-50\b(?! dark)/g, replacement: "hover:bg-slate-50 dark:hover:bg-slate-800" },
  { regex: /\bgrizzly\b(?! dark)/g, replacement: "bg-slate-100 dark:bg-slate-800" }
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  replacements.forEach(({ regex, replacement }) => {
    newContent = newContent.replace(regex, replacement);
  });
  
  fs.writeFileSync(file, newContent);
});

console.log("Tertiary fix applied!");
