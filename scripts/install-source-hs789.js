require('dotenv').config();
const fs = require('fs-extra');

const source = process.env.BUILD_DIR_NAME ? 'external/a318ceo/' + process.env.BUILD_DIR_NAME : 'external/a318ceo';
console.log('installManifest source is: ' + source);

const installManifest = fs.readJSONSync('./build-a318ceo/out/lvfr-horizonsim-airbus-a318-ceo/install.json');
installManifest.source = source;
fs.writeJSONSync('./build-a318ceo/out/lvfr-horizonsim-airbus-a318-ceo/install.json', installManifest);