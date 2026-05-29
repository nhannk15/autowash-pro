import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import './BlogDetail.css'

// Import service images for thumbnails and illustrations
import imgRuaXe from '../../assets/Service/RuaXeNgoaiThat.jpg'
import imgNoiThat from '../../assets/Service/VeSinhNoiThat.jpg'
import imgKhoangMay from '../../assets/Service/VeSinhKhoangMay.png'
import imgKhuMui from '../../assets/Service/KhuMui.png'
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
        id: 4,
        title: 'Các tiêu chí đánh giá trung tâm rửa xe ô tô uy tín, chất lượng cao',
        date: '28/04/2026',
        image: imgKhoangMay,
        link: '/blog/tieu-chi-danh-gia-trung-tam-rua-xe-o-to'
    }
]

export default function BlogDetail3() {
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
                    <span className="blog-detail__breadcrumb-current">Cách chăm sóc ngoại thất ô tô...</span>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="blog-detail__container">
                {/* Left Column: Post Content */}
                <div className="blog-detail__content-column">
                    <article>
                        <span className="blog-detail__post-category">Chăm sóc ngoại thất</span>
                        <h1 className="blog-detail__post-title">Cách chăm sóc ngoại thất ô tô tại nhà an toàn, tài mới đều làm được</h1>
                        
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
                                <span>01/08/2023</span>
                            </div>
                        </div>

                        <div className="blog-detail__body">
                            <p>
                                Khi nhắc đến <strong>"tự chăm sóc ngoại thất ô tô tại nhà"</strong>, hầu hết các chủ xe sẽ nghĩ ngay đến phương pháp rửa xe truyền thống là chiếc xe sẽ sạch bóng. Tuy nhiên, ngoài rửa xe, có rất nhiều chi tiết bên ngoài xe cần được chăm sóc đặc biệt. Bởi vì không có chi tiết nào trên ô tô bền vững theo thời gian nếu không được bảo dưỡng đúng cách.
                            </p>
                            <p>
                                Trong bài viết này, <strong>Car Wash Centre</strong> sẽ hướng dẫn bạn cách tự chăm sóc ngoại thất ô tô tại nhà một cách an toàn, sạch keng, giúp giữ gìn giá trị xe lâu dài nhất.
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
                                    <li className="blog-detail__toc-item"><a href="#khac-biet">1. Chăm sóc ngoại thất tại nhà có khác trung tâm Detailing?</a></li>
                                    <li className="blog-detail__toc-item"><a href="#co-the-tu-lam">2. Có thể tự chăm sóc vệ sinh ngoại thất tại nhà không?</a></li>
                                    <li className="blog-detail__toc-item"><a href="#thu-tu">3. Nên chăm sóc ngoại thất hay nội thất ô tô trước?</a></li>
                                    <li className="blog-detail__toc-item"><a href="#bo-phan-luu-y">4. Những bộ phận cần lưu ý khi chăm sóc ngoại thất</a></li>
                                    <li className="blog-detail__toc-item"><a href="#chuan-bi">5. Chăm sóc ngoại thất tại nhà cần chuẩn bị dụng cụ gì?</a></li>
                                    <li className="blog-detail__toc-item"><a href="#cac-buoc">6. Các bước chăm sóc ngoại thất tại nhà đúng cách, sạch keng</a></li>
                                    <li className="blog-detail__toc-item"><a href="#tan-suat">7. Nên chăm sóc ngoại thất xe hơi tại nhà bao lâu một lần?</a></li>
                                    <li className="blog-detail__toc-item"><a href="#dich-vu-cwc">8. Dịch vụ chăm sóc xe tại nhà toàn diện của Car Wash Centre</a></li>
                                </ol>
                            </div>

                            {/* Section 1 */}
                            <h2 id="khac-biet">1. Chăm sóc ngoại thất tại nhà có khác trung tâm Detailing?</h2>
                            <p>
                                Chăm sóc ngoại thất ô tô tại nhà chắc chắn có phần hạn chế hơn so với làm tại các trung tâm Detailing chuyên nghiệp. Tại các trung tâm, xe được vệ sinh sâu nhờ các máy móc chuyên dụng và đội ngũ kỹ thuật viên thạo nghề.
                            </p>
                            <p>
                                Tuy nhiên, tự chăm sóc tại nhà mang lại sự chủ động và tiết kiệm chi phí rất nhiều. Sự khác biệt chủ yếu nằm ở:
                            </p>
                            <ul>
                                <li><strong>Hạng mục chăm sóc:</strong> Tại nhà khó làm sạch sâu gầm xe, các khe kẽ phức tạp hay vệ sinh khoang máy tỉ mỉ.</li>
                                <li><strong>Thời gian thực hiện:</strong> Tại nhà linh hoạt hơn, bạn có thể chia nhỏ thời gian làm từng bộ phận mà không cần chờ đợi.</li>
                                <li><strong>Thiết bị & Dung dịch:</strong> Trung tâm có cầu nâng, máy xịt cao áp lọc ion nước, súng hơi nóng. Tại nhà chủ yếu dùng áp lực nước máy thông thường và cọ tay.</li>
                                <li><strong>Giá thành:</strong> Chi phí tự mua dụng cụ dưỡng xe tại nhà dùng trong cả năm chỉ bằng một vài lần đem xe đến trung tâm.</li>
                            </ul>

                            <div className="blog-detail__image-wrapper">
                                <img src={imgRuaXe} alt="Rửa xe đúng cách tại nhà" className="blog-detail__image" />
                                <span className="blog-detail__image-caption">Chăm sóc ngoại thất tại nhà giúp chủ xe chủ động giữ gìn giá trị xe.</span>
                            </div>

                            {/* Section 2 */}
                            <h2 id="co-the-tu-lam">2. Có thể tự chăm sóc vệ sinh ngoại thất tại nhà không?</h2>
                            <p>
                                Bạn hoàn toàn có thể tự thực hiện mọi công việc chăm sóc ngoại thất cơ bản tại nhà. Điều quan trọng nhất là bạn cần nắm vững các kỹ thuật cơ bản để tránh gây xước sơn dăm. Các bài hướng dẫn chi tiết như phương pháp 3 xô, kỹ thuật làm sạch mâm lốp, tẩy nhựa đường an toàn mà Car Wash Centre chia sẻ đều rất dễ áp dụng.
                            </p>

                            {/* Section 3 */}
                            <h2 id="thu-tu">3. Nên chăm sóc ngoại thất hay nội thất ô tô trước?</h2>
                            <p>
                                Theo lời khuyên của các chuyên gia, bạn nên <strong>tiến hành chăm sóc nội thất trước</strong>, sau đó mới dọn ngoại thất.
                            </p>
                            <p>
                                Lý do là khí hậu Việt Nam nắng nóng, nếu bạn rửa xe bên ngoài trước, khi dọn nội thất hơi nóng từ cabin sẽ hấp xuống bề mặt sơn ướt, làm khô nước cực nhanh tạo nên các vệt ố nước (water spots). Việc mở cửa cabin dọn nội thất trước cũng giúp xe có thời gian hạ nhiệt, giúp việc rửa sơn xe sau đó an toàn và hiệu quả hơn. Hơn nữa, việc sử dụng máy hút bụi nội thất sau khi rửa xe có thể làm bụi bẩn bay ra bám ngược vào thân xe vừa rửa sạch.
                            </p>

                            {/* Section 4 */}
                            <h2 id="bo-phan-luu-y">4. Những bộ phận cần lưu ý khi chăm sóc ngoại thất</h2>
                            <p>
                                Khi tự chăm sóc tại nhà, hãy chú ý đầy đủ các vị trí sau để chiếc xe được sạch đều:
                            </p>
                            <ul>
                                <li>Lớp sơn bóng thân xe (tránh chà xát mạnh gây xước dăm).</li>
                                <li>Nắp capo và lưới tản nhiệt (nơi tích tụ nhiều xác côn trùng, sỏi cát nhỏ).</li>
                                <li>Kính chắn gió, gương chiếu hậu và kính cửa sổ.</li>
                                <li>Hốc bánh xe, vành mâm và lốp xe (nơi dính nhiều bùn đất và mạt sắt phanh).</li>
                                <li>Các chi tiết nhựa nhám ngoại thất (dễ bị bạc màu dưới nắng nếu không dưỡng).</li>
                            </ul>

                            {/* Section 5 */}
                            <h2 id="chuan-bi">5. Chăm sóc ngoại thất tại nhà cần chuẩn bị dụng cụ gì?</h2>
                            <p>
                                Để công việc diễn ra thuận lợi, bạn nên chuẩn bị bộ dụng cụ cơ bản sau:
                            </p>
                            <div className="blog-detail__step-box">
                                <p><strong>Khăn Microfiber siêu sợi:</strong> Chuẩn bị từ 4-5 chiếc khăn mềm khác màu để phân chia vùng lau riêng biệt.</p>
                                <p><strong>Nước lau kính chuyên dụng:</strong> Chọn loại không chứa Amoniac để bảo vệ lớp phim cách nhiệt.</p>
                                <p><strong>Xà phòng rửa xe trung tính (pH=7):</strong> Như Sonax, 3M, CWC Lava để tẩy bẩn an toàn không làm bay sáp bóng hay Ceramic.</p>
                                <p><strong>Dung dịch tẩy nhựa đường, keo dán:</strong> Loại bỏ các vết bẩn cứng đầu bám chặt trên hông xe.</p>
                                <p><strong>Dưỡng bóng sơn & lốp:</strong> Dung dịch xịt bảo vệ Sealant tăng độ bóng sơn và dưỡng đen cao su lốp.</p>
                                <p><strong>Dụng cụ phụ trợ:</strong> Cọ vệ sinh mâm, bàn chải lốp, 3 xô nước có lưới lọc Grit Guard.</p>
                            </div>

                            {/* Section 6 */}
                            <h2 id="cac-buoc">6. Các bước chăm sóc ngoại thất tại nhà đúng cách, sạch keng</h2>
                            <p>
                                Thực hiện tuần tự theo quy trình dưới đây sẽ mang lại hiệu quả cao nhất:
                            </p>
                            
                            <h3>Bước 1: Làm sạch bánh xe và hốc bánh</h3>
                            <p>
                                Dùng vòi nước xịt sạch đất cát bám thô ở hốc bánh và mâm xe. Sử dụng dung dịch tẩy bụi phanh chuyên dụng phun lên vành mâm, dùng cọ mâm lông mềm chải sạch các khe kẽ. Rửa sạch lại bằng nước. Luôn làm sạch mâm lốp trước khi chạm vào thân xe.
                            </p>
                            
                            <h3>Bước 2: Tẩy cặn bẩn cứng đầu trên thân xe</h3>
                            <p>
                                Phun nước ướt toàn xe. Kiểm tra các vết bẩn như nhựa đường, phân chim, nhựa cây bám trên lớp sơn. Sử dụng dung dịch tẩy cặn bẩn chuyên dụng phun trực tiếp lên vết bẩn, để dung dịch làm mềm cặn bẩn trong 2 phút rồi dùng khăn Microfiber ẩm lau nhẹ nhàng, tuyệt đối không cạo hay miết mạnh bằng tay.
                            </p>

                            <div className="blog-detail__image-wrapper">
                                <img src={imgKhoangMay} alt="Xử lý chất bẩn trên bề mặt sơn xe" className="blog-detail__image" />
                                <span className="blog-detail__image-caption">Sử dụng dung dịch chuyên dụng hóa mềm cặn bẩn để bảo vệ sơn xe khỏi trầy xước.</span>
                            </div>

                            <h3>Bước 3: Rửa thân xe bằng phương pháp 3 xô</h3>
                            <p>
                                Áp dụng kỹ thuật 3 xô: xô giặt khăn sạch, xô dung dịch rửa thân xe, xô rửa mâm lốp. Dùng găng tay rửa xe lau nhẹ nhàng thân xe theo chiều thẳng từ trên xuống dưới. Thường xuyên giũ găng tay vào xô giặt nước sạch trước khi nhúng lại xô xà phòng để xả sạch đất cát bám.
                            </p>

                            <h3>Bước 4: Xả nước sạch và lau khô</h3>
                            <p>
                                Dùng vòi xả sạch xà phòng bọt tuyết từ trên mui xe xuống dưới. Dùng khăn Microfiber khổ lớn thấm hút nước trên bề mặt sơn xe, tránh miết khăn quá mạnh. Dùng súng thổi hơi (nếu có) để xì khô nước đọng ở gương, khe cửa, tay nắm.
                            </p>

                            <h3>Bước 5: Làm sạch kính xe</h3>
                            <p>
                                Xịt nước lau kính không chứa amoniac lên khăn Microfiber sạch, lau kính chắn gió và kính hông theo hướng song song. Dùng một khăn khô khác lau lại một lần nữa để loại bỏ các vệt sọc nước.
                            </p>

                            <h3>Bước 6: Phủ bảo vệ sơn và lốp xe</h3>
                            <p>
                                Khi xe đã khô hoàn toàn, xịt dung dịch Sealant bảo vệ lên bề mặt sơn theo từng khu vực nhỏ và dùng khăn sạch lau đều để tạo lớp màng bóng kháng nước. Sử dụng chổi quét dưỡng lốp để bảo vệ và phục hồi màu đen tự nhiên của cao su lốp xe.
                            </p>

                            {/* Section 7 */}
                            <h2 id="tan-suat">7. Nên chăm sóc ngoại thất xe hơi tại nhà bao lâu một lần?</h2>
                            <p>
                                Theo khuyến cáo của các chuyên gia Detailing:
                            </p>
                            <ul>
                                <li><strong>Vệ sinh rửa xe cơ bản:</strong> Nên thực hiện 1 lần/tuần để tránh bụi bẩn bám dính lâu ngày gây ố sơn.</li>
                                <li><strong>Khử nhiễm và dưỡng sơn sâu:</strong> Thực hiện khoảng 3 tháng một lần để tái tạo độ bóng loáng và khả năng kháng tia UV của lớp sơn.</li>
                            </ul>

                            {/* Section 8 */}
                            <h2 id="dich-vu-cwc">8. Dịch vụ chăm sóc xe tại nhà toàn diện của Car Wash Centre</h2>
                            <p>
                                Nếu công việc bận rộn khiến bạn không có thời gian tự tay chăm sóc, <strong>Car Wash Centre</strong> sẵn sàng phục vụ bạn ngay tại nhà với dịch vụ <strong>CWC On Demand</strong> chuyên nghiệp, sử dụng công nghệ Rinseless Wash Polymer tiên tiến nhất:
                            </p>
                            <ul>
                                <li>Rửa xe đúng cách tại nhà không gây xước dăm.</li>
                                <li>Dọn dẹp hút bụi nội thất cơ bản và chuyên sâu.</li>
                                <li>Dưỡng lốp, phục hồi nhựa nhám ngoại thất.</li>
                                <li>Châm nước rửa kính chắn gió và kiểm tra lọc gió.</li>
                            </ul>

                            <div className="blog-detail__callout">
                                📞 <strong>Hotline đặt lịch dịch vụ tại nhà:</strong> 07 64 64 64 16
                                <br />
                                📍 <strong>Địa chỉ trung tâm:</strong> Số 1A Đường Phú Thuận, phường Phú Thuận, Quận 7, TP. HCM
                            </div>
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
                            Bảo vệ ngoại thất xế yêu bóng đẹp, an toàn với công nghệ chăm sóc xe tiên tiến nhất từ Car Wash Centre.
                        </p>
                        <Link to="/dich-vu" className="blog-detail__cta-btn">Xem Dịch Vụ</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
