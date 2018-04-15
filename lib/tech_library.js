const weaponRegEx = /^((?:bat|lzr|mbat|dlzr|brg)[1-9])$/;
const weaponHelp = 'Valid weapons are: bat, lzr, mbat, dlzr or brg followed by a level number. e.g. bat3';

const shieldRegEx = /^((?:dlta|psv|omg|mrr|area)[1-9])$/;
const shieldHelp = 'Valid shields are: dlta, psv, omg, mrr or area followed by a level number. e.g. omg3';

const moduleRegEx = /^((?:emp|tlp|rpr|twrp|unty|slth|fort|imp|rkt|slvg|supr|dst|brr|vng|leap)[1-9]|sanc1?)$/;
const moduleHelp = 'Valid modules are: emp, tlp, rpr, twrp, unty, sanc, slth, fort, imp, rkt, slvg, supr, dst, brr, vng or leap followed by a level number. e.g. twrp3';

const miningRegEx = /^((?:hbe|bst|enr|rmt|unty|upld|crch|gen)[1-9])$/;
const miningHelp = 'Valid mining modules are: hbe, bst, enr, rmt, unty, upld, crch or gen followed by a level number. e.g. rmt2';

const tradeRegEx = /^((?:cbe|scmp|rsh|trbo|trbu|auto|offl|beam|entr|recl)[1-9])$/;
const tradeHelp = 'Valid trade modules are: cbe, scmp, rsh, trbo, trbu, auto, offl, beam, entr or recl followed by a level number. e.g. beam1';

module.exports = {
    weaponRegEx: weaponRegEx,
    weaponHelp: weaponHelp,
    shieldRegEx: shieldRegEx,
    shieldHelp: shieldHelp,
    moduleRegEx: moduleRegEx,
    moduleHelp: moduleHelp,
    miningRegEx: miningRegEx,
    miningHelp: miningHelp,
    tradeRegEx: tradeRegEx,
    tradeHelp: tradeHelp
};
