const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `
                    <div className="flex gap-2 2xl:gap-4 relative w-full">
                      <form onSubmit={handleAddSongRequest} className="flex gap-2 2xl:gap-4 flex-1">
                        <input
                          type="text"
                          placeholder="Add YouTube Video URL..."
                          value={songRequestValue}
                          onChange={(e) => setSongRequestValue(e.target.value)}
                          className="flex-1 bg-brutal-white border-2 2xl:border-4 border-brutal-black p-2 2xl:p-3 text-brutal-black font-bold text-sm 2xl:text-lg outline-none focus:bg-brutal-gray transition-colors placeholder:text-brutal-black/40"
                          disabled={isLoading}
                        />
                        <button type="submit"
                          disabled={isLoading || !songRequestValue.trim()}
                          className="bg-brutal-white border-2 2xl:border-4 border-brutal-black text-brutal-black px-3 2xl:px-4 hover:bg-brutal-green disabled:opacity-50 transition-colors flex items-center justify-center shrink-0 active:translate-x-[2px] active:translate-y-[2px]"
                        >
                          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5 stroke-[3]" />}
                        </button>
                      </form>
                      <button 
                        type="button"
                        onClick={() => setIsPlaylistDropdownOpen(!isPlaylistDropdownOpen)}
                        className="bg-brutal-white border-2 2xl:border-4 border-brutal-black text-brutal-black px-3 2xl:px-4 hover:bg-brutal-green transition-colors flex items-center justify-center shrink-0 active:translate-x-[2px] active:translate-y-[2px] whitespace-nowrap font-bold text-sm"
                      >
                        <Music className="w-4 h-4 mr-2" /> My Playlist
                      </button>
                      
                      {isPlaylistDropdownOpen && (
                        <div className="absolute top-full right-0 mt-2 w-64 bg-brutal-white border-2 2xl:border-4 border-brutal-black z-[100] shadow-[4px_4px_0_0_var(--color-brutal-black)] max-h-60 overflow-y-auto">
                          {playlists.length > 0 ? playlists.map(p => (
                            <div 
                              key={p.id} 
                              onClick={() => handleAddPlaylistItems(p)} 
                              className="p-3 border-b-2 border-brutal-black hover:bg-brutal-green hover:text-white cursor-pointer truncate font-bold text-sm transition-colors"
                            >
                              {p.title}
                            </div>
                          )) : (
                            <div className="p-3 text-sm text-center font-bold">No playlists added</div>
                          )}
                        </div>
                      )}
                    </div>`;

// We'll replace both occurrences. Let's use a regex that matches the whole form.
const formRegex = /<form onSubmit=\{handleAddSongRequest\} className="flex gap-2 2xl:gap-4">[\s\S]*?<\/form>/g;
code = code.replace(formRegex, replacement);

fs.writeFileSync('src/App.tsx', code);
