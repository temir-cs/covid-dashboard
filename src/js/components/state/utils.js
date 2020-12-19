async function getJSON(url, reqOpt) {
    const response = await fetch(url, reqOpt);
    const data = await response.text();
    // console.log(data);
    return data;
}

const numbersSort = (a, b) => b - a;

export {
    getJSON,
    numbersSort,
};
