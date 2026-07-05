const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Replace all <div type="submit"...> with <button
code = code.replace(/<div([^>]*type="submit"|[^>]*disabled=)/g, '<button$1');
code = code.replace(/<\/div>( *\n *<!-- End of submit button?)/g, '</button>$1'); // Hard to match closing tags.

fs.writeFileSync('src/App.tsx', code);
