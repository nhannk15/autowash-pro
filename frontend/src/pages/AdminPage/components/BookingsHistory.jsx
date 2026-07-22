import React, { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import {
    Card, Table, Typography, Tag, Modal, Descriptions, Spin, Divider,
    Segmented, DatePicker, Button, Tooltip, Space, Flex, Input
} from 'antd';
import {
    CalendarOutlined, SearchOutlined, EyeOutlined, UnorderedListOutlined
} from '@ant-design/icons';
import { getBookingsHistory } from '../../../service/adminService';
import './BookingsHistory.css';

const { Title, Text } = Typography;

export default function BookingsHistory() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

    const [filterMode, setFilterMode] = useState('range');
    const [dateRange, setDateRange] = useState([dayjs(), dayjs()]);
    const [monthYear, setMonthYear] = useState(dayjs());
    const [year, setYear] = useState(dayjs());

    const apiParams = useMemo(() => {
        if (filterMode === 'range') return { startDate: dateRange[0].format('YYYY-MM-DD'), endDate: dateRange[1].format('YYYY-MM-DD') };
        if (filterMode === 'month') return { month: monthYear.format('MMMM').toUpperCase(), year: monthYear.year() };
        if (filterMode === 'year') return { year: year.year() };
        return {};
    }, [filterMode, dateRange, monthYear, year]);

    const apiParamsKey = JSON.stringify(apiParams);

    const filterLabel = useMemo(() => {
        if (filterMode === 'all') return 'Tất cả';
        if (filterMode === 'range') return `${dateRange[0].format('DD/MM/YYYY')} – ${dateRange[1].format('DD/MM/YYYY')}`;
        if (filterMode === 'month') return monthYear.format('MM/YYYY');
        if (filterMode === 'year') return `Năm ${year.year()}`;
        return '';
    }, [filterMode, dateRange, monthYear, year]);

    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            try {
                const data = await getBookingsHistory(apiParams);
                setBookings(data || []);
            } catch (error) {
                console.error('Failed to fetch bookings history', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [apiParamsKey]);

    const formatCurrency = (value) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

    const getStatusColor = (status) => {
        const map = {
            PENDING: 'gold',
            CONFIRMED: 'blue',
            COMPLETED: 'green',
            CANCELLED: 'red'
        };
        return map[status] || 'default';
    };

    const getStatusText = (status) => {
        const map = {
            PENDING: 'Chờ xác nhận',
            CONFIRMED: 'Đã xác nhận',
            COMPLETED: 'Hoàn thành',
            CANCELLED: 'Đã hủy'
        };
        return map[status] || status;
    };

    const filteredData = bookings.filter((item) => {
        const searchLower = searchText.toLowerCase();
        const code = (item.bookingCode || '').toLowerCase();
        const customer = (item.customer?.fullName || '').toLowerCase();
        const phone = (item.customer?.phoneNumber || '').toLowerCase();
        const plate = (item.vehicle?.licensePlate || '').toLowerCase();
        return code.includes(searchLower) || customer.includes(searchLower) || phone.includes(searchLower) || plate.includes(searchLower);
    });

    const getBookingRevenue = (record) => {
        if (record.billing?.finalAmount != null) {
            const final = Number(record.billing.finalAmount);
            const deposit = Number(record.billing.depositAmount || 0);
            return final + deposit;
        }
        return (record.bookingDetails || []).reduce((sum, d) => sum + Number(d.finalPrice || d.priceAtBooking || 0), 0);
    };

    const columns = [
        {
            title: 'Mã đặt lịch',
            dataIndex: 'bookingCode',
            key: 'bookingCode',
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: 'Ngày',
            dataIndex: 'slotDate',
            key: 'slotDate',
            render: (text) => text ? dayjs(text).format('DD/MM/YYYY') : '—',
        },
        {
            title: 'Khách hàng',
            key: 'customer',
            render: (_, record) => (
                <div>
                    <div><Text strong>{record.customer?.fullName}</Text></div>
                    <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.customer?.phoneNumber}</div>
                </div>
            )
        },
        {
            title: 'Phương tiện',
            key: 'vehicle',
            render: (_, record) => (
                <div>
                    <div><Text strong>{record.vehicle?.licensePlate}</Text></div>
                    <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.vehicle?.brand} {record.vehicle?.model}</div>
                </div>
            )
        },
        {
            title: 'Khung giờ',
            key: 'time',
            render: (_, record) => (
                <Text>
                    {record.startTime?.substring(0, 5)} - {record.endTime?.substring(0, 5)}
                </Text>
            )
        },
        {
            title: 'Tổng tiền',
            key: 'amount',
            align: 'right',
            render: (_, record) => (
                <Text strong style={{ color: '#1890ff' }}>
                    {formatCurrency(getBookingRevenue(record))}
                </Text>
            )
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: (_, record) => (
                <Tag color={getStatusColor(record.status)}>
                    {getStatusText(record.status)}
                </Tag>
            )
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Tooltip title="Xem chi tiết">
                    <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        ghost
                        size="small"
                        onClick={() => setSelectedBooking(record)}
                    >
                        Chi tiết
                    </Button>
                </Tooltip>
            ),
        },
    ];

    const getPromotionDiscount = (b) => {
        const promotion = b.promotion;
        if (!promotion) return 0;
        return (b.bookingDetails || []).reduce((sum, d) => sum + (Number(d.discountAmount) || 0), 0);
    };

    return (
        <div className="bookings-history-container">
            {/* Filter Bar */}
            <div className="bookings-history__filter-bar">
                <div className="bookings-history__filter-left">
                    <Title level={4} className="bookings-history__title">Lịch sử Cuộc hẹn</Title>
                    <Text className="bookings-history__filter-label">
                        Dữ liệu: <Text strong>{filterLabel}</Text>
                    </Text>
                </div>

                <div className="bookings-history__filter-right">
                    <Segmented
                        options={[
                            { label: <><UnorderedListOutlined style={{ marginRight: 4 }} />Tất cả</>, value: 'all' },
                            { label: <><CalendarOutlined style={{ marginRight: 4 }} />Khoảng ngày</>, value: 'range' },
                            { label: 'Tháng', value: 'month' },
                            { label: 'Năm', value: 'year' },
                        ]}
                        value={filterMode}
                        onChange={setFilterMode}
                    />
                    <div className="bookings-history__filter-picker">
                        {filterMode === 'range' && (
                            <DatePicker.RangePicker
                                value={dateRange}
                                onChange={(d) => d && setDateRange(d)}
                                format="DD/MM/YYYY"
                                allowClear={false}
                            />
                        )}
                        {filterMode === 'month' && (
                            <DatePicker
                                picker="month"
                                value={monthYear}
                                onChange={(d) => d && setMonthYear(d)}
                                format="MM/YYYY"
                                allowClear={false}
                            />
                        )}
                        {filterMode === 'year' && (
                            <DatePicker
                                picker="year"
                                value={year}
                                onChange={(d) => d && setYear(d)}
                                format="YYYY"
                                allowClear={false}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Content Card */}
            <Card className="bookings-history__card">
                <Flex justify="space-between" align="center" wrap="wrap" gap={12} className="bookings-history__card-header">
                    <Text strong>Tổng số: {filteredData.length} lịch hẹn</Text>
                    <Input
                        placeholder="Tìm kiếm mã, tên, SĐT, biển số..."
                        prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                        className="bookings-history__search-input"
                        allowClear
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                    />
                </Flex>

                {loading ? (
                    <div className="bookings-history__loading">
                        <Spin size="large" />
                    </div>
                ) : (
                    <Table
                        columns={columns}
                        dataSource={filteredData}
                        rowKey="id"
                        scroll={{ x: 1000 }}
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: filteredData.length,
                            onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
                        }}
                    />
                )}
            </Card>

            {/* Details Modal */}
            <Modal
                title={<Title level={4} style={{ margin: 0 }}>Chi tiết Cuộc hẹn</Title>}
                open={!!selectedBooking}
                onCancel={() => setSelectedBooking(null)}
                footer={[
                    <Button key="close" onClick={() => setSelectedBooking(null)}>Đóng</Button>,
                ]}
                width={800}
                centered
            >
                {selectedBooking && (() => {
                    const promoDiscount = getPromotionDiscount(selectedBooking);
                    const totalDiscount = Number(selectedBooking.billing?.discountAmount || 0);
                    const voucherDiscount = Math.max(0, totalDiscount - promoDiscount);

                    return (
                        <div className="bookings-history__modal-body">
                            <Descriptions bordered column={2} size="small">
                                <Descriptions.Item label="Mã đặt lịch" span={2}>
                                    <Text strong>{selectedBooking.bookingCode}</Text>
                                </Descriptions.Item>

                                <Descriptions.Item label="Khách hàng">
                                    <Text>{selectedBooking.customer?.fullName || 'N/A'}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Số điện thoại">
                                    <Text>{selectedBooking.customer?.phoneNumber || 'N/A'}</Text>
                                </Descriptions.Item>

                                <Descriptions.Item label="Biển số xe">
                                    <Text>{selectedBooking.vehicle?.licensePlate || 'N/A'}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Loại xe">
                                    {selectedBooking.vehicle?.brand} {selectedBooking.vehicle?.model}
                                </Descriptions.Item>

                                <Descriptions.Item label="Ngày hẹn">
                                    <Text>{selectedBooking.slotDate ? dayjs(selectedBooking.slotDate).format('DD/MM/YYYY') : '—'}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Khung giờ">
                                    <Text>
                                        {selectedBooking.startTime?.substring(0, 5)} - {selectedBooking.endTime?.substring(0, 5)}
                                    </Text>
                                </Descriptions.Item>

                                <Descriptions.Item label="Khoang rửa">
                                    {selectedBooking.washBay || 'Chưa phân bổ'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Nhân viên">
                                    {selectedBooking.staffInfoDTO?.fullName || 'Chưa phân công'}
                                </Descriptions.Item>

                                <Descriptions.Item label="Ghi chú của khách" span={2}>
                                    <Text>{selectedBooking.notes || 'Không có'}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Ghi chú của nhân viên" span={2}>
                                    <Text>{selectedBooking.staffNotes || 'Không có'}</Text>
                                </Descriptions.Item>
                            </Descriptions>

                            <Divider orientation="left" plain>Danh sách dịch vụ</Divider>
                            <Table
                                dataSource={selectedBooking.bookingDetails || []}
                                columns={[
                                    { title: 'Tên dịch vụ', dataIndex: 'serviceName', key: 'serviceName' },
                                    { title: 'Đơn giá', dataIndex: 'priceAtBooking', key: 'priceAtBooking', align: 'right', render: (val) => formatCurrency(val) },
                                    { title: 'Giảm giá', dataIndex: 'discountAmount', key: 'discountAmount', align: 'right', render: (val) => <Text type="danger">-{formatCurrency(val)}</Text> },
                                    { title: 'Thành tiền', dataIndex: 'finalPrice', key: 'finalPrice', align: 'right', render: (val) => <Text strong>{formatCurrency(val)}</Text> },
                                ]}
                                pagination={false}
                                rowKey="servicePriceId"
                                size="small"
                                bordered
                            />

                            <Divider orientation="left" plain>Thông tin thanh toán</Divider>
                            <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
                                <Descriptions.Item label="Khuyến mãi">
                                    {selectedBooking.promotion ? (
                                        <Space>
                                            <Tag color="#52c41a">{selectedBooking.promotion.promotionName}</Tag>
                                            <Text className="booking-history__promotion-text">-{formatCurrency(promoDiscount)}</Text>
                                        </Space>
                                    ) : <Text type="secondary">Không có</Text>}
                                </Descriptions.Item>

                                <Descriptions.Item label="Voucher">
                                    {selectedBooking.billing?.voucher ? (
                                        <Space>
                                            <Tag color="blue">{selectedBooking.billing.voucher.voucherCode}</Tag>
                                            <Text className="booking-history__voucher-text">-{formatCurrency(voucherDiscount)}</Text>
                                        </Space>
                                    ) : <Text type="secondary">Không có</Text>}
                                </Descriptions.Item>

                                <Descriptions.Item label="Tiền cọc">
                                    <Text className="booking-history__deposit-text">{formatCurrency(selectedBooking.billing?.depositAmount)}</Text>
                                </Descriptions.Item>

                                <Descriptions.Item label="Phương thức thanh toán">
                                    {selectedBooking.billing?.paymentMethod === 'CASH'
                                        ? 'Tiền mặt'
                                        : 'Chuyển khoản' || 'N/A'}
                                </Descriptions.Item>

                                <Descriptions.Item label="Tổng thanh toán">
                                    <Title level={4} style={{ color: '#52c41a', fontSize: '16px' }}>
                                        {formatCurrency(selectedBooking.billing?.finalAmount)}
                                    </Title>
                                </Descriptions.Item>
                            </Descriptions>
                        </div>
                    );
                })()}
            </Modal>
        </div>
    );
}
