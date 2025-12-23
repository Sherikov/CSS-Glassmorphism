// --- Configuration ---
const defaultSettings = {
    blur: 15, saturation: 180, transparency: 0.25, glassColor: "#ffffff",
    width: 350, height: 220, radius: 20, outline: 1,
    isLightText: true, isSpotlight: false, activeBgIndex: -1
};
let state = { ...defaultSettings };

// --- DOM Elements ---
const controls = {
    blur: document.getElementById('blur'),
    saturation: document.getElementById('saturation'),
    transparency: document.getElementById('transparency'),
    glassColor: document.getElementById('glass-color'),
    width: document.getElementById('width'),
    height: document.getElementById('height'),
    radius: document.getElementById('radius'),
    outline: document.getElementById('outline'),
    textColorToggle: document.getElementById('text-color-toggle'),
    spotlightToggle: document.getElementById('spotlight-toggle')
};

const valDisplays = {
    blur: document.getElementById('blur-val'),
    saturation: document.getElementById('saturation-val'),
    transparency: document.getElementById('transparency-val'),
    width: document.getElementById('width-val'),
    height: document.getElementById('height-val'),
    radius: document.getElementById('radius-val'),
    outline: document.getElementById('outline-val'),
};

const glassCard = document.getElementById('glass-card');
const codeOutput = document.getElementById('css-code');
const previewArea = document.getElementById('preview-area');
const bgButtons = document.querySelectorAll('.bg-btn');

// --- Mouse Tracking (for Spotlight Effect) ---
glassCard.addEventListener('mousemove', (e) => {
    if (!state.isSpotlight) return;

    // Calculate mouse position relative to card
    const rect = glassCard.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update CSS variables
    glassCard.style.setProperty('--mouse-x', `${x}px`);
    glassCard.style.setProperty('--mouse-y', `${y}px`);
});

// --- Helper Functions ---

// Convert Hex to RGB
function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
}

// LocalStorage Management
function saveState() { localStorage.setItem('glassSettingsV3', JSON.stringify(state)); }
function loadState() {
    const saved = localStorage.getItem('glassSettingsV3');
    if (saved) state = { ...defaultSettings, ...JSON.parse(saved) };
}

// --- Core Update Logic ---
function updateGlass() {
    // Read values from inputs
    state.blur = controls.blur.value;
    state.saturation = controls.saturation.value;
    state.transparency = controls.transparency.value;
    state.glassColor = controls.glassColor.value;
    state.width = controls.width.value;
    state.height = controls.height.value;
    state.radius = controls.radius.value;
    state.outline = controls.outline.value;
    state.isLightText = controls.textColorToggle.checked;
    state.isSpotlight = controls.spotlightToggle.checked;

    // Update Text Displays
    valDisplays.blur.innerText = `${state.blur}px`;
    valDisplays.saturation.innerText = `${state.saturation}%`;
    valDisplays.transparency.innerText = state.transparency;
    valDisplays.width.innerText = `${state.width}px`;
    valDisplays.height.innerText = `${state.height}px`;
    valDisplays.radius.innerText = `${state.radius}px`;
    valDisplays.outline.innerText = `${state.outline}px`;

    // Generate CSS
    const rgbBg = hexToRgb(state.glassColor);
    const backgroundStyle = `rgba(${rgbBg}, ${state.transparency})`;
    const backdropFilterStyle = `blur(${state.blur}px) saturate(${state.saturation}%)`;
    const borderStyle = `${state.outline}px solid rgba(255, 255, 255, 0.3)`;
    const textColor = state.isLightText ? '#ffffff' : '#000000';

    // Apply Styles to Card
    glassCard.style.background = backgroundStyle;
    glassCard.style.backdropFilter = backdropFilterStyle;
    glassCard.style.webkitBackdropFilter = backdropFilterStyle;
    glassCard.style.border = borderStyle;
    glassCard.style.width = `${state.width}px`;
    glassCard.style.height = `${state.height}px`;
    glassCard.style.borderRadius = `${state.radius}px`;
    glassCard.style.color = textColor;

    // Toggle Spotlight Class
    if (state.isSpotlight) {
        glassCard.classList.add('interactive');
    } else {
        glassCard.classList.remove('interactive');
    }

    // Generate Code for User
    let codeText = `.glass-card {
    width: ${state.width}px;
    height: ${state.height}px;
    color: ${textColor};
    background: ${backgroundStyle};
    backdrop-filter: ${backdropFilterStyle};
    -webkit-backdrop-filter: ${backdropFilterStyle};
    border: ${borderStyle};
    border-radius: ${state.radius}px;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
    position: relative;
    overflow: hidden;
}`;

    if (state.isSpotlight) {
        codeText += `

/* Add this for Spotlight Effect */
.glass-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    background: radial-gradient(
        600px circle at var(--mouse-x), var(--mouse-y), 
        rgba(255, 255, 255, 0.2), 
        transparent 40%
    );
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
    z-index: 2;
}

.glass-card:hover::before {
    opacity: 1;
}

/* Note: JS is required to update --mouse-x and --mouse-y */`;
    }

    codeOutput.innerText = codeText;
    saveState();
}

// --- Initialization & Event Listeners ---
Object.values(controls).forEach(c => c.addEventListener('input', updateGlass));

// File Upload Logic
document.getElementById('bg-file-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(ev) {
            previewArea.style.background = `url(${ev.target.result}) no-repeat center/cover`;
            document.querySelectorAll('.shape').forEach(s => s.style.display = 'none');
        }
        reader.readAsDataURL(file);
    }
});

// Background Preset Logic
bgButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        previewArea.style.background = getComputedStyle(btn).background;
        document.querySelectorAll('.shape').forEach(s => s.style.display = 'block');
    });
});

// Copy Button Logic
document.getElementById('copy-btn').addEventListener('click', () => {
     navigator.clipboard.writeText(codeOutput.innerText);
     alert("Code copied to clipboard!");
});

// Run on load
loadState();

// Sync UI inputs with state
controls.blur.value = state.blur;
controls.saturation.value = state.saturation;
controls.transparency.value = state.transparency;
controls.glassColor.value = state.glassColor;
controls.width.value = state.width;
controls.height.value = state.height;
controls.radius.value = state.radius;
controls.outline.value = state.outline;
controls.textColorToggle.checked = state.isLightText;
controls.spotlightToggle.checked = state.isSpotlight;

updateGlass();