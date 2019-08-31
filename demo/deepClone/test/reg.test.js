const bodyReg = /(?<={)(.|\n)+(?=})/m;

const paramReg = /(?<=\().+(?=\)\s+{)/;


function fun1() {
    console.log('func1');
    return 'func1';
}

function fun2(param1, param2) {
    console.log('func2');
    return 'func2' + param1 + param2;
}

const fun3 = () => {
    console.log('func3');
    return 'func3';
};

const fun4 = param => {
    console.log('func4');
    return 'func4' + param;
};

const fun5 = (param1, param2) => {
    console.log('func5');
    return 'func5' + param1, param2;
};


function cloneFunction(func) {
    const funcString = func.toString();
    if (func.prototype) {
        console.log('普通函数');
        const param = paramReg.exec(funcString);
        const body = bodyReg.exec(funcString);
        if (body) {
            console.log('匹配到函数体：', body[0]);
            if (param) {
                const paramArr = param[0].split(',');
                console.log('匹配到参数：', paramArr);
                return new Function(...paramArr, body[0]);
            } else {
                return new Function(body[0]);
            }
        } else {
            return null;
        }
    } else {
        return eval(funcString);
    }
}

const cloneFunc = cloneFunction(fun5);

console.log(cloneFunc(1, 2));

// console.log(fun1.toString().match(bodyReg));

// const func6 = new Function(`    console.log('func3');
// return 'func3';`);

// console.log(fun1.toString());
// console.log(fun2.toString());
// console.log(fun3.toString());
// console.log(fun4.toString());
// console.log(fun5.toString());
// console.log(func6.toString());