import React from 'react';
import { Card, Avatar, Typography, Divider, Button, Descriptions, Tag, Row, Col, Statistic } from "antd";
import { EditOutlined, IdcardOutlined, CalendarOutlined, TeamOutlined, ClockCircleOutlined, UserOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { useAuth } from '../../../context/AuthContext';
import './Profile.css';

const { Title, Text } = Typography;

export default function Profile() {
    const { user } = useAuth();

    const displayName = user?.fullname || 'Đặng Nhất Thiên Bảo';
    const role = user?.role || 'STAFF';
    const age = user?.age || 20;
    const phone = user?.phone || '0123456789';
    const email = user?.email || 'baodnt@example.com';
    const avatarLetter = displayName.charAt(0).toUpperCase();

    // Các field chưa có trong context → dùng fallback mẫu
    const staffId = user?.id || 'NV-00142';
    const department = user?.department || 'Lễ tân';
    const joinDate = user?.joinDate || '01/03/2024';
    const shift = user?.shift || 'Chiều (12:00 - 18:00)';
    const status = user?.status || 'active';

    const statusConfig = {
        active: { color: 'success', label: 'Đang làm việc' },
        inactive: { color: 'error', label: 'Đã nghỉ việc' },
    };
    const { color: statusColor, label: statusLabel } = statusConfig[status] ?? statusConfig.active;

    return (
        <div className="profile-container">
            {/* ── Card chính ── */}
            <Card className="profile-card" variant="borderless">

                {/* Header */}
                <div className="profile-header">
                    <div className="profile-avatar-wrapper">
                        {user?.avatar
                            ? <Avatar size={100} src={user.avatar} className="profile-avatar" />
                            : <Avatar size={100} className="profile-avatar profile-avatar-placeholder">{avatarLetter}</Avatar>
                        }
                    </div>

                    <div className="profile-title">
                        <div className="profile-name-row">
                            <Title level={3} style={{ margin: 0, fontWeight: 700 }}>{displayName}</Title>
                            <Tag color={statusColor} className="profile-status-badge" style={{ margin: 0, padding: '2px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: 500, border: 'none' }}>
                                {statusLabel}
                            </Tag>
                        </div>
                        <Text className="profile-role">{role}</Text>
                    </div>

                    <div className="profile-actions">
                        <Button type="primary" size="large" icon={<EditOutlined />} style={{ borderRadius: '8px' }}>
                            Chỉnh sửa hồ sơ
                        </Button>
                    </div>
                </div>

                <Divider style={{ margin: '24px 0' }} />

                {/* Layout 2 cột: Thông tin | Stats */}
                <Row gutter={[48, 24]} align="top">

                    {/* Cột trái — Thông tin cá nhân */}
                    <Col xs={24} lg={14}>
                        <Descriptions
                            title={<span className="section-title">Thông tin cá nhân</span>}
                            column={1}
                            styles={{
                                label: { fontWeight: 500, color: '#8c8c8c', width: '180px' },
                                content: { fontWeight: 600, color: '#262626' },
                            }}
                        >
                            <Descriptions.Item label={<><IdcardOutlined style={{ marginRight: 6 }} />Mã nhân viên</>}>
                                {staffId}
                            </Descriptions.Item>
                            <Descriptions.Item label={<><TeamOutlined style={{ marginRight: 6 }} />Phòng ban</>}>
                                {department}
                            </Descriptions.Item>
                            <Descriptions.Item label={<><PhoneOutlined style={{ marginRight: 6 }} />Số điện thoại</>}>
                                {phone}
                            </Descriptions.Item>
                            <Descriptions.Item label={<><MailOutlined style={{ marginRight: 6 }} />Email</>}>
                                {email}
                            </Descriptions.Item>
                            <Descriptions.Item label={<><CalendarOutlined style={{ marginRight: 6 }} />Ngày vào làm</>}>
                                {joinDate}
                            </Descriptions.Item>
                        </Descriptions>
                    </Col>
                </Row>
            </Card>
        </div>
    );
}