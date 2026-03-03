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
        document.getElementById('totalStars').textContent = results.stats.total;
        document.getElementById('goodStarsCount').textContent = results.stats.good;
        document.getElementById('badStarsCount').textContent = results.stats.bad;
        document.getElementById('goodPercentage').textContent = results.stats.percentage + '%';
        document.getElementById('scoreBar').style.width = results.stats.percentage + '%';

        const pairsBody = document.getElementById('pairsTableBody');
        pairsBody.innerHTML = results.pairs.map((pair) => {
            let pairDisplay = `<strong>${pair.originalPair}</strong>`;
            if (pair.pair !== pair.originalPair && !pair.isThreeDigit) {
                pairDisplay += ` <span class="text-xs text-gray-500">→ ${pair.pair}</span>`;
            }
            if (pair.isThreeDigit) {
                pairDisplay += ` <span class="text-xs text-blue-500">(3 số)</span>`;
            }

            let energyBadge = '';
            if (pair.energyLevel === 'enhanced') {
                energyBadge = '<span class="badge" style="background: #dbeafe; color: #1e40af;">⚡ Tăng cường</span>';
            } else if (pair.energyLevel === 'super_enhanced') {
                energyBadge = '<span class="badge" style="background: #dbeafe; color: #1e40af;">⚡⚡ Siêu tăng</span>';
            } else if (pair.energyLevel === 'reduced') {
                energyBadge = '<span class="badge" style="background: #fef3c7; color: #92400e;">⚠️ Bị động</span>';
            }

            let noteDisplay = '';
            if (pair.note) {
                noteDisplay = `<div class="text-xs text-gray-500 mt-1">${pair.note}</div>`;
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
                    <td>
                        ${pair.meaning || '-'}
                        ${noteDisplay}
                    </td>
                </tr>
            `;
        }).join('');

        const specialSection = document.getElementById('specialNumbersSection');
        const specialContent = document.getElementById('specialNumbersContent');
        
        if (results.specialNumbers.zeros.length === 0 && results.specialNumbers.fives.length === 0) {
            specialSection.classList.add('hidden');
        } else {
            specialSection.classList.remove('hidden');
            let html = '';
            
            if (results.specialNumbers.zeroCount > 0) {
                html += `<div class="alert alert-warning">
                    <strong>🔴 Số 0:</strong> ${results.specialNumbers.zeroCount} số
                    <ul style="margin-top: 0.5rem; padding-left: 1.5rem;">
                        ${results.specialNumbers.zeros.map(z => `
                            <li>Vị trí ${z.position}: ${z.context || 'N/A'}</li>
                        `).join('')}
                    </ul>
                    <div style="margin-top: 0.5rem; font-size: 0.875rem;">
                        ${ZERO_FIVE_RULES.zero.warnings.slice(0, 3).map(w => `⚠️ ${w}<br>`).join('')}
                    </div>
                </div>`;
            }
            
            if (results.specialNumbers.fiveCount > 0) {
                html += `<div class="alert alert-info">
                    <strong>🟡 Số 5:</strong> ${results.specialNumbers.fiveCount} số
                    <ul style="margin-top: 0.5rem; padding-left: 1.5rem;">
                        ${results.specialNumbers.fives.map(f => `
                            <li>Vị trí ${f.position}: ${f.context || 'N/A'}</li>
                        `).join('')}
                    </ul>
                    <div style="margin-top: 0.5rem; font-size: 0.875rem;">
                        ${ZERO_FIVE_RULES.five.effects.slice(0, 2).map(e => `✨ ${e}<br>`).join('')}
                    </div>
                </div>`;
            }

            if (results.specialNumbers.combinations.length > 0) {
                html += `<div class="alert alert-danger">
                    <strong>⚠️ Tổ hợp đặc biệt:</strong>
                    <ul style="margin-top: 0.5rem; padding-left: 1.5rem;">
                        ${results.specialNumbers.combinations.map(c => `
                            <li><strong>${c.combination}</strong>: ${c.meaning} (vị trí: ${c.positions.join(', ')})</li>
                        `).join('')}
                    </ul>
                </div>`;
            }

            specialContent.innerHTML = html;
        }

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
                <div class="star-details">
                    <p>💰 <strong>Tài:</strong> ${star.wealth}</p>
                    <p>❤️ <strong>Tình:</strong> ${star.love}</p>
                    <p>🍎 <strong>Sức khỏe:</strong> ${star.health}</p>
                </div>
            </div>
        `).join('');

        const goals = ['tailoc', 'tinhcam', 'sunghiep', 'suckhoe'];
        
        goals.forEach(key => {
            const element = document.getElementById(`goal${key.charAt(0).toUpperCase() + key.slice(1)}`);
            const data = results.goalAnalysis[key];
            
            if (element && data) {
                element.innerHTML = `<ul>${data.content.map(item => `<li>${item}</li>`).join('')}</ul>`;
            }
        });

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
        alert('✅ Đã lưu vào lịch sử phân tích!');
    },

    loadHistory() {
        const historyList = document.getElementById('historyList');
        const db = JSON.parse(localStorage.getItem('bat_cuc_db') || '{"analyses":[]}');
        const history = db.analyses.slice(0, 5);

        if (history.length === 0) {
            historyList.innerHTML = '<p class="text-center">Chưa có lịch sử phân tích</p>';
            return;
        }

        historyList.innerHTML = history.map(item => `
            <div class="history-item" onclick="app.loadAnalysis('${item.timestamp}')">
                <div class="history-info">
                    <strong>📱 ${item.phoneNumber}</strong>
                    <p>${new Date(item.timestamp).toLocaleString('vi-VN')} | ${item.gender === 'nam' ? 'Nam' : 'Nữ'} | ${item.birthYear}</p>
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
        if (confirm('Bạn có chắc muốn xóa toàn bộ lịch sử phân tích?')) {
            localStorage.setItem('bat_cuc_db', JSON.stringify({ analyses: [] }));
            this.loadHistory();
            alert('✅ Đã xóa lịch sử!');
        }
    },

    copyResults() {
        if (!this.currentResults) {
            alert('⚠️ Chưa có kết quả để sao chép!');
            return;
        }

        const r = this.currentResults;
        const text = `
🔮 Bát Cực Linh Số - Phân Tích Năng Lượng Số
📱 Số điện thoại: ${r.phoneNumber}
👤 Giới tính: ${r.gender === 'nam' ? 'Nam' : 'Nữ'}
🎂 Năm sinh: ${r.birthYear}
📊 Điểm năng lượng: ${r.stats.percentage}%

📈 Thống kê:
- Tổng cặp số: ${r.stats.total}
- Cát tinh: ${r.stats.good}
- Hung tinh: ${r.stats.bad}

⚠️ Lưu ý đặc biệt:
- Số 0: ${r.specialNumbers.zeroCount}
- Số 5: ${r.specialNumbers.fiveCount}

💡 Khuyến nghị:
${r.recommendations.map(rec => `- ${rec.title}: ${rec.content}`).join('\n')}

※ Kết quả mang tính chất tham khảo theo tài liệu Bát Cực Linh Số Kim Tâm Cát
        `.trim();

        navigator.clipboard.writeText(text).then(() => {
            alert('✅ Đã sao chép kết quả vào clipboard!');
        }).catch(() => {
            alert('⚠️ Không thể sao chép. Vui lòng sao chép thủ công.');
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});