const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/<button\s+([^>]*)onClick=\{\(\) => setIsHistoryOpen\(!isHistoryOpen\)\}/, '<div $1onClick={() => setIsHistoryOpen(!isHistoryOpen)}');
code = code.replace(/<span className="text-xl leading-none">\{isHistoryOpen \? '−' : '\+'\}<\/span>\s*<\/button>/, '<span className="text-xl leading-none">{isHistoryOpen ? \'−\' : \'+\'}</span></div>');

fs.writeFileSync('src/App.tsx', code);
