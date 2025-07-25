function formatText(text, format) {
    if (!format || format.trim() === '') {
        return text;
    }
    return format.replace(/%s/g, text);
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function showFinalResult(lines, selectCount, displayFormat) {
    const resultDiv = document.getElementById('result');
    
    if (selectCount === 1) {
        const randomIndex = Math.floor(Math.random() * lines.length);
        const selected = lines[randomIndex];
        const formattedText = formatText(selected, displayFormat);
        
        resultDiv.className = 'result selected';
        resultDiv.textContent = formattedText;
    } else {
        const shuffled = shuffleArray(lines);
        const selected = shuffled.slice(0, selectCount);
        
        resultDiv.className = 'result';
        resultDiv.innerHTML = selected
            .map(item => {
                const formattedText = formatText(item, displayFormat);
                return `<div class="result-item selected">${formattedText}</div>`;
            })
            .join('');
    }
    
    document.getElementById('copyButton').classList.add('show');
}

function animateRoulette(lines, selectCount, displayFormat, duration = 2000) {
    const resultDiv = document.getElementById('result');
    const startTime = Date.now();
    let animationTimeout;
    
    function updateDisplay() {
        if (selectCount === 1) {
            const randomIndex = Math.floor(Math.random() * lines.length);
            const selected = lines[randomIndex];
            const formattedText = formatText(selected, displayFormat);
            
            resultDiv.className = 'result selected roulette-animation';
            resultDiv.textContent = formattedText;
        } else {
            const shuffled = shuffleArray(lines);
            const selected = shuffled.slice(0, selectCount);
            
            resultDiv.className = 'result roulette-animation';
            resultDiv.innerHTML = selected
                .map(item => {
                    const formattedText = formatText(item, displayFormat);
                    return `<div class="result-item selected">${formattedText}</div>`;
                })
                .join('');
        }
    }
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;
        
        if (progress >= 1) {
            showFinalResult(lines, selectCount, displayFormat);
            return;
        }
        
        updateDisplay();
        
        const speed = Math.max(50, 200 * (1 - progress));
        animationTimeout = setTimeout(animate, speed);
    }
    
    animate();
}

function selectRandom() {
    const textarea = document.getElementById('names');
    const resultDiv = document.getElementById('result');
    const selectCountInput = document.getElementById('selectCount');
    const displayFormatInput = document.getElementById('displayFormat');
    const enableAnimationInput = document.getElementById('enableAnimation');
    
    const lines = textarea.value
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    
    if (lines.length === 0) {
        resultDiv.className = 'result';
        resultDiv.innerHTML = '<span class="empty-message">選択候補を入力してください</span>';
        return;
    }
    
    const selectCount = Math.min(parseInt(selectCountInput.value) || 1, lines.length);
    const displayFormat = displayFormatInput.value;
    const enableAnimation = enableAnimationInput.checked;
    
    document.getElementById('copyButton').classList.remove('show');
    
    if (enableAnimation) {
        animateRoulette(lines, selectCount, displayFormat);
    } else {
        showFinalResult(lines, selectCount, displayFormat);
    }
}

function copyResult() {
    const resultDiv = document.getElementById('result');
    const copyButton = document.getElementById('copyButton');
    
    let textToCopy = '';
    
    if (resultDiv.querySelector('.result-item')) {
        const items = resultDiv.querySelectorAll('.result-item');
        textToCopy = Array.from(items).map(item => item.textContent).join('');
    } else {
        textToCopy = resultDiv.textContent;
    }
    
    if (textToCopy && !textToCopy.includes('選択候補を入力して')) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = copyButton.textContent;
            copyButton.textContent = 'コピー済み!';
            copyButton.classList.add('copied');
            
            setTimeout(() => {
                copyButton.textContent = originalText;
                copyButton.classList.remove('copied');
            }, 2000);
        }).catch(err => {
            console.error('コピーに失敗しました:', err);
            alert('コピーに失敗しました');
        });
    }
}

function updateUrlFromInputs() {
    const textarea = document.getElementById('names');
    const selectCountInput = document.getElementById('selectCount');
    const displayFormatInput = document.getElementById('displayFormat');
    
    const lines = textarea.value
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    
    const data = {
        items: lines,
        count: parseInt(selectCountInput.value) || 1,
        format: displayFormatInput.value || '',
        animation: document.getElementById('enableAnimation').checked
    };
    
    if (lines.length > 0 || data.count !== 1 || data.format !== '') {
        const encoded = encodeURIComponent(JSON.stringify(data));
        window.location.hash = encoded;
    } else {
        window.location.hash = '';
    }
}

function loadFromUrl() {
    const hash = window.location.hash.substring(1);
    if (hash) {
        try {
            const decoded = decodeURIComponent(hash);
            let data;
            
            try {
                data = JSON.parse(decoded);
            } catch (e) {
                data = { items: decoded.split('\n'), count: 1, format: '' };
            }
            
            if (data.items && Array.isArray(data.items)) {
                document.getElementById('names').value = data.items.join('\n');
            } else if (typeof data === 'string') {
                document.getElementById('names').value = data;
            }
            
            if (data.count) {
                document.getElementById('selectCount').value = data.count;
            }
            
            if (data.format) {
                document.getElementById('displayFormat').value = data.format;
            }
            
            if (data.animation !== undefined) {
                document.getElementById('enableAnimation').checked = data.animation;
            }
        } catch (e) {
            console.error('Failed to decode URL fragment:', e);
        }
    }
}

document.getElementById('names').addEventListener('input', function() {
    updateUrlFromInputs();
});

document.getElementById('selectCount').addEventListener('input', function() {
    updateUrlFromInputs();
});

document.getElementById('displayFormat').addEventListener('input', function() {
    updateUrlFromInputs();
});

document.getElementById('enableAnimation').addEventListener('change', function() {
    updateUrlFromInputs();
});

document.getElementById('names').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        selectRandom();
    }
});

window.addEventListener('hashchange', function() {
    loadFromUrl();
});

document.getElementById('selectButton').addEventListener('click', selectRandom);

document.getElementById('copyButton').addEventListener('click', copyResult);

window.addEventListener('load', function() {
    loadFromUrl();
});