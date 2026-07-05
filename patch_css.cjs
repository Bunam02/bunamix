const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

code = code.replace(/\.ui-acrobatic button:not\(\.settings-btn\):active/g, '.ui-acrobatic button:not(.settings-btn):not(.no-anim):active');
code = code.replace(/\.ui-acrobatic button:not\(\.settings-btn\), \.ui-acrobatic a img/g, '.ui-acrobatic button:not(.settings-btn):not(.no-anim), .ui-acrobatic a img');
code = code.replace(/\.ui-acrobatic button:not\(\.settings-btn\):hover, \.ui-acrobatic a:hover img/g, '.ui-acrobatic button:not(.settings-btn):not(.no-anim):hover, .ui-acrobatic a:hover img');

fs.writeFileSync('src/index.css', code);
