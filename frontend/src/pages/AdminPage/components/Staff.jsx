import React, { useEffect, useState } from "react";
import {
    Table, Input, Button, Space, Tag, Modal,
    notification, Select, Tooltip, Badge, Form, DatePicker
} from 'antd';
import {
    SearchOutlined, DeleteOutlined,
    ExclamationCircleOutlined, RedoOutlined, PlusOutlined, UserAddOutlined
} from '@ant-design/icons';
import { getStaffs, addStaff, recoverStaff, deleteStaff } from "../../../service/adminService";

const { confirm } = Modal;
const { Option } = Select;

export default function Staff() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [searchName, setSearchName] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [sortField, setSortField] = useState(null);
    const [sortOrder, setSortOrder] = useState("asc")

    const [modalOpen, setModalOpen] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchStaffs();
    }, [pagination.current, pagination.pageSize, searchName, sortField, sortOrder]);

    const fetchStaffs = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.current - 1,
                size: pagination.pageSize
            };
            if (searchName) params.search = searchName;
            if (sortField) params.sort = `${sortField},${sortOrder}`

            const response = await getStaffs(params);
            const pageData = response?.data;
            setData(pageData?.content || []);
            setPagination(prev => ({
                ...prev,
                total: pageData?.totalElements || 0
            }));
        } catch (error) {
            notification.error({
                message: "Lỗi",
                description: "Không thể tải danh sách nhân viên"
            })
        } finally {
            setLoading(false);
        }
    }

    const handleSearch = (value) => {
        setSearchName(value);
        setPagination(prev => ({ ...prev, current: 1 }));
    }

    const handleSortChange = (value) => {
        if (!value) {
            setSortField(null);
            setSortOrder("asc");
            return;
        }
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
                    notification.success({
                        message: "Thành công",
                        description: `Đã khôi phục tài khoản nhân viên ${record.fullName}`
                    });
                    fetchStaffs();
                } catch (error) {
                    notification.error({
                        message: "Lỗi",
                        description: "Không thể khôi phục tài khoản nhân viên"
                    })
                }
            }
        })
    }

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
                    notification.success({
                        message: "Thành công",
                        description: `Đã xóa tài khoản nhân viên ${record.fullName}`,
                    });
                    fetchStaffs();
                } catch (error) {
                    notification.error({
                        message: "Lỗi",
                        description: "Không thể xóa tài khoản nhân viên",
                    })
                }
            }
        })
    }

    const handleTableChange = (paginationConfig) => {
        setPagination(paginationConfig);
    }

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
            notification.success({
                message: "Thành công",
                description: "Đã tạo tài khoản nhân viên mới"
            });
            form.resetFields();
            setModalOpen(false);
            fetchStaffs();
        } catch (error) {
            if (error?.errorFields) return;
            notification.error({
                message: "Lỗi",
                description: "Không thể tạo tài khoản nhân viên mới"
            });
        } finally {
            setAddLoading(false);
        }
    }

    const columns = [
        {
            title: "Họ và tên",
            dataIndex: "fullName",
            key: "fullName",
            render: (name) => <span style={{ fontWeight: 500 }}>{name}</span>,
            width: 200,
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            render: (email) => <span>{email || "-"}</span>,
            width: 220
        },
        {
            title: "Số điện thoại",
            dataIndex: "phoneNumber",
            key: "phoneNumber",
            render: (phone) => <span>{phone || "-"}</span>,
            width: 120
        },
        {
            title: "Ngày vào làm",
            dataIndex: "hiredDate",
            key: "hiredDate",
            render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '—',
            width: 120
        },
        {
            title: "Vai trò",
            dataIndex: "role",
            key: "role",
            render: (role) => <span>{role || "-"}</span>,
            width: 120
        },
        {
            title: "Trạng thái",
            dataIndex: "active",
            key: "active",
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
            width: 110,
        },
        {
            title: "Thao tác",
            key: "action",
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
                    <Tooltip title="Xóa nhân viên">
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
        }
    ];

    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                marginBottom: 16,
                flexWrap: 'wrap',
                alignItems: 'center',
            }}>
                <Button type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setModalOpen(true)}>
                    Thêm nhân viên
                </Button>
                <Space wrap>
                    <Select placeholder="Sắp xếp theo..."
                        allowClear
                        style={{ width: 230 }}
                        onChange={handleSortChange}>
                        <Option value="fullName_asc">Họ tên: A → Z</Option>
                        <Option value="fullName_desc">Họ tên: Z → A</Option>
                        <Option value="hiredDate_asc">Ngày vào làm: Cũ → Mới</Option>
                        <Option value="hiredDate_desc">Ngày vào làm: Mới → Cũ</Option>
                    </Select>
                    <Input placeholder="Tìm theo họ tên..."
                        allowClear
                        style={{ width: 220 }}
                        value={searchInput}
                        onChange={(e) => {
                            setSearchInput(e.target.value);
                            if (!e.target.value) handleSearch('');
                        }}
                        onPressEnter={() => handleSearch(searchInput)} />
                    <Button
                        type="primary"
                        icon={<SearchOutlined />}
                        onClick={() => handleSearch(searchInput)}
                    >
                        Tìm kiếm
                    </Button>
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                pagination={pagination}
                loading={loading}
                onChange={handleTableChange}
                scroll={{ x: 1020 }}
            />

            <Modal
                title={
                    <Space>
                        <UserAddOutlined />
                        <span>Thêm nhân viên mới</span>
                    </Space>
                }
                open={modalOpen}
                onOk={handleAddStaff}
                onCancel={() => {
                    setModalOpen(false);
                    form.resetFields();
                }}
                okText="Tạo tài khoản"
                cancelText="Hủy"
                confirmLoading={addLoading}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    style={{ marginTop: 16 }}
                >
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

                    <Form.Item
                        label="Số điện thoại"
                        name="phoneNumber"
                    >
                        <Input placeholder="0901 234 567" />
                    </Form.Item>

                    <Form.Item
                        label="Ngày vào làm"
                        name="hiredDate"
                    >
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