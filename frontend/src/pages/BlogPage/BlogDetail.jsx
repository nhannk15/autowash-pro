import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import './BlogDetail.css'

// Import service images for related posts
import imgRuaXe from '../../assets/Service/RuaXeNgoaiThat.jpg'
import imgNoiThat from '../../assets/Service/VeSinhNoiThat.jpg'
import imgKhoangMay from '../../assets/Service/VeSinhKhoangMay.png'
import imgKhuMui from '../../assets/Service/KhuMui.png'
import imgBaoDuong from '../../assets/Service/BaoDuongNhanh.png'
import imgCeramic from '../../assets/Service/PhuCeramic.png'

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

export default function BlogDetail() {
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
                    <span className="blog-detail__breadcrumb-current">Hướng dẫn tẩy ố kính ô tô...</span>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="blog-detail__container">
                {/* Left Column: Post Content */}
                <div className="blog-detail__content-column">
                    <article>
                        <span className="blog-detail__post-category">Kinh nghiệm chăm sóc xe</span>
                        <h1 className="blog-detail__post-title">Hướng dẫn tẩy ố kính ô tô: Kinh nghiệm và cách xử lý vết ố</h1>
                        
                        <div className="blog-detail__post-meta">
                            <div className="blog-detail__meta-item">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style={{color: '#a0aec0'}}>
                                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A9.75 9.75 0 0112 22.5a9.75 9.75 0 01-8.314-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                                </svg>
                                <span>Đăng bởi: Car Wash Centre</span>
                            </div>
                            <div className="blog-detail__meta-item">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style={{color: '#a0aec0'}}>
                                    <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9H3.75v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5zm-15-3h15V7.5a1.5 1.5 0 00-1.5-1.5H5.25A1.5 1.5 0 003.75 7.5v.75z" clipRule="evenodd" />
                                </svg>
                                <span>18/05/2026</span>
                            </div>
                        </div>

                        <div className="blog-detail__body">
                            <p>
                                Kính bị ố, có đốm nước, vảy trắng là điều gây khó chịu với nhiều người sau khi vừa rửa sạch xe. Nếu biết xử lý đúng cách, các vết bẩn này dễ dàng bị loại bỏ. Ngược lại, xử lý vết ố nước không đúng kỹ thuật sẽ để lại nhiều hậu quả nghiêm trọng. Trong bài viết này, <strong>Car Wash Centre</strong> sẽ hướng dẫn bạn các cách tẩy ố kính ô tô hiệu quả, đánh bay cặn bẩn nhanh chóng.
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
                                    <li className="blog-detail__toc-item"><a href="#nguyen-nhan">1. Nguyên nhân xuất hiện vết ố kính ô tô</a></li>
                                    <li className="blog-detail__toc-item">
                                        <a href="#huong-dan">2. Hướng dẫn tẩy ố kính ô tô hiệu quả nhất</a>
                                        <ul className="blog-detail__toc-sublist">
                                            <li className="blog-detail__toc-subitem"><a href="#tay-o-giam">2.1 Tẩy ố bằng giấm ăn</a></li>
                                            <li className="blog-detail__toc-subitem"><a href="#tay-o-chanh">2.2 Tẩy ố bằng chanh tươi</a></li>
                                            <li className="blog-detail__toc-subitem"><a href="#tay-o-baking">2.3 Tẩy ố bằng baking soda và kem đánh răng</a></li>
                                            <li className="blog-detail__toc-subitem"><a href="#tay-o-chuyen-dung">2.4 Sử dụng dung dịch chuyên dụng</a></li>
                                        </ul>
                                    </li>
                                    <li className="blog-detail__toc-item"><a href="#luu-y">3. Lưu ý khi tự tẩy ố kính tại nhà</a></li>
                                </ol>
                            </div>

                            <h2 id="nguyen-nhan">Nguyên nhân xuất hiện vết ố kính ô tô</h2>
                            <p>
                                Những vết bẩn khó chịu sau khi rửa xe chính là kết quả của các cặn nước cứng chứa khoáng chất canxi, magie chưa được “làm mềm”. Khi nước cứng bay hơi, chúng sẽ để lại những khoáng chất cứng đầu, gây ra những vệt ố, vảy trắng trên bề mặt kính. Dưới ánh nắng mặt trời, vết bẩn này dần khô cứng lại tạo thành các lớp men trắng dày khiến việc loại bỏ trở nên vô cùng khó khăn.
                            </p>

                            <div className="blog-detail__image-wrapper">
                                <img src={imgRuaXe} alt="Vết ố mốc bám dày đặc trên kính ô tô" className="blog-detail__image" />
                                <span className="blog-detail__image-caption">Vết ố kính xe ô tô được hình thành từ nhiều nguyên nhân: nước mưa đọng, rửa nước giếng khoan, bụi bẩn...</span>
                            </div>

                            <p>
                                Có nhiều nguyên nhân chính dẫn đến tình trạng này:
                            </p>
                            <ul>
                                <li><strong>Mưa axit và ô nhiễm môi trường:</strong> Nước mưa đọng lâu ngày trên kính không được lau khô sẽ tạo nên các phản ứng hóa học kết tủa bề mặt, tạo cặn canxi cứng đầu bám chặt vào silicat trong kính.</li>
                                <li><strong>Sử dụng nguồn nước ô nhiễm để rửa xe:</strong> Rửa xe bằng nước giếng khoan chứa nhiều kim loại nặng hoặc cặn vôi mà không lau khô kịp thời sẽ tạo lớp cặn ố mốc mờ đục.</li>
                                <li><strong>Hóa chất rửa xe không đạt chuẩn:</strong> Xà phòng hoặc dung dịch rửa xe kém chất lượng, có độ pH quá cao hoặc quá thấp dễ ăn mòn và để lại dấu vết trên kính.</li>
                            </ul>

                            <div className="blog-detail__callout">
                                Xem thêm: <Link to="/dich-vu">Quy trình Vệ sinh kính ô tô và Chăm sóc ngoại thất chuyên nghiệp tại nhà</Link>
                            </div>

                            <h2 id="huong-dan">Hướng dẫn tẩy ố kính ô tô hiệu quả nhất</h2>
                            <p>
                                Thay vì mang xe đến trung tâm chăm sóc chuyên nghiệp ngay lập tức, bạn có thể tự mình làm sạch các vết ố đốm nhẹ bằng các nguyên liệu đơn giản tại nhà. Trước khi làm, hãy đảm bảo đeo găng tay cao su để bảo vệ da.
                            </p>

                            <h3 id="tay-o-giam">1. Tẩy ố kính ô tô bằng giấm ăn</h3>
                            <p>
                                Giấm trắng chứa nồng độ axit axetic nhẹ (4 - 7%) đủ để phá vỡ các cặn khoáng canxi. Bạn pha giấm trắng với nước sạch theo tỷ lệ 1:1, xịt trực tiếp lên vùng kính bị ố và để dung dịch ngấm trong khoảng 1 - 2 phút. Sau đó, dùng khăn microfiber khô lau sạch lại. Lưu ý tránh sử dụng giấm công nghiệp vì nồng độ axit cao có thể làm hỏng bề mặt kính.
                            </p>

                            <h3 id="tay-o-chanh">2. Tẩy ố kính ô tô bằng chanh tươi</h3>
                            <p>
                                Với các vết ố mới xuất hiện, chanh tươi là phương án nhanh chóng và tiện lợi nhất. Bạn chỉ cần cắt đôi quả chanh và chà nhẹ trực tiếp lên bề mặt kính chắn gió, hoặc dùng nước cốt chanh thấm vào khăn lau. Cuối cùng rửa sạch lại bằng nước và lau khô hoàn toàn.
                            </p>

                            <h3 id="tay-o-baking">3. Tẩy ố bằng baking soda và kem đánh răng</h3>
                            <p>
                                Baking soda và kem đánh răng có tính ma sát nhẹ và tẩy rửa tốt, phù hợp cho vết cặn canxi cứng đầu bám lâu ngày:
                            </p>
                            <ul>
                                <li><strong>Kem đánh răng:</strong> Chọn loại dạng kem thông thường (tránh dạng gel), bôi trực tiếp lên vết ố và xoa đều bằng khăn ẩm. Để nguyên 5 - 10 phút trước khi lau sạch bằng khăn ướt.</li>
                                <li><strong>Baking Soda:</strong> Trộn baking soda với nước theo tỷ lệ 3:1 tạo thành hỗn hợp sệt (có thể thêm vài giọt giấm). Thoa lên kính, chà nhẹ và để trong 15 phút, sau đó lau sạch bằng khăn ẩm.</li>
                            </ul>

                            <h3 id="tay-o-chuyen-dung">4. Tẩy ố bằng dung dịch chuyên dụng</h3>
                            <p>
                                Đối với các vết ố nặng tạo mảng trắng đục che khuất tầm nhìn, sử dụng hóa chất tẩy ố kính chuyên dụng là giải pháp an toàn và hiệu quả nhất. Các dung dịch cao cấp (như dòng <strong>CWC Glassy</strong> đang được sử dụng tại hệ thống của chúng tôi) chứa các hợp chất hoạt tính hòa tan cặn canxi cực nhanh mà không gây ố xước hay mờ đục bề mặt kính.
                            </p>

                            <h2 id="luu-y">Lưu ý quan trọng khi tự tẩy ố kính tại nhà</h2>
                            <p>
                                Để đảm bảo an toàn tuyệt đối cho xế cưng, bạn cần tuân thủ các quy tắc sau:
                            </p>
                            <ul>
                                <li><strong>Không để hóa chất dính vào sơn xe:</strong> Các chất tẩy rửa kính thường có tính axit mạnh, dễ làm ố bạc màu hoặc ăn mòn lớp sơn bóng bên ngoài. Nếu vô tình bị dính hóa chất lên thân xe, hãy lập tức rửa sạch bằng nhiều nước.</li>
                                <li><strong>Tránh sử dụng trên kính phủ màu hoặc tráng gương:</strong> Lớp phủ chống lóa hoặc tráng gương ngoại thất rất nhạy cảm với axit và hóa chất tẩy ố mạnh. Tránh dùng chất tẩy trực tiếp lên các bề mặt này.</li>
                                <li><strong>Sử dụng khăn Microfiber mềm:</strong> Khăn lau thô cứng hoặc bám cát dăm sẽ làm trầy xước kính. Hãy chuẩn bị các loại khăn vi sợi chuyên dụng mềm mịn, thấm hút tốt.</li>
                            </ul>

                            <p style={{marginTop: '32px'}}>
                                Hy vọng bài viết đã cung cấp những kiến thức bổ ích giúp bạn tự tin xử lý vết ố kính tại nhà đúng kỹ thuật, giữ cho kính lái luôn trong suốt và an toàn trên mọi nẻo đường!
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
                        <h4 className="blog-detail__cta-title">Đặt lịch chăm sóc xe</h4>
                        <p className="blog-detail__cta-desc">
                            Trải nghiệm dịch vụ chăm sóc xe tiêu chuẩn Detailing chuyên nghiệp ngay tại nhà của Car Wash Centre.
                        </p>
                        <Link to="/dich-vu" className="blog-detail__cta-btn">Xem Dịch Vụ</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
