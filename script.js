'use strict';

const shiftPattern = [
    '1. Gündüz', '1. Dinlenme', '2. Gündüz', '2. Dinlenme', '3. Gündüz', '3. Dinlenme',
    '4. Gündüz', '4. Dinlenme', '5. Gündüz', '5. Dinlenme',
    '1. Gece', '1. Dinlenme', '2. Gece', '2. Dinlenme', '3. Gece', '3. Dinlenme',
    '4. Gece', '4. Dinlenme', '5. Gece', '5. Dinlenme'
];

const OFFSETS = { 1: 0, 2: 9, 3: 19, 4: 10 };

const THEME = {
    day: { name: 'Gündüz', icon: '☀️', color: 'var(--day)', bg: 'var(--day-bg)' },
    night: { name: 'Gece', icon: '🌙', color: 'var(--night)', bg: 'var(--night-bg)' },
    rest: { name: 'Dinlenme', icon: '🛡️', color: 'var(--rest)', bg: 'var(--rest-bg)' }
};

function getShiftType(idx) {
    if (idx % 2 === 1) return 'rest';
    return idx < 10 ? 'day' : 'night';
}

function getDaysDiff(targetDateStr) {
    const [y, m, d] = targetDateStr.split('-').map(Number);
    const targetUtc = Date.UTC(y, m - 1, d);
    const refUtc = Date.UTC(2026, 8, 21); // 21 Eylül 2026 (0-index: 8 = Eylül)
    return Math.round((targetUtc - refUtc) / 86400000);
}

function getGroupStatus(groupNum, daysDiff) {
    const idx = (((OFFSETS[groupNum] + daysDiff) % 20) + 20) % 20;
    return { index: idx, title: shiftPattern[idx], type: getShiftType(idx) };
}

function pad(n) {
    return String(n).padStart(2, '0');
}

function todayStr() {
    const n = new Date();
    return n.getFullYear() + '-' + pad(n.getMonth() + 1) + '-' + pad(n.getDate());
}

function addDaysStr(dateStr, n) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const t = new Date(Date.UTC(y, m - 1, d + n));
    return t.getUTCFullYear() + '-' + pad(t.getUTCMonth() + 1) + '-' + pad(t.getUTCDate());
}

function formatLong(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('tr-TR', {
        timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric', weekday: 'long'
    });
}

const state = { group: 1, date: todayStr() };
const $ = id => document.getElementById(id);

function buildSegments() {
    const seg = $('seg');
    seg.textContent = '';
    for (let g = 1; g <= 4; g++) {
        const b = document.createElement('button');
        b.className = 'pill';
        b.type = 'button';
        b.textContent = g + '. Grup';
        b.dataset.group = g;
        b.addEventListener('click', () => {
            state.group = g;
            render();
        });
        seg.appendChild(b);
    }
}

function setProgress(info) {
    const stepsEl = $('steps');
    stepsEl.textContent = '';

    const blockIndex = info.index % 10;
    const stepNum = Math.floor(blockIndex / 2) + 1;

    const t = THEME[info.type];
    if (info.type === 'rest') {
        const isAfterDay = info.index < 10;
        $('mlabel').textContent = 'Dinlenme (' + (isAfterDay ? 'Gündüz' : 'Gece') + ' sonrası)';
    } else {
        $('mlabel').textContent = t.name + ' Nöbeti';
    }

    $('mcount').textContent = stepNum + '/5';

    for (let i = 1; i <= 5; i++) {
        const s = document.createElement('div');
        s.className = 'step' + (i <= stepNum ? ' on' : '');
        stepsEl.appendChild(s);
    }
}

function nextShiftNote(info, daysDiff) {
    if (info.type !== 'rest') {
        let transitionInfo = 'Nöbet süresi: <b>12 saat</b>, ardından <b>36 saat</b> dinlenme.';
        if (info.index === 8) {
            transitionInfo = '5. Gündüz nöbeti. Bitiminde geceye geçiş için <b>48 saat</b> istirahat başlayacak.';
        } else if (info.index === 18) {
            transitionInfo = '5. Gece nöbeti. Bitiminde gündüze dönüş için <b>24 saat</b> istirahat başlayacak.';
        }
        return transitionInfo;
    }

    for (let k = 1; k <= 3; k++) {
        const nx = getGroupStatus(state.group, daysDiff + k);
        if (nx.type !== 'rest') {
            const dateStr = addDaysStr(state.date, k);
            const when = k === 1 ? 'Yarın' : formatLong(dateStr);
            let extra = '';
            if (info.index === 9) extra = ' Gündüzden geceye geçiş istirahati (<b>48 saat</b>).';
            if (info.index === 19) extra = ' Geceden gündüze geçiş istirahati (<b>24 saat</b>).';
            return 'Sonraki nöbet: <b>' + when + ' · ' + nx.title + '</b>.' + extra;
        }
    }
    return '';
}

function renderRoster(daysDiff) {
    const host = $('roster');
    host.textContent = '';
    const all = [1, 2, 3, 4].map(g => ({ g, s: getGroupStatus(g, daysDiff) }));

    const sections = [
        { type: 'day', label: 'Gündüz Ekibi (08:00 - 20:00)' },
        { type: 'night', label: 'Gece Ekibi (20:00 - 08:00)' },
        { type: 'rest', label: 'İstirahatteki Ekipler' }
    ];

    sections.forEach(sec => {
        const members = all.filter(x => x.s.type === sec.type);
        const row = document.createElement('div');
        row.className = 'row ' + sec.type + (members.some(x => x.g === state.group) ? ' sel' : '');

        const ico = document.createElement('div');
        ico.className = 'ico';
        ico.textContent = THEME[sec.type].icon;

        const body = document.createElement('div');
        const lbl = document.createElement('div');
        lbl.className = 'lbl';
        lbl.textContent = sec.label;

        const val = document.createElement('div');
        val.className = 'val';

        if (members.length === 0) {
            val.textContent = '—';
        } else {
            members.forEach(x => {
                const item = document.createElement('div');
                item.innerHTML = `<span class="group-tag">${x.g}. Grup</span> <span class="group-detail">(${x.s.title})</span>`;
                val.appendChild(item);
            });
        }

        body.appendChild(lbl);
        body.appendChild(val);
        row.appendChild(ico);
        row.appendChild(body);
        host.appendChild(row);
    });
}

function render() {
    const daysDiff = getDaysDiff(state.date);
    const info = getGroupStatus(state.group, daysDiff);
    const t = THEME[info.type];
    const result = $('result');

    document.querySelectorAll('.pill').forEach(p =>
        p.setAttribute('aria-pressed', String(Number(p.dataset.group) === state.group)));
    $('datePick').value = state.date;

    result.style.setProperty('--accent', t.color);
    result.style.setProperty('--accent-bg', t.bg);
    $('badge').textContent = t.icon + ' ' + (info.type === 'rest' ? 'İstirahat' : t.name);
    $('rdate').textContent = formatLong(state.date); $('rtitle').textContent = info.title;
    $('rgroup').textContent = state.group + '. Grup · 20 Günlük Döngüde ' + (info.index + 1) + '. Gün';

    setProgress(info);
    $('note').innerHTML = nextShiftNote(info, daysDiff);

    $('rosterDate').textContent = formatLong(state.date);
    renderRoster(daysDiff);
}

function tickClock() {
    const n = new Date();
    $('clock').textContent = pad(n.getHours()) + ':' + pad(n.getMinutes()) + ':' + pad(n.getSeconds()); $('clockDate').textContent = n.toLocaleDateString('tr-TR', {
        day: 'numeric', month: 'long', year: 'numeric', weekday: 'long'
    });
}

function init() {
    buildSegments();

    $('datePick').addEventListener('change', e => {
        if (/^\d{4}-\d{2}-\d{2}$/.test(e.target.value)) {
            state.date = e.target.value;
            render();
        } else {
            e.target.value = state.date;
        }
    });

    document.querySelectorAll('.chip').forEach(c =>
        c.addEventListener('click', () => {
            state.date = addDaysStr(todayStr(), Number(c.dataset.offset));
            render();
        }));

    tickClock();
    setInterval(tickClock, 1000);
    render();
}

init();
