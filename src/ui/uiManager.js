export function showLoading(show) {
    const l = document.getElementById('loading');
    const b = document.getElementById('buscar');

    l.classList.toggle('hidden', !show);
    b.disabled = show;
    b.textContent = show ? '⏳ Carregando...' : '🚀 Buscar Dados';
}

export function showError(msg) {
    const e = document.getElementById('error');
    e.textContent = msg;
    e.classList.remove('hidden');
    setTimeout(()=>e.classList.add('hidden'),10000);
}

export function showSuccess(msg) {
    const s = document.getElementById('success');
    s.textContent = msg;
    s.classList.remove('hidden');
    setTimeout(()=>s.classList.add('hidden'),5000);
}

export function hideMessages(){
    document.getElementById('error').classList.add('hidden');
    document.getElementById('success').classList.add('hidden');
}

import { SYMBOLS } from '../utils/symbols.js';

export function populateSymbolSelector(market) {
    const select = document.getElementById('symbol');
    if (!select) {
        console.error('❌ Select #symbol não encontrado');
        return;
    }

    select.innerHTML = '';

    SYMBOLS[market].forEach(item => {
        const option = document.createElement('option');
        option.value = item.value;
        option.textContent = item.label;
        select.appendChild(option);
    });

    console.log('✅ Seletor populado:', market);
}
