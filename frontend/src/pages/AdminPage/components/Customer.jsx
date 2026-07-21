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
import './Customer.css';

const { confirm } = Modal;
const { Option } = Select;

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
                size: pagination.pageSize,
            };
            if (searchName) params.search = searchName;
            if (sortField) params.sort = `${sortField},${sortOrder}`;

            const response = await getCustomers(params);
            const pageData = response?.data;
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
        if (!value) { setSortField(null); setSortOrder('asc'); return; }
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
                } catch {
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
                } catch {
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
            render: (name) => <span className="customer-cell-name">{name}</span>,
            width: 190,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (email) => <span className="customer-cell-text">{email || '—'}</span>,
            width: 220,
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            render: (phone) => <span className="customer-cell-text">{phone || '—'}</span>,
            width: 120,
        },
        {
            title: 'Ngày sinh',
            dataIndex: 'dateOfBirth',
            key: 'dateOfBirth',
            render: (date) => (
                <span className="customer-cell-text">
                    {date ? new Date(date).toLocaleDateString('vi-VN') : '—'}
                </span>
            ),
            width: 110,
        },
        {
            title: 'Phương tiện',
            dataIndex: 'vehicles',
            key: 'vehicles',
            render: (vehicles) => {
                if (!vehicles || vehicles.length === 0) {
                    return <span className="customer-cell-empty">Chưa đăng ký</span>;
                }
                return (
                    <Space size={4} wrap>
                        {vehicles.map((v, i) => (
                            <Tooltip key={i} title={`${v.brand} ${v.model} · ${v.licensePlate}`}>
                                <Tag
                                    icon={<CarOutlined />}
                                    color="blue"
                                    className="customer-vehicle-tag"
                                >
                                    {v.brand} - {v.model} - {v.licensePlate}
                                </Tag>
                            </Tooltip>
                        ))}
                    </Space>
                );
            },
            width: 260,
        },
        {
            title: 'Hạng thành viên',
            dataIndex: 'tier',
            key: 'tier',
            render: (tier) =>
                tier
                    ? (
                        <Tag
                            color={getTierColor(tier.currentTierName)}
                            className="customer-tier-tag"
                        >
                            {tier.currentTierName}
                        </Tag>
                    )
                    : <span className="customer-cell-empty">Chưa có</span>,
            width: 130,
        },
        {
            title: 'Điểm tích lũy',
            dataIndex: 'lifetimePoints',
            key: 'lifetimePoints',
            render: (points) => (
                <span className="customer-points">
                    <StarOutlined className="customer-points-icon" />
                    {(points || 0).toLocaleString()}
                </span>
            ),
            width: 120,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'active',
            key: 'active',
            render: (active) => (
                <Badge
                    status={active ? 'success' : 'error'}
                    text={
                        <span className={active ? 'customer-status-active' : 'customer-status-locked'}>
                            {active ? 'Hoạt động' : 'Bị khóa'}
                        </span>
                    }
                />
            ),
            width: 110,
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 100,
            render: (_, record) => (
                <Space size={6}>
                    <Tooltip title="Khôi phục tài khoản">
                        <Button
                            disabled={record.active}
                            size="small"
                            className="customer-action-btn customer-action-btn--recover"
                            icon={<RedoOutlined />}
                            onClick={() => handleRecover(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa khách hàng">
                        <Button
                            danger
                            size="small"
                            className="customer-action-btn"
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="customer-page">
            {/* ── Toolbar ── */}
            <div className="customer-toolbar">
                <Select
                    placeholder="Sắp xếp theo..."
                    allowClear
                    className="customer-toolbar-select"
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
                    className="customer-toolbar-search"
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
                    className="customer-toolbar-btn"
                    onClick={() => handleSearch(searchInput)}
                >
                    Tìm kiếm
                </Button>
            </div>

            {/* ── Table ── */}
            <div className="customer-table-wrapper">
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="id"
                    pagination={pagination}
                    loading={loading}
                    onChange={handleTableChange}
                    scroll={{ x: 1100 }}
                />
            </div>
        </div>
    );
}