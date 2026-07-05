const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /const \[isSidebarOpen, setIsSidebarOpen\] = useState\(true\);/,
  "const [isSidebarOpen, setIsSidebarOpen] = useState(true);\n  const [isPlaylistDropdownOpen, setIsPlaylistDropdownOpen] = useState(false);"
);

fs.writeFileSync('src/App.tsx', code);
