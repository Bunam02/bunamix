const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /<div className="flex gap-2 2xl:gap-4 relative w-full">/g,
  '<div className="flex flex-col gap-2 2xl:gap-4 relative w-full">'
);

fs.writeFileSync('src/App.tsx', code);
