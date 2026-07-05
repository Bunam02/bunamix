const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Patch 1: Request List button
code = code.replace(
  /className="w-full flex items-center justify-center gap-3 2xl:gap-5 bg-brutal-white border-2 2xl:border-4 border-brutal-black p-4 2xl:p-6 group transition-colors hover:bg-brutal-gray shadow-\[4px_4px_0_0_var\(--color-brutal-black\)\] 2xl:shadow-\[6px_6px_0_0_var\(--color-brutal-black\)\] active:translate-x-\[4px\] active:translate-y-\[4px\] active:shadow-none"/g,
  'className="w-full flex items-center justify-center gap-3 2xl:gap-5 bg-brutal-white border-2 2xl:border-4 border-brutal-black p-4 2xl:p-6 group transition-colors hover:bg-brutal-gray shadow-[4px_4px_0_0_var(--color-brutal-black)] 2xl:shadow-[6px_6px_0_0_var(--color-brutal-black)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none no-anim"'
);

// Patch 2: My Playlist buttons
code = code.replace(
  /className="w-full bg-brutal-white border-2 2xl:border-4 border-brutal-black text-brutal-black py-2 2xl:py-3 px-3 2xl:px-4 hover:bg-\[var\(--retro-accent\)\] hover:text-white transition-colors flex items-center justify-center shrink-0 active:translate-x-\[2px\] active:translate-y-\[2px\] whitespace-nowrap font-bold text-sm 2xl:text-lg uppercase tracking-widest shadow-\[4px_4px_0_0_var\(--color-brutal-black\)\]"/g,
  'className="w-full bg-brutal-white border-2 2xl:border-4 border-brutal-black text-brutal-black py-2 2xl:py-3 px-3 2xl:px-4 hover:bg-[var(--retro-accent)] hover:text-white transition-colors flex items-center justify-center shrink-0 active:translate-x-[2px] active:translate-y-[2px] whitespace-nowrap font-bold text-sm 2xl:text-lg uppercase tracking-widest shadow-[4px_4px_0_0_var(--color-brutal-black)] no-anim"'
);

fs.writeFileSync('src/App.tsx', code);
