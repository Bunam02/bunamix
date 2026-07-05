const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regexDropdown = /<div className="absolute top-full right-0 mt-2 w-64 bg-brutal-white border-2 2xl:border-4 border-brutal-black z-\[100\] shadow-\[4px_4px_0_0_var\(--color-brutal-black\)\] max-h-60 overflow-y-auto">/g;

code = code.replace(regexDropdown, '<div className="absolute top-full left-0 right-0 mt-2 w-full bg-brutal-white border-2 2xl:border-4 border-brutal-black z-[100] shadow-[4px_4px_0_0_var(--color-brutal-black)] max-h-60 overflow-y-auto">');

fs.writeFileSync('src/App.tsx', code);
