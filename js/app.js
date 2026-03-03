const app = {
    currentResults: null,

    init() {
        this.bindEvents();
        this.loadHistory();
    },

    bindEvents() {
        document.getElementById('analysisForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
    },

    async handleSubmit() {
        const phoneNumber = document.getElementById('phoneNumber').value;
        const gender = document.getElementById('gender').value;
        const birthYear = document.getElementById('birthYear').value;

        if (!/^[0-9]{10,11}$/.test(phoneNumber)) {
            alert('Vui lòng nhập số điện thoại hợp lệ (10-11 số)');
            return;
        }

        document.getElementById('loadingSection').classList.remove('hidden');
        document.getElementById('resultsSection').classList.add('hidden');

        await this.animateProgress();

        const results = analyzer.analyze(phoneNumber, gender, birthYear);
        this.currentResults = results;

        this.saveToHistoryInternal(results);

        document.getElementById('loadingSection').classList.add('hidden');
        document.getElementById('resultsSection').classList.remove('hidden');

        this.renderResults(results);
        this.loadHistory();

        document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
    },

    async animateProgress() {
        const progressFill = document.getElementById('progressFill');
        for (let i = 0; i <= 100; i += 10) {
            progressFill.style.width = i + '%';
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    },

    renderResults(results) {
        // Stats
        document.getElementById('totalStars').textContent = results.stats.total;
        document.getElementById('goodStarsCount').textContent = results.stats.good;
        document.getElementById('badStarsCount').textContent = results.stats.bad;
        document.getElementById('goodPercentage').textContent = results.stats.percentage + '%';
        document.getElementById('scoreBar').style.width = results.stats.percentage + '%';

        // Pairs table
        const pairsBody = document.getElementById('pairsTableBody');
        pairsBody.innerHTML = results.pairs.map((pair) => {
            let pairDisplay = `<strong>${pair.originalPair}</strong>`;
            if (pair.pair !== pair.originalPair) {
                pairDisplay += ` <span class="text-xs text-gray-500">→ ${pair.pair}</span>`;
            }

            let energyBadge = '';
            if (pair.energyLevel === 'enhanced') {
                energyBadge = '<span class="badge" style="background: #dbeafe; color: #1e40af;">⚡ Tăng cường</span>';
            } else if (pair.energyLevel === 'reduced') {
                energyBadge = '<span class="badge" style="background: #fef3c7; color: #92400e;">⚠️ Bị động</span>';
            }

            return `
                <tr class="${pair.type === 'good' ? 'bg-green-50' : pair.type === 'bad' ? 'bg-red-50' : 'bg-yellow-50'}">
                    <td>${pair.position}</td>
                    <td>${pairDisplay}</td>
                    <td class="${pair.type === 'good' ? 'text-green-600' : pair.type === 'bad' ? 'text-red-600' : 'text-yellow-600'}">
                        ${pair.star || '-'}
                    </td>
                    <td>
                        <span class="badge ${pair.type === 'good' ? 'good' : pair.type === 'bad' ? 'bad' : ''}">
                            ${pair.type === 'good' ? 'Cát' : pair.type === 'bad' ? 'Hung' : 'Trung'}
                        </span>
                        ${energyBadge}
                    </td>
                    <td>${pair.meaning || '-'}</td>
                </tr>
            `;
        }).join('');

        // Special numbers
        const specialSection = document.getElementById('specialNumbersSection');
        const specialContent = document.getElementById('specialNumbersContent');
        
        if (results.specialNumbers.zeros.length === 0 && results.specialNumbers.fives.length === 0) {
            specialSection.classList.add('hidden');
        } else {
            specialSection.classList.remove('hidden');
            let html = '';
            
            if (results.specialNumbers.zeroCount > 0) {
                html += `<div class="alert alert-warning"><strong>🔴 Số 0:</strong> ${results.specialNumbers.zeroCount} số</div>`;
            }
            
            if (results.specialNumbers.fiveCount > 0) {
                html += `<div class="alert alert-info"><strong>🟡 Số 5:</strong> ${results.specialNumbers.fiveCount} số</div>`;
            }

            if (results.specialNumbers.combinations.length > 0) {
                html += `<div class="alert alert-danger"><strong>⚠️ Tổ hợp đặc biệt:</strong> ${results.specialNumbers.combinations.map(c => `${c.combination} (${c.meaning})`).join(', ')}</div>`;
            }

            specialContent.innerHTML = html;
        }

        // Star cards
        const starContainer = document.getElementById('starCardsContainer');
        starContainer.innerHTML = Object.values(results.stars).map(star => `
            <div class="star-card ${star.type}">
                <h3>
                    ${star.name}
                    <span class="badge ${star.type === 'good' ? 'good' : star.type === 'bad' ? 'bad' : ''}">
                        ${star.type === 'good' ? 'Cát Tinh' : star.type === 'bad' ? 'Hung Tinh' : 'Trung Tính'}
                    </span>
                </h3>
                <p><strong>Số lần:</strong> ${star.count} | <strong>Vị trí:</strong> ${star.positions.join(', ')}</p>
                <p><strong>Ý nghĩa:</strong> ${star.meaning}</p>
            </div>
        `).join('');

        // Goal analysis
        const goals = ['tailoc', 'tinhcam', 'sunghiep', 'suckhoe'];
        goals.forEach(key => {
            const element = document.getElementById(`goal${key.charAt(0).toUpperCase() + key.slice(1)}`);
            const data = results.goalAnalysis[key];
            if (element && data) {
                element.innerHTML = `<ul>${data.content.map(item => `<li>${item}</li>`).join('')}</ul>`;
            }
        });

        // Recommendations
        const recommendations = document.getElementById('recommendations');
        recommendations.innerHTML = results.recommendations.map(rec => `
            <div class="alert alert-${rec.type}">
                <strong>${rec.title}</strong>
                <p>${rec.content}</p>
            </div>
        `).join('');
    },

    saveToHistoryInternal(results) {
        const db = JSON.parse(localStorage.getItem('bat_cuc_db') || '{"analyses":[]}');
        db.analyses.unshift(results);
        localStorage.setItem('bat_cuc_db', JSON.stringify(db));
    },

    saveToHistory() {
        alert('✅ Đã lưu vào lịch sử!');
    },

    loadHistory() {
        const historyList = document.getElementById('historyList');
        const db = JSON.parse(localStorage.getItem('bat_cuc_db') || '{"analyses":[]}');
        const history = db.analyses.slice(0, 5);

        if (history.length === 0) {
            historyList.innerHTML = '<p class="text-center">Chưa có lịch sử</p>';
            return;
        }

        historyList.innerHTML = history.map(item => `
            <div class="history-item" onclick="app.loadAnalysis('${item.timestamp}')">
                <div>
                    <strong>📱 ${item.phoneNumber}</strong>
                    <p>${new Date(item.timestamp).toLocaleString('vi-VN')}</p>
                </div>
                <div class="history-score ${item.stats.percentage >= 70 ? 'good' : item.stats.percentage >= 50 ? 'neutral' : 'bad'}">
                    ${item.stats.percentage}%
                </div>
            </div>
        `).join('');
    },

    loadAnalysis(timestamp) {
        const db = JSON.parse(localStorage.getItem('bat_cuc_db') || '{"analyses":[]}');
        const analysis = db.analyses.find(a => a.timestamp === timestamp);
        if (analysis) {
            this.currentResults = analysis;
            document.getElementById('resultsSection').classList.remove('hidden');
            this.renderResults(analysis);
            document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
        }
    },

    clearHistory() {
        if (confirm('Xóa lịch sử?')) {
            localStorage.setItem('bat_cuc_db', JSON.stringify({ analyses: [] }));
            this.loadHistory();
        }
    },

    copyResults() {
        if (!this.currentResults) {
            alert('⚠️ Chưa có kết quả!');
            return;
        }

        const r = this.currentResults;
        const text = `
🔮 Bát Cực Linh Số
📱 Số: ${r.phoneNumber}
📊 Điểm: ${r.stats.percentage}%

💡 Khuyến nghị:
${r.recommendations.map(rec => `- ${rec.title}: ${rec.content}`).join('\n')}
        `.trim();

        navigator.clipboard.writeText(text).then(() => {
            alert('✅ Đã sao chép!');
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});