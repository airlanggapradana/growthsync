const fs = require('fs');
let code = fs.readFileSync('src/components/NakesDashboardView.tsx', 'utf8');

code = code.replace(
  /const historyQ = query\(collection\(db, 'questionnaireResults'\), where\('childId', '==', docSnap\.id\)\);/g,
  "const historyQ = query(collection(db, 'questionnaireResults'), where('profileId', '==', docSnap.id));"
);

fs.writeFileSync('src/components/NakesDashboardView.tsx', code);
