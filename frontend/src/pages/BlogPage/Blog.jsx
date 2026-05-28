import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './Blog.css'

// Import service images for blog thumbnails
import imgRuaXe from '../../assets/Service/RuaXeNgoaiThat.jpg'
import imgNoiThat from '../../assets/Service/VeSinhNoiThat.jpg'
import imgKhoangMay from '../../assets/Service/VeSinhKhoangMay.png'
import imgKhuMui from '../../assets/Service/KhuMui.png'
import imgBaoDuong from '../../assets/Service/BaoDuongNhanh.png'
import imgCeramic from '../../assets/Service/PhuCeramic.png'

const blogPosts = [
    {
        id: 1,
        title: 'Hướng dẫn tẩy ố kính ô tô: Kinh nghiệm và cách xử lý vết ố',
        category: 'Rửa xe đúng cách',
        date: '18/05/2026',
        summary: 'Kính bị ố, có đốm nước, vảy trắng là điều gây khó chịu với nhiều người sau khi vừa rửa sạch xe. Nếu biết xử lý đúng cách, các vết bẩn này dễ dàng bị loại bỏ. Ngược lại, xử lý vết ố nước không đúng kỹ thuật sẽ để lại nhiều hậu quả nghiêm […]',
        image: imgRuaXe,
        link: '/blog/huong-dan-tay-o-kinh-o-to'
    },
    {
        id: 2,
        title: 'Bảng Giá Vệ Sinh Nội Thất Ô Tô Tại Nhà TPHCM Chất Lượng Cao',
        category: 'Vệ sinh nội thất',
        date: '12/05/2026',
        summary: 'Dọn vệ sinh nội thất ô tô luôn là công việc cần thiết để giữ cho không gian bên trong xe hơi sạch sẽ, thoáng mát, loại bỏ vi khuẩn, mùi hôi khó chịu. Hiện nay, mô hình này đang được nhiều đơn vị cung cấp thực hiện ngay tại nhà mà chủ xe không […]',
        image: imgNoiThat,
        link: '/blog/bang-gia-ve-sinh-noi-that-o-to-tai-nha'
    },
    {
        id: 3,
        title: 'Cách chăm sóc ngoại thất ô tô tại nhà an toàn, tài mới đều làm được',
        category: 'Chăm sóc ngoại thất',
        date: '04/05/2026',
        summary: 'Chăm sóc ngoại thất ô tô tại nhà - Hướng dẫn chăm sóc chi tiết, an toàn và hiệu quả. Tiết kiệm chi phí, sạch keng như trung tâm Detailing từ Car Wash Centre.',
        image: imgKhoangMay,
        link: '/blog/cach-cham-soc-ngoai-that-o-to-tai-nha'
    },
    {
        id: 4,
        title: 'Các tiêu chí đánh giá trung tâm rửa xe ô tô uy tín, chất lượng cao',
        category: 'Rửa xe đúng cách',
        date: '28/04/2026',
        summary: 'Dựa theo 8 tiêu chí đánh giá đúng nhất, Car Wash Centre sẽ giúp bạn biết cách phân biệt và lựa chọn đâu là trung tâm rửa xe ô tô uy tín, chất lượng cao, hạn chế tối đa nguy cơ trầy xước xe.',
        image: imgRuaXe,
        link: '/blog/tieu-chi-danh-gia-trung-tam-rua-xe-o-to'
    },
    {
        id: 5,
        title: 'Cách chăm sóc nội thất ô tô tại nhà toàn diện, giúp xe bền đẹp',
        category: 'Vệ sinh nội thất',
        date: '15/04/2026',
        summary: 'Khoang nội thất sạch sẽ giúp xe giữ được giá trị ban đầu, bảo vệ sức khỏe, tránh khỏi vi khuẩn và nấm mốc gây hại. Trong bài viết này Car Wash Centre sẽ hướng dẫn bạn những kinh nghiệm chăm sóc nội thất ô tô tại nhà toàn diện và hiệu quả nhất.',
        image: imgBaoDuong,
        link: '/blog/cach-cham-soc-noi-that-o-to-tai-nha'
    },
]

export default function Blog() {
    const [visibleCount, setVisibleCount] = useState(3);

    const displayedPosts = blogPosts.slice(0, visibleCount);

    return (
        <div className="blog-page">
            {/* Header Section */}
            <div className="blog-header">
                <div className="blog-header__container">
                    <h1 className="blog-header__title">Blog & Kinh Nghiệm Chăm Sóc Xe</h1>
                    <p className="blog-header__subtitle">
                        Tổng hợp những kiến thức, hướng dẫn và chia sẻ kinh nghiệm rửa xe, bảo dưỡng nhanh, chăm sóc xe hơi chuyên nghiệp từ các chuyên gia.
                    </p>
                    <div className="blog-header__divider"></div>
                </div>
            </div>

            {/* Main Content Section */}
            <div className="blog-main">
                <div className="blog-list">
                    {displayedPosts.map((post) => (
                        <Link
                            to={post.link}
                            key={post.id}
                            className="blog-item"
                            onClick={post.link === '#' ? (e) => e.preventDefault() : undefined}
                        >
                            {/* Left Image */}
                            <div className="blog-item__img-wrapper">
                                <img src={post.image} alt={post.title} className="blog-item__img" />
                            </div>

                            {/* Right Content */}
                            <div className="blog-item__content">
                                <span className="blog-item__tag">{post.category}</span>

                                <h2 className="blog-item__title">{post.title}</h2>

                                <div className="blog-item__meta">
                                    <span className="blog-item__meta-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                            <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9H3.75v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5zm-15-3h15V7.5a1.5 1.5 0 00-1.5-1.5H5.25A1.5 1.5 0 003.75 7.5v.75z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                    <span>{post.date}</span>
                                </div>

                                <p className="blog-item__summary">{post.summary}</p>

                                <div className="blog-item__action">
                                    <span>Đọc thêm</span>
                                    <span className="blog-item__action-arrow">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                                            <path fillRule="evenodd" d="M12.97 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22H3a.75.75 0 010-1.5h16.19l-6.22-6.22a.75.75 0 010-1.06z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {blogPosts.length > visibleCount && (
                    <div className="blog-load-more-container">
                        <button
                            className="blog-load-more-btn"
                            onClick={() => setVisibleCount(prev => prev + 3)}
                        >
                            Xem thêm bài viết
                            <span className="load-more-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                    <path fillRule="evenodd" d="M12 5.25a.75.75 0 01.75.75v5.25H18a.75.75 0 010 1.5h-5.25V18a.75.75 0 01-1.5 0v-5.25H6a.75.75 0 010-1.5h5.25V6a.75.75 0 01.75-.75z" clipRule="evenodd" />
                                </svg>
                            </span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
