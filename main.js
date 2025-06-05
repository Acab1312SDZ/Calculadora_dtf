
const MARGIN = 1.5; // cm extra (0,75 por lado)
const designs = [];
const LS_KEY = 'dtf-designs';
const THEME_KEY = 'dtf-theme';
    /* -------- Helpers de interfaz -------- */
    function renderTable() {
    const tbody = document.querySelector('#designTable tbody');
    tbody.innerHTML = '';

    designs.forEach((d, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${d.width}</td>
        <td>${d.height}</td>
        <td>${d.quantity}</td>
        <td><button class="delete" data-index="${idx}">✕</button></td>
        `;
        tbody.appendChild(tr);
    });
    }
saveDesigns();


function showMessage(msg) {
    const box = document.getElementById('message');
    box.textContent = msg;
    setTimeout(() => {
        box.textContent = '';
    }, 3000);
}

function saveDesigns() {
    localStorage.setItem(LS_KEY, JSON.stringify(designs));
}

function loadDesigns() {
    const stored = localStorage.getItem(LS_KEY);
    if (stored) {
        try {
            const arr = JSON.parse(stored);
            designs.push(...arr);
            renderTable();
        } catch (_) {
            // ignore parse errors
        }
    }
}

function setTheme(theme) {
    document.body.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(THEME_KEY, theme);
    document.getElementById('toggleTheme').textContent = theme === 'dark' ? '☀️' : '🌙';
}

function loadTheme() {
    const stored = localStorage.getItem(THEME_KEY) || 'light';
    setTheme(stored);
}
    /* -------- Lógica de negocio -------- */
    function prepareDesigns(arr) {
    const list = [];
    arr.forEach((d) => {
        const wEff = d.width + MARGIN;
        const hEff = d.height + MARGIN;
        for (let i = 0; i < d.quantity; i += 1) {
        list.push({ w: wEff, h: hEff });
        }
    });
    return list;
    }

    function calculateLength(items, rollWidth) {
    // Heurística First-Fit Decreasing
    items.sort((a, b) => Math.max(b.w, b.h) - Math.max(a.w, a.h));
    const rows = [];

    items.forEach((item) => {
        let { w, h } = item;

        // Rotar si con ello cabe en la bobina
        if (w > rollWidth && h <= rollWidth) [w, h] = [h, w];

        let placed = false;
        for (const row of rows) {
        const spaceLeft = rollWidth - row.used;
        if (w <= spaceLeft) {
            row.used += w;
            row.height = Math.max(row.height, h);
            placed = true;
            break;
        }
        }
        if (!placed) rows.push({ used: w, height: h });
    });

    let totalHeight = rows.reduce((sum, r) => sum + r.height, 0);
    totalHeight *= 1.05; // +5 % de seguridad
    return (totalHeight / 100).toFixed(2); // metros con 2 decimales
    }

    /* -------- Listeners -------- */

    document.getElementById('addDesign').addEventListener('click', () => {
    const width = parseFloat(document.getElementById('width').value);
    const height = parseFloat(document.getElementById('height').value);
    const quantity = parseInt(document.getElementById('quantity').value, 10);

    if (Number.isNaN(width) || Number.isNaN(height) || Number.isNaN(quantity) || quantity <= 0) {
        alert('Completa los campos correctamente');
        return;
    }

    designs.push({ width, height, quantity });
    renderTable();
    });

    document.querySelector('#designTable').addEventListener('click', (e) => {
    if (e.target.classList.contains('delete')) {
        const idx = parseInt(e.target.dataset.index, 10);
        designs.splice(idx, 1);
        renderTable();
    }
    });

    document.getElementById('compute').addEventListener('click', () => {
    if (!designs.length) {
        alert('Añade al menos un diseño');
        return;
    }
            showMessage('Completa los campos correctamente');


    const rollWidth = parseFloat(document.querySelector('input[name="roll"]:checked').value);
    const items = prepareDesigns(designs);
    const meters = calculateLength(items, rollWidth);

    document.getElementById('result').textContent = `Necesitas ≈ ${meters} m de bobina ${rollWidth} cm`;
});

document.getElementById('toggleTheme').addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark');
    setTheme(isDark ? 'light' : 'dark');
});

loadDesigns();
loadTheme();
