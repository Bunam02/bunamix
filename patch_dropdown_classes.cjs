const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /<div className="absolute top-full left-0 right-0 mt-2 w-full bg-brutal-white border-2 2xl:border-4 border-brutal-black z-\[100\] shadow-\[4px_4px_0_0_var\(--color-brutal-black\)\] max-h-60 overflow-y-auto">/g,
  '<div className="absolute top-full left-0 right-0 mt-2 w-full bg-brutal-white border-2 2xl:border-4 border-brutal-black z-[100] shadow-[4px_4px_0_0_var(--color-brutal-black)] max-h-60 overflow-y-auto dropdown-menu">'
);

code = code.replace(
  /className="p-3 border-b-2 border-brutal-black hover:bg-brutal-green hover:text-white cursor-pointer truncate font-bold text-sm transition-colors"/g,
  'className="p-3 border-b-2 border-brutal-black hover:bg-brutal-green hover:text-white cursor-pointer truncate font-bold text-sm transition-colors dropdown-item"'
);

fs.writeFileSync('src/App.tsx', code);
