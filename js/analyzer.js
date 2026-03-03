/**
 * Bộ máy phân tích Bát Cực Linh Số
 * Logic được tách riêng khỏi UI
 */

class NumberAnalyzer {
    constructor() {
        this.results = {};
    }

    /**
     * Phân tích số điện thoại
     */
    analyze(phoneNumber, gender, birthYear, goal) {
        this.results = {
            phoneNumber,
            gender,
            birthYear,
            goal,
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

    /**
     * Tách cặp số
     */
    extractPairs() {
        const phone = this.results.phoneNumber.replace(/\D/g, '');
        for (let i = 0; i < phone.length - 1; i++) {
            const pair = phone.substring(i, i + 2);
            this.results.pairs.push({
                position: i + 1,
                pair: pair,
                star: null,
                type: null
            });
        }
    }

    /**
     * Phân loại sao
     */
    classifyStars() {
    this.results.pairs.forEach(pairObj => {
        let pairToCheck = pairObj.pair;
        
        // Xử lý số 0 - chuyển về Phục vị
        if (pairToCheck.includes('0')) {
            if (pairToCheck.startsWith('0')) {
                // 03, 07, 09... -> 33, 77, 99...
                const lastDigit = pairToCheck[1];
                pairToCheck = lastDigit + lastDigit;
                pairObj.hasZero = true;
                pairObj.zeroPosition = 'start';
            } else if (pairToCheck.endsWith('0')) {
                // 30, 70, 90... -> 33, 77, 99...
                const firstDigit = pairToCheck[0];
                pairToCheck = firstDigit + firstDigit;
                pairObj.hasZero = true;
                pairObj.zeroPosition = 'end';
            }
        }
        
        // Tìm sao tương ứng
        for (const [starKey, starData] of Object.entries(STAR_CONFIG)) {
            if (starData.pairs.includes(pairToCheck)) {
                pairObj.star = starData.name;
                pairObj.starKey = starKey;
                pairObj.type = starData.type;
                pairObj.meaning = starData.meaning;
                pairObj.originalPair = pairObj.pair; // Lưu cặp gốc
                pairObj.processedPair = pairToCheck; // Lưu cặp đã xử lý
                
                if (!this.results.stars[starKey]) {
                    this.results.stars[starKey] = {
                        ...starData,
                        count: 0,
                        positions: []
                    };
                }
                this.results.stars[starKey].count++;
                this.results.stars[starKey].positions.push(pairObj.position);
                break;
            }
        }
    });
}

    /**
     * Phân tích số 0 và 5
     */
    analyzeSpecialNumbers() {
        const phone = this.results.phoneNumber.replace(/\D/g, '');
        
        for (let i = 0; i < phone.length; i++) {
            if (phone[i] === '0') {
                this.results.specialNumbers.zeros.push({
                    position: i + 1,
                    context: this.getContext(phone, i)
                });
            }
            if (phone[i] === '5') {
                this.results.specialNumbers.fives.push({
                    position: i + 1,
                    context: this.getContext(phone, i)
                });
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
    }

    /**
     * Kiểm tra cảnh báo nghiêm trọng
     */
    checkCriticalWarnings() {
        const phone = this.results.phoneNumber.replace(/\D/g, '');
        
        // Check đuôi số
        CRITICAL_WARNINGS.endings.forEach(ending => {
            if (phone.endsWith(ending)) {
                this.results.criticalWarnings.push({
                    type: 'critical',
                    message: `Số đuôi ${ending}: ${ending === '05' ? 'Tứ đại giai không' : 'Công dã tràng'}`,
                    penalty: 50
                });
            }
        });

        // Check tổ hợp cấm
        CRITICAL_WARNINGS.combinations.forEach(combo => {
            if (phone.includes(combo)) {
                this.results.criticalWarnings.push({
                    type: 'warning',
                    message: `Tổ hợp ${combo}: ${ZERO_FIVE_RULES.zero.special_combinations[combo] || 'Cấm kỵ'}`,
                    penalty: 20
                });
            }
        });

        // Check quá nhiều số 0
        if (this.results.specialNumbers.zeros.length > CRITICAL_WARNINGS.maxZeros) {
            this.results.criticalWarnings.push({
                type: 'warning',
                message: `Quá nhiều số 0 (${this.results.specialNumbers.zeros.length}): Kiếm tiền rất vất vả, dễ phẫu thuật`,
                penalty: 15
            });
        }
    }

    /**
     * Tính điểm
     */
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

        // Apply penalties
        this.results.criticalWarnings.forEach(warning => {
            this.results.score -= warning.penalty;
        });

        // Ensure score between 0-100
        this.results.score = Math.max(0, Math.min(100, this.results.score));

        this.results.stats = {
            total: this.results.pairs.length,
            good: goodCount,
            bad: badCount,
            neutral: neutralCount,
            percentage: this.results.score
        };
    }

    /**
     * Tạo khuyến nghị
     */
    generateRecommendations() {
        const recs = [];

        // Based on score
        if (this.results.score >= 70) {
            recs.push({
                type: 'positive',
                title: '✅ Dãy số có năng lượng tốt',
                content: 'Dãy số của bạn có tỷ lệ cát tinh cao, mang lại nhiều may mắn. Nên duy trì sử dụng.'
            });
        } else if (this.results.score >= 50) {
            recs.push({
                type: 'neutral',
                title: '⚖️ Dãy số ở mức trung bình',
                content: 'Có cả cát và hung tinh. Cần lưu ý các điểm yếu để cải thiện.'
            });
        } else {
            recs.push({
                type: 'warning',
                title: '⚠️ Dãy số cần cải thiện',
                content: 'Tỷ lệ hung tinh cao. Nên xem xét đổi số hoặc sử dụng các biện pháp hóa giải.'
            });
        }

        // Based on critical warnings
        this.results.criticalWarnings.forEach(warning => {
            recs.push({
                type: warning.type === 'critical' ? 'critical' : 'warning',
                title: '⚠️ Cảnh Báo',
                content: warning.message
            });
        });

        // Based on stars
        if (this.results.stars['luc_sat']?.count >= 2) {
            recs.push({
                type: 'warning',
                title: '⚠️ Nhiều Lục Sát',
                content: 'Dễ có vấn đề về tình cảm, thiên đào hoa, hôn nhân không thuận. Cần Diên Niên để chế ước.'
            });
        }

        if (this.results.stars['tuyet_menh']?.count >= 2) {
            recs.push({
                type: 'warning',
                title: '⚠️ Nhiều Tuyệt Mệnh',
                content: 'Dễ phá tài, đầu tư thất bại, tính tình cực đoan. Cần Thiên Y để chế ước.'
            });
        }

        // Check interactions
        if (this.results.stars['dien_nien'] && this.results.stars['luc_sat']) {
            recs.push({
                type: 'positive',
                title: '✅ Diên Niên chế Lục Sát',
                content: 'May mắn là bạn có Diên Niên để chế ước Lục Sát, giúp ổn định tình cảm.'
            });
        }

        if (this.results.stars['thien_y'] && this.results.stars['tuyet_menh']) {
            recs.push({
                type: 'positive',
                title: '✅ Thiên Y chế Tuyệt Mệnh',
                content: 'Thiên Y giúp hóa giải tính cực đoan của Tuyệt Mệnh, giảm nguy cơ phá tài.'
            });
        }

        this.results.recommendations = recs;
    }

    /**
     * Phân tích theo mục tiêu
     */
    analyzeByGoal() {
        const goalAnalysis = {
            tailoc: { title: '💰 Tài Lộc', content: [] },
            tinhcam: { title: '❤️ Tình Cảm', content: [] },
            sunghiep: { title: '💼 Sự Nghiệp', content: [] },
            suckhoe: { title: '🍎 Sức Khỏe', content: [] }
        };

        // Tài Lộc
        if (this.results.stars['thien_y']) {
            goalAnalysis.tailoc.content.push(`✅ Có ${this.results.stars['thien_y'].count} Thiên Y - Chủ đại tài, tiền từ bát phương đến`);
        }
        if (this.results.stars['sinh_khi']) {
            goalAnalysis.tailoc.content.push(`✅ Có ${this.results.stars['sinh_khi'].count} Sinh Khí - Quý nhân mang tài, có tiền ngoài ý muốn`);
        }
        if (this.results.stars['dien_nien']) {
            goalAnalysis.tailoc.content.push(`✅ Có ${this.results.stars['dien_nien'].count} Diên Niên - Giữ tiền tốt, tính toán tỉ mỉ`);
        }
        if (this.results.stars['tuyet_menh']) {
            goalAnalysis.tailoc.content.push(`⚠️ Có ${this.results.stars['tuyet_menh'].count} Tuyệt Mệnh - Dễ phá tài, xuất tiền nhanh`);
        }
        if (this.results.specialNumbers.zeros.length > 0) {
            goalAnalysis.tailoc.content.push(`⚠️ Có ${this.results.specialNumbers.zeros.length} số 0 - Tiền tài nhất định bị moi mất`);
        }

        // Tình Cảm
        if (this.results.stars['thien_y']) {
            goalAnalysis.tinhcam.content.push(`✅ Có ${this.results.stars['thien_y'].count} Thiên Y - Chính đào hoa, dễ kết hôn, tình cảm ân ái`);
        }
        if (this.results.stars['luc_sat']) {
            goalAnalysis.tinhcam.content.push(`⚠️ Có ${this.results.stars['luc_sat'].count} Lục Sát - Thiên đào hoa, dễ ngoại tình, hôn nhân không thuận`);
        }
        if (this.results.gender === 'nu' && this.results.stars['dien_nien']) {
            const strongPairs = ['19', '91', '87', '78'];
            const hasStrong = this.results.pairs.some(p => 
                p.starKey === 'dien_nien' && strongPairs.includes(p.pair)
            );
            if (hasStrong) {
                goalAnalysis.tinhcam.content.push(`⚠️ Nữ dùng Diên Niên mạnh - Dễ khắc chồng, hôn nhân không tốt`);
            }
        }

        // Sự Nghiệp
        if (this.results.stars['dien_nien']) {
            goalAnalysis.sunghiep.content.push(`✅ Có ${this.results.stars['dien_nien'].count} Diên Niên - Năng lực lãnh đạo, có thể độc thủ một phương`);
        }
        if (this.results.stars['sinh_khi']) {
            goalAnalysis.sunghiep.content.push(`✅ Có ${this.results.stars['sinh_khi'].count} Sinh Khí - Nhiều quý nhân trợ giúp, gặp dữ hóa lành`);
        }
        if (this.results.specialNumbers.zeros.length > 0) {
            goalAnalysis.sunghiep.content.push(`⚠️ Có ${this.results.specialNumbers.zeros.length} số 0 - Sự nghiệp nhất định đình trệ`);
        }

        // Sức Khỏe
        const healthIssues = [];
        if (this.results.stars['thien_y']) healthIssues.push('Huyết áp, tuần hoàn máu');
        if (this.results.stars['dien_nien']) healthIssues.push('Vai cổ, eo, giấc ngủ, tim');
        if (this.results.stars['tuyet_menh']) healthIssues.push('Gan, thận, tiểu đường');
        if (this.results.stars['ngu_quy']) healthIssues.push('Tim, tuần hoàn máu, tai ương');
        if (this.results.stars['luc_sat']) healthIssues.push('Da, dạ dày, bệnh tinh thần');
        if (this.results.stars['hoa_hai']) healthIssues.push('Khoang miệng, khí quản, tai nạn xe');
        if (this.results.specialNumbers.zeros.length > 0) healthIssues.push('Bệnh tật phát sinh (do số 0)');

        if (healthIssues.length > 0) {
            goalAnalysis.suckhoe.content.push(`⚠️ Cần lưu ý: ${healthIssues.join(', ')}`);
        } else {
            goalAnalysis.suckhoe.content.push(`✅ Không có dấu hiệu sức khỏe đáng lo ngại`);
        }

        this.results.goalAnalysis = goalAnalysis;
    }

    /**
     * Helper functions
     */
    getContext(phone, index) {
        const start = Math.max(0, index - 2);
        const end = Math.min(phone.length, index + 3);
        return phone.substring(start, end);
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

// Export for use
const analyzer = new NumberAnalyzer();