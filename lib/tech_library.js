const weaponRegEx = /^(battery[1-9])|(laser[1-9])|(mass[1-9])|(dual[1-9])|(barrage[1-9])$/;
const weaponHelp = 'Valid weapons are: battery, laser, mass, dual or barrage followed by a level number. e.g. battery3';

const shieldRegEx = /^(alpha[1-9])|(delta[1-9])|(passive[1-9])|(omega[1-9])|(mirror[1-9])|(area[1-9])$/;
const shieldHelp = 'Valid shields are: alpha, delta, passive, omega, mirror or area followed by a level number. e.g. omg3';

const moduleRegEx = /^(emp[1-9])|(teleport[1-9])|(repair[1-9])|(warp[1-9])|(unity[1-9])|(sanc)|(stealth[1-9])|(fortify[1-9])|(impulse[1-9])|(rocket[1-9])|(salvage[1-9])|(suppress[1-9])|(destiny[1-9])|(barrier[1-9])|(vengeance[1-9])|(leap[1-9])|(drone[1-9])$/;
const moduleHelp = 'Valid modules are: emp, teleport, repair, warp, unity, sanc, stealth, fortify, impulse, rocket, salvage, suppress, destiny, barrier, vengeance, leap or drone followed by a level number. e.g. warp3';

const miningRegEx = /^(hydrobay[1-9])|(boost[1-9])|(enrich[1-9])|(remote[1-9])|(unity[1-9])|(upload[1-9])|(crunch[1-9])|(genesis[1-9])$/;
const miningHelp = 'Valid mining modules are: hydrobay, boost, enrich, remote, unity, upload, crunch or genesis followed by a level number. e.g. remote2';

const tradeRegEx = /^(cargobay[1-9])|(computer[1-9])|(rush[1-9])|(boost[1-9])|(burst[1-9])|(autopilot[1-9])|(offload[1-9])|(beam[1-9])|(entrust[1-9])|(recall[1-9])$/;
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