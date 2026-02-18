/**
 * F1 Reaction Timer - Lights Out logic
 */

const STATE = { START: 'start', SEQUENCE: 'sequence', WAITING: 'waiting', READY: 'ready', RESULT: 'result' };
let currentState = STATE.START;
let startTime = 0;
let sequenceTimeouts = [];
let bestTime = localStorage.getItem('f1_best') || Infinity;

const screens = {
    start: document.getElementById('start-screen'),
    game: document.getElementById('game-screen'),
    result: document.getElementById('result-screen')
};

const leds = [
    [document.getElementById('l1a'), document.getElementById('l1b')],
    [document.getElementById('l2a'), document.getElementById('l2b')],
    [document.getElementById('l3a'), document.getElementById('l3b')],
    [document.getElementById('l4a'), document.getElementById('l4b')],
    [document.getElementById('l5a'), document.getElementById('l5b')]
];

const elements = {
    statusText: document.getElementById('status-text'),
    resultTime: document.getElementById('reaction-time-result'),
    resultStatus: document.getElementById('result-status'),
    pbResult: document.getElementById('pb-result'),
    bestTimeStart: document.getElementById('best-time-start'),
    gameArea: document.getElementById('game-area')
};

function syncStats() {
    const displayBest = bestTime === Infinity ? '-- ms' : `${bestTime} ms`;
    elements.bestTimeStart.textContent = displayBest;
    elements.pbResult.textContent = displayBest;
}

function showScreen(key) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[key].classList.add('active');
}

function clearSequence() {
    sequenceTimeouts.forEach(t => clearTimeout(t));
    sequenceTimeouts = [];
    leds.flat().forEach(led => {
        led.classList.remove('active');
        led.classList.remove('green');
    });
}

function startF1Sequence() {
    currentState = STATE.SEQUENCE;
    showScreen('game');
    clearSequence();
    elements.statusText.textContent = "Wait for green...";
    elements.statusText.style.color = "white";

    // Light up 1-5 (Red)
    for (let i = 0; i < 5; i++) {
        sequenceTimeouts.push(setTimeout(() => {
            leds[i].forEach(led => led.classList.add('active'));
        }, (i + 1) * 1000));
    }

    // Random delay after all lights are on to turn GREEN
    const randomDelay = Math.floor(Math.random() * 3000) + 1000;
    sequenceTimeouts.push(setTimeout(() => {
        currentState = STATE.READY;
        leds.flat().forEach(led => {
            led.classList.remove('active');
            led.classList.add('green');
        });
        startTime = performance.now();
        elements.statusText.textContent = "GO GO GO!";
        elements.statusText.style.color = "var(--success)";
    }, 5000 + randomDelay));
}

function handleInteraction() {
    if (currentState === STATE.SEQUENCE || currentState === STATE.WAITING) {
        clearSequence();
        showResult(null); // Jump Start
    } else if (currentState === STATE.READY) {
        const time = Math.round(performance.now() - startTime);
        if (time < bestTime) {
            bestTime = time;
            localStorage.setItem('f1_best', time);
        }
        showResult(time);
    }
}

function showResult(time) {
    currentState = STATE.RESULT;
    showScreen('result');

    if (time === null) {
        elements.resultStatus.textContent = "JUMP START";
        elements.resultStatus.style.color = "var(--f1-red)";
        elements.resultTime.textContent = "0.000s";
    } else {
        elements.resultStatus.textContent = "REACTION TIME";
        elements.resultStatus.style.color = "var(--f1-white)";
        elements.resultTime.textContent = (time / 1000).toFixed(3) + "s";
    }
    syncStats();
}

// Event Listeners
document.getElementById('start-btn').onclick = startF1Sequence;
document.getElementById('restart-btn').onclick = startF1Sequence;
document.getElementById('home-btn').onclick = () => { showScreen('start'); syncStats(); };

elements.gameArea.onmousedown = (e) => { e.preventDefault(); handleInteraction(); };
elements.gameArea.ontouchstart = (e) => { e.preventDefault(); handleInteraction(); };

syncStats();
