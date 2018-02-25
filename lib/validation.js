const weaponRegEx = /^(Bat[1-9])|(Lzr[1-9])|(MBat[1-9])|(DLzr[1-9])|(Brg[1-9])$/;
const invalidWeaponError = 'Valid entries are Bat, Lzr, MBat, DLzr, Brg followed by a level number. e.g. Bat3';

const shieldRegEx = /^(Dlta[1-9])|(Psv[1-9])|(Omg[1-9])|(Mrr[1-9])|(Area[1-9])$/;
const invalidShieldError = 'Valid entries are Dlta, Psv, Omg, Mrr, Area followed by a level number. e.g. Omg3';

const moduleRegEx = /^(Emp[1-9])|(Tlp[1-9])|(Rpr[1-9])|(TWrp[1-9])|(Unty[1-9])|(Sanc)|(Slth[1-9])|(Fort[1-9])|(Imp[1-9])|(Rkt[1-9])|(Slvg[1-9])|(Supr[1-9])|(Dst[1-9])|(Brr[1-9])|(Vng[1-9])|(Leap[1-9])$/;
const invalidModuleError = 'Valid entries are Emp, Tlp, Rpr, TWrp, Unty, Sanc, Slth, Fort, Imp, Rkt, Slvg, Supr, Dst, Brr, Vng, Leap followed by a level number. e.g. TWrp3';

const miningRegEx = /^(HBE[1-9])|(Bst[1-9])|(Enr[1-9])|(Rmt[1-9])|(Unty[1-9])|(Upld[1-9])|(Crch[1-9])|(Gen[1-9])$/;
const invalidMiningError = 'Valid entries are HBE, Bst, Enr, Rmt, Unty, Upld, Crch, Gen followed by a level number. e.g. RMin2';

const tradeRegEx = /^(CBE[1-9])|(SCmp[1-9])|(Rsh[1-9])|(TrBo[1-9])|(TrBu[1-9])|(Auto[1-9])|(Offl[1-9])|(Beam[1-9])|(Recl[1-9])$/;
const invalidTradeError = 'Valid entries are CBE, SCmp, Rsh, TrBo, TrBu, Auto, Offl, Beam, Recl followed by a level number. e.g. Beam1';

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