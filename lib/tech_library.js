const weaponRegEx = /^((?:battery|laser|mass|dual|barrage)[1-9])$/;
const weaponHelp = 'Valid weapons are: battery, laser, mass, dual or barrage followed by a level number. e.g. battery3';

const shieldRegEx = /^((?:alpha|delta|passive|omega|mirror|area)[1-9])$/;
const shieldHelp = 'Valid shields are: alpha, delta, passive, omega, mirror or area followed by a level number. e.g. omega3';

const moduleRegEx = /^((?:emp|teleport|repair|warp|unity|stealth|fortify|impulse|rocket|salvage|suppress|destiny|barrier|vengeance|leap|drone)[1-9]|sanc1?)$/;
const moduleHelp = 'Valid modules are: emp, teleport, repair, warp, unity, sanc, stealth, fortify, impulse, rocket, salvage, suppress, destiny, barrier, vengeance, leap or drone followed by a level number. e.g. warp3';

const miningRegEx = /^((?:hydrobay|boost|enrich|remote|unity|upload|crunch|genesis)[1-9])$/;
const miningHelp = 'Valid mining modules are: hydrobay, boost, enrich, remote, unity, upload, crunch or genesis followed by a level number. e.g. remote2';

const tradeRegEx = /^((?:cargobay|computer|rush|boost|burst|autopilot|offload|beam|entrust|recall)[1-9])$/;
const tradeHelp = 'Valid trade modules are: cargobay, computer, rush, boost, burst, autopilot, offload, beam, entrust or recall followed by a level number. e.g. beam1';

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
