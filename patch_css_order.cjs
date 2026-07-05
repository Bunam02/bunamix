const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

// Just remove the dropdown-menu rules we added
code = code.replace(/\.ui-acrobatic \.dropdown-menu \{\n    border-radius: 24px !important;\n    padding: 8px !important;\n  \}\n  \.ui-acrobatic \.dropdown-item \{\n    border-radius: 12px !important;\n    border: none !important;\n  \}\n  /g, '');

// And add them at the end of .ui-acrobatic block
code = code.replace(/@keyframes floatUp/g, `  .ui-acrobatic .dropdown-menu {
    border-radius: 24px !important;
    padding: 8px !important;
  }
  .ui-acrobatic .dropdown-item {
    border-radius: 12px !important;
    border: none !important;
  }
}

@keyframes floatUp`);

fs.writeFileSync('src/index.css', code);
