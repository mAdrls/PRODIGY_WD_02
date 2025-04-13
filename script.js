// DOM Elements
const minutesElement = document.getElementById("minutes");
const secondsElement = document.getElementById("seconds");
const millisecondsElement = document.getElementById("milliseconds");
const startButton = document.getElementById("start");
const pauseButton = document.getElementById("pause");
const resetButton = document.getElementById("reset");
const lapButton = document.getElementById("lap");
const clearLapsButton = document.getElementById("clear-laps");
const lapsList = document.getElementById("laps");
const themeToggle = document.getElementById("theme-toggle");

// Timer variables
let startTime;
let elapsedTime = 0;
let timerInterval;
let running = false;
let lapCounter = 1;
let lastLapTime = 0;
let lapTimes = [];
let savedLaps = [];

// Check for saved theme preference
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme');
    themeToggle.innerHTML = '<span class="icon">☀️</span>';
}

// Check for saved laps
const loadSavedLaps = () => {
    const saved = localStorage.getItem('stopwatchLaps');
    if (saved) {
        savedLaps = JSON.parse(saved);
        renderSavedLaps();
    }
};

// Theme toggle functionality
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeToggle.innerHTML = `<span class="icon">${isDark ? '☀️' : '🌙'}</span>`;
});

// Format time to display
const formatTime = (time) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = Math.floor((time % 1000) / 10);

    return {
        minutes: minutes.toString().padStart(2, "0"),
        seconds: seconds.toString().padStart(2, "0"),
        milliseconds: milliseconds.toString().padStart(2, "0")
    };
};

// Update timer display
const updateDisplay = (timeObj) => {
    minutesElement.textContent = timeObj.minutes;
    secondsElement.textContent = timeObj.seconds;
    millisecondsElement.textContent = timeObj.milliseconds;
};

// Start timer
const startTimer = () => {
    if (!running) {
        startTime = Date.now() - elapsedTime;
        timerInterval = setInterval(() => {
            elapsedTime = Date.now() - startTime;
            const formattedTime = formatTime(elapsedTime);
            updateDisplay(formattedTime);
        }, 10);
        running = true;
        startButton.disabled = true;
        pauseButton.disabled = false;
    }
};

// Pause timer
const pauseTimer = () => {
    if (running) {
        clearInterval(timerInterval);
        running = false;
        startButton.disabled = false;
        pauseButton.disabled = true;
    }
};

// Reset timer
const resetTimer = () => {
    clearInterval(timerInterval);
    running = false;
    elapsedTime = 0;
    lastLapTime = 0;
    lapCounter = 1;
    updateDisplay(formatTime(0));
    startButton.disabled = false;
    pauseButton.disabled = false;
};

// Record lap time
const recordLap = () => {
    if (running) {
        const lapTime = elapsedTime;
        const splitTime = lapTime - lastLapTime;
        lastLapTime = lapTime;
        
        const lap = {
            number: lapCounter,
            time: lapTime,
            split: splitTime,
            formattedTime: formatTime(lapTime),
            formattedSplit: formatTime(splitTime)
        };
        
        lapTimes.push(lap);
        renderLap(lap);
        lapCounter++;
        
        // Save laps to localStorage
        savedLaps = lapTimes;
        localStorage.setItem('stopwatchLaps', JSON.stringify(savedLaps));
        
        // Highlight fastest and slowest laps
        highlightLaps();
    }
};

// Render a single lap
const renderLap = (lap) => {
    const li = document.createElement("li");
    li.dataset.lapNumber = lap.number;
    li.innerHTML = `
        <span>${lap.number}</span>
        <span>${lap.formattedTime.minutes}:${lap.formattedTime.seconds}:${lap.formattedTime.milliseconds}</span>
        <span>${lap.formattedSplit.minutes}:${lap.formattedSplit.seconds}:${lap.formattedSplit.milliseconds}</span>
    `;
    lapsList.prepend(li);
};

// Render saved laps from localStorage
const renderSavedLaps = () => {
    lapsList.innerHTML = '';
    savedLaps.forEach(lap => {
        renderLap(lap);
    });
    
    if (savedLaps.length > 0) {
        lapCounter = Math.max(...savedLaps.map(lap => lap.number)) + 1;
        highlightLaps();
    }
};

// Highlight fastest and slowest laps
const highlightLaps = () => {
    if (lapTimes.length <= 1) return;
    
    // Remove existing highlights
    document.querySelectorAll('#laps li.fastest, #laps li.slowest').forEach(el => {
        el.classList.remove('fastest', 'slowest');
    });
    
    // Find fastest and slowest splits (ignoring the first lap)
    const splits = lapTimes.slice(1).map(lap => ({ number: lap.number, split: lap.split }));
    const fastestSplit = Math.min(...splits.map(s => s.split));
    const slowestSplit = Math.max(...splits.map(s => s.split));
    
    const fastestLap = splits.find(s => s.split === fastestSplit);
    const slowestLap = splits.find(s => s.split === slowestSplit);
    
    // Apply highlights
    if (fastestLap) {
        const fastEl = document.querySelector(`#laps li[data-lap-number="${fastestLap.number}"]`);
        if (fastEl) fastEl.classList.add('fastest');
    }
    
    if (slowestLap) {
        const slowEl = document.querySelector(`#laps li[data-lap-number="${slowestLap.number}"]`);
        if (slowEl) slowEl.classList.add('slowest');
    }
};

// Clear all laps
const clearLaps = () => {
    lapsList.innerHTML = '';
    lapTimes = [];
    savedLaps = [];
    lapCounter = 1;
    lastLapTime = 0;
    localStorage.removeItem('stopwatchLaps');
};

// Event listeners
startButton.addEventListener("click", startTimer);
pauseButton.addEventListener("click", pauseTimer);
resetButton.addEventListener("click", resetTimer);
lapButton.addEventListener("click", recordLap);
clearLapsButton.addEventListener("click", clearLaps);

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault();
        if (running) {
            pauseTimer();
        } else {
            startTimer();
        }
    } else if (e.code === "KeyR") {
        resetTimer();
    } else if (e.code === "KeyL") {
        recordLap();
    }
});

// Initialize
loadSavedLaps();
updateDisplay(formatTime(0));