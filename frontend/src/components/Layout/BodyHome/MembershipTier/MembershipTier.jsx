import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
    StarOutlined,
    SafetyCertificateOutlined,
    TrophyOutlined,
    CrownOutlined,
    CheckCircleFilled,
    CalendarOutlined,
} from '@ant-design/icons'
import './MembershipTier.css'

// Map tierLevel → Ant Design icon + class màu
const TIER_CONFIG = {
    1: {
        Icon: StarOutlined,
        colorClass: 'tier-card--bronze',
        featured: false,
        checkColor: '#cd7f32',
    },
    2: {
        Icon: SafetyCertificateOutlined,
        colorClass: 'tier-card--silver',
        featured: false,
        checkColor: '#6b7280',
    },
    3: {
        Icon: TrophyOutlined,
        colorClass: 'tier-card--gold',
        featured: false,
        checkColor: '#d97706',
    },
    4: {
        Icon: CrownOutlined,
        colorClass: 'tier-card--diamond',
        featured: false,
        checkColor: '#7c3aed',
    },
}

function getTierConfig(tierLevel) {
    return TIER_CONFIG[tierLevel] || {
        Icon: StarOutlined,
        colorClass: '',
        featured: false,
        checkColor: '#52c41a',
    }
}

// Chuyển perksDescription (chuỗi phân tách dấu phẩy) → mảng
function parsePerks(perksDescription) {
    if (!perksDescription) return []
    return perksDescription.split(',').map(p => p.trim()).filter(Boolean)
}

export default function MembershipTier() {
    const navigate = useNavigate()
    const [tiers, setTiers] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get('/api/all-membership-tiers')
            .then(res => {
                const data = res.data || []
                data.sort((a, b) => a.tierLevel - b.tierLevel)
                setTiers(data)
            })
            .catch(err => console.error('Không thể tải hạng thành viên:', err))
            .finally(() => setLoading(false))
    }, [])

    return (
        <section className="membership">
            <div className="membership__container">

                {/* TRÁI: Tiêu đề + mô tả */}
                <div className="membership__intro">
                    <h2 className="membership__title">CHƯƠNG TRÌNH<br />THÀNH VIÊN</h2>
                    <p className="membership__desc">
                        Nâng tầm trải nghiệm chăm sóc xe với những ưu đãi đặc quyền dành riêng cho khách hàng thân thiết.
                    </p>
                    <button className="membership__cta" onClick={() => navigate('/signup')}>ĐĂNG KÝ NGAY</button>
                </div>

                {/* PHẢI: Danh sách tier cards */}
                <div className="membership__cards">
                    {loading ? (
                        <div style={{ color: '#888', padding: '40px', textAlign: 'center', flex: 1 }}>
                            Đang tải...
                        </div>
                    ) : (
                        tiers.map((tier) => {
                            const { Icon, colorClass, featured, checkColor } = getTierConfig(tier.tierLevel)
                            const perks = parsePerks(tier.perksDescription)

                            return (
                                <div
                                    key={tier.id}
                                    className={`tier-card ${colorClass} ${featured ? 'tier-card--featured' : ''}`}
                                >
                                    {/* Header: Ant Design icon + badge tên hạng */}
                                    <div className="tier-card__header">
                                        <span className="tier-card__icon">
                                            <Icon />
                                        </span>
                                        <span className="tier-card__level">
                                            {tier.tierName.toUpperCase()}
                                        </span>
                                    </div>

                                    {/* Tên hạng */}
                                    <h3 className="tier-card__name">{tier.tierName}</h3>

                                    {/* Quyền lợi từ perksDescription */}
                                    <ul className="tier-card__perks">
                                        {perks.length > 0 ? (
                                            perks.map((perk, i) => (
                                                <li key={i} className="tier-card__perk">
                                                    <CheckCircleFilled
                                                        className="tier-card__check"
                                                        style={{ color: checkColor }}
                                                    />
                                                    <span className="tier-card__perk-text">{perk}</span>
                                                </li>
                                            ))
                                        ) : (
                                            <li className="tier-card__perk" style={{ opacity: 0.6 }}>
                                                <CheckCircleFilled className="tier-card__check" style={{ color: '#ccc' }} />
                                                <span className="tier-card__perk-text">Chưa có thông tin quyền lợi</span>
                                            </li>
                                        )}

                                        {/* Đặt lịch trước */}
                                        <li className="tier-card__perk">
                                            <CalendarOutlined
                                                className="tier-card__check"
                                                style={{ color: checkColor }}
                                            />
                                            <span className="tier-card__perk-text">
                                                Đặt trước tối đa <strong>{tier.bookingWindowDays}</strong> ngày
                                            </span>
                                        </li>
                                    </ul>

                                    {/* Điểm duy trì */}
                                    <p className="tier-card__highlight">
                                        DUY TRÌ: {tier.minPointsToMaintain.toLocaleString()} ĐIỂM / QUÝ
                                    </p>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </section>
    )
}
