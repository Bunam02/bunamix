const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

// I replaced: `@keyframes floatUp` with `... } \n @keyframes floatUp`
// Let's remove that extra `}` if it's there.
code = code.replace(/  \}\n\n@keyframes floatUp/g, '\n@keyframes floatUp');

fs.writeFileSync('src/index.css', code);
