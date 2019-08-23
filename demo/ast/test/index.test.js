const format = require('../src/format');

const a = format('/* eslint-disable */\nmodule.exports =' + JSON.stringify({ psmInfo: 'a', name: '12313232' }));

console.log(a);