const fs = require('fs');
let code = fs.readFileSync('src/components/ParentChatList.tsx', 'utf8');

const targetListRender = `{nakesList.map((nakes) => (`;

const replaceWith = `
             {nakesList.length === 0 && (
                <div className="col-span-full py-20 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                  <Briefcase className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">Belum Ada Nakes</h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    Saat ini belum ada tenaga kesehatan yang melayani profil Anda. Harap tunggu hingga Nakes mengambil profil Anda untuk konsultasi.
                  </p>
                </div>
             )}
`;

// we just remove the nakesList.map entirely and make the empty state look better.
// The list was from `{nakesList.map((nakes) => (` to `))} {nakesList.length === 0 && ...`
code = code.replace(/\{nakesList\.map\(\(nakes\) => \([\s\S]*?\}\)\}[\s\S]*?\{nakesList\.length === 0 && \([\s\S]*? Saat ini belum ada tenaga kesehatan yang melayani profil Anda. Harap tunggu hingga Nakes mengambil profil Anda untuk konsultasi.[\s\S]*?<\/div>\s*\)\}/, replaceWith);

fs.writeFileSync('src/components/ParentChatList.tsx', code);
