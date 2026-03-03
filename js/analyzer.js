/**
 * Bộ máy phân tích Bát Cực Linh Số
 * Logic được tách riêng khỏi UI
 * Cập nhật theo tài liệu Kim Tâm Cát
 */

class NumberAnalyzer {
    constructor() {
        this.results = {};
    }

    /**
     * Phân tích số điện thoại
     */
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

    /**
     * Tách cặp số với xử lý đặc biệt cho 0 và 5
     * Theo tài liệu: 2 số thành cục, 3 số thành tượng
     * Số 0 và 5 ở giữa sẽ kết nối số trước và sau
     */
    extractPairs() {
        const phone = this.results.phoneNumber.replace(/\D/g, '');
        const pairs = [];
        let i = 0;
        
        while (i < phone.length - 1) {
            const current = phone[i];
            const next = phone[i + 1];
            const pair = current + next;
            
            // Xử lý trường hợp đặc biệt: 3 số với 0 hoặc 5 ở giữa
            if (i < phone.length - 2) {
                const middle = phone[i + 1];
                const afterNext = phone[i + 2];
                
                // Trường hợp: A0B hoặc A5B (0 hoặc 5 ở giữa 2 số khác)
                if ((middle === '0' || middle === '5') && 
                    current !== '0' && current !== '5' && 
                    afterNext !== '0' && afterNext !== '5') {
                    
                    // Tạo cặp kết nối: A0B = AB, A5B = AB (nhưng 5 tăng cường)
                    const connectedPair = current + afterNext;
                    
                    pairs.push({
                        position: i + 1,
                        pair: connectedPair,
                        originalPair: current + middle + afterNext,
                        isFuVi: false,
                        hasZero: middle === '0',
                        hasFive: middle === '5',
                        modifier: middle === '0' ? 'hidden' : 'enhanced',
                        note: middle === '0' ? 'Số 0 ở giữa - bị động, ẩn tính' : 'Số 5 ở giữa - tăng cường năng lượng',
                        isThreeDigit: true
                    });
                    
                    i += 2; // Skip 2 vị trí (vì đã xử lý 3 số)
                    continue;
                }
            }
            
            // Xử lý số 0 hoặc 5 ở đầu cặp số
            if (current === '0' || current === '5') {
                // 0 hoặc 5 ở đầu: Tạo Phục vị với số sau
                // 06 = 66, 56 = 66
                pairs.push({
                    position: i + 1,
                    pair: next + next, // Phục vị của số sau
                    originalPair: pair,
                    isFuVi: true,
                    hasZero: current === '0',
                    hasFive: current === '5',
                    modifier: current === '0' ? 'hidden' : 'enhanced',
                    note: current === '0' ? 'Số 0 ở đầu - Phục vị ẩn tính' : 'Số 5 ở đầu - Phục vị tăng cường'
                });
                i++;
                continue;
            }
            
            // Xử lý số 0 hoặc 5 ở cuối cặp số
            if (next === '0' || next === '5') {
                // 0 hoặc 5 ở cuối: Tạo Phục vị với số trước
                // 30 = 33, 35 = 33
                pairs.push({
                    position: i + 1,
                    pair: current + current, // Phục vị của số trước
                    originalPair: pair,
                    isFuVi: true,
                    hasZero: next === '0',
                    hasFive: next === '5',
                    modifier: next === '0' ? 'hidden' : 'enhanced',
                    note: next === '0' ? 'Số 0 ở cuối - Phục vị ẩn tính' : 'Số 5 ở cuối - Phục vị tăng cường'
                });
                i++;
                continue;
            }
            
            // Trường hợp đặc biệt: 951 hoặc 159 (Diên Niên tăng mạnh)
            if (i < phone.length - 2) {
                if ((current === '9' && middle === '5' && afterNext === '1') ||
                    (current === '1' && middle === '5' && afterNext === '9')) {
                    
                    pairs.push({
                        position: i + 1,
                        pair: '91', // Diên Niên
                        originalPair: current + middle + afterNext,
                        isFuVi: false,
                        hasFive: true,
                        modifier: 'super_enhanced',
                        note: '951/159 - Diên Niên tăng mạnh gấp đôi (9191/1919)',
                        isThreeDigit: true,
                        isSpecial: true
                    });
                    
                    i += 2;
                    continue;
                }
            }
            
            // Cặp số bình thường (không có 0 hoặc 5)
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
            
            i++;
        }
        
        this.results.pairs = pairs;
    }

    /**
     * Phân loại sao với xử lý modifier
     */
    classifyStars() {
        this.results.pairs.forEach(pairObj => {
            let pairToCheck = pairObj.pair;
            
            // Tìm sao tương ứng
            for (const [starKey, starData] of Object.entries(STAR_CONFIG)) {
                if (starData.pairs.includes(pairToCheck)) {
                    pairObj.star = starData.name;
                    pairObj.starKey = starKey;
                    pairObj.type = starData.type;
                    pairObj.meaning = starData.meaning;
                    
                    // Thêm thông tin modifier
                    if (pairObj.modifier === 'hidden') {
                        pairObj.meaning += ' ⚠️ (bị động, ẩn tính)';
                        pairObj.energyLevel = 'reduced';
                    } else if (pairObj.modifier === 'enhanced') {
                        pairObj.meaning += ' ⚡ (tăng cường năng lượng)';
                        pairObj.energyLevel = 'enhanced';
                    } else if (pairObj.modifier === 'super_enhanced') {
                        pairObj.meaning += ' ⚡⚡ (tăng mạnh gấp đôi)';
                        pairObj.energyLevel = 'super_enhanced';
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
                    break;
                }
            }
            
            // Nếu không tìm thấy sao (cặp số không hợp lệ)
            if (!pairObj.star) {
                pairObj.star = 'Không xác định';
                pairObj.type = 'neutral';
                pairObj.meaning = 'Cặp số đặc biệt';
            }
        });
    }

    /**
     * Phân tích số 0 và 5
     */
    analyzeSpecialNumbers() {
        const phone = this.results.phoneNumber.replace(/\D/g, '');
        
        // Đếm số 0 và 5
        const zeroCount = (phone.match(/0/g) || []).length;
        const fiveCount = (phone.match(/5/g) || []).length;
        
        this.results.specialNumbers.zeroCount = zeroCount;
        this.results.specialNumbers.fiveCount = fiveCount;
        
        // Cảnh báo theo tài liệu
        if (zeroCount >= 3) {
            this.results.criticalWarnings.push({
                type: 'warning',
                message: `Quá nhiều số 0 (${zeroCount}): Kiếm tiền rất vất vả, dễ phẫu thuật, hao tiết nguyên khí`,
                penalty: 15
            });
        }
        
        if (zeroCount > 0 && fiveCount > 0) {
            this.results.criticalWarnings.push({
                type: 'warning',
                message: `Nhiều 0 và 5: Kiếm tiền rất vất vả (theo tài liệu)`,
                penalty: 10
            });
        }
        
        // Kiểm tra vị trí số 0
        for (let i = 0; i < phone.length; i++) {
            if (phone[i] === '0') {
                if (i === phone.length - 1) {
                    this.results.criticalWarnings.push({
                        type: 'critical',
                        message: 'Số đuôi là 0: Công dã tràng, bận bịu mà không kết quả',
                        penalty: 50
                    });
                }
                
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

        // Check special combinations với 0
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
        
        // Check tổ hợp 05 ở đuôi
        if (phone.endsWith('05')) {
            this.results.criticalWarnings.push({
                type: 'critical',
                message: 'Đuôi 05: Tứ đại giai không (tài phú không, sự nghiệp không, tình cảm không, sức khỏe không)',
                penalty: 100
            });
        }
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
        
        // Check tổ hợp Hung tinh + 0
        const hungStars = ['tuyet_menh', 'ngu_quy', 'luc_sat', 'hoa_hai'];
        this.results.pairs.forEach(pair => {
            if (hungStars.includes(pair.starKey) && pair.hasZero) {
                this.results.criticalWarnings.push({
                    type: 'warning',
                    message: `Hung tinh ${pair.star} + số 0: Năng lượng xấu bị động hóa, khó giải quyết`,
                    penalty: 10
                });
            }
        });
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

        // Bonus for enhanced good stars
        this.results.pairs.forEach(pair => {
            if (pair.type === 'good' && pair.energyLevel === 'enhanced') {
                this.results.score += 3;
            }
            if (pair.type === 'good' && pair.energyLevel === 'super_enhanced') {
                this.results.score += 5;
            }
            if (pair.type === 'bad' && pair.energyLevel === 'enhanced') {
                this.results.score -= 3;
            }
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

        // Based on 0 and 5
        if (this.results.specialNumbers.zeroCount >= 3) {
            recs.push({
                type: 'warning',
                title: '⚠️ Quá nhiều số 0',
                content: 'Theo tài liệu: "0 nhiều thể hiện thân thể dễ bị phẫu thuật, hao tiết nguyên khí, kiếm tiền rất vất vả". Nên cân nhắc đổi số.'
            });
        }

        this.results.recommendations = recs;
    }

    /**
     * Phân tích theo mục tiêu - LUÔN PHÂN TÍCH ĐỦ 4 MỤC TIÊU
     */
    analyzeByGoal() {
        const goalAnalysis = {
            tailoc: { title: '💰 Tài Lộc', content: [] },
            tinhcam: { title: '❤️ Tình Cảm', content: [] },
            sunghiep: { title: '💼 Sự Nghiệp', content: [] },
            suckhoe: { title: '🍎 Sức Khỏe', content: [] }
        };

        // --- TÀI LỘC ---
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
        if (this.results.stars['luc_sat']) {
            goalAnalysis.tailoc.content.push(`⚠️ Có ${this.results.stars['luc_sat'].count} Lục Sát - Tiêu tiền cho nữ nhân, không giữ được tiền`);
        }
        if (this.results.specialNumbers.zeroCount > 0) {
            goalAnalysis.tailoc.content.push(`⚠️ Có ${this.results.specialNumbers.zeroCount} số 0 - Tiền tài nhất định bị moi mất`);
        }
        if (goalAnalysis.tailoc.content.length === 0) goalAnalysis.tailoc.content.push('ℹ️ Không có dấu hiệu tài lộc đặc biệt');

        // --- TÌNH CẢM ---
        if (this.results.stars['thien_y']) {
            goalAnalysis.tinhcam.content.push(`✅ Có ${this.results.stars['thien_y'].count} Thiên Y - Chính đào hoa, dễ kết hôn, tình cảm ân ái`);
        }
        if (this.results.stars['luc_sat']) {
            goalAnalysis.tinhcam.content.push(`⚠️ Có ${this.results.stars['luc_sat'].count} Lục Sát - Thiên đào hoa, dễ ngoại tình, hôn nhân không thuận`);
        }
        if (this.results.gender === 'nu' && this.results.stars['dien_nien']) {
            const strongPairs = ['19', '91', '87', '78'];
            const hasStrong = this.results.pairs.some(p => p.starKey === 'dien_nien' && strongPairs.includes(p.pair));
            if (hasStrong) {
                goalAnalysis.tinhcam.content.push(`⚠️ Nữ dùng Diên Niên mạnh - Dễ khắc chồng, hôn nhân không tốt`);
            }
        }
        if (this.results.specialNumbers.combinations.some(c => ['103', '608', '301', '806'].includes(c.combination))) {
            goalAnalysis.tinhcam.content.push(`🛑 Có tổ hợp ẩn tàng ly hôn (103, 608...)`);
        }
        if (goalAnalysis.tinhcam.content.length === 0) goalAnalysis.tinhcam.content.push('ℹ️ Không có dấu hiệu tình cảm đặc biệt');

        // --- SỰ NGHIỆP ---
        if (this.results.stars['dien_nien']) {
            goalAnalysis.sunghiep.content.push(`✅ Có ${this.results.stars['dien_nien'].count} Diên Niên - Năng lực lãnh đạo, có thể độc thủ một phương`);
        }
        if (this.results.stars['sinh_khi']) {
            goalAnalysis.sunghiep.content.push(`✅ Có ${this.results.stars['sinh_khi'].count} Sinh Khí - Nhiều quý nhân trợ giúp, gặp dữ hóa lành`);
        }
        if (this.results.stars['thien_y']) {
            goalAnalysis.sunghiep.content.push(`✅ Có ${this.results.stars['thien_y'].count} Thiên Y - Có thể thành đại sự, trở thành ông chủ`);
        }
        if (this.results.stars['phuc_vi']) {
            goalAnalysis.sunghiep.content.push(`⚠️ Có ${this.results.stars['phuc_vi'].count} Phục Vị - Sự nghiệp trì trệ, chờ đợi thời cơ`);
        }
        if (this.results.specialNumbers.zeroCount > 0) {
            goalAnalysis.sunghiep.content.push(`⚠️ Có ${this.results.specialNumbers.zeroCount} số 0 - Sự nghiệp nhất định đình trệ`);
        }
        if (goalAnalysis.sunghiep.content.length === 0) goalAnalysis.sunghiep.content.push('ℹ️ Không có dấu hiệu sự nghiệp đặc biệt');

        // --- SỨC KHỎE ---
        const healthIssues = [];
        if (this.results.stars['thien_y']) healthIssues.push('Huyết áp, tuần hoàn máu');
        if (this.results.stars['dien_nien']) healthIssues.push('Vai cổ, eo, giấc ngủ, tim');
        if (this.results.stars['tuyet_menh']) healthIssues.push('Gan, thận, tiểu đường');
        if (this.results.stars['ngu_quy']) healthIssues.push('Tim, tuần hoàn máu, tai ương');
        if (this.results.stars['luc_sat']) healthIssues.push('Da, dạ dày, bệnh tinh thần');
        if (this.results.stars['hoa_hai']) healthIssues.push('Khoang miệng, khí quản, tai nạn xe');
        if (this.results.specialNumbers.zeroCount > 0) healthIssues.push('Bệnh tật phát sinh (do số 0)');

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