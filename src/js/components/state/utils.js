async function getJSON(url, reqOpt) {
    const response = await fetch(url, reqOpt);
    const data = await response.text();
    // console.log(data);
    return data;
}

const numbersSort = (a, b) => b - a;

const getDataRange = (data, levels) => {
    const tmp = data.sort(function (a, b) { return a - b; });
    const quantiles = [];
    const step = data.length / levels;
    for (let i = 1; i < levels; i++) {
        const qidx = Math.round(i * step + 0.49);
        quantiles.push(tmp[qidx - 1]); // zero-based
    }
    const bounds = quantiles;

    bounds.unshift(tmp[0]);
    if (bounds[tmp.length - 1] !== tmp[tmp.length - 1]) bounds.push(tmp[tmp.length - 1]);

    const range = bounds;
    range.sort(function (a, b) { return a - b; });

    return range;
};

const classifyByRange = (num, range) => {
    if (num < range[0] || num > range[range.length - 1]) {
        throw new Error('Value out of range!');
    }

    let level;
    for (let i = 0; i < range.length; i += 1) {
        if (num === range[i]) {
            level = i;
            break;
        } else if (num >= range[i] && num < range[i + 1]) {
            level = i + 1;
            break;
        }
    }
    return level;
};

export {
    getJSON,
    numbersSort,
    getDataRange,
    classifyByRange,
};
