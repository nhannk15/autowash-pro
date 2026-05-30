import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import './BlogDetail.css'

// Import service images for thumbnails and illustrations
import imgRuaXe from '../../assets/Service/RuaXeNgoaiThat.jpg'
import imgNoiThat from '../../assets/Service/VeSinhNoiThat.jpg'
import imgKhoangMay from '../../assets/Service/VeSinhKhoangMay.png'
import imgKhuMui from '../../assets/Service/KhuMui.png'
import imgBaoDuong from '../../assets/Service/BaoDuongNhanh.png'

const relatedPosts = [
    {
        id: 2,
        title: 'Bảng Giá Vệ Sinh Nội Thất Ô Tô Tại Nhà TPHCM Chất Lượng Cao',
        date: '12/05/2026',
        image: imgNoiThat,
        link: '/blog/bang-gia-ve-sinh-noi-that-o-to-tai-nha'
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

export default function BlogDetail5() {
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
                    <span className="blog-detail__breadcrumb-current">Cách chăm sóc nội thất ô tô...</span>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="blog-detail__container">
                {/* Left Column: Post Content */}
                <div className="blog-detail__content-column">
                    <article>
                        <span className="blog-detail__post-category">Vệ sinh nội thất</span>
                        <h1 className="blog-detail__post-title">Cách chăm sóc nội thất ô tô tại nhà toàn diện, giúp xe bền đẹp</h1>
                        
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
                                <span>15/04/2026</span>
                            </div>
                        </div>

                        <div className="blog-detail__body">
                            <p>
                                Theo thống kê, các chủ xe thường dành khoảng gần 100 giờ/năm cho việc vệ sinh, chăm sóc xe tại nhà. Nhưng vì một số lý do cá nhân mà nhiều người lại bỏ quên công việc này. Khoang nội thất sạch sẽ giúp xe giữ được giá trị ban đầu, bảo vệ sức khỏe, tránh khỏi vi khuẩn và nấm mốc gây hại.
                            </p>
                            <p>
                                Trong bài viết này, <strong>Car Wash Centre</strong> sẽ hướng dẫn bạn những kinh nghiệm chăm sóc nội thất ô tô tại nhà toàn diện và hiệu quả nhất, giúp xế yêu luôn bền đẹp như mới!
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
                                    <li className="blog-detail__toc-item"><a href="#tai-sao">1. Tại sao nên chăm sóc nội thất ô tô tại nhà?</a></li>
                                    <li className="blog-detail__toc-item"><a href="#khac-biet">2. So sánh tự dọn nội thất tại nhà và tại trung tâm Detailing</a></li>
                                    <li className="blog-detail__toc-item"><a href="#hang-muc">3. Chăm sóc nội thất tại nhà gồm những công việc gì?</a></li>
                                    <li className="blog-detail__toc-item"><a href="#dung-cu">4. Các dụng cụ, sản phẩm chăm sóc nội thất tại nhà hiệu quả</a></li>
                                    <li className="blog-detail__toc-item"><a href="#combo">5. Combo sản phẩm chăm sóc chuyên sâu từ Car Wash Centre</a></li>
                                    <li className="blog-detail__toc-item"><a href="#cac-buoc">6. Chi tiết 9 bước dọn dẹp vệ sinh nội thất ô tô tại nhà</a></li>
                                    <li className="blog-detail__toc-item"><a href="#meo-hay">7. Mẹo hay giữ gìn khoang nội thất luôn sạch đẹp</a></li>
                                    <li className="blog-detail__toc-item"><a href="#faq">8. Các câu hỏi thường gặp (Q&A)</a></li>
                                    <li className="blog-detail__toc-item"><a href="#gioi-thieu">9. Car Wash Centre - Chuỗi dịch vụ rửa xe đúng cách</a></li>
                                </ol>
                            </div>

                            {/* Section 1 */}
                            <h2 id="tai-sao">1. Tại sao nên chăm sóc nội thất ô tô tại nhà?</h2>
                            <p>
                                Khoang nội thất là không gian kín nơi bạn và gia đình dành phần lớn thời gian mỗi khi di chuyển. Mồ hôi, bụi bẩn từ quần áo, vụn thức ăn rơi vãi kết hợp cùng nhiệt độ cao và độ ẩm trong cabin tạo điều kiện lý tưởng cho các loài vi khuẩn, nấm mốc sinh sôi phát triển.
                            </p>
                            <p>
                                Duy trì thói quen vệ sinh nội thất hàng tuần giúp giữ gìn bầu không khí trong lành, bảo vệ hệ hô hấp cho người ngồi trong xe, đồng thời giữ cho các chi tiết da, nhựa không bị phai màu, nứt nẻ, kéo dài tuổi thọ sử dụng xe.
                            </p>

                            {/* Section 2 */}
                            <h2 id="khac-biet">2. So sánh tự dọn nội thất tại nhà và tại trung tâm Detailing</h2>
                            <p>
                                Việc tự dọn nội thất tại nhà giúp bạn tiết kiệm chi phí và chủ động thời gian. Tuy nhiên, hiệu quả làm sạch sâu chắc chắn không thể bằng tại trung tâm Detailing chuyên nghiệp do thiếu trang thiết bị chuyên dụng như máy phun hút giặt thảm hơi nước nóng, súng lốc xoáy chuyên dụng (Tornador), máy khử mùi Ozone...
                            </p>
                            <p>
                                Tại nhà chủ yếu giải quyết các vấn đề vệ sinh bề mặt cơ bản (hút bụi, lau bảng taplo, khử mùi nhẹ). Đối với các vết ố mốc nặng trên trần nỉ, sàn nỉ hay mùi hôi hải sản bám sâu, bạn nên đưa xe đến trung tâm để xử lý triệt để.
                            </p>

                            <div className="blog-detail__image-wrapper">
                                <img src={imgNoiThat} alt="Vệ sinh nội thất ô tô chuyên nghiệp" className="blog-detail__image" />
                                <span className="blog-detail__image-caption">Tại các trung tâm Detailing, nội thất xe được giặt sâu bằng hơi nước nóng diệt khuẩn.</span>
                            </div>

                            {/* Section 3 */}
                            <h2 id="hang-muc">3. Chăm sóc nội thất tại nhà gồm những công việc gì?</h2>
                            <p>
                                Để bảo dưỡng nội thất tại nhà đơn giản, bạn nên tập trung vào các hạng mục cốt lõi:
                            </p>
                            <ul>
                                <li>Giặt sạch thảm trải sàn (vật liệu cao su, nhựa hoặc nỉ).</li>
                                <li>Hút sạch bụi bẩn ở các khe ghế, thảm sàn và cốp xe.</li>
                                <li>Lau sạch bảng điều khiển taplo, vô lăng, tapi cửa bằng dung dịch trung tính.</li>
                                <li>Vệ sinh cửa gió điều hòa và thay lọc gió máy lạnh định kỳ.</li>
                                <li>Phủ dung dịch dưỡng bảo vệ bề mặt da, nhựa nhám khỏi tia UV.</li>
                            </ul>

                            {/* Section 4 */}
                            <h2 id="dung-cu">4. Các dụng cụ, sản phẩm chăm sóc nội thất tại nhà hiệu quả</h2>
                            <p>
                                Bộ dụng cụ dọn dẹp tại nhà cần chuẩn bị:
                            </p>
                            <ul>
                                <li>Máy hút bụi cầm tay (có đầu hút khe nhỏ).</li>
                                <li>Bàn chải lông mềm cỡ nhỏ (cọ khe kẽ, đường chỉ ghế da) và bàn chải lông cứng (cọ thảm nỉ).</li>
                                <li>Khăn Microfiber siêu sợi mềm mịn (chuẩn bị ít nhất 3 cái khác màu).</li>
                                <li>Nước lau kính chuyên dụng cho ô tô (không chứa cồn/amoniac để tránh hư hỏng phim cách nhiệt).</li>
                                <li>Dung dịch vệ sinh nội thất trung tính an toàn cho da và nhựa.</li>
                                <li>Dung dịch dưỡng bảo vệ chất liệu da/nhựa (CWC Restore...).</li>
                            </ul>

                            {/* Section 5 */}
                            <h2 id="combo">5. Combo sản phẩm chăm sóc chuyên sâu từ Car Wash Centre</h2>
                            <p>
                                Để hỗ trợ các chủ xe tự chăm sóc chuyên nghiệp tại nhà, Car Wash Centre cung cấp bộ đôi sản phẩm độc quyền:
                            </p>
                            <ul>
                                <li>
                                    <strong>Dung dịch vệ sinh nội thất CWC Interior:</strong> Công thức trung tính đặc biệt, loại bỏ nhanh các vết bẩn cứng đầu trên da, nỉ, nhựa, cao su mà không làm bay màu hay xơ hóa bề mặt da.
                                </li>
                                <li>
                                    <strong>Dung dịch phủ dưỡng bề mặt CWC Restore:</strong> Tạo lớp màng bảo vệ khô ráo, kháng tia cực tím cực mạnh giúp ngăn ngừa tình trạng nứt nẻ da ghế và bạc màu nhựa nhám.
                                </li>
                            </ul>

                            <div className="blog-detail__image-wrapper">
                                <img src={imgBaoDuong} alt="Combo sản phẩm chăm sóc nội thất CWC" className="blog-detail__image" />
                                <span className="blog-detail__image-caption">Bộ đôi CWC Interior & CWC Restore giúp giữ gìn nội thất luôn tươi mới.</span>
                            </div>

                            {/* Section 6 */}
                            <h2 id="cac-buoc">6. Chi tiết 9 bước dọn dẹp vệ sinh nội thất ô tô tại nhà</h2>
                            <p>
                                Hãy tiến hành dọn dẹp theo đúng thứ tự 9 bước chuẩn Detailing dưới đây:
                            </p>
                            
                            <h3>Bước 1: Giặt thảm lót sàn</h3>
                            <p>
                                Tháo toàn bộ các thảm lót sàn ra khỏi cabin. Rũ sạch cát đất, xịt nước và dùng xà phòng trung tính cọ sạch thảm. Phơi khô thảm hoàn toàn ở nơi thoáng gió trước khi lắp lại vào xe để tránh đọng ẩm gây mốc sàn.
                            </p>

                            <h3>Bước 2: Hút bụi thô cơ bản</h3>
                            <p>
                                Thu dọn chai nước, rác thải lớn trong xe. Dùng máy hút bụi hút sạch đất cát trên bề mặt taplo, bệ điều khiển trung tâm và dọc theo các khe ghế ngồi trước khi bắt đầu lau ẩm.
                            </p>

                            <h3>Bước 3: Vệ sinh taplo và vô lăng</h3>
                            <p>
                                Xịt dung dịch vệ sinh <strong>CWC Interior</strong> lên khăn Microfiber (tránh xịt trực tiếp lên bảng điện tử). Lau sạch bụi bẩn trên taplo, cụm vô lăng, hộp số và các nút bấm điều khiển. Dùng khăn khô sạch lau lại một lượt.
                            </p>

                            <h3>Bước 4: Lau dọn tabi cửa và bệ bước</h3>
                            <p>
                                Làm sạch các vách cửa hông (tabi cửa), bệ tì tay và các hộc chứa đồ cánh cửa. Vệ sinh bệ bước chân - nơi thường xuyên bám sình lầy từ đế giày dép.
                            </p>

                            <h3>Bước 5: Vệ sinh các cửa gió điều hòa</h3>
                            <p>
                                Dùng cọ quét lông mềm kết hợp súng thổi bụi (hoặc máy hút bụi) để quét sạch bụi mịn bám sâu trong các cánh gió máy lạnh.
                            </p>

                            <h3>Bước 6: Hút bụi sâu thảm sàn và ghế</h3>
                            <p>
                                Đẩy ghế lái và ghế phụ hết cỡ ra sau để hút bụi kỹ phần sàn phía trước, sau đó đẩy ghế lên trước để hút sàn phía sau. Ngả tựa lưng ghế để hút sạch bụi bẩn đọng trong các khe rãnh nệm ghế ngồi.
                            </p>

                            <h3>Bước 7: Phủ dưỡng bảo vệ da, nhựa hông xe</h3>
                            <p>
                                Đợi các bề mặt khô ráo, thấm dung dịch dưỡng <strong>CWC Restore</strong> vào miếng mút xốp hoặc khăn mềm. Thoa đều lên các phần nhựa taplo, tapi cửa và nệm ghế da để phục hồi độ mềm mại, tạo chiều sâu màu đen và kháng tia UV.
                            </p>

                            <h3>Bước 8: Khử mùi cabin nhanh</h3>
                            <p>
                                Sử dụng bình xịt khử mùi sinh học dựa trên enzym để tiêu diệt các ổ vi khuẩn gây mùi. Hoặc bạn có thể đặt một đĩa bột Baking soda, vài lát chanh tươi trong xe qua đêm để hút sạch mùi ẩm mốc.
                            </p>

                            <h3>Bước 9: Vệ sinh kính xe hông và kính chắn gió</h3>
                            <p>
                                Dùng nước lau kính chuyên dụng không chứa amoniac xịt lên khăn lau, lau sạch mặt trong kính chắn gió, kính lái và gương chiếu hậu để đảm bảo tầm nhìn hoàn hảo nhất khi di chuyển.
                            </p>

                            <div className="blog-detail__image-wrapper">
                                <img src={imgKhuMui} alt="Khử mùi diệt khuẩn điều hòa xe hơi" className="blog-detail__image" />
                                <span className="blog-detail__image-caption">Khử mùi diệt khuẩn định kỳ giúp duy trì bầu không khí mát mẻ, trong lành.</span>
                            </div>

                            {/* Section 7 */}
                            <h2 id="meo-hay">7. Mẹo hay giữ gìn khoang nội thất luôn sạch đẹp</h2>
                            <ul>
                                <li>Hạn chế tối đa việc ăn uống thức ăn có mùi hoặc đồ chiên rán rơi vãi trong xe.</li>
                                <li>Luôn dự phòng 1 hộp khăn giấy ướt chuyên dụng và túi đựng rác nhỏ trong hộc đồ cửa xe.</li>
                                <li>Lắp đặt thảm lót sàn cao su chất lượng cao để dễ dàng tháo ra xịt rửa bùn đất vào mùa mưa.</li>
                                <li>Thường xuyên hé cửa kính xe khoảng 1-2cm khi đỗ xe ở bãi đỗ có mái che mát để trao đổi không khí, giảm thiểu mùi tích tụ.</li>
                            </ul>

                            {/* Section 8 */}
                            <h2 id="faq">8. Các câu hỏi thường gặp (Q&A)</h2>
                            <p><strong>Q: Tại sao phải dùng nước rửa kính không chứa Amoniac?</strong></p>
                            <p>A: Amoniac là chất tẩy mạnh, có thể làm bạc màu tấm nhựa nội thất và phản ứng hóa học làm hỏng, bong tróc các tấm phim cách nhiệt dán trên kính lái/kính hông.</p>
                            
                            <p><strong>Q: Bao lâu nên dọn nội thất chuyên sâu tại trung tâm?</strong></p>
                            <p>A: Dù có tự dọn tại nhà hàng tuần, bạn vẫn nên đưa xe đi dọn nội thất chuyên sâu (có tháo ghế, giặt nóng) từ 1 - 2 lần/năm tại trung tâm Detailing uy tín.</p>

                            {/* Section 9 */}
                            <h2 id="gioi-thieu">9. Car Wash Centre - Chuỗi rửa xe đúng cách</h2>
                            <p>
                                Hân hạnh đồng hành cùng thương hiệu chăm sóc xe hơi danh tiếng <strong>Vietnam Car Care</strong>, <strong>Car Wash Centre</strong> cung cấp các dịch vụ dọn vệ sinh và chăm sóc khoang cabin chuyên sâu bằng công nghệ tiên tiến nhất tại TP.HCM. Chúng tôi cam kết trả lại cho bạn một khoang xe thơm tho, sạch mốc và an toàn cho sức khỏe tuyệt đối.
                            </p>
                            
                            <div className="blog-detail__callout">
                                📍 <strong>Địa chỉ liên hệ:</strong> Số 1A Đường Phú Thuận, phường Phú Thuận, Quận 7, TP. HCM
                                <br />
                                📞 <strong>Đặt lịch chăm sóc xe tại nhà:</strong> 07 64 64 64 16
                                <br />
                                📞 <strong>Đường dây nóng hỗ trợ:</strong> 0784 7676 79 / 0911 811 247
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
                        <h4 className="blog-detail__cta-title">Đặt lịch dọn nội thất</h4>
                        <p className="blog-detail__cta-desc">
                            Bảo vệ sức khỏe gia đình, loại bỏ vi khuẩn nấm mốc với dịch vụ dọn dẹp nội thất ô tô chuyên sâu tại nhà.
                        </p>
                        <Link to="/dich-vu" className="blog-detail__cta-btn">Xem Dịch Vụ</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
