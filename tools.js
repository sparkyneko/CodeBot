"use strict";


const sysops = {
    '105835949107273728': '@nekohikaru',
    '808956986787889172': '@nyazaza'
};

module.exports = {
    isSysop(userid) {
        return sysops[userid];
    },
}