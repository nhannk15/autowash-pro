import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import './BlogDetail.css'

// Import service images for thumbnails and illustrations
import imgRuaXe from '../../assets/Service/RuaXeNgoaiThat.jpg'
import imgNoiThat from '../../assets/Service/VeSinhNoiThat.jpg'
import imgKhoangMay from '../../assets/Service/VeSinhKhoangMay.png'
import imgKhuMui from '../../assets/Service/KhuMui.png'
import imgBaoDuong from '../../assets/Service/BaoDuongNhanh.png'
import imgCeramic from '../../assets/Service/PhuCeramic.png'

const relatedPosts = [
    {
        id: 1,
        title: 'Hướng dẫn tẩy ố kính ô tô: Kinh nghiệm và cách xử lý vết ố',
        date: '18/05/2026',
        image: imgRuaXe,
        link: '/blog/huong-dan-tay-o-kinh-o-to'
    },
    {
        id: 2,
        title: 'Bảng Giá Vệ Sinh Nội Thất Ô Tô Tại Nhà TPHCM Chất Lượng Cao',
        date: '12/05/2026',
        image: imgNoiThat,
        link: '/blog/bang-gia-ve-sinh-noi-that-o-to-tai-nha'
    },
    {
        id: 3,
        title: 'Tác dụng vượt trội của việc khử mùi diệt khuẩn dàn lạnh ô tô',
        date: '04/05/2026',
        image: imgKhuMui,
        link: '#'
    }
]

export default function BlogDetail4() {
    // Scroll to top on page load
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [])

    return (
        <div className="blog-detail">
            {/* Breadcrumb Navigation */}
            <div className="blog-detail__breadcrumb-wrapper">
                <div className="blog-detail__breadcrumb">
                    <Link to="/" className="blog-detail__breadcrumb-link">Trang Chủ</Link>
                    <span className="blog-detail__breadcrumb-separator">&gt;</span>
                    <Link to="/blog" className="blog-detail__breadcrumb-link">Blog</Link>
                    <span className="blog-detail__breadcrumb-separator">&gt;</span>
                    <span className="blog-detail__breadcrumb-current">Tiêu chí đánh giá trung tâm...</span>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="blog-detail__container">
                {/* Left Column: Post Content */}
                <div className="blog-detail__content-column">
                    <article>
                        <span className="blog-detail__post-category">Kinh nghiệm rửa xe</span>
                        <h1 className="blog-detail__post-title">Các tiêu chí đánh giá trung tâm rửa xe ô tô uy tín, chất lượng cao</h1>
                        
                        <div className="blog-detail__post-meta">
                            <div className="blog-detail__meta-item">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style={{color: '#a0aec0'}}>
                                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A9.75 9.75 0 0112 22.5a9.75 9.75 0 01-8.314-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                                </svg>
                                <span>Đăng bởi: Car Wash Centre Team</span>
                            </div>
                            <div className="blog-detail__meta-item">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style={{color: '#a0aec0'}}>
                                    <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9H3.75v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5zm-15-3h15V7.5a1.5 1.5 0 00-1.5-1.5H5.25A1.5 1.5 0 003.75 7.5v.75z" clipRule="evenodd" />
                                </svg>
                                <span>20/08/2023</span>
                            </div>
                        </div>

                        <div className="blog-detail__body">
                            <p>
                                <strong>Dịch vụ rửa xe đúng cách</strong> hay rửa xe hơi cao cấp là những khái niệm rất quen thuộc với nhiều chủ xe hiện nay. Tuy nhiên, nhiều người vẫn còn mơ hồ chưa biết rõ sự khác biệt với rửa xe hơi truyền thống ra sao. Cũng vì điều này, nhiều trung tâm Detailing kém chất lượng lợi dụng sự thiếu hiểu biết của khách hàng mà cung cấp các dịch vụ rửa xe ô tô kém chất lượng, không đáng với số tiền bỏ ra.
                            </p>
                            <p>
                                Trong bài viết này, <strong>Car Wash Centre</strong> sẽ giúp bạn nhận biết trung tâm rửa xe ô tô uy tín thông qua các tiêu chí đánh giá khách quan nhất. Từ đó, bạn có thể dễ dàng kiểm tra, phân biệt và phòng tránh những trung tâm rửa xe hơi "fake" trên địa bàn.
                            </p>

                            {/* Table of Contents Box */}
                            <div className="blog-detail__toc">
                                <div className="blog-detail__toc-title">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18" style={{color: '#f5a623'}}>
                                        <path fillRule="evenodd" d="M2.625 6A3.375 3.375 0 016 2.625h12A3.375 3.375 0 0121.375 6v12A3.375 3.375 0 0118 21.375H6A3.375 3.375 0 012.625 18V6zm3 3.375a.75.75 0 01.75-.75h11.25a.75.75 0 010 1.5H6.375a.75.75 0 01-.75-.75zM6 12a.75.75 0 000 1.5h12a.75.75 0 000-1.5H6zm-.375 3.75a.75.75 0 01.75-.75h11.25a.75.75 0 010 1.5H6.375a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                                    </svg>
                                    <span>Mục lục nội dung</span>
                                </div>
                                <ol className="blog-detail__toc-list">
                                    <li className="blog-detail__toc-item"><a href="#phuong-phap">1. Phương pháp rửa xe ô tô đúng cách (3 xô)</a></li>
                                    <li className="blog-detail__toc-item"><a href="#dung-dich">2. Sử dụng dung dịch rửa xe ô tô an toàn</a></li>
                                    <li className="blog-detail__toc-item"><a href="#ky-thuat">3. Kỹ thuật rửa xe hơi đạt tiêu chuẩn</a></li>
                                    <li className="blog-detail__toc-item"><a href="#dung-cu">4. Dụng cụ rửa xe hơi chất lượng cao</a></li>
                                    <li className="blog-detail__toc-item"><a href="#quy-trinh">5. Quy trình rửa xe ô tô tiêu chuẩn 8 bước</a></li>
                                    <li className="blog-detail__toc-item"><a href="#thoi-gian">6. Thời gian rửa vệ sinh xe nhanh chóng và hợp lý</a></li>
                                    <li className="blog-detail__toc-item"><a href="#gia-ca">7. Bảng giá dịch vụ rửa xe ô tô tham khảo</a></li>
                                    <li className="blog-detail__toc-item"><a href="#danh-gia">8. Đánh giá khách quan từ cộng đồng khách hàng</a></li>
                                    <li className="blog-detail__toc-item"><a href="#gioi-thieu">9. Car Wash Centre - Chuyên dịch vụ rửa xe Quận 7</a></li>
                                </ol>
                            </div>

                            {/* Section 1 */}
                            <h2 id="phuong-phap">1. Phương pháp rửa xe ô tô đúng cách (3 xô)</h2>
                            <p>
                                Có rất nhiều chủ xe phản ánh hiện nay có một số trung tâm rửa xe ô tô không đúng cách, khiến một số chi tiết trên xe bị bong tróc, trầy xước sau khi rửa. Điển hình là việc xịt rửa nước áp lực cao không đúng khoảng cách hoặc sử dụng chung một chiếc khăn để lau toàn bộ xe.
                            </p>
                            <p>
                                <strong>Phương pháp rửa xe ô tô đúng cách</strong> là sử dụng kỹ thuật rửa xe từ 3 xô riêng biệt:
                            </p>
                            <ul>
                                <li><strong>Xô 1:</strong> Chứa xà phòng rửa xe chuyên dụng dành riêng cho phần thân và sơn xe phía trên.</li>
                                <li><strong>Xô 2:</strong> Chứa nước sạch để giặt xả và rũ sạch cát bẩn trên găng tay rửa trước khi nhúng lại vào xô xà phòng.</li>
                                <li><strong>Xô 3:</strong> Chứa dung dịch rửa dành riêng cho mâm lốp, hốc bánh xe - nơi bám nhiều bụi sắt mạt phanh và cát đá nhất.</li>
                            </ul>
                            <p>
                                Việc tách biệt xô và khăn rửa mâm lốp khỏi sơn xe giúp triệt tiêu hoàn toàn nguy cơ cát bám kéo lê trên bề mặt sơn, ngăn ngừa hình thành các vết xước xoáy mất thẩm mỹ.
                            </p>

                            <div className="blog-detail__image-wrapper">
                                <img src={imgRuaXe} alt="Phương pháp rửa xe ô tô 3 xô chuẩn Detailing tại Car Wash Centre" className="blog-detail__image" />
                                <span className="blog-detail__image-caption">Sử dụng phương pháp 3 xô có lưới lọc cát giúp giảm thiểu 99% vết trầy xước xoáy trên bề mặt sơn.</span>
                            </div>

                            {/* Section 2 */}
                            <h2 id="dung-dich">2. Sử dụng dung dịch rửa xe ô tô an toàn</h2>
                            <p>
                                Một trong những tiêu chí đánh giá quan trọng nhất là loại hóa chất rửa xe được sử dụng. Rất nhiều tiệm rửa xe truyền thống dùng nước rửa chén, xà phòng giặt hoặc hóa chất độ kiềm (pH) cao để đánh bay vết bẩn siêu tốc. Chất tẩy rửa mạnh chứa nhiều kiềm/axit tự do sẽ làm mất độ bóng của sơn, ăn mòn lớp phủ Ceramic bảo vệ và làm mục ruỗng các chi tiết gioăng cao su, viền mạ crom.
                            </p>
                            <p>
                                Một trung tâm uy tín luôn ưu tiên sử dụng <strong>xà phòng trung tính (độ pH = 7)</strong> từ các thương hiệu hàng đầu như Sonax, 3M, CWC LAVA... giúp làm mềm cặn bẩn một cách an toàn mà vẫn giữ nguyên độ sâu bóng tự nhiên của sơn xe.
                            </p>
                            <p>
                                Đặc biệt đối với các xe đã phủ bảo vệ Ceramic, việc dùng dung dịch rửa xe trung tính là bắt buộc để duy trì độ bền và hiệu ứng kháng nước của lớp phủ.
                            </p>

                            <div className="blog-detail__image-wrapper">
                                <img src={imgCeramic} alt="Phủ Ceramic và rửa xe bằng dung dịch trung tính pH=7" className="blog-detail__image" />
                                <span className="blog-detail__image-caption">Dung dịch trung tính bảo vệ lớp phủ Ceramic và sơn xe tối ưu.</span>
                            </div>

                            {/* Section 3 */}
                            <h2 id="ky-thuat">3. Kỹ thuật rửa xe hơi đạt tiêu chuẩn</h2>
                            <p>
                                Kỹ thuật của thợ rửa xe quyết định trực tiếp tới độ an toàn của chiếc xe. Những dấu hiệu nhận biết thợ rửa xe kém chuyên nghiệp cần tránh:
                            </p>
                            <ol>
                                <li>
                                    <strong>Điều chỉnh áp lực nước quá cao & quá gần:</strong> Khoảng cách tối thiểu của vòi xịt áp lực cao đến sơn xe phải là 25cm. Để vòi xịt quá gần hoặc áp lực vượt quá 100 bar (1450 PSI) có thể làm bong tróc sơn, hư hỏng các mép cảm biến và nứt vỡ thanh mạ crom nhạy cảm.
                                </li>
                                <li>
                                    <strong>Xịt rửa thô sai cách:</strong> Không dùng vòi xịt áp lực cao xịt thẳng trực tiếp vào xe khi còn đầy cát đất bám dày. Áp lực nước lớn sẽ đẩy cát ma sát mạnh lên sơn xe gây xước dăm. Quy trình chuẩn yêu cầu phun sương làm mềm bùn đất bằng áp lực nhẹ trước.
                                </li>
                                <li>
                                    <strong>Lau khăn không đúng chiều:</strong> Thợ chuyên nghiệp lau khăn theo đường thẳng (ngang hoặc dọc), tuyệt đối không chà xát theo vòng tròn vì chuyển động tròn cực kỳ dễ để lại các vết xước mạng nhện xoáy tròn dưới ánh nắng.
                                </li>
                                <li>
                                    <strong>Sử dụng quá nhiều lực tay:</strong> Dùng sức tì đè mạnh để cố đánh bay nhựa đường, nhựa cây hoặc phân chim bám cứng. Thay vào đó, cần dùng dung dịch chuyên dụng hóa mềm cặn bẩn để lau nhẹ nhàng.
                                </li>
                                <li>
                                    <strong>Rửa khoang máy cẩu thả:</strong> Rửa máy mà không bịt kín che chắn các chi tiết nhạy cảm (hộp cầu chì, máy phát điện, họng gió, các giắc cắm điện) có thể làm chập cháy hệ thống điện hoặc gây khó nổ động cơ sau khi rửa.
                                </li>
                            </ol>

                            <div className="blog-detail__image-wrapper">
                                <img src={imgKhoangMay} alt="Vệ sinh khoang máy ô tô che chắn cẩn thận" className="blog-detail__image" />
                                <span className="blog-detail__image-caption">Kỹ thuật vệ sinh khoang máy đòi hỏi che chắn tỉ mỉ hệ thống điện quan trọng.</span>
                            </div>

                            {/* Section 4 */}
                            <h2 id="dung-cu">4. Dụng cụ rửa xe hơi chất lượng cao</h2>
                            <p>
                                Một trung tâm Detailing chất lượng cao được đầu tư bài bản về mặt dụng cụ chuyên nghiệp:
                            </p>
                            <ul>
                                <li>
                                    <strong>Khăn lau khô Microfiber chuyên dụng:</strong> Khăn làm từ sợi Microfiber siêu mịn (mỏng bằng 1/100 sợi tóc), có khả năng thấm hút nước vượt trội gấp 7 lần trọng lượng khăn và hoàn toàn không để lại tơ sợi, không gây xước sơn. Khăn luôn được phân loại theo màu để lau các vị trí khác nhau (sơn, kính, mâm, nội thất).
                                </li>
                                <li>
                                    <strong>Găng tay rửa xe lông cừu/Microfiber mềm:</strong> Thay thế cho bọt biển truyền thống (bọt biển giữ cát ở bề mặt và chà xát lên sơn). Các sợi lông mềm của găng tay giữ hạt cát sâu bên trong, cách ly khỏi sơn xe trong suốt quá trình lau.
                                </li>
                                <li>
                                    <strong>Bàn chải cọ mâm lông thú lông mềm:</strong> Dành riêng cho mâm lốp và các khe kẽ khuất, tránh dùng bàn chải nhựa lông cứng chà lên bề mặt mâm vì sẽ gây xước và mờ lớp sơn mâm xe.
                                </li>
                                <li>
                                    <strong>Cầu nâng 1 trụ chuyên dụng:</strong> Cho phép nâng hạ xe để xịt rửa triệt để bùn đất bám chặt dưới gầm xe, hệ thống treo và hốc bánh xe - nơi dễ bị rỉ sét do muối và bùn đất đọng lại lâu ngày.
                                </li>
                                <li>
                                    <strong>Xô rửa xe có Grit Guard (lưới lọc cát):</strong> Tấm lưới nhựa đặt ở đáy xô giúp ngăn cản bụi cát chìm xuống đáy không bị khuấy động nổi lên trên, giữ găng tay rửa xe luôn sạch sẽ.
                                </li>
                            </ul>

                            {/* Section 5 */}
                            <h2 id="quy-trinh">5. Quy trình rửa xe ô tô tiêu chuẩn 8 bước</h2>
                            <p>
                                Tại <strong>Car Wash Centre</strong>, xe của bạn sẽ được chăm sóc qua 8 bước tiêu chuẩn Detailing Châu Âu nghiêm ngặt:
                            </p>
                            <div className="blog-detail__step-box">
                                <p><strong>Bước 1: Tiếp nhận & Kiểm tra:</strong> Đánh giá tình trạng bề mặt sơn, kính và nội thất. Lưu ý các chi tiết hư tổn để tránh va chạm mạnh.</p>
                                <p><strong>Bước 2: Xịt rửa sơ bộ (Pre-wash):</strong> Phun sương nước làm mềm vết bẩn thô và giặt sạch thảm lót chân cabin.</p>
                                <p><strong>Bước 3: Khử nhiễm chất bẩn bề mặt:</strong> Phun dung dịch tẩy rửa chuyên dụng loại bỏ nhựa đường bám, mạt sắt phanh trên thân xe.</p>
                                <p><strong>Bước 4: Vệ sinh gầm xe:</strong> Nâng cầu nâng, xịt rửa gầm xe bằng áp lực nước phù hợp loại bỏ muối mặn và sình lầy bám dưới gầm.</p>
                                <p><strong>Bước 5: Rửa mâm lốp, hốc bánh:</strong> Cọ rửa sạch sẽ các kẽ mâm, lòng bánh xe bằng cọ chuyên dụng lông mềm và dung dịch riêng.</p>
                                <p><strong>Bước 6: Rửa thân xe bằng phương pháp 3 xô:</strong> Dùng găng tay lông cừu lau rửa thân xe từ trên xuống dưới bằng dung dịch trung tính.</p>
                                <p><strong>Bước 7: Làm khô & Dưỡng bề mặt:</strong> Xì khô nước đọng ở các khe kẽ bằng súng hơi cầm tay, lau khô bằng khăn Microfiber siêu mịn và quét dưỡng bóng bảo vệ lốp xe.</p>
                                <p><strong>Bước 8: Vệ sinh nội thất cơ bản:</strong> Hút bụi sàn xe, ghế ngồi và lau sạch bảng điều khiển taplo, kính trong xe trước khi bàn giao.</p>
                            </div>

                            {/* Section 6 */}
                            <h2 id="thoi-gian">6. Thời gian rửa vệ sinh xe nhanh chóng và hợp lý</h2>
                            <p>
                                Thời gian rửa xe cần tương xứng với độ tỉ mỉ. Nếu một tiệm rửa xe quá nhanh (chỉ 10-15 phút) thì chắc chắn nhiều bước cọ rửa chi tiết bị bỏ qua. Ngược lại, nếu quá lâu cũng gây phiền hà cho lịch trình của khách hàng.
                            </p>
                            <p>
                                Mốc thời gian tiêu chuẩn để hoàn thành rửa toàn bộ xe (chưa tính rửa gầm chuyên sâu):
                            </p>
                            <ul>
                                <li><strong>Rửa xe bọt tuyết chuẩn:</strong> 30 - 40 phút (yêu cầu phối hợp 3-4 kỹ thuật viên chuyên nghiệp trên 1 cầu rửa).</li>
                                <li><strong>Rửa xe không chạm nhanh:</strong> 25 - 35 phút.</li>
                                <li><strong>Rửa xe công nghệ Rinseless Wash (Chăm sóc xe tại nhà):</strong> 20 - 30 phút.</li>
                            </ul>

                            {/* Section 7 */}
                            <h2 id="gia-ca">7. Bảng giá dịch vụ rửa xe ô tô tham khảo</h2>
                            <p>
                                Giá cả phản ánh trực tiếp chất lượng dung dịch hóa chất và trang thiết bị đầu tư. Mức giá dịch vụ rửa xe ô tô hợp lý trên thị trường được chia theo công nghệ:
                            </p>

                            <table className="blog-detail__table">
                                <thead>
                                    <tr>
                                        <th>Loại hình dịch vụ rửa xe</th>
                                        <th>Phân khúc giá tham khảo (VNĐ)</th>
                                        <th>Đặc tính dịch vụ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><strong>Rửa xe bọt tuyết truyền thống</strong></td>
                                        <td>60.000 - 90.000 / lượt</td>
                                        <td>Làm sạch nhanh, dễ xước sơn nếu xô không có lưới lọc cát.</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Rửa xe không chạm cao cấp</strong></td>
                                        <td>80.000 - 120.000 / lượt</td>
                                        <td>Tránh xước dăm tối đa, dùng hóa chất trung tính để dưỡng sơn.</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Dịch vụ rửa xe tại nhà (Rinseless)</strong></td>
                                        <td>90.000 - 130.000 / lượt</td>
                                        <td>Tiết kiệm thời gian, dùng dung dịch Polymer cao cấp bảo vệ Ceramic.</td>
                                    </tr>
                                </tbody>
                            </table>
                            <p>
                                Nếu một nơi có mức giá quá thấp, bạn cần hỏi kỹ về nguồn gốc hóa chất rửa để tránh các loại nước rửa pha xút rẻ tiền làm hỏng lớp sơn xe theo thời gian.
                            </p>

                            {/* Section 8 */}
                            <h2 id="danh-gia">8. Đánh giá khách quan từ cộng đồng khách hàng</h2>
                            <p>
                                Trước khi chọn gửi gắm xế cưng, bạn nên tham khảo ý kiến đánh giá từ những khách hàng đi trước trên các nền tảng mạng xã hội và bản đồ số:
                            </p>
                            <ul>
                                <li><strong>Google Maps & Google Reviews:</strong> Điểm số đánh giá từ 4.5/5 trở lên với hàng trăm bình luận thực tế là bảo chứng tốt nhất cho chất lượng.</li>
                                <li><strong>Facebook Fanpage:</strong> Xem các bài viết, video quy trình rửa thực tế tại xưởng và các phản hồi tại phần đánh giá trang.</li>
                            </ul>
                            <p>
                                Tại <strong>Car Wash Centre</strong> và thương hiệu mẹ <strong>Vietnam Car Care</strong>, chúng tôi tự hào nhận được hàng ngàn đánh giá 5 sao từ cộng đồng chủ xe tại khu vực TP.HCM nhờ thái độ phục vụ tận tâm và chất lượng kỹ thuật vượt trội.
                            </p>

                            {/* Section 9 */}
                            <h2 id="gioi-thieu">9. Car Wash Centre - Chuyên dịch vụ rửa xe Quận 7</h2>
                            <p>
                                Tự hào là đơn vị tiên phong áp dụng quy trình rửa xe đúng cách chuẩn Detailing Châu Âu, <strong>Car Wash Centre</strong> luôn nỗ lực đem lại trải nghiệm hoàn mỹ nhất cho xế cưng của bạn. Bên cạnh dịch vụ rửa xe tại trung tâm, chúng tôi còn cung cấp hệ sinh thái dịch vụ chăm sóc xe tại nhà toàn diện:
                            </p>
                            <ul>
                                <li>Vệ sinh khoang máy chuyên sâu bằng hơi nước nóng.</li>
                                <li>Dọn dẹp vệ sinh nội thất ô tô chi tiết, khử trùng diệt khuẩn.</li>
                                <li>Khử mùi diệt khuẩn dàn lạnh điều hòa bằng công nghệ nội soi.</li>
                                <li>Tẩy ố kính, tẩy bụi sơn, nhựa đường và đánh bóng sơn xe chuyên nghiệp.</li>
                                <li>Bảo dưỡng định kỳ nhanh tại nhà.</li>
                            </ul>

                            <div className="blog-detail__callout">
                                <strong>Thông tin liên hệ đặt lịch chăm sóc:</strong>
                                <br />
                                📍 <strong>Địa chỉ:</strong> Số 1A Đường Phú Thuận, phường Phú Thuận, Quận 7, TP. HCM (Gần Phú Mỹ Hưng)
                                <br />
                                📞 <strong>Hotline trung tâm:</strong> 0784 7676 79 / 0911 811 247
                                <br />
                                📱 <strong>Hotline dịch vụ tại nhà:</strong> 07 64 64 64 16
                            </div>

                            <p style={{marginTop: '32px'}}>
                                Việc sáng suốt lựa chọn một trung tâm chăm sóc xe uy tín, chất lượng sẽ bảo vệ tài sản của bạn lâu dài. Hãy là người chủ xe thông thái khi lựa chọn dịch vụ rửa xe cho chiếc xế cưng của mình!
                            </p>
                        </div>
                    </article>

                    {/* Back Button */}
                    <Link to="/blog" className="blog-detail__back-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                            <path fillRule="evenodd" d="M11.03 3.97a.75.75 0 010 1.06l-6.22 6.22H21a.75.75 0 010 1.5H4.81l6.22 6.22a.75.75 0 11-1.06 1.06l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 011.06 0z" clipRule="evenodd" />
                        </svg>
                        <span>Quay lại Blog</span>
                    </Link>
                </div>

                {/* Right Column: Sidebar */}
                <div className="blog-detail__sidebar">
                    {/* Related Posts Widget */}
                    <div className="blog-detail__widget">
                        <h4 className="blog-detail__widget-title">Bài viết liên quan</h4>
                        <div className="blog-detail__related-list">
                            {relatedPosts.map((post) => (
                                <Link to={post.link} key={post.id} className="blog-detail__related-item">
                                    <img src={post.image} alt={post.title} className="blog-detail__related-img" />
                                    <div className="blog-detail__related-info">
                                        <h5 className="blog-detail__related-post-title">{post.title}</h5>
                                        <span className="blog-detail__related-post-date">{post.date}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Booking CTA Widget */}
                    <div className="blog-detail__widget blog-detail__cta-widget">
                        <h4 className="blog-detail__cta-title">Đặt lịch rửa xe cao cấp</h4>
                        <p className="blog-detail__cta-desc">
                            Bảo vệ bề mặt sơn xe, hạn chế tối đa trầy xước xoáy với quy trình rửa xe 3 xô tiêu chuẩn Châu Âu tại nhà.
                        </p>
                        <Link to="/dich-vu" className="blog-detail__cta-btn">Xem Dịch Vụ</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
