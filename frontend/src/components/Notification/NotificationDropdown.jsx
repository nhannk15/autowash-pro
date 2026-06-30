import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getAllNotifications,
    getUnreadNotifications,
    getUnreadCount,
    markNotificationRead,
    markAllNotificationsRead,
} from '../../service/customerService';
import './NotificationDropdown.css';

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Label ngắn hiển thị trong badge tròn theo NotificationType.
 * Dùng màu CSS class cùng tên với type.
 */
const TYPE_LABEL = {
    BOOKING_CONFIRMED: 'Đặt lịch',
    BOOKING_REMINDER:  'Nhắc lịch',
    TIER_UPGRADE:      'Nâng hạng',
    TIER_DOWNGRADE:    'Giảm hạng',
    POINTS_EARN:       'Điểm +',
    POINTS_EXPIRY:     'HH điểm',
    POINTS_ADJUST:     'ĐC điểm',
};

/**
 * Định dạng thời gian tương đối (2 giờ trước, 3 ngày trước …)
 */
function formatRelativeTime(dateStr) {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60)  return 'Vừa xong';
    if (diffMin < 60)  return `${diffMin} phút trước`;
    if (diffHour < 24) return `${diffHour} giờ trước`;
    if (diffDay < 30)  return `${diffDay} ngày trước`;
    return date.toLocaleDateString('vi-VN');
}

/**
 * Chia danh sách thành nhóm: Hôm nay / Trước đó
 */
function groupByDate(notifications) {
    const today = new Date();
    const groups = { today: [], older: [] };

    notifications.forEach((n) => {
        const d = new Date(n.createdAt);
        const isToday =
            d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear();
        if (isToday) groups.today.push(n);
        else groups.older.push(n);
    });
    return groups;
}

// ── Sub-components ─────────────────────────────────────────────────────────

function TypeBadge({ type }) {
    const label = TYPE_LABEL[type] || type;
    return (
        <div className={`notif-type-badge ${type}`}>
            {label}
        </div>
    );
}

function NotificationItem({ notification, onRead, onClose }) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (!notification.isRead) {
            onRead(notification.id);
        }
        onClose();
        navigate('/ca-nhan/tong-quan');
    };

    return (
        <div
            className={`notif-item ${notification.isRead ? '' : 'unread'}`}
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        >
            <TypeBadge type={notification.notificationType} />

            <div className="notif-item__content">
                <div className="notif-item__title">{notification.title}</div>
                <div className="notif-item__body">{notification.body}</div>
                <div className="notif-item__meta">
                    <span className="notif-item__time">
                        {formatRelativeTime(notification.createdAt)}
                    </span>
                    {!notification.isRead && <span className="notif-unread-dot" />}
                </div>
            </div>
        </div>
    );
}

function NotificationList({ notifications, loading, onRead, onClose }) {
    if (loading) {
        return (
            <div className="notif-loading">
                <div className="notif-spinner" />
            </div>
        );
    }

    if (!notifications || notifications.length === 0) {
        return (
            <div className="notif-empty">
                <div className="notif-empty__icon">🔔</div>
                <div className="notif-empty__text">Không có thông báo nào</div>
            </div>
        );
    }

    const groups = groupByDate(notifications);

    return (
        <>
            {groups.today.length > 0 && (
                <>
                    <div className="notif-group-label">Hôm nay</div>
                    {groups.today.map((n) => (
                        <NotificationItem key={n.id} notification={n} onRead={onRead} onClose={onClose} />
                    ))}
                </>
            )}
            {groups.older.length > 0 && (
                <>
                    <div className="notif-group-label">Trước đó</div>
                    {groups.older.map((n) => (
                        <NotificationItem key={n.id} notification={n} onRead={onRead} onClose={onClose} />
                    ))}
                </>
            )}
        </>
    );
}

// ── Bell icon SVG ──────────────────────────────────────────────────────────
function BellIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
        </svg>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────

const POLLING_INTERVAL = 5000; // 5 giây

export default function NotificationDropdown() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread'
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [prevUnreadCount, setPrevUnreadCount] = useState(0);

    const wrapperRef = useRef(null);
    const pollingRef = useRef(null);

    // ── Fetch unread count (polling) ──
    const fetchUnreadCount = useCallback(async () => {
        try {
            const data = await getUnreadCount();
            setUnreadCount(data.unreadsCount ?? 0);
        } catch {
            // Bỏ qua lỗi network khi polling
        }
    }, []);

    // ── Fetch notification list (khi mở dropdown) ──
    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const data = activeTab === 'unread'
                ? await getUnreadNotifications()
                : await getAllNotifications();
            setNotifications(data);
        } catch (err) {
            console.error('fetchNotifications error:', err);
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    // ── Polling unread count ──
    useEffect(() => {
        fetchUnreadCount(); // ngay lập tức lần đầu
        pollingRef.current = setInterval(fetchUnreadCount, POLLING_INTERVAL);
        return () => clearInterval(pollingRef.current);
    }, [fetchUnreadCount]);

    // ── Animation rung chuông khi có thông báo mới ──
    useEffect(() => {
        if (unreadCount > prevUnreadCount && prevUnreadCount !== 0) {
            // Badge pop animation tự động qua CSS, bell ring bằng class
        }
        setPrevUnreadCount(unreadCount);
    }, [unreadCount, prevUnreadCount]);

    // ── Fetch list khi mở dropdown hoặc đổi tab ──
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen, activeTab, fetchNotifications]);

    // ── Click outside để đóng ──
    useEffect(() => {
        function handleClickOutside(e) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
                setIsExpanded(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ── Mark single as read ──
    const handleMarkRead = useCallback(async (id) => {
        try {
            const updated = await markNotificationRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error('markNotificationRead error:', err);
        }
    }, []);

    // ── Mark all as read ──
    const handleMarkAllRead = useCallback(async () => {
        if (unreadCount === 0) return;
        try {
            await markAllNotificationsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('markAllNotificationsRead error:', err);
        }
    }, [unreadCount]);

    // ── Đóng dropdown ──
    const handleClose = useCallback(() => {
        setIsOpen(false);
        setIsExpanded(false);
    }, []);

    // ── Toggle dropdown ──
    const handleBellClick = () => {
        setIsOpen((prev) => !prev);
        if (!isOpen) {
            setActiveTab('all');
            setIsExpanded(false);
        }
    };

    // ── Switch tab ──
    const handleTabChange = (tab) => {
        if (tab !== activeTab) {
            setActiveTab(tab);
        }
    };

    // ── "Xem tất cả" ──
    const handleSeeAll = () => {
        setActiveTab('all');
        setIsExpanded(true);
    };

    return (
        <div className="notif-bell-wrapper" ref={wrapperRef}>
            {/* Bell Button */}
            <button
                id="notification-bell-btn"
                className={`notif-bell-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
                onClick={handleBellClick}
                aria-label={`Thông báo${unreadCount > 0 ? ` (${unreadCount} chưa đọc)` : ''}`}
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <BellIcon />
                {unreadCount > 0 && (
                    <span className="notif-badge">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div
                    className="notif-dropdown"
                    role="dialog"
                    aria-label="Thông báo"
                >
                    {/* Header */}
                    <div className="notif-dropdown__header">
                        <h2 className="notif-dropdown__title">Thông báo</h2>
                        <button
                            className="notif-dropdown__mark-all-btn"
                            onClick={handleMarkAllRead}
                            disabled={unreadCount === 0}
                        >
                            Đánh dấu tất cả đã đọc
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="notif-dropdown__tabs">
                        <button
                            id="notif-tab-all"
                            className={`notif-tab ${activeTab === 'all' ? 'active' : ''}`}
                            onClick={() => handleTabChange('all')}
                        >
                            Tất cả
                        </button>
                        <button
                            id="notif-tab-unread"
                            className={`notif-tab ${activeTab === 'unread' ? 'active' : ''}`}
                            onClick={() => handleTabChange('unread')}
                        >
                            Chưa đọc
                            {unreadCount > 0 && ` (${unreadCount > 9 ? '9+' : unreadCount})`}
                        </button>
                    </div>

                    <div className="notif-dropdown__divider" />

                    {/* Scrollable list */}
                    <div className={`notif-dropdown__list ${isExpanded ? 'expanded' : ''}`}>
                        <NotificationList
                            notifications={notifications}
                            loading={loading}
                            onRead={handleMarkRead}
                            onClose={handleClose}
                        />
                    </div>

                    {/* Footer */}
                    {!isExpanded && notifications.length > 0 && (
                        <div className="notif-dropdown__footer">
                            <button
                                id="notif-see-all-btn"
                                className="notif-see-all-btn"
                                onClick={handleSeeAll}
                            >
                                Xem tất cả thông báo ↓
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
