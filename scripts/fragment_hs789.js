const fragmenter = require('@flybywiresim/fragmenter');
const fs = require('fs');

const execute = async () => {
    try {
        const result = await fragmenter.pack({
            packOptions: { splitFileSize: 102_760_448, keepCompleteModulesAfterSplit: false },
            baseDir: './horizonsim-789/build/horizonsim-aircraft-787-9',
            outDir: './horizonsim-789/build/build-modules',
            modules: [{
                name: 'effects',
                sourceDir: './Effects'
            }, {
                name: 'html_ui_fonts',
                sourceDir: './html_ui'
            }, {
                name: 'ContentInfo',
                sourceDir: './ContentInfo'
            }, {
                name: 'B787_9_GE_House_Textures',
                sourceDir: './SimObjects/Airplanes/_HorizonSim_B787_9_GE_HOUSE'
            }, {
                name: 'B787_9_RR_House_Textures',
                sourceDir: './SimObjects/Airplanes/_HorizonSim_B787_9_RR_HOUSE'
            }, {
                name: 'B787_9_GENX_Checklist',
                sourceDir: './SimObjects/Airplanes/HorizonSim_B787_9_GENX/Checklist'
            }, {
                name: 'B787_9_GENX_Model',
                sourceDir: './SimObjects/Airplanes/HorizonSim_B787_9_GENX/model'
            }, {
                name: 'B787_9_GENX_Panel_GE',
                sourceDir: './SimObjects/Airplanes/HorizonSim_B787_9_GENX/panel.GE'
            }, {
                name: 'B787_9_GENX_Panel_GE_R',
                sourceDir: './SimObjects/Airplanes/HorizonSim_B787_9_GENX/panel.GE.R'
            }, {
                name: 'B787_9_GENX_Panel_GE_RW',
                sourceDir: './SimObjects/Airplanes/HorizonSim_B787_9_GENX/panel.GE.RW'
            }, {
                name: 'B787_9_GENX_Panel_GE_W',
                sourceDir: './SimObjects/Airplanes/HorizonSim_B787_9_GENX/panel.GE.W'
            }, {
                name: 'B787_9_GENX_RTC',
                sourceDir: './SimObjects/Airplanes/HorizonSim_B787_9_GENX/rtc'
            }, {
                name: 'B787_9_GENX_SOUND',
                sourceDir: './SimObjects/Airplanes/HorizonSim_B787_9_GENX/sound'
            }, {
                name: 'B787_9_GENX_TEXTURE',
                sourceDir: './SimObjects/Airplanes/HorizonSim_B787_9_GENX/TEXTURE.GE'
            }, {
                name: 'HorizonSim_B787_9_SHARED_TEXTURE',
                sourceDir: './SimObjects/Airplanes/HorizonSim_B787_9_SHARED/TEXTURE'
            }, {
                name: 'HorizonSim_B787_9_SHARED_TEXTURE_HORIZONSIM',
                sourceDir: './SimObjects/Airplanes/HorizonSim_B787_9_SHARED/TEXTURE.HorizonSim'
            }, {
                name: 'B787_9_TRENT_Checklist',
                sourceDir: './SimObjects/Airplanes/HorizonSim_B787_9_TRENT/Checklist'
            }, {
                name: 'B787_9_TRENT_Model',
                sourceDir: './SimObjects/Airplanes/HorizonSim_B787_9_TRENT/model'
            }, {
                name: 'B787_9_TRENT_Panel_RR',
                sourceDir: './SimObjects/Airplanes/HorizonSim_B787_9_TRENT/panel.RR'
            }, {
                name: 'B787_9_TRENT_Panel_RR_R',
                sourceDir: './SimObjects/Airplanes/HorizonSim_B787_9_TRENT/panel.RR.R'
            }, {
                name: 'B787_9_TRENT_Panel_RR_RW',
                sourceDir: './SimObjects/Airplanes/HorizonSim_B787_9_TRENT/panel.RR.RW'
            }, {
                name: 'B787_9_TRENT_Panel_RR_W',
                sourceDir: './SimObjects/Airplanes/HorizonSim_B787_9_TRENT/panel.RR.W'
            }, {
                name: 'B787_9_TRENT_RTC',
                sourceDir: './SimObjects/Airplanes/HorizonSim_B787_9_TRENT/rtc'
            }, {
                name: 'B787_9_TRENT_SOUND',
                sourceDir: './SimObjects/Airplanes/HorizonSim_B787_9_TRENT/sound'
            }, {
                name: 'B787_9_TRENT_TEXTURE',
                sourceDir: './SimObjects/Airplanes/HorizonSim_B787_9_TRENT/TEXTURE.RR'
            }]
        });
        console.log(result);
        console.log(fs.readFileSync('./horizonsim-789/build/build-modules/modules.json').toString());
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

execute();