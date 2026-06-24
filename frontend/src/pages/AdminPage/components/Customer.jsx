import React, { useEffect, useState } from 'react';
import {
    Table, Input, Button, Space, Tag, Modal,
    notification, Select, Tooltip, Badge
} from 'antd';
import {
    SearchOutlined, DeleteOutlined,
    StarOutlined, CarOutlined, ExclamationCircleOutlined, RedoOutlined
} from '@ant-design/icons';
import { getCustomers, deleteCustomer, recoverCustomer } from '../../../service/adminService';

const { confirm } = Modal;

export default function Customer() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [searchName, setSearchName] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [sortField, setSortField] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');

    useEffect(() => {
        fetchCustomers();
    }, [pagination.current, pagination.pageSize, searchName, sortField, sortOrder]);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.current - 1,
                size: pagination.pageSize
            };
            if (searchName) params.search = searchName;
            if (sortField) params.sort = `${sortField},${sortOrder}`;

            const response = await getCustomers(params);

            const pageData = response?.data;         // <-- đây là phần pagination
            setData(pageData?.content || []);
            setPagination(prev => ({
                ...prev,
                total: pageData?.totalElements || 0,
            }));
        } catch (error) {
            notification.error({
                message: 'Lỗi',
                description: 'Không thể tải danh sách khách hàng',
            });
        } finally {
            setLoading(false);
        }
    };

    const getTierColor = (tierName) => {
        switch (tierName?.toLowerCase()) {
            case 'bronze': return '#cd7f32';
            case 'silver': return '#8A8D91';
            case 'gold': return '#EFBF04';
            case 'platinum': return '#71D9B3';
            case 'diamond': return '#9ac5db';
            default: return 'blue';
        }
    };

    const handleSearch = (value) => {
        setSearchName(value);
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleSortChange = (value) => {
        if (!value) {
            setSortField(null);
            setSortOrder('asc');
            return;
        }
        const [field, order] = value.split('_');
        setSortField(field);
        setSortOrder(order);
    };

    const handleRecover = (record) => {
        confirm({
            title: 'Xác nhận khôi phục',
            icon: <ExclamationCircleOutlined />,
            content: `Bạn có chắc muốn khôi phục khách hàng "${record.fullName}" không?`,
            okText: 'Khôi phục',
            okType: 'success',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await recoverCustomer(record.id);
                    notification.success({ message: 'Thành công', description: 'Đã khôi phục khách hàng' });
                    fetchCustomers();
                } catch (error) {
                    notification.error({ message: 'Lỗi', description: 'Không thể khôi phục khách hàng' });
                }
            },
        });
    };

    const handleDelete = (record) => {
        confirm({
            title: 'Xác nhận xóa',
            icon: <ExclamationCircleOutlined />,
            content: `Bạn có chắc muốn xóa khách hàng "${record.fullName}" không? Hành động này không thể hoàn tác.`,
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await deleteCustomer(record.id);
                    notification.success({ message: 'Thành công', description: 'Đã xóa khách hàng' });
                    fetchCustomers();
                } catch (error) {
                    notification.error({ message: 'Lỗi', description: 'Không thể xóa khách hàng' });
                }
            },
        });
    };

    const handleTableChange = (paginationConfig) => {
        setPagination(paginationConfig);
    };

    const columns = [
        {
            title: 'Họ tên',
            dataIndex: 'fullName',
            key: 'fullName',
            render: (name) => (
                <Space>
                    <span style={{ fontWeight: 500 }}>{name}</span>
                </Space>
            ),
            width: 190
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (email) => (
                <Space size={6}>
                    <span>{email}</span>
                </Space>
            ),
            width: 220
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            render: (phone) => (
                <Space size={6}>
                    <span>{phone || '—'}</span>
                </Space>
            ),
            width: 100
        },
        {
            title: 'Ngày sinh',
            dataIndex: 'dateOfBirth',
            key: 'dateOfBirth',
            render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '—',
            width: 100
        },
        {
            title: 'Phương tiện',
            dataIndex: 'vehicles',
            key: 'vehicles',
            render: (vehicles) => {
                if (!vehicles || vehicles.length === 0) {
                    return <span style={{ color: '#bfbfbf' }}>Chưa đăng ký</span>;
                }
                return (
                    <Space size={4} wrap>
                        {vehicles.map((v, i) => (
                            <Tooltip key={i} title={`${v.brand} ${v.model} · ${v.licensePlate}`}>
                                <Tag icon={<CarOutlined />} color="blue" style={{ cursor: 'default' }}>
                                    {v.brand} - {v.model} - {v.licensePlate}
                                </Tag>
                            </Tooltip>
                        ))}
                    </Space>
                );
            },
            width: 240
        },
        {
            title: 'Hạng thành viên',
            dataIndex: 'tier',
            key: 'tier',
            render: (tier) =>
                tier
                    ? <Tag color={getTierColor(tier.currentTierName)}><span style={{ fontWeight: 600 }}>{tier.currentTierName}</span></Tag>
                    : <span style={{ color: '#bfbfbf' }}>Chưa có</span>,
            width: 100
        },
        {
            title: 'Điểm tích lũy',
            dataIndex: 'lifetimePoints',
            key: 'lifetimePoints',
            render: (points) => (
                <Space size={4}>
                    <StarOutlined style={{ color: '#fadb14' }} />
                    <span style={{ fontWeight: 500 }}>{(points || 0).toLocaleString()}</span>
                </Space>
            ),
            width: 100
        },
        {
            title: 'Trạng thái',
            dataIndex: 'active',
            key: 'active',
            render: (active) => (
                <Badge
                    status={active ? 'success' : 'error'}
                    text={
                        <span style={{ color: active ? '#52c41a' : '#ff4d4f', fontWeight: 400 }}>
                            {active ? 'Hoạt động' : 'Bị khóa'}
                        </span>
                    }
                />
            ),
            width: 95
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 110,
            render: (_, record) => (
                <Space size={6}>
                    <Tooltip title="Khôi phục tài khoản">
                        <Button
                            disabled={record.active}
                            size="small"
                            icon={<RedoOutlined style={{ color: 'green' }} />}
                            onClick={() => handleRecover(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa khách hàng">
                        <Button
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(record)}
                        />
                    </Tooltip>
                </Space>
            ),
            width: 100
        },
    ];

    return (
        <div>
            {/* Toolbar: Search + Sort — căn phải */}
            <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 12,
                marginBottom: 16,
                flexWrap: 'wrap',
                alignItems: 'center',
            }}>
                <Select
                    placeholder="Sắp xếp theo..."
                    allowClear
                    style={{ width: 240 }}
                    onChange={handleSortChange}
                >
                    <Option value="lifetimePoints_desc">Điểm tích lũy: Cao → Thấp</Option>
                    <Option value="lifetimePoints_asc">Điểm tích lũy: Thấp → Cao</Option>
                    <Option value="fullName_asc">Họ tên: A → Z</Option>
                    <Option value="fullName_desc">Họ tên: Z → A</Option>
                    <Option value="tier_asc">Hạng thành viên: Thấp → Cao</Option>
                    <Option value="tier_desc">Hạng thành viên: Cao → Thấp</Option>
                </Select>
                <Input
                    placeholder="Tìm theo họ tên..."
                    allowClear
                    style={{ width: 220 }}
                    value={searchInput}
                    onChange={(e) => {
                        setSearchInput(e.target.value);
                        if (!e.target.value) handleSearch('');
                    }}
                    onPressEnter={() => handleSearch(searchInput)}
                />
                <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={() => handleSearch(searchInput)}
                >
                    Tìm kiếm
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                pagination={pagination}
                loading={loading}
                onChange={handleTableChange}
            />
        </div>
    );
}