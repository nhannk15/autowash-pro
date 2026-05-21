import './MembershipTier.css'

const tiers = [
    {
        id: 1,
        level: 'SILVER',
        icon: '🥈',
        name: 'Member Plus',
        perks: [
            'Tích điểm đổi quà',
            'Tra cứu lịch sử dịch vụ',
            'Ưu tiên đặt lịch',
        ],
        highlight: 'GIẢM 5% TẤT CẢ DỊCH VỤ',
        featured: false,
    },
    {
        id: 2,
        level: 'GOLD',
        icon: '🥇',
        name: 'Premium Elite',
        perks: [
            'Ưu đãi độc quyền 15%',
            'Tặng gói vệ sinh khoang máy',
            'Hỗ trợ cứu hộ 24/7',
        ],
        highlight: 'GIẢM 15% TẤT CẢ DỊCH VỤ',
        featured: true,
    },
    {
        id: 3,
        level: 'PLATINUM',
        icon: '💎',
        name: 'VIP Diamond',
        perks: [
            'Tất cả quyền lợi Gold',
            'Xe đưa đón tận nơi',
            'Quản lý xe cá nhân',
        ],
        highlight: 'GIẢM 25% TẤT CẢ DỊCH VỤ',
        featured: false,
    },
]

export default function MembershipTier() {
    return (
        <section className="membership">
            <div className="membership__container">

                {/* TRÁI: Tiêu đề + mô tả */}
                <div className="membership__intro">
                    <h2 className="membership__title">CHƯƠNG TRÌNH<br />THÀNH VIÊN</h2>
                    <p className="membership__desc">
                        Nâng tầm trải nghiệm chăm sóc xe với những ưu đãi đặc quyền dành riêng cho khách hàng thân thiết.
                    </p>
                    <button className="membership__cta">ĐĂNG KÝ NGAY</button>
                </div>

                {/* PHẢI: 3 Card tier */}
                <div className="membership__cards">
                    {tiers.map((tier) => (
                        <div
                            key={tier.id}
                            className={`tier-card ${tier.featured ? 'tier-card--featured' : ''}`}
                        >
                            <div className="tier-card__header">
                                <span className="tier-card__icon">{tier.icon}</span>
                                <span className="tier-card__level">{tier.level}</span>
                            </div>

                            <h3 className="tier-card__name">{tier.name}</h3>

                            <ul className="tier-card__perks">
                                {tier.perks.map((perk, i) => (
                                    <li key={i} className="tier-card__perk">
                                        <span className="tier-card__check">
                                            {tier.featured ? '⭐' : '✅'}
                                        </span>
                                        {perk}
                                    </li>
                                ))}
                            </ul>

                            <p className="tier-card__highlight">{tier.highlight}</p>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    )
}
