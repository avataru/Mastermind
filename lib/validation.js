const weaponRegEx = /^(bat[1-9])|(lzr[1-9])|(mbat[1-9])|(dlzr[1-9])|(brg[1-9])$/;
const invalidWeaponError = 'Valid entries are bat, lzr, mbat, dlzr, brg followed by a level number. e.g. bat3';

const shieldRegEx = /^(dlta[1-9])|(psv[1-9])|(omg[1-9])|(mrr[1-9])|(area[1-9])$/;
const invalidShieldError = 'Valid entries are dlta, psv, omg, mrr, area followed by a level number. e.g. omg3';

const moduleRegEx = /^(emp[1-9])|(tlp[1-9])|(rpr[1-9])|(twrp[1-9])|(unty[1-9])|(sanc)|(slth[1-9])|(fort[1-9])|(imp[1-9])|(rkt[1-9])|(slvg[1-9])|(supr[1-9])|(dst[1-9])|(brr[1-9])|(vng[1-9])|(leap[1-9])$/;
const invalidModuleError = 'Valid entries are emp, tlp, rpr, twrp, unty, sanc, slth, fort, imp, rkt, slvg, supr, dst, brr, vng, leap followed by a level number. e.g. twrp3';

const miningRegEx = /^(hbe[1-9])|(bst[1-9])|(enr[1-9])|(rmt[1-9])|(unty[1-9])|(upld[1-9])|(crch[1-9])|(gen[1-9])$/;
const invalidMiningError = 'Valid entries are hbe, bst, enr, rmt, unty, upld, crch, gen followed by a level number. e.g. rmt2';

const tradeRegEx = /^(cbe[1-9])|(scmp[1-9])|(rsh[1-9])|(trbo[1-9])|(trbu[1-9])|(auto[1-9])|(offl[1-9])|(beam[1-9])|(recl[1-9])$/;
const invalidTradeError = 'Valid entries are cbe, scmp, rsh, trbo, trbu, auto, offl, beam, recl followed by a level number. e.g. Beam1';

module.exports = {
    weaponRegEx: weaponRegEx,
    invalidWeaponError: invalidWeaponError,
    shieldRegEx: shieldRegEx,
    invalidShieldError: invalidShieldError,
    moduleRegEx: moduleRegEx,
    invalidModuleError: invalidModuleError,
    miningRegEx: miningRegEx,
    invalidMiningError: invalidMiningError,
    tradeRegEx: tradeRegEx,
    invalidTradeError: invalidTradeError
};