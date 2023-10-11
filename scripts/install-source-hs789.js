require('dotenv').config();
const fs = require('fs-extra');

const source = process.env.BUILD_DIR_NAME ? 'external/hs789/' + process.env.BUILD_DIR_NAME : 'external/hs789';
console.log('installManifest source is: ' + source);

const installManifest = fs.readJSONSync('./horizonsim-789/build/horizonsim-aircraft-787-9/install.json');
installManifest.source = source;
fs.writeJSONSync('./horizonsim-789/build/horizonsim-aircraft-787-9/install.json', installManifest);