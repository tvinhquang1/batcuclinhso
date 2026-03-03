/**
 * Bộ máy phân tích Bát Cực Linh Số
 * Logic đã được kiểm tra và sửa lỗi
 */

class NumberAnalyzer {
    constructor() {
        this.results = {};
    }

    analyze(phoneNumber, gender, birthYear) {
        this.results = {
            phoneNumber,
            gender,
            birthYear,
            timestamp: new Date().toISOString(),
            pairs: [],
            stars: {},
            specialNumbers: { zeros: [], fives: [] },
            score: 50,
            recommendations: [],
            criticalWarnings: []
        };

        this.extractPairs();
        this.classifyStars();
        this.analyzeSpecialNumbers();
        this.checkCriticalWarnings();
        this.calculateScore();
        this.generateRecommendations();
        this.analyzeByGoal();

        return this.results;
    }

    extractPairs() {
        const phone = this.results.phoneNumber.replace(/\D/g, '');
        const pairs = [];
        
        for (let i = 0; i < phone.length - 1; i++) {
            const current = phone[i];
            const next = phone[i + 1];
            const pair = current + next;
            
            // Xử lý số 0 và 5
            if (current === '0' || current === '5') {
                // 0 hoặc 5 ở đầu: Phục vị của số sau
                pairs.push({
                    position: i + 1,
                    pair: next + next,
                    originalPair: pair,
                    isFuVi: true,
                    hasZero: current === '0',
                    hasFive: current === '5',
                    modifier: current === '0' ? 'hidden' : 'enhanced',
                    note: current === '0' ? 'Số 0 ở đầu - Phục vị ẩn tính' : 'Số 5 ở đầu - Phục vị tăng cường'
                });
            } else if (next === '0' || next === '5') {
                // 0 hoặc 5 ở cuối: Phục vị của số trước
                pairs.push({
                    position: i + 1,
                    pair: current + current,
                    originalPair: pair,
                    isFuVi: true,
                    hasZero: next === '0',
                    hasFive: next === '5',
                    modifier: next === '0' ? 'hidden' : 'enhanced',
                    note: next === '0' ? 'Số 0 ở cuối - Phục vị ẩn tính' : 'Số 5 ở cuối - Phục vị tăng cường'
                });
            } else {
                // Cặp số bình thường
                pairs.push({
                    position: i + 1,
                    pair: pair,
                    originalPair: pair,
                    isFuVi: false,
                    hasZero: false,
                    hasFive: false,
                    modifier: null,
                    note: null
                });
            }
        }
        
        this.results.pairs = pairs;
    }

    classifyStars() {
        this.results.pairs.forEach(pairObj => {
            let pairToCheck = pairObj.pair;
            let found = false;
            
            // Tìm sao tương ứng
            for (const [starKey, starData] of Object.entries(STAR_CONFIG)) {
                if (starData.pairs.includes(pairToCheck)) {
                    pairObj.star = starData.name;
                    pairObj.starKey = starKey;
                    pairObj.type = starData.type;
                    pairObj.meaning = starData.meaning;
                    
                    // Thêm modifier
                    if (pairObj.modifier === 'hidden') {
                        pairObj.meaning += ' ⚠️ (bị động, ẩn tính)';
                        pairObj.energyLevel = 'reduced';
                    } else if (pairObj.modifier === 'enhanced') {
                        pairObj.meaning += ' ⚡ (tăng cường năng lượng)';
                        pairObj.energyLevel = 'enhanced';
                    }
                    
                    if (!this.results.stars[starKey]) {
                        this.results.stars[starKey] = {
                            ...starData,
                            count: 0,
                            positions: []
                        };
                    }
                    this.results.stars[starKey].count++;
                    this.results.stars[starKey].positions.push(pairObj.position);
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                pairObj.star = 'Không xác định';
                pairObj.type = 'neutral';
                pairObj.meaning = 'Cặp số đặc biệt';
            }
        });
    }

    analyzeSpecialNumbers() {
        const phone = this.results.phoneNumber.replace(/\D/g, '');
        const zeroCount = (phone.match(/0/g) || []).length;
        const fiveCount = (phone.match(/5/g) || []).length;
        
        this.results.specialNumbers.zeroCount = zeroCount;
        this.results.specialNumbers.fiveCount = fiveCount;
        
        if (zeroCount >= 3) {
            this.results.criticalWarnings.push({
                type: 'warning',
                message: `Quá nhiều số 0 (${zeroCount}): Kiếm tiền rất vất vả, dễ phẫu thuật`,
                penalty: 15
            });
        }
        
        for (let i = 0; i < phone.length; i++) {
            if (phone[i] === '0') {
                if (i === phone.length - 1) {
                    this.results.criticalWarnings.push({
                        type: 'critical',
                        message: 'Số đuôi là 0: Công dã tràng',
                        penalty: 50
                    });
                }
                this.results.specialNumbers.zeros.push({ position: i + 1 });
            }
            if (phone[i] === '5') {
                this.results.specialNumbers.fives.push({ position: i + 1 });
            }
        }

        // Check special combinations
        this.results.specialNumbers.combinations = [];
        const specialCombos = Object.keys(ZERO_FIVE_RULES.zero.special_combinations);
        specialCombos.forEach(combo => {
            if (phone.includes(combo)) {
                this.results.specialNumbers.combinations.push({
                    combination: combo,
                    meaning: ZERO_FIVE_RULES.zero.special_combinations[combo],
                    positions: this.findAllOccurrences(phone, combo)
                });
            }
        });
        
        if (phone.endsWith('05')) {
            this.results.criticalWarnings.push({
                type: 'critical',
                message: 'Đuôi 05: Tứ đại giai không',
                penalty: 100
            });
        }
    }

    checkCriticalWarnings() {
        const phone = this.results.phoneNumber.replace(/\D/g, '');
        
        CRITICAL_WARNINGS.endings.forEach(ending => {
            if (phone.endsWith(ending)) {
                this.results.criticalWarnings.push({
                    type: 'critical',
                    message: `Số đuôi ${ending}`,
                    penalty: 50
                });
            }
        });

        CRITICAL_WARNINGS.combinations.forEach(combo => {
            if (phone.includes(combo)) {
                this.results.criticalWarnings.push({
                    type: 'warning',
                    message: `Tổ hợp ${combo}: ${ZERO_FIVE_RULES.zero.special_combinations[combo] || 'Cấm kỵ'}`,
                    penalty: 20
                });
            }
        });
    }

    calculateScore() {
        let goodCount = 0;
        let badCount = 0;
        let neutralCount = 0;

        Object.values(this.results.stars).forEach(star => {
            if (star.type === 'good') goodCount += star.count;
            else if (star.type === 'bad') badCount += star.count;
            else neutralCount += star.count;
        });

        const total = goodCount + badCount + neutralCount;
        if (total > 0) {
            this.results.score = Math.round(50 + (goodCount - badCount) / total * 50);
        }

        this.results.criticalWarnings.forEach(warning => {
            this.results.score -= warning.penalty;
        });

        this.results.score = Math.max(0, Math.min(100, this.results.score));

        this.results.stats = {
            total: this.results.pairs.length,
            good: goodCount,
            bad: badCount,
            neutral: neutralCount,
            percentage: this.results.score
        };
    }

    generateRecommendations() {
        const recs = [];

        if (this.results.score >= 70) {
            recs.push({
                type: 'positive',
                title: '✅ Dãy số có năng lượng tốt',
                content: 'Dãy số của bạn có tỷ lệ cát tinh cao.'
            });
        } else if (this.results.score >= 50) {
            recs.push({
                type: 'neutral',
                title: '⚖️ Dãy số ở mức trung bình',
                content: 'Có cả cát và hung tinh.'
            });
        } else {
            recs.push({
                type: 'warning',
                title: '⚠️ Dãy số cần cải thiện',
                content: 'Tỷ lệ hung tinh cao.'
            });
        }

        this.results.criticalWarnings.forEach(warning => {
            recs.push({
                type: warning.type === 'critical' ? 'critical' : 'warning',
                title: '⚠️ Cảnh Báo',
                content: warning.message
            });
        });

        this.results.recommendations = recs;
    }

    analyzeByGoal() {
        const goalAnalysis = {
            tailoc: { title: '💰 Tài Lộc', content: [] },
            tinhcam: { title: '❤️ Tình Cảm', content: [] },
            sunghiep: { title: '💼 Sự Nghiệp', content: [] },
            suckhoe: { title: '🍎 Sức Khỏe', content: [] }
        };

        // Tài Lộc
        if (this.results.stars['thien_y']) {
            goalAnalysis.tailoc.content.push(`✅ Có ${this.results.stars['thien_y'].count} Thiên Y - Chủ đại tài`);
        }
        if (this.results.stars['sinh_khi']) {
            goalAnalysis.tailoc.content.push(`✅ Có ${this.results.stars['sinh_khi'].count} Sinh Khí - Quý nhân mang tài`);
        }
        if (this.results.stars['tuyet_menh']) {
            goalAnalysis.tailoc.content.push(`⚠️ Có ${this.results.stars['tuyet_menh'].count} Tuyệt Mệnh - Dễ phá tài`);
        }
        if (this.results.specialNumbers.zeroCount > 0) {
            goalAnalysis.tailoc.content.push(`⚠️ Có ${this.results.specialNumbers.zeroCount} số 0 - Tiền tài bị moi mất`);
        }
        if (goalAnalysis.tailoc.content.length === 0) goalAnalysis.tailoc.content.push('ℹ️ Không có dấu hiệu đặc biệt');

        // Tình Cảm
        if (this.results.stars['thien_y']) {
            goalAnalysis.tinhcam.content.push(`✅ Có ${this.results.stars['thien_y'].count} Thiên Y - Chính đào hoa`);
        }
        if (this.results.stars['luc_sat']) {
            goalAnalysis.tinhcam.content.push(`⚠️ Có ${this.results.stars['luc_sat'].count} Lục Sát - Thiên đào hoa`);
        }
        if (goalAnalysis.tinhcam.content.length === 0) goalAnalysis.tinhcam.content.push('ℹ️ Không có dấu hiệu đặc biệt');

        // Sự Nghiệp
        if (this.results.stars['dien_nien']) {
            goalAnalysis.sunghiep.content.push(`✅ Có ${this.results.stars['dien_nien'].count} Diên Niên - Năng lực lãnh đạo`);
        }
        if (this.results.specialNumbers.zeroCount > 0) {
            goalAnalysis.sunghiep.content.push(`⚠️ Có ${this.results.specialNumbers.zeroCount} số 0 - Sự nghiệp đình trệ`);
        }
        if (goalAnalysis.sunghiep.content.length === 0) goalAnalysis.sunghiep.content.push('ℹ️ Không có dấu hiệu đặc biệt');

        // Sức Khỏe
        const healthIssues = [];
        if (this.results.stars['thien_y']) healthIssues.push('Huyết áp');
        if (this.results.stars['dien_nien']) healthIssues.push('Vai cổ, giấc ngủ');
        if (this.results.stars['luc_sat']) healthIssues.push('Dạ dày');
        if (this.results.specialNumbers.zeroCount > 0) healthIssues.push('Bệnh tật (do số 0)');
        
        if (healthIssues.length > 0) {
            goalAnalysis.suckhoe.content.push(`⚠️ Cần lưu ý: ${healthIssues.join(', ')}`);
        } else {
            goalAnalysis.suckhoe.content.push(`✅ Không có dấu hiệu đáng lo ngại`);
        }

        this.results.goalAnalysis = goalAnalysis;
    }

    findAllOccurrences(str, substr) {
        const positions = [];
        let pos = 0;
        while ((pos = str.indexOf(substr, pos)) !== -1) {
            positions.push(pos + 1);
            pos++;
        }
        return positions;
    }
}

const analyzer = new NumberAnalyzer();