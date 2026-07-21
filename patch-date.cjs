const fs = require('fs');
let code = fs.readFileSync('src/components/NakesDashboardView.tsx', 'utf8');

code = code.replace(
  /const historyData = historySnap\.docs\.map\(hDoc => \(\{ id: hDoc\.id, \.\.\.hDoc\.data\(\) \} as QuestionnaireResult\)\);/g,
  `const historyData = historySnap.docs.map(hDoc => {
            const data = hDoc.data();
            return {
              id: hDoc.id,
              ...data,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString())
            } as QuestionnaireResult;
          });`
);

fs.writeFileSync('src/components/NakesDashboardView.tsx', code);
