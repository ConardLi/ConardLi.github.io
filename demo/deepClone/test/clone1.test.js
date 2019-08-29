const clone = require('../src/clone_1');

const target = {
    field1: 1,
    field2: undefined,
    field3: {
        child: 'child'
    }
};

const result = clone(target);

console.log(result);