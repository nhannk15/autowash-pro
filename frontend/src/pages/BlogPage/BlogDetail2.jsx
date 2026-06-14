import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import './BlogDetail.css'

// Import service images for thumbnails
import imgRuaXe from '../../assets/Service/RuaXeNgoaiThat.jpg'
import imgNoiThat from '../../assets/Service/VeSinhNoiThat.jpg'
import imgKhoangMay from '../../assets/Service/VeSinhKhoangMay.png'
import imgKhuMui from '../../assets/Service/KhuMui.png'

const relatedPosts = [
    {
        id: 1,
        title: 'Hướng dẫn tẩy ố kính ô tô: Kinh nghiệm và cách xử lý vết ố',
        date: '18/05/2026',
        image: imgRuaXe,
        link: '/blog/huong-dan-tay-o-kinh-o-to'
    },
    {
        id: 3,
        title: 'Cách chăm sóc ngoại thất ô tô tại nhà an toàn, tài mới đều làm được',
        date: '04/05/2026',
        image: imgKhoangMay,
        link: '/blog/cach-cham-soc-ngoai-that-o-to-tai-nha'
    },
    {
        id: 4,
        title: 'Các tiêu chí đánh giá trung tâm rửa xe ô tô uy tín, chất lượng cao',
        date: '28/04/2026',
        image: imgRuaXe,
        link: '/blog/tieu-chi-danh-gia-trung-tam-rua-xe-o-to'
    }
]

export default function BlogDetail2() {
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
                    <span className="blog-detail__breadcrumb-current">Bảng Giá Vệ Sinh Nội Thất Ô Tô...</span>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="blog-detail__container">
                {/* Left Column: Post Content */}
                <div className="blog-detail__content-column">
                    <article>
                        <span className="blog-detail__post-category">Bảng giá dịch vụ</span>
                        <h1 className="blog-detail__post-title">Bảng Giá Vệ Sinh Nội Thất Ô Tô Tại Nhà TPHCM Chất Lượng Cao</h1>
                        
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
                                <span>12/05/2026</span>
                            </div>
                        </div>

                        <div className="blog-detail__body">
                            <p>
                                Dọn vệ sinh nội thất ô tô luôn là công việc cần thiết để giữ cho không gian bên trong xe hơi sạch sẽ, thoáng mát, loại bỏ vi khuẩn, mùi hôi khó chịu. Hiện nay, mô hình này đang được nhiều đơn vị cung cấp thực hiện ngay tại nhà mà chủ xe không cần di chuyển đến trung tâm, rất tiện lợi, an toàn và tiết kiệm thời gian. Vậy giá <strong>dịch vụ vệ sinh nội thất ô tô tại nhà</strong> TPHCM như thế nào? Hãy cùng Car Wash Centre tìm hiểu dưới đây nhé!
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
                                    <li className="blog-detail__toc-item"><a href="#loi-ich">1. Lợi ích nổi bật khi vệ sinh nội thất tại nhà</a></li>
                                    <li className="blog-detail__toc-item"><a href="#yeu-to-gia">2. Chi phí dọn vệ sinh phụ thuộc vào yếu tố nào?</a></li>
                                    <li className="blog-detail__toc-item"><a href="#bang-gia">3. Bảng giá vệ sinh nội thất ô tô mới nhất</a></li>
                                    <li className="blog-detail__toc-item"><a href="#so-sanh">4. So sánh dịch vụ tại nhà và tại trung tâm</a></li>
                                </ol>
                            </div>

                            <h2 id="loi-ich">Lợi ích nổi bật khi sử dụng dịch vụ vệ sinh nội thất ô tô tại nhà</h2>
                            <p>
                                Khi nhắc đến việc dọn vệ sinh khoang nội thất, hầu hết chủ xe đều nghĩ đến việc phải đưa xe đến trung tâm chăm sóc Detailing. Tuy nhiên, việc di chuyển và chờ đợi tại chỗ làm tiêu tốn rất nhiều thời gian của bạn.
                            </p>

                            <div className="blog-detail__image-wrapper">
                                <img src={imgNoiThat} alt="Kỹ thuật viên đang dọn vệ sinh nội thất ô tô tại nhà" className="blog-detail__image" />
                                <span className="blog-detail__image-caption">Vệ sinh nội thất tại nhà giúp tiết kiệm thời gian đáng kể cho các chủ xe bận rộn.</span>
                            </div>

                            <p>Các ưu điểm vượt trội bao gồm:</p>
                            <ul>
                                <li><strong>Tiết kiệm thời gian di chuyển:</strong> Bạn không cần xếp hàng, chờ đợi hay mất công lái xe qua các cung đường đông đúc. Kỹ thuật viên sẽ đem máy móc đến tận hầm chung cư hoặc sân nhà bạn để thao tác.</li>
                                <li><strong>Hạn chế rủi ro va quẹt:</strong> Giữ xe cố định tại vị trí an toàn giúp loại bỏ hoàn toàn nguy cơ va chạm giao thông hoặc xước xát dọc đường.</li>
                                <li><strong>Tăng tuổi thọ chất liệu nội thất:</strong> Loại bỏ triệt để nấm mốc, vết đổ nước ngọt, cà phê, bụi dăm bám ở các kẽ ghế da, giúp bảo vệ da ghế không bị nứt nẻ, bạc màu.</li>
                            </ul>

                            <h2 id="yeu-to-gia">Chi phí dọn vệ sinh nội thất ô tô tại nhà phụ thuộc vào những yếu tố nào?</h2>
                            <p>
                                Mức phí dọn nội thất tại nhà không cố định hoàn toàn mà sẽ dao động dựa trên:
                            </p>
                            <ul>
                                <li><strong>Kích thước và phân khúc xe:</strong> Các dòng Sedan cỡ nhỏ sẽ có mức giá rẻ hơn so với các dòng SUV 5 chỗ, 7 chỗ hoặc xe bán tải cỡ lớn.</li>
                                <li><strong>Tình trạng nhiễm bẩn thực tế:</strong> Xe bị mốc nặng do ngập nước, bám mùi hôi thuốc lá nặng hoặc đổ sữa sẽ yêu cầu quy trình xử lý phức tạp cùng các loại hóa chất khử mùi chuyên dụng cao cấp hơn.</li>
                                <li><strong>Hạng mục yêu cầu:</strong> Bạn dọn cục bộ (chỉ giặt ghế da, chỉ hút bụi) hay dọn chuyên sâu toàn bộ các chi tiết cabin (trần xe, sàn xe, táp lô, khe gió điều hòa).</li>
                            </ul>

                            <h2 id="bang-gia">Bảng giá vệ sinh nội thất ô tô tại nhà TPHCM mới nhất</h2>
                            <p>
                                Dưới đây là bảng giá tham khảo chi tiết tại hệ thống Car Wash Centre áp dụng cho khu vực TPHCM:
                            </p>

                            {/* Beautiful Styling Table matching the standard blog */}
                            <div style={{overflowX: 'auto', margin: '24px 0'}}>
                                <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem', border: '1px solid #edf2f7'}}>
                                    <thead>
                                        <tr style={{backgroundColor: '#0d1b4b', color: '#ffffff'}}>
                                            <th style={{padding: '12px 16px', border: '1px solid #edf2f7', textAlign: 'left'}}>Hạng mục / Dòng xe</th>
                                            <th style={{padding: '12px 16px', border: '1px solid #edf2f7', textAlign: 'center'}}>Dòng Sedan (4 - 5 chỗ)</th>
                                            <th style={{padding: '12px 16px', border: '1px solid #edf2f7', textAlign: 'center'}}>Dòng SUV (5 chỗ)</th>
                                            <th style={{padding: '12px 16px', border: '1px solid #edf2f7', textAlign: 'center'}}>Dòng SUV / MPV (7 chỗ)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={{padding: '12px 16px', border: '1px solid #edf2f7', fontWeight: 'bold'}}>Gói hút bụi & lau dọn Basic</td>
                                            <td style={{padding: '12px 16px', border: '1px solid #edf2f7', textAlign: 'center'}}>50.000 VNĐ</td>
                                            <td style={{padding: '12px 16px', border: '1px solid #edf2f7', textAlign: 'center'}}>60.000 VNĐ</td>
                                            <td style={{padding: '12px 16px', border: '1px solid #edf2f7', textAlign: 'center'}}>70.000 VNĐ</td>
                                        </tr>
                                        <tr style={{backgroundColor: '#f7fafc'}}>
                                            <td style={{padding: '12px 16px', border: '1px solid #edf2f7', fontWeight: 'bold'}}>Gói vệ sinh chuyên sâu VIP</td>
                                            <td style={{padding: '12px 16px', border: '1px solid #edf2f7', textAlign: 'center'}}>300.000 - 1.200.000 VNĐ</td>
                                            <td style={{padding: '12px 16px', border: '1px solid #edf2f7', textAlign: 'center'}}>400.000 - 1.500.000 VNĐ</td>
                                            <td style={{padding: '12px 16px', border: '1px solid #edf2f7', textAlign: 'center'}}>500.000 - 1.800.000 VNĐ</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="blog-detail__callout">
                                🎁 <strong>Ưu đãi cực khủng:</strong> Giảm ngay đến 30% cho khách hàng đặt lịch vệ sinh chuyên sâu VIP lần đầu qua website, miễn phí công di chuyển khu vực Quận 7. Hotline tư vấn: <a href="tel:0764646416">07 64 64 64 16</a>.
                            </div>

                            <h2 id="so-sanh">So sánh vệ sinh nội thất tại nhà và tại trung tâm chăm sóc xe</h2>
                            <div style={{overflowX: 'auto', margin: '24px 0'}}>
                                <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem', border: '1px solid #edf2f7'}}>
                                    <thead>
                                        <tr style={{backgroundColor: '#edf2f7', color: '#2d3748', borderBottom: '2px solid #cbd5e0'}}>
                                            <th style={{padding: '12px 16px', border: '1px solid #edf2f7', textAlign: 'left'}}>Tiêu chí</th>
                                            <th style={{padding: '12px 16px', border: '1px solid #edf2f7', textAlign: 'left'}}>Dịch vụ tại nhà</th>
                                            <th style={{padding: '12px 16px', border: '1px solid #edf2f7', textAlign: 'left'}}>Thực hiện tại Trung tâm</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={{padding: '12px 16px', border: '1px solid #edf2f7', fontWeight: 'bold'}}>Mức độ làm sạch</td>
                                            <td style={{padding: '12px 16px', border: '1px solid #edf2f7'}}>Đạt hiệu quả đến 95%.</td>
                                            <td style={{padding: '12px 16px', border: '1px solid #edf2f7'}}>Đạt 98 - 99% nhờ máy móc cố định công suất cực lớn.</td>
                                        </tr>
                                        <tr style={{backgroundColor: '#f7fafc'}}>
                                            <td style={{padding: '12px 16px', border: '1px solid #edf2f7', fontWeight: 'bold'}}>Trang bị máy móc</td>
                                            <td style={{padding: '12px 16px', border: '1px solid #edf2f7'}}>Máy hút bụi cơ động, máy hơi nước nóng cầm tay chuyên dụng.</td>
                                            <td style={{padding: '12px 16px', border: '1px solid #edf2f7'}}>Đầy đủ cầu nâng, phòng sấy chuyên dụng, máy bắn đá CO2.</td>
                                        </tr>
                                        <tr>
                                            <td style={{padding: '12px 16px', border: '1px solid #edf2f7', fontWeight: 'bold'}}>Sự tiện lợi</td>
                                            <td style={{padding: '12px 16px', border: '1px solid #edf2f7'}}><strong>Tối đa.</strong> Bạn ở nhà nghỉ ngơi hoặc làm việc khác trong khi thi công.</td>
                                            <td style={{padding: '12px 16px', border: '1px solid #edf2f7'}}>Thấp hơn. Phải lái xe đi gửi và chờ đợi nhận lại xe.</td>
                                        </tr>
                                        <tr style={{backgroundColor: '#f7fafc'}}>
                                            <td style={{padding: '12px 16px', border: '1px solid #edf2f7', fontWeight: 'bold'}}>Chi phí</td>
                                            <td style={{padding: '12px 16px', border: '1px solid #edf2f7'}}>Tương đương tại tiệm (có thể phụ thu phí đi lại tuỳ xa gần).</td>
                                            <td style={{padding: '12px 16px', border: '1px solid #edf2f7'}}>Giá niêm yết cố định của cơ sở.</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <p style={{marginTop: '32px'}}>
                                Tóm lại, dịch vụ dọn vệ sinh nội thất xe tại nhà là giải pháp tuyệt vời cho các chủ xe mong muốn sự linh hoạt, tiết kiệm thời gian mà vẫn đảm bảo cabin được khử trùng sạch sẽ, thơm tho. Đừng ngần ngại liên hệ với Car Wash Centre để nhận sự phục vụ chu đáo nhất!
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
                        <h4 className="blog-detail__cta-title">Đặt lịch dọn nội thất</h4>
                        <p className="blog-detail__cta-desc">
                            Giữ cabin xe luôn sạch sẽ, an toàn cho hệ hô hấp. Đội ngũ Car Wash Centre sẵn sàng phục vụ tận nơi.
                        </p>
                        <Link to="/dich-vu" className="blog-detail__cta-btn">Xem Dịch Vụ</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
