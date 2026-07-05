const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regexBtn = /<button\s+type="button"\s+onClick=\{\(\) => setIsPlaylistDropdownOpen\(!isPlaylistDropdownOpen\)\}\s+className="bg-brutal-white border-2 2xl:border-4 border-brutal-black text-brutal-black px-3 2xl:px-4 hover:bg-brutal-green transition-colors flex items-center justify-center shrink-0 active:translate-x-\[2px\] active:translate-y-\[2px\] whitespace-nowrap font-bold text-sm"\s*>/g;

code = code.replace(regexBtn, `<button 
                        type="button"
                        onClick={() => setIsPlaylistDropdownOpen(!isPlaylistDropdownOpen)}
                        className="w-full bg-brutal-white border-2 2xl:border-4 border-brutal-black text-brutal-black py-2 2xl:py-3 px-3 2xl:px-4 hover:bg-[var(--retro-accent)] hover:text-white transition-colors flex items-center justify-center shrink-0 active:translate-x-[2px] active:translate-y-[2px] whitespace-nowrap font-bold text-sm 2xl:text-lg uppercase tracking-widest shadow-[4px_4px_0_0_var(--color-brutal-black)]"
                      >`);
                      
fs.writeFileSync('src/App.tsx', code);
