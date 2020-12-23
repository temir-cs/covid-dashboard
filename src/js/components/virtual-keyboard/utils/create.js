export default function create(el, classNames, child, parent, ...dataAttr) {
    let element = null;
    try {
        element = document.createElement(el);
    } catch (error) {
        throw new Error('Unable to create HTML element! Error: ', error);
    }

    if (classNames) element.classList.add(...classNames.split(' '));

    if (child && Array.isArray(child)) {
        child.forEach((childElement) => childElement && element.appendChild(childElement));
    } else if (child && typeof child === 'object') {
        element.appendChild(child);
    } else if (child && typeof child === 'string') {
        element.innerHTML = child;
    }

    if (parent) parent.appendChild(element);

    if (dataAttr.length > 0) {
        dataAttr.forEach(([attrName, attrValue]) => {
            if (attrValue === '') {
                element.setAttribute(attrName, '');
            }

            if (attrName.match(/value|id|placeholder|cols|rows|autocorrect|spellcheck|src/)) {
                element.setAttribute(attrName, attrValue);
            } else {
                element.dataset[attrName] = attrValue;
            }
        });
    }
    return element;
}
