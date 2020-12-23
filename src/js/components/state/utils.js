async function getJSON(url, reqOpt) {
    const response = await fetch(url, reqOpt);
    const data = await response.text();
    // console.log(data);
    return data;
}

const numbersSort = (a, b) => b - a;

const getSeverityCoefficient = (value) => {
    if (value > 1000000) return 10;
    if (value > 700000) return 9;
    if (value > 500000) return 8;
    if (value > 300000) return 7;
    if (value > 200000) return 6;
    if (value > 100000) return 5;
    if (value > 70000) return 4;
    if (value > 50000) return 3;
    if (value > 30000) return 2;
    if (value > 10000) return 1;
    return 0;
};

export {
    getJSON,
    numbersSort,
    getSeverityCoefficient,
};
