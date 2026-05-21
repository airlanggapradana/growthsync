const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(/hover:bg-white dark:bg-slate-900\/10/g, 'hover:bg-white/10 dark:hover:bg-white/10');
content = content.replace(/bg-white dark:bg-slate-900\/10/g, 'bg-white/10 dark:bg-white/10');
fs.writeFileSync('src/App.tsx', content);

let content2 = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');
content2 = content2.replace(/bg-white dark:bg-slate-900\/10/g, 'bg-white/10 dark:bg-white/10');
content2 = content2.replace(/hover:bg-white dark:bg-slate-900\/20/g, 'hover:bg-white/20 dark:hover:bg-white/20');
fs.writeFileSync('src/components/DashboardView.tsx', content2);

console.log('Fixed transparency classes');
