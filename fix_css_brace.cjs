const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

code = code.replace(/  \}\n\}\n\n@keyframes floatUp/g, '  }\n\n@keyframes floatUp');

fs.writeFileSync('src/index.css', code);
