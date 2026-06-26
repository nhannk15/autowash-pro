import React, { useEffect, useState } from "react";
import {
    Table, Input, Button, Space, Modal,
    notification, Select, Tooltip, Badge, Form, DatePicker
} from 'antd';
import {
    SearchOutlined, DeleteOutlined,
    ExclamationCircleOutlined, RedoOutlined, PlusOutlined, UserAddOutlined
} from '@ant-design/icons';
import { getStaffs, addStaff, recoverStaff, deleteStaff } from "../../../service/adminService";
import './Staff.css';

const { confirm } = Modal;
const { Option } = Select;

export default function Staff() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [searchName, setSearchName] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [sortField, setSortField] = useState(null);
    const [sortOrder, setSortOrder] = useState("asc");

    const [modalOpen, setModalOpen] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchStaffs();
    }, [pagination.current, pagination.pageSize, searchName, sortField, sortOrder]);

    const fetchStaffs = async () => {
        setLoading(true);
        try {
            const params = { page: pagination.current - 1, size: pagination.pageSize };
            if (searchName) params.search = searchName;
            if (sortField) params.sort = `${sortField},${sortOrder}`;

            const response = await getStaffs(params);
            const pageData = response?.data;
            setData(pageData?.content || []);
            setPagination(prev => ({ ...prev, total: pageData?.totalElements || 0 }));
        } catch {
            notification.error({ message: "Lỗi", description: "Không thể tải danh sách nhân viên" });
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value) => {
        setSearchName(value);
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleSortChange = (value) => {
        if (!value) { setSortField(null); setSortOrder("asc"); return; }
        const [field, order] = value.split("_");
        setSortField(field);
        setSortOrder(order);
    };

    const handleRecover = (record) => {
        confirm({
            title: "Xác nhận khôi phục",
            icon: <ExclamationCircleOutlined />,
            content: `Bạn có chắc chắn muốn khôi phục tài khoản nhân viên ${record.fullName} không?`,
            okText: "Khôi phục",
            okType: "success",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    await recoverStaff(record.id);
                    notification.success({ message: "Thành công", description: `Đã khôi phục tài khoản nhân viên ${record.fullName}` });
                    fetchStaffs();
                } catch {
                    notification.error({ message: "Lỗi", description: "Không thể khôi phục tài khoản nhân viên" });
                }
            },
        });
    };

    const handleDelete = (record) => {
        confirm({
            title: "Xác nhận xóa",
            icon: <ExclamationCircleOutlined />,
            content: `Bạn có chắc muốn xóa nhân viên ${record.fullName} không?`,
            okText: "Xóa",
            okType: "danger",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    await deleteStaff(record.id);
                    notification.success({ message: "Thành công", description: `Đã xóa tài khoản nhân viên ${record.fullName}` });
                    fetchStaffs();
                } catch {
                    notification.error({ message: "Lỗi", description: "Không thể xóa tài khoản nhân viên" });
                }
            },
        });
    };

    const handleTableChange = (paginationConfig) => setPagination(paginationConfig);

    const handleAddStaff = async () => {
        try {
            const values = await form.validateFields();
            setAddLoading(true);
            const payload = {
                ...values,
                hiredDate: values.hiredDate?.format('YYYY-MM-DD') ?? null,
                dateOfBirth: values.dateOfBirth?.format('YYYY-MM-DD') ?? null,
            };
            await addStaff(payload);
            notification.success({ message: "Thành công", description: "Đã tạo tài khoản nhân viên mới" });
            form.resetFields();
            setModalOpen(false);
            fetchStaffs();
        } catch (error) {
            if (error?.errorFields) return;
            notification.error({ message: "Lỗi", description: "Không thể tạo tài khoản nhân viên mới" });
        } finally {
            setAddLoading(false);
        }
    };

    const columns = [
        {
            title: "Họ và tên",
            dataIndex: "fullName",
            key: "fullName",
            render: (name) => <span className="staff-cell-name">{name}</span>,
            width: 200,
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            render: (email) => <span className="staff-cell-text">{email || "—"}</span>,
            width: 220,
        },
        {
            title: "Số điện thoại",
            dataIndex: "phoneNumber",
            key: "phoneNumber",
            render: (phone) => <span className="staff-cell-text">{phone || "—"}</span>,
            width: 130,
        },
        {
            title: "Ngày vào làm",
            dataIndex: "hiredDate",
            key: "hiredDate",
            render: (date) => (
                <span className="staff-cell-text">
                    {date ? new Date(date).toLocaleDateString('vi-VN') : '—'}
                </span>
            ),
            width: 130,
        },
        {
            title: "Vai trò",
            dataIndex: "role",
            key: "role",
            render: (role) => <span className="staff-cell-text">{role || "—"}</span>,
            width: 120,
        },
        {
            title: "Trạng thái",
            dataIndex: "active",
            key: "active",
            render: (active) => (
                <Badge
                    status={active ? 'success' : 'error'}
                    text={
                        <span className={active ? 'staff-status-active' : 'staff-status-locked'}>
                            {active ? 'Hoạt động' : 'Bị khóa'}
                        </span>
                    }
                />
            ),
            width: 120,
        },
        {
            title: "Thao tác",
            key: "action",
            width: 100,
            render: (_, record) => (
                <Space size={6}>
                    <Tooltip title="Khôi phục tài khoản">
                        <Button
                            disabled={record.active}
                            size="small"
                            className="staff-action-btn staff-action-btn--recover"
                            icon={<RedoOutlined />}
                            onClick={() => handleRecover(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa nhân viên">
                        <Button
                            danger
                            size="small"
                            className="staff-action-btn"
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="staff-page">
            {/* ── Toolbar ── */}
            <div className="staff-toolbar">
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    className="staff-add-btn"
                    onClick={() => setModalOpen(true)}
                >
                    Thêm nhân viên
                </Button>

                <div className="staff-toolbar-right">
                    <Select
                        placeholder="Sắp xếp theo..."
                        allowClear
                        className="staff-toolbar-select"
                        onChange={handleSortChange}
                    >
                        <Option value="fullName_asc">Họ tên: A → Z</Option>
                        <Option value="fullName_desc">Họ tên: Z → A</Option>
                        <Option value="hiredDate_asc">Ngày vào làm: Cũ → Mới</Option>
                        <Option value="hiredDate_desc">Ngày vào làm: Mới → Cũ</Option>
                    </Select>

                    <Input
                        placeholder="Tìm theo họ tên..."
                        allowClear
                        className="staff-toolbar-search"
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
                        className="staff-toolbar-btn"
                        onClick={() => handleSearch(searchInput)}
                    >
                        Tìm kiếm
                    </Button>
                </div>
            </div>

            {/* ── Table ── */}
            <div className="staff-table-wrapper">
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="id"
                    pagination={pagination}
                    loading={loading}
                    onChange={handleTableChange}
                    scroll={{ x: 1020 }}
                />
            </div>

            {/* ── Modal thêm nhân viên ── */}
            <Modal
                title={
                    <Space>
                        <UserAddOutlined />
                        <span>Thêm nhân viên mới</span>
                    </Space>
                }
                open={modalOpen}
                onOk={handleAddStaff}
                onCancel={() => { setModalOpen(false); form.resetFields(); }}
                okText="Tạo tài khoản"
                cancelText="Hủy"
                confirmLoading={addLoading}
                destroyOnClose
                className="staff-modal"
            >
                <Form form={form} layout="vertical" className="staff-form">
                    <Form.Item
                        label="Họ tên"
                        name="fullName"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                    >
                        <Input placeholder="Nguyễn Văn A" />
                    </Form.Item>

                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email' },
                            { type: 'email', message: 'Email không hợp lệ' },
                        ]}
                    >
                        <Input placeholder="nhanvien@autowash.vn" />
                    </Form.Item>

                    <Form.Item
                        label="Mật khẩu"
                        name="password"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu' },
                            { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' },
                        ]}
                    >
                        <Input.Password placeholder="Tối thiểu 6 ký tự" />
                    </Form.Item>

                    <Form.Item label="Số điện thoại" name="phoneNumber">
                        <Input placeholder="0901 234 567" />
                    </Form.Item>

                    <Form.Item label="Ngày vào làm" name="hiredDate">
                        <DatePicker
                            style={{ width: '100%' }}
                            placeholder="Chọn ngày vào làm"
                            format="DD/MM/YYYY"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}