/**
 * Cấu hình Bát Cực Linh Số
 * Dữ liệu 8 sao theo tài liệu Kim Tâm Cát
 */

const STAR_CONFIG = {
    // 4 Cát Tinh
    thien_y: {
        name: 'Thiên Y',
        type: 'good',
        pairs: ['13', '31', '68', '86', '94', '49', '72', '27'],
        element: 'Thổ',
        meaning: 'Chủ đại tài, thông minh, hôn nhân, hành văn tốt',
        personality: 'Thông minh, thiện lương, hào phóng, thích trợ giúp người, đơn thuần, không tâm cơ, dễ bị lừa',
        wealth: 'Tiền tài, chính tài, thiên tài, bát phương tài đến, dùng tiền hào phóng',
        career: 'Có thể thành đại sự, trở thành ông chủ hoặc trợ thủ đắc lực, công trạng tốt',
        love: 'Chính Đào hoa, có hiện tượng kết hôn, dễ gặp đối tượng lý tưởng, tình cảm ân ái',
        health: 'Dễ có vấn đề về huyết áp, tuần hoàn máu, bệnh tai mắt mũi',
        noble: 'Bối cảnh nhân mạch hùng hậu, trưởng bối hoặc bạn bè hay giúp đỡ'
    },
    sinh_khi: {
        name: 'Sinh Khí',
        type: 'good',
        pairs: ['14', '41', '67', '76', '93', '39', '82', '28'],
        element: 'Mộc',
        meaning: 'Quý nhân, mối quan hệ, thanh danh tốt, bằng lòng với số mệnh',
        personality: 'Lạc quan sáng sủa, nhìn thoáng, tùy duyên, không so đo, nhân duyên tốt, không có chủ kiến',
        wealth: 'Quý nhân mang tài đến, có tiền ngoài ý muốn, không giữ được tiền',
        career: 'Nhiều quý nhân trợ giúp, gặp dữ hóa lành, thích hợp làm công tác xã hội, PR',
        love: 'Không cưỡng cầu, tùy duyên, quan hệ hài hòa, hôn nhân ngọt ngào',
        health: 'Có bệnh dạ dày, tai mắt mũi, bệnh tim',
        noble: 'Quý nhân vận, bằng hữu nhiều, nhân duyên tốt'
    },
    dien_nien: {
        name: 'Diên Niên',
        type: 'good',
        pairs: ['19', '91', '87', '78', '34', '43', '26', '62'],
        element: 'Kim',
        meaning: 'Đại nam nhân, ý chí kiên định, cách cục lãnh tụ',
        personality: 'Tính trách nhiệm mạnh, chủ nghĩa đại nam tử, cố chấp, lý lẽ cứng nhắc, tâm tính lão đại',
        wealth: 'Vất vả kiếm tiền, tương đối giữ được tiền, thích tính toán tỉ mỉ',
        career: 'Có năng lực chuyên nghiệp, làm lãnh đạo, áp lực lớn, có thể một mình gánh vác',
        love: 'Một lòng chuyên chú, yêu cầu cao, chủ một nhà, không phản bội',
        health: 'Vất vả lâu ngày thành tật, bệnh vai cổ, eo, giấc ngủ không tốt, bệnh tim',
        noble: 'Mọi thứ tự thân làm, mối quan hệ đến từ sức hút cá nhân',
        femaleWarning: 'Số 19, 91, 87, 78 nữ không thể dùng do năng lượng quá mạnh dễ khắc chồng, ly hôn'
    },
    phuc_vi: {
        name: 'Phục Vị',
        type: 'neutral',
        pairs: ['11', '22', '99', '88', '77', '66', '44', '33'],
        element: 'Mộc',
        meaning: 'Vận sức chờ phát động, ngọa hổ tàng long, bị động',
        personality: 'Kiên nhẫn, nghị lực, nhưng bảo thủ, cố chấp, nội tâm không an toàn',
        wealth: 'Kiếm tiền hạnh khổ, thu nhập ổn định, tài vận thường thường',
        career: 'Gò bó theo khuôn phép, thích hợp việc ổn định, chờ đợi thời cơ',
        love: 'Không tự nguyện, không có cảm giác an toàn, hôn nhân vận không tốt',
        health: 'Bệnh về tim, não, lo nghĩ, bệnh ẩn tính',
        noble: 'Người nhà sẽ là quý nhân tốt nhất'
    },
    // 4 Hung Tinh
    tuyet_menh: {
        name: 'Tuyệt Mệnh',
        type: 'bad',
        pairs: ['12', '21', '69', '96', '48', '84', '37', '73'],
        element: 'Kim',
        meaning: 'Dám làm, lỗ mãng, liều lĩnh, không thủ tài',
        personality: 'Tâm địa thiện lương, phản ứng nhanh, dễ tin bạn, dám mạo hiểm, cực đoan',
        wealth: 'Dễ kiếm tiền nhưng không giữ được, xuất tiền nhanh, dễ phá tài',
        career: 'Làm về đầu tư, tài chính, cổ phiếu, dám liều, dễ có quyết định cảm tính',
        love: 'Dũng cảm truy cầu, năng lực hòa hợp kém, dễ ly hôn',
        health: 'Chú ý gan, thận, bệnh tiểu đường, tai nạn xe cộ',
        noble: 'Không có quý nhân, mọi thứ dựa vào chính mình'
    },
    ngu_quy: {
        name: 'Ngũ Quỷ',
        type: 'bad',
        pairs: ['18', '81', '79', '97', '36', '63', '24', '42'],
        element: 'Hỏa',
        meaning: 'Huyết quang, biến động, phá hư tình cảm, tài hoa nhưng không ổn định',
        personality: 'Thông minh, phản ứng nhanh, đa nghi, thay đổi thất thường, không dễ tin người',
        wealth: 'Buôn bán, mệnh lý tôn giáo, nhiều nợ nần, không giữ được tài',
        career: 'Thường xuyên biến động, không an phận, dễ thất nghiệp',
        love: 'Tình cảm hay thay đổi, không an phận, dễ có quan hệ tay ba, ngoại tình',
        health: 'Dễ có bệnh về tim, tuần hoàn máu, tai ương ngoài ý muốn',
        noble: 'Hay nghi ngờ, không tin người, thiếu quý nhân'
    },
    luc_sat: {
        name: 'Lục Sát',
        type: 'bad',
        pairs: ['16', '61', '47', '74', '38', '83', '29', '92'],
        element: 'Thủy',
        meaning: 'Tiền tiêu cho nữ nhân, thiên đào hoa, ưu tư, u buồn',
        personality: 'Nhân duyên tốt, am hiểu giao tế, tình cảm phong phú, nhạy cảm đa nghi, do dự',
        wealth: 'Dựa vào quan hệ nhân mạch, tiêu tiền cho gia đình, nữ nhân, không giữ được tiền',
        career: 'Quan hệ xã hội, ngoại giao, nghề phục vụ, ngành nghề nữ tính',
        love: 'Thiên Đào hoa, dễ ngoại tình, hôn nhân không thuận, dễ ly dị',
        health: 'Dễ có bệnh về da, dạ dày, u buồng chứng, nóng nảy, bệnh tự kỷ',
        noble: 'Vì tư duy mẫn cảm, đa nghi tổn thương bằng hữu nên không có vận quý nhân'
    },
    hoa_hai: {
        name: 'Họa Hại',
        type: 'bad',
        pairs: ['17', '71', '89', '98', '46', '64', '23', '32'],
        element: 'Thổ',
        meaning: 'Lấy miệng là nghiệp, cãi vã thị phi, tai nạn xe cộ',
        personality: 'Biết ăn nói, thẳng thắn, nóng tính, hay phàn nàn, dễ để tâm chuyện vụn vặt',
        wealth: 'Mở miệng là được Tài, khó giữ được tiền, dễ vì cãi vã mà phá tài',
        career: 'Làm công việc liên quan đến nói năng, nói nhiều làm ít, dễ cãi vã thị phi',
        love: 'Đầu tiên ngon ngọt, sau đó dễ cãi vã, ly hôn',
        health: 'Dễ có bệnh khoang miệng, khí quản, yết hầu, tai nạn xe cộ',
        noble: 'Không có quý nhân tương trợ, nhiều thị phi'
    }
};

// Quy tắc số 0 và 5
const ZERO_FIVE_RULES = {
    zero: {
        nature: 'Âm, ẩn tính, bị động, chờ đợi',
        warnings: [
            '0 trong sự nghiệp nhất định đình trệ',
            '0 trong tình cảm nhất định có vấn đề',
            '0 trong tiền tài nhất định bị moi mất',
            '0 trong sức khỏe nhất định có bệnh tật phát sinh',
            'Dãy số không thể quá nhiều 0',
            'Số đuôi không thể là 0'
        ],
        special_combinations: {
            '103': 'Tình cảm ẩn giấu, ngoài giá thú',
            '608': 'Ẩn tàng ly hôn',
            '102': 'Đầu tư thất bại',
            '609': 'Đầu tư thất bại',
            '806': 'Ẩn giấu tài phú, dễ bị mắc kẹt'
        }
    },
    five: {
        nature: 'Dương, nổi bật, chủ động, tăng cường',
        effects: [
            '5 nằm giữa làm tăng cường năng lượng cặp số',
            '55, 555 ở đầu/cuối kéo dài số liền kề',
            '951 = 9191, 159 = 1919 (tăng mạnh)',
            '153 = Tiền kiếm được tăng nhiều',
            '856 = Có tài phú',
            '865 = Tài phú càng ngày càng nhiều'
        ]
    }
};

// Tương tác giữa các sao
const STAR_INTERACTIONS = {
    'thien_y_tuyet_menh': 'Thiên Y chế ước Tuyệt Mệnh',
    'sinh_khi_hoa_hai': 'Sinh Khí chế ước Họa Hại',
    'dien_nien_luc_sat': 'Diên Niên chế ước Lục Sát',
    'phuc_vi_ngu_quy': 'Phục Vị chế ước Ngũ Quỷ',
    'ngu_quy_luc_sat': 'Ngũ Quỷ + Lục Sát = Hôn nhân có biến hóa',
    'ngu_quy_tuyet_menh': 'Ngũ Quỷ + Tuyệt Mệnh = Không chết cũng muốn mạng',
    'tuyet_menh_hoa_hai': 'Tuyệt Mệnh + Họa Hại = Đầu tư sẽ thất bại',
    'tuyet_menh_luc_sat': 'Tuyệt Mệnh + Lục Sát = Đào hoa khắp thiên hạ',
    'ngu_quy_hoa_hai': 'Ngũ Quỷ + Họa Hại = Âm linh khiến Tài bại (có vong, đường âm phá)'
};

// Cấm kỵ nghiêm trọng
const CRITICAL_WARNINGS = {
    endings: ['0', '05'],
    combinations: ['103', '301', '608', '806', '102', '609', '120'],
    maxZeros: 2
};