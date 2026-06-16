import React, { useEffect, useState } from 'react';
import { Card, Avatar, Typography, Divider, Button, Descriptions, Tag, Row, Col } from "antd";
import { EditOutlined, IdcardOutlined, CalendarOutlined, TeamOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext.jsx';
import { getStaffProfile, updateStaffProfile } from '../../service/staffService.js';
import './Profile.css';

const { Title, Text } = Typography;

export default function Profile() {
    const { user } = useAuth();
    const [employeeProfile, setEmployeeProfile] = useState({});
    const [avatarError, setAvatarError] = useState(false);

    useEffect(() => {
        async function fetchEmployeeProfile() {
            if (!user?.id) return;
            try {
                const data = await getStaffProfile(user.id);
                setEmployeeProfile(data);
                setAvatarError(false);
            } catch (error) {
                console.error("Failed to fetch employee profile", error);
            }
        }
        fetchEmployeeProfile();
    }, [user?.id]);

    const displayName = employeeProfile?.fullName;
    const role = employeeProfile?.role;
    const phone = employeeProfile?.phoneNumber;
    const email = employeeProfile?.email;
    const avatarUrl = employeeProfile?.avatarUrl;
    const avatarLetter = displayName?.charAt(0).toUpperCase();
    const employeeId = user?.id;
    const joinDate = employeeProfile?.hiredDate;
    const status = employeeProfile?.active ? 'active' : 'inactive';

    const statusConfig = {
        active: { color: 'success', label: 'Đang làm việc' },
        inactive: { color: 'error', label: 'Đã nghỉ việc' },
    };
    const { color: statusColor, label: statusLabel } = statusConfig[status] ?? statusConfig.active;

    const handleEditProfile = async (data) => {
        try {
            const data = await updateStaffProfile(user?.id, data);
            setEmployeeProfile(data);
            setAvatarError(false);
            message.success("Cập nhật hồ sơ thành công!");
        } catch (error) {
            console.error("Failed to update employee profile", error);
            message.error("Cập nhật hồ sơ thất bại!");
        }
    };
    return (
        <div className="profile-container">
            {/* ── Card chính ── */}
            <Card className="profile-card" variant="borderless">

                {/* Header */}
                <div className="profile-header">
                    <div className="profile-avatar-wrapper">
                        {avatarUrl && !avatarError
                            ? <Avatar size={100} src={avatarUrl} onError={() => { setAvatarError(true); return false; }} className="profile-avatar" />
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
                        <Button type="primary" size="large" onClick={handleEditProfile} icon={<EditOutlined />} style={{ borderRadius: '8px' }}>
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
                                {employeeId}
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