const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

const regex = /\.ui-acrobatic \.border-4, \.ui-acrobatic \.border-2 \{/;
code = code.replace(regex, `.ui-acrobatic .dropdown-menu {
    border-radius: 24px !important;
    padding: 8px !important;
  }
  .ui-acrobatic .dropdown-item {
    border-radius: 12px !important;
    border: none !important;
  }
  .ui-acrobatic .border-4, .ui-acrobatic .border-2 {`);

fs.writeFileSync('src/index.css', code);
