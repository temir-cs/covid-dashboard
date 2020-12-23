/* eslint-disable import/extensions */
/* eslint-disable no-param-reassign */
import create from './utils/create.js';
import language from './layouts/index.js'; // { en, ru }
import Key from './Key.js';
import rowsOrder from './layouts/rows';

// THE FOLLOWING PROJECT WAS TAKEN FROM https://github.com/rolling-scopes-school/temir-cs-JS2020Q3/tree/virtual-keyboard

export default class Keyboard {
    constructor() {
        this.rowsOrder = rowsOrder;
        this.keysPressed = {};
        this.isCaps = false;
        this.keyButtons = []; // Key()
    }

    init(langCode) { // ru en
        this.mainContainer = create('div', 'keyboard__container', '');
        this.keyBase = language[langCode];
        this.output = document.querySelector('.content__search--countries');
        this.container = create('div', 'keyboard keyboard_hidden', null, this.mainContainer, ['language', langCode], ['id', 'keyboard']);
        document.body.append(this.mainContainer);
        return this;
    }

    setOutputField(element) {
        this.output = element;
    }

    hideKeyboard() {
        this.mainContainer.classList.remove('keyboard_visible');
    }

    generateLayout() {
        this.rowsOrder.forEach((row, i) => {
            const rowElement = create('div', 'keyboard__row', null, this.container, ['row', i + 1]);
            rowElement.style.gridTemplateColumns = `repeat(${row.length}, 1fr)`;
            row.forEach((code) => { // Backquote
                const keyObject = this.keyBase.find((key) => key.code === code);
                if (keyObject) {
                    const keyButton = new Key(keyObject);
                    this.keyButtons.push(keyButton);
                    rowElement.appendChild(keyButton.div);
                }
            });
        });

        document.addEventListener('keydown', (e) => this.handleEvent(e));
        document.addEventListener('keyup', (e) => this.handleEvent(e));
        const keys = document.querySelectorAll('.keyboard__key');
        keys.forEach((key) => {
            key.addEventListener('mousedown', (e) => this.preHandleEvent(e));
            key.addEventListener('mouseup', (e) => this.preHandleEvent(e));
        });

        // Show / Hide keyboard controls
        document.querySelectorAll('.keyboard__visibility-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                this.mainContainer.classList.toggle('keyboard_visible');
            });
        });

        // Speech recognition
        window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        // eslint-disable-next-line no-undef
        this.recognition = new SpeechRecognition();
        this.recognition.interimResults = true;
        this.voiceOn = false;
    }

    preHandleEvent(e) {
        e.stopPropagation();
        const keyDiv = e.target.closest('.keyboard__key');
        if (!keyDiv) return;
        const kod = keyDiv.dataset.code;
        this.handleEvent({ code: kod, type: e.type });
    }

    resetButtonState(e) {
        const kod = e.target.dataset.code;
        const keyObj = this.keyButtons.find((key) => key.code === kod);
        keyObj.div.classList.remove('active');
        keyObj.div.removeEventListener('mouseleave', this.resetButtonState);
    }

    handleEvent(e) {
        if (e.stopPropagation) e.stopPropagation();
        const { code, type } = e;
        const keyObj = this.keyButtons.find((key) => key.code === code);
        if (!keyObj) return;
        this.output.focus();

        if (type.match(/keydown|mousedown/)) {
            if (type.match(/key/)) e.preventDefault();

            keyObj.div.classList.add('active');

            // if (code.match(/Shift/)) this.shiftKey = true;
            // if (this.shiftKey) this.switchUpperCase(true);

            // Shift switch
            if (code.match(/Shift/)) {
                if (!this.shiftKey) {
                    this.shiftKey = true;
                    this.switchUpperCase(true);
                } else {
                    this.shiftKey = false;
                    this.switchUpperCase(false);
                    keyObj.div.classList.remove('active');
                }
            }

            // Caps lock switch
            if (code.match(/Caps/) && !this.isCaps) {
                this.isCaps = true;
                this.switchUpperCase(true);
            } else if (code.match(/Caps/) && this.isCaps) {
                this.isCaps = false;
                this.switchUpperCase(false);
                keyObj.div.classList.remove('active');
            }

            // Switch language
            if (code.match(/Control/)) this.ctrlKey = true;
            if (code.match(/Alt/)) this.altKey = true;

            if (code.match(/Lang/)) this.switchLanguage();
            if (code.match(/Control/) && this.altKey) this.switchLanguage();
            if (code.match(/Alt/) && this.ctrlKey) this.switchLanguage();

            // Start voice recognition
            if (code.match(/Voice/)) {
                this.recognition.lang = this.container.dataset.language === 'en' ? 'en-US' : 'ru';
                if (!this.voiceOn) {
                    this.voiceOn = true;
                    this.recognition.addEventListener('result', this.recognizeVoice);
                    this.recognition.addEventListener('end', this.recognition.start);
                    this.recognition.start();
                } else {
                    this.voiceOn = false;
                    this.recognition.abort();
                    this.recognition.removeEventListener('result', this.recognizeVoice);
                    this.recognition.removeEventListener('end', this.recognition.start);
                    keyObj.div.classList.remove('active');
                }
            }

            if (!this.isCaps) {
                this.printToOutput(keyObj, this.shiftKey ? keyObj.shift : keyObj.small);
            } else if (this.isCaps) {
                if (this.shiftKey) {
                    this.printToOutput(keyObj, keyObj.sub.innerHTML ? keyObj.shift : keyObj.small);
                } else {
                    this.printToOutput(keyObj, !keyObj.sub.innerHTML ? keyObj.shift : keyObj.small);
                }
            }

            // release button
        } else if (type.match(/keyup|mouseup/)) {
            // if (code.match(/Shift/)) {
            //   this.shiftKey = false;
            //   this.switchUpperCase(false);
            // }
            if (code.match(/Control/)) this.ctrlKey = false;
            if (code.match(/Close/)) {
                this.mainContainer.classList.remove('keyboard_visible');
            }
            if (code.match(/Alt/)) this.altKey = false;
            if (!code.match(/Caps/) && !code.match(/Shift/) && !code.match(/Sound/) && !code.match(/Voice/)) {
                keyObj.div.classList.remove('active');
            }
        }
    }

    switchLanguage() {
        const langAbbr = Object.keys(language);
        let langIndex = langAbbr.indexOf(this.container.dataset.language);
        this.keyBase = langIndex + 1 < langAbbr.length ? language[langAbbr[langIndex += 1]]
            : language[langAbbr[langIndex -= langIndex]];

        this.container.dataset.language = langAbbr[langIndex];

        this.keyButtons.forEach((button) => {
            const keyObj = this.keyBase.find((key) => key.code === button.code);
            if (!keyObj) return;
            button.small = keyObj.small;
            button.shift = keyObj.shift;

            if (keyObj.shift && keyObj.shift.match(/[^a-zA-Zа-яА-яёЁ0-9]/g)) {
                button.sub.innerHTML = keyObj.shift;
            } else {
                button.sub.innerHTML = '';
            }
            button.letter.innerHTML = keyObj.small;
        });

        if (this.isCaps) this.switchUpperCase(true);
    }

    switchUpperCase(isTrue) {
        if (isTrue) {
            this.keyButtons.forEach((button) => {
                if (button.sub) {
                    if (this.shiftKey) {
                        button.sub.classList.add('sub-active');
                        button.letter.classList.add('sub-inactive');
                    }
                }
                if (!button.isFnKey && this.isCaps && !this.shiftKey && !button.sub.innerHTML) {
                    button.letter.innerHTML = button.shift;
                } else if (!button.isFnKey && this.isCaps && this.shiftKey) {
                    button.letter.innerHTML = button.small;
                } else if (!button.isFnKey && !button.sub.innerHTML) {
                    button.letter.innerHTML = button.shift;
                }
            });
        } else {
            this.keyButtons.forEach((button) => {
                if (!button.isFnKey) {
                    button.sub.classList.remove('sub-active');
                    button.letter.classList.remove('sub-inactive');

                    if (!this.isCaps) {
                        button.letter.innerHTML = button.small;
                    } else {
                        button.letter.innerHTML = button.shift;
                    }
                }
            });
        }
    }

    printToOutput(keyObj, symbol) {
        let cursorPos = this.output.selectionStart;
        const left = this.output.value.slice(0, cursorPos);
        const right = this.output.value.slice(cursorPos);

        const fnButtonsHandler = {
            Tab: () => {
                this.output.value = `${left}\t${right}`;
                cursorPos += 1;
            },
            ArrowLeft: () => {
                cursorPos = cursorPos - 1 >= 0 ? cursorPos - 1 : 0;
            },
            ArrowRight: () => {
                cursorPos += 1;
            },
            ArrowUp: () => {
                const positionFromLeft = this.output.value.slice(0, cursorPos).match(/(\n).*$(?!\1)/g) || [[1]];
                cursorPos -= positionFromLeft[0].length;
            },
            ArrowDown: () => {
                const positionFromLeft = this.output.value.slice(cursorPos).match(/^.*(\n).*(?!\1)/) || [[1]];
                cursorPos += positionFromLeft[0].length;
            },
            Enter: () => {
                this.output.value = `${left}\n${right}`;
                cursorPos += 1;
            },
            Backspace: () => {
                this.output.value = `${left.slice(0, -1)}${right}`;
                cursorPos -= 1;
            },
            Delete: () => {
                this.output.value = `${left}${right.slice(1)}`;
            },
            Space: () => {
                this.output.value = `${left} ${right}`;
                cursorPos += 1;
            },
        };

        if (fnButtonsHandler[keyObj.code]) fnButtonsHandler[keyObj.code]();
        else if (!keyObj.isFnKey) {
            cursorPos += 1;
            this.output.value = `${left}${symbol || ''}${right}`;
        }
        this.output.dispatchEvent(new Event('input'));
        this.output.setSelectionRange(cursorPos, cursorPos);
    }

    recognizeVoice(e) {
        const transcript = Array.from(e.results)
            .map((result) => result[0])
            .map((result) => result.transcript)
            .join('');
        if (e.results[0].isFinal) {
            this.output.value = `${this.output.value} ${transcript}`.trim();
        }
    }
}
