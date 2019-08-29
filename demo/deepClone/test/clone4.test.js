const { clone1, clone2 } = require('../src/clone_4');


const target = {
    field1: 1,
    field2: undefined,
    field3: {
        child: 'child'
    },
    field4: [2, 4, 8],
    f: { f: { f: { f: { f: { f: { f: { f: { f: { f: { f: { f: {} } } } } } } } } } } },
};

target.target = target;

console.time();
const result = clone1(target);
console.timeEnd();

console.time();
const result2 = clone2(target);
console.timeEnd();