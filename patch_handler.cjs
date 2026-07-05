const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const handlerCode = `
  const handleAddPlaylistItems = async (playlist) => {
    setIsPlaylistDropdownOpen(false);
    setIsLoading(true);
    try {
      const items = await fetchPlaylistItems(playlist.id);
      if (!items || items.length === 0) {
        setError('Playlist is empty or could not be loaded.');
        return;
      }
      setQueue(prev => {
        const newQueue = [...prev, ...items];
        if (prev.length === 0) {
          setCurrentIndex(0);
          setInitialVideoId(items[0].videoId);
        }
        return newQueue;
      });
      if (!isPlaying) {
        setIsPlaying(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to add playlist.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSongRequest = async (e: React.FormEvent) => {`;

code = code.replace(/const handleAddSongRequest = async \(e: React.FormEvent\) => \{/, handlerCode);

fs.writeFileSync('src/App.tsx', code);
