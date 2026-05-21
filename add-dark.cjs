const fs = require('fs');

const files = [
  'src/App.tsx',
  'src/components/DashboardView.tsx',
  'src/components/ChildOnboardingView.tsx',
  'src/components/AuthView.tsx'
];

const replacements = [
  { regex: /\bbg-white\b/g, replacement: "bg-white dark:bg-slate-900" },
  { regex: /\bbg-slate-50\b(?!\/)/g, replacement: "bg-slate-50 dark:bg-slate-800" },
  { regex: /\bbg-\[\#F4F5F7\]\b/g, replacement: "bg-[#F4F5F7] dark:bg-slate-950" },
  { regex: /\bbg-\[\#FCFCFD\]\b/g, replacement: "bg-[#FCFCFD] dark:bg-slate-950" },
  { regex: /\bborder-slate-200\b/g, replacement: "border-slate-200 dark:border-slate-700" },
  { regex: /\bborder-slate-100\b/g, replacement: "border-slate-100 dark:border-slate-800" },
  { regex: /\btext-slate-900\b/g, replacement: "text-slate-900 dark:text-slate-50" },
  { regex: /\btext-slate-800\b/g, replacement: "text-slate-800 dark:text-slate-200" },
  { regex: /\btext-slate-700\b/g, replacement: "text-slate-700 dark:text-slate-300" },
  { regex: /\btext-slate-600\b/g, replacement: "text-slate-600 dark:text-slate-400" },
  { regex: /\btext-slate-500\b/g, replacement: "text-slate-500 dark:text-slate-400" }
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  replacements.forEach(({ regex, replacement }) => {
    newContent = newContent.replace(regex, replacement);
  });
  
  fs.writeFileSync(file, newContent);
});

console.log("Dark mode classes added using JS!");
