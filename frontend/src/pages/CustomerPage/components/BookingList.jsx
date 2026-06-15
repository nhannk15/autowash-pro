import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { CarOutlined } from '@ant-design/icons';
import './Booking.css';
import axios from 'axios';
import { message } from 'antd';
function VehicleImage({ src, alt, fallbackIcon }) {
    const [hasError, setHasError] = useState(false);

    if (!src || hasError) {
        return fallbackIcon;
    }

    return (
        <img
            src={src}
            alt={alt}
            className="vehicle-card__image"
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
        />
    );
}

export default function BookingList() {
    const { user } = useAuth();

    // Các trạng thái của Wizard
    const [currentStep, setCurrentStep] = useState(1);
    const [maxUnlockedStep, setMaxUnlockedStep] = useState(1);
    const [isSuccess, setIsSuccess] = useState(false);

    // Dữ liệu lựa chọn đặt lịch
    const [selectedVehicleType, setSelectedVehicleType] = useState(null); // 'SEDAN' hoặc 'SUV'
    const [services, setServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedTimeSlotId, setSelectedTimeSlotId] = useState(null);
    const [activeTab, setActiveTab] = useState('all');

    // Trạng thái cho Khung giờ trống (Bays)
    const [timeSlots, setTimeSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [errorSlots, setErrorSlots] = useState(null);

    // Thông tin khách hàng & khuyến mãi phục vụ tính tiền ở Frontend
    const [customer, setCustomer] = useState(null);
    const [promotions, setPromotions] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [bookingError, setBookingError] = useState(null);

    // Danh sách xe của khách hàng từ API thực tế
    const [userVehicles, setUserVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [loadingVehicles, setLoadingVehicles] = useState(false);
    const [errorVehicles, setErrorVehicles] = useState(null);

    // Lấy danh sách xe của khách hàng từ API thực tế
    useEffect(() => {
        const fetchVehicles = async () => {
            if (!user) return;
            setLoadingVehicles(true);
            setErrorVehicles(null);
            try {
                const response = await axios.get(`/api/vehicles/user`);
                const result = response.data
                const vehicleList = result?.data || [];
                
                // Lọc bỏ những xe đã bị xóa mềm/vô hiệu hóa
                const activeVehicles = vehicleList.filter(v => v.active !== false && v.isActive !== false);
                setUserVehicles(activeVehicles);

                // Tự động chọn xe hoạt động đầu tiên nếu có danh sách
                if (activeVehicles.length > 0) {
                    setSelectedVehicle(activeVehicles[0]);
                    setSelectedVehicleType(activeVehicles[0].typeName);
                    setMaxUnlockedStep(prev => Math.max(prev, 2));
                }
            } catch (err) {
                setErrorVehicles(err.response?.data.message || err.message || 'không thể tải danh sách xe của bạn');
                setUserVehicles([]);
            } finally {
                setLoadingVehicles(false);
            }
        };

        fetchVehicles();
    }, [user]);
    // Mảng phụ thuộc báo cho React biết: "Hãy chạy lại hàm bên trong useEffect mỗi khi giá trị của biến user thay đổi".
    // Đề phòng trường hợp Token hết hạn ngầm (Session Expired)
    // Nếu người dùng treo máy ở trang này quá lâu, Token/Cookie đăng nhập bị hết hạn:

    // Hệ thống Auth ngầm sẽ tự động cập nhật user thành null.
    // Nhờ có [user], giao diện sẽ tự động phản ứng: khóa chức năng đặt lịch và xóa danh sách xe ngay lập tức, thay vì để người dùng tiếp tục bấm đặt lịch bằng dữ liệu cũ và nhận lỗi crash hệ thống từ Backend.


    // Lấy thông tin chi tiết khách hàng theo tài khoản đang đăng nhập để tính hạng thành viên và áp khuyến mãi
    // useEffect(() => {
    //     if (!user) return;
    //     const fetchCustomerInfo = async () => {
    //         try {
    //             const response = await fetch(`/api/customers/${user.id}`);
    //             if (response.ok) {
    //                 const result = await response.json();
    //                 setCustomer(result.data || result);
    //             }
    //         } catch (err) {
    //             console.error("Failed to fetch customer info:", err);
    //         }
    //     };
    //     fetchCustomerInfo();
    // }, [user]);

    // Lấy danh sách chương trình khuyến mãi
    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                const response = await axios.get('/api/promotions');

                const result = response.data;
                setPromotions(result?.data || []);

            } catch (err) {
                console.error("Failed to fetch promotions:", err);
                message.warning(err.response?.data.message || err.message || "không thể tải danh sách chương trình khuyến mãi")
            }
        };
        fetchPromotions();
    }, []);

    // Tìm chương trình khuyến mãi phù hợp dựa trên ngày đặt lịch và hạng thành viên
    const getApplicablePromotion = () => {
        if (!selectedDate || !customer || !customer.tier || promotions.length === 0) return null;
        const tierId = customer.tier.id;
        const bookingDateTime = new Date(selectedDate + "T00:00:00");

        const applicable = promotions.filter(p => {
            if (!p.active) return false;
            if (p.usageCount >= p.maxUsesTotal) return false;

            const startDate = new Date(p.startDate);
            const endDate = new Date(p.endDate);
            if (bookingDateTime < startDate || bookingDateTime > endDate) return false;

            const TIER_LEVELS = {
                'Bronze': 1,
                'Silver': 2,
                'Gold': 3,
                'Platinum': 4
            };
            if (p.minTierName) {
                const requiredLevel = TIER_LEVELS[p.minTierName] || 0;
                const currentLevel = customer.tier.tierLevel || 0;
                if (currentLevel < requiredLevel) return false;
            }

            return true;
        });

        if (applicable.length === 0) return null;

        applicable.sort((a, b) => b.discountValue - a.discountValue);
        return applicable[0];
    };

    // Trạng thái tải API dịch vụ
    const [loadingServices, setLoadingServices] = useState(false);
    const [errorServices, setErrorServices] = useState(null);

    // Form xác nhận liên hệ (pre-fill từ user profile)
    const [contactInfo, setContactInfo] = useState({
        fullname: '',
        phone: '',
        email: '',
        notes: ''
    });

    // Cập nhật thông tin liên hệ khi có dữ liệu user đăng nhập
    useEffect(() => {
        if (user) {
            setContactInfo({
                fullname: user.fullname || '',
                phone: user.phone || user.phoneNumber || '',
                email: user.email || '',
                notes: ''
            });
        }
    }, [user]);

    // Lấy dữ liệu dịch vụ từ API hệ thống thực tế
    useEffect(() => {
        const fetchServices = async () => {
            setLoadingServices(true);
            setErrorServices(null);
            try {
                const response = await axios.get("/api/services");
                const result = response.data;
                const serviceList = result?.data || [];
                if (Array.isArray(serviceList)) {
                    // Chuẩn hóa cấu trúc dịch vụ tương tự trang Dịch Vụ chính
                    const formatted = serviceList.map(item => {
                        const priceSedanItem = item.servicePrices?.find(sp => sp.vehicleType?.typeName === 'SEDAN');
                        const priceSuvItem = item.servicePrices?.find(sp => sp.vehicleType?.typeName === 'SUV');
                        return {
                            id: item.serviceId, // Sử dụng serviceId từ API thực tế
                            name: item.serviceName,
                            type: item.category ? item.category.toLowerCase() : 'basic',
                            shortDesc: item.description || '',
                            priceSedan: priceSedanItem ? priceSedanItem.price : 0,
                            priceSuv: priceSuvItem ? priceSuvItem.price : 0,
                            priceSedanId: priceSedanItem ? priceSedanItem.servicePriceId : null,
                            priceSuvId: priceSuvItem ? priceSuvItem.servicePriceId : null,
                            duration: item.duration || 0,
                        };
                    });
                    setServices(formatted);
                } else {
                    throw new Error("Định dạng dữ liệu API không đúng.");
                }
            } catch (err) {
                setErrorServices(err.response?.data.message || err.message || "Không thể tải danh sách dịch vụ");
            } finally {
                setLoadingServices(false);
            }
        };
        fetchServices();
    }, []);

    // Lấy dữ liệu khung giờ trống khi ngày thay đổi hoặc khi người dùng quay lại màn hình chọn giờ (Bước 3)
    useEffect(() => {
        if (!selectedDate || currentStep !== 3) return;
        const fetchAvailableSlots = async () => {
            setLoadingSlots(true);
            setErrorSlots(null);
            try {
                const response = await axios.get(`/api/bookings/available-slots?date=${selectedDate}`);

                const result = response.data
                const slotList = result?.timeSlotAvailabilityResponses || [];
                setTimeSlots(slotList);
            } catch (err) {
                setErrorSlots(err.response?.data.message || err.message);
                setTimeSlots([]);
            } finally {
                setLoadingSlots(false);
            }
        };
        fetchAvailableSlots();
    }, [selectedDate, currentStep]);

    // Phân loại các slot theo buổi (Sáng, Chiều, Tối)
    const getSlotsForPeriod = (period) => {
        return timeSlots.filter(slot => {
            if (!slot.startTime) return false;
            const hour = parseInt(slot.startTime.split(':')[0], 10);
            if (period === 'morning') return hour >= 7 && hour < 12;
            if (period === 'afternoon') return hour >= 12 && hour < 17;
            if (period === 'evening') return hour >= 17 && hour < 22;
            return false;
        });
    };

    // Set ngày đặt lịch mặc định là ngày mai
    useEffect(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const yyyy = tomorrow.getFullYear();
        const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const dd = String(tomorrow.getDate()).padStart(2, '0');
        setSelectedDate(`${yyyy}-${mm}-${dd}`);
    }, []);

    // Quản lý việc click chọn các bước trên thanh Stepper
    const handleStepClick = (stepNum) => {
        if (stepNum <= maxUnlockedStep) {
            setCurrentStep(stepNum);
        }
    };

    // Điều hướng tiến tới bước tiếp theo
    const handleNextStep = () => {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        if (nextStep > maxUnlockedStep) {
            setMaxUnlockedStep(nextStep);
        }
    };

    // Điều hướng lùi lại bước trước
    const handleBackStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Thêm/Xóa dịch vụ khỏi lịch đặt
    const handleToggleService = (service) => {
        const isSelected = selectedServices.some(s => s.id === service.id);
        if (isSelected) {
            setSelectedServices(selectedServices.filter(s => s.id !== service.id));
        } else {
            setSelectedServices([...selectedServices, service]);
        }
    };

    // Định dạng hiển thị tiền tệ VND
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Lấy giá tiền cụ thể của dịch vụ dựa trên loại xe đã chọn
    const getServicePrice = (service) => {
        return selectedVehicleType === 'SEDAN' ? service.priceSedan : service.priceSuv;
    };

    // Tính tổng tiền tạm tính hiện tại
    const calculateTotal = () => {
        return selectedServices.reduce((sum, s) => sum + getServicePrice(s), 0);
    };

    // Lọc dịch vụ theo Tab bộ lọc
    const filteredServices = services.filter(service => {
        if (activeTab === 'all') return true;
        if (activeTab === 'basic') {
            return service.type === 'basic' || service.type === 'addon';
        }
        return service.type === activeTab;
    });

    const premiumCount = services.filter(s => s.type === 'premium').length;
    const basicCount = services.filter(s => s.type === 'basic' || s.type === 'addon').length;



    // Cập nhật thông tin Form ghi chú/liên hệ
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setContactInfo(prev => ({ ...prev, [name]: value }));
    };

    // Xử lý gửi đặt lịch thành công (gửi API lên Backend)
    const handleSubmitBooking = async (e) => {
        if (e) e.preventDefault();

        if (!selectedTimeSlotId) {
            setBookingError("Vui lòng chọn khung giờ hẹn.");
            return;
        }

        setSubmitting(true);
        setBookingError(null);

        try {
            const servicePriceIds = selectedServices.map(service =>
                selectedVehicleType === 'SEDAN' ? service.priceSedanId : service.priceSuvId
            );

            const payload = {
                customerId: user ? user.id : 3, // Sử dụng ID của tài khoản đang đăng nhập
                vehicleId: selectedVehicle ? selectedVehicle.vehicleId : null,
                timeSlotId: selectedTimeSlotId,
                bookingDate: selectedDate,
                servicePriceIds: servicePriceIds,
                notes: contactInfo.notes
            };

            await axios.post("/api/bookings", payload);

            setIsSuccess(true);
        } catch (err) {
            setBookingError(err.response?.data?.message || err.message || "Đã xảy ra lỗi khi tạo lịch đặt.")
        } finally {
            setSubmitting(false);
        }
    };

    // Reset lại toàn bộ wizard để đặt lịch mới
    const handleResetBooking = () => {
        setSelectedVehicle(null);
        setSelectedVehicleType(null);
        setSelectedServices([]);
        setSelectedTime('');
        setSelectedTimeSlotId(null);
        setBookingError(null);
        setCurrentStep(1);
        setMaxUnlockedStep(1);
        setIsSuccess(false);
    };

    const steps = [
        { num: 1, label: 'Chọn xe' },
        { num: 2, label: 'Dịch vụ' },
        { num: 3, label: 'Thời gian' },
        { num: 4, label: 'Xác nhận' }
    ];



    return (
        <div className="booking-wizard">
            {/* STEPPER BAR PROGRESS */}
            <div className="booking-stepper">
                {steps.map((step) => {
                    const isCompleted = step.num < currentStep;
                    const isActive = step.num === currentStep;
                    const isClickable = step.num <= maxUnlockedStep;

                    return (
                        <button
                            key={step.num}
                            className={`booking-step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${!isClickable ? 'disabled' : ''}`}
                            onClick={() => handleStepClick(step.num)}
                            disabled={!isClickable}
                            type="button"
                        >
                            <div className="booking-step-circle">
                                {isCompleted ? '✓' : step.num}
                            </div>
                            <span className="booking-step-label">{step.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* STEP 1: CHỌN XE */}
            {currentStep === 1 && (
                <div>
                    <h2 className="booking-step-title">Chọn loại xe của bạn</h2>
                    <p className="booking-step-subtitle">Vui lòng chọn phân khúc xe để áp dụng bảng giá tương ứng tốt nhất</p>

                    {loadingVehicles ? (
                        <p style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Đang tải danh sách xe của bạn...</p>
                    ) : errorVehicles ? (
                        <p style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>Lỗi: {errorVehicles}</p>
                    ) : userVehicles.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Bạn chưa có xe nào. Hãy vào trang "Xe của tôi" để thêm xe.</p>
                    ) : (
                        <div className="vehicle-selection-grid">
                            {userVehicles.map((vehicle) => {
                                const isSelected = selectedVehicle?.vehicleId === vehicle.vehicleId;
                                const isSedan = vehicle.typeName === 'SEDAN';
                                return (
                                    <div
                                        key={vehicle.vehicleId}
                                        className={`vehicle-card ${isSelected ? 'active' : ''}`}
                                        onClick={() => {
                                            setSelectedVehicle(vehicle);
                                            setSelectedVehicleType(vehicle.typeName);
                                            setMaxUnlockedStep(Math.max(maxUnlockedStep, 2));
                                        }}
                                    >
                                        {/* Hình ảnh xe hoặc Icon phân khúc xe */}
                                        <div className="vehicle-card__image-container">
                                            <VehicleImage
                                                src={vehicle.image}
                                                alt={`${vehicle.brand} ${vehicle.model}`}
                                                fallbackIcon={
                                                    <div className="vehicle-card__icon-wrapper">
                                                        {isSedan ? <CarOutlined /> : <span style={{ fontSize: '24px' }}>🚙</span>}
                                                    </div>
                                                }
                                            />
                                        </div>

                                        {/* Tên hãng & dòng xe */}
                                        <h3 className="vehicle-card__title">{vehicle.brand} {vehicle.model}</h3>

                                        {/* Phân khúc xe */}
                                        <span className="vehicle-card__type-tag">
                                            {isSedan ? 'Sedan (4-5 chỗ)' : 'SUV (5-7 chỗ)'}
                                        </span>

                                        {/* Chi tiết biển số & màu sắc */}
                                        <div className="vehicle-card__details">
                                            <div className="vehicle-detail-row">
                                                <span className="vehicle-detail-label">Biển số:</span>
                                                <span className="vehicle-detail-value license-plate">{vehicle.licensePlate}</span>
                                            </div>
                                            <div className="vehicle-detail-row">
                                                <span className="vehicle-detail-label">Màu sắc:</span>
                                                <span className="vehicle-detail-value">{vehicle.color || 'Chưa cập nhật'}</span>
                                            </div>
                                        </div>

                                        {isSelected && <span className="vehicle-card__badge">✓ Đã chọn</span>}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="step-1-footer">
                        <button
                            className="btn-continue-step1"
                            disabled={!selectedVehicleType}
                            onClick={handleNextStep}
                        >
                            TIẾP TỤC CHỌN DỊCH VỤ
                        </button>
                    </div>
                </div>
            )}

            {/* LAYOUT 2 CỘT CHO BƯỚC 2 VÀ BƯỚC 3 */}
            {(currentStep === 2 || currentStep === 3) && (
                <div className="booking-content-layout">
                    {/* BẢNG CHỌN CHÍNH BÊN TRÁI */}
                    <div className="booking-main-panel">
                        {/* BƯỚC 2: CHỌN DỊCH VỤ */}
                        {currentStep === 2 && (
                            <div>
                                <h2 className="booking-step-title">Chọn gói dịch vụ</h2>
                                <p className="booking-step-subtitle">
                                    Chọn các dịch vụ chăm sóc tốt nhất cho xe của bạn ({selectedVehicleType === 'SEDAN' ? 'Xe Sedan' : 'Xe SUV / Bán tải'})
                                </p>

                                <div className="booking-filter-tabs">
                                    <button
                                        className={`booking-filter-btn ${activeTab === 'all' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('all')}
                                    >
                                        Tất cả <span className="tab-count">{services.length}</span>
                                    </button>
                                    <button
                                        className={`booking-filter-btn ${activeTab === 'premium' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('premium')}
                                    >
                                        ✨ Cao cấp <span className="tab-count">{premiumCount}</span>
                                    </button>
                                    <button
                                        className={`booking-filter-btn ${activeTab === 'basic' ? 'active' : ''}`}
                                        onClick={() => setActiveTab('basic')}
                                    >
                                        Cơ bản <span className="tab-count">{basicCount}</span>
                                    </button>
                                </div>

                                {loadingServices ? (
                                    <p style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Đang tải danh sách dịch vụ...</p>
                                ) : errorServices ? (
                                    <p style={{ color: '#ef4444', textAlign: 'center', padding: '40px' }}>Không tải được dịch vụ: {errorServices}</p>
                                ) : (
                                    <div className="booking-services-wrapper">
                                        <div className="booking-services-grid">
                                            {filteredServices.map(service => {
                                                const isSelected = selectedServices.some(s => s.id === service.id);
                                                const priceVal = getServicePrice(service);
                                                return (
                                                    <div
                                                        key={service.id}
                                                        className={`booking-service-card ${service.type === 'premium' ? 'booking-service-card--premium' : ''}`}
                                                    >
                                                        <div className="booking-service-card__header">
                                                            <h3 className="booking-service-card__title">{service.name}</h3>
                                                            <span className="booking-service-card__price">{formatCurrency(priceVal)}</span>
                                                        </div>
                                                        <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '500' }}>
                                                            ⏱ <span>Thời gian: {service.duration} phút</span>
                                                        </div>
                                                        <p className="booking-service-card__desc">{service.shortDesc}</p>
                                                        <button
                                                            type="button"
                                                            className={`booking-service-card__btn ${isSelected ? 'booking-service-card__btn--selected' : 'booking-service-card__btn--add'}`}
                                                            onClick={() => {
                                                                handleToggleService(service);
                                                                // Mở khóa Bước 3 nếu có ít nhất 1 dịch vụ được chọn
                                                                const newSelection = isSelected
                                                                    ? selectedServices.filter(s => s.id !== service.id)
                                                                    : [...selectedServices, service];
                                                                if (newSelection.length > 0) {
                                                                    setMaxUnlockedStep(Math.max(maxUnlockedStep, 3));
                                                                } else {
                                                                    setMaxUnlockedStep(2); // khóa lại bước sau nếu không chọn dịch vụ nào
                                                                }
                                                            }}
                                                        >
                                                            {isSelected ? 'ĐÃ CHỌN' : 'THÊM'}
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* BƯỚC 3: CHỌN THỜI GIAN */}
                        {currentStep === 3 && (
                            <div className="booking-datetime-container">
                                <div>
                                    <h2 className="booking-step-title">Chọn thời gian</h2>
                                    <p className="booking-step-subtitle">Chọn ngày và khung giờ bạn muốn đưa xe đến trung tâm chăm sóc</p>
                                </div>

                                <div className="booking-datetime-grid-layout">
                                    {/* CỘT TRÁI: CHỌN NGÀY */}
                                    <div className="datetime-left-col">
                                        <div className="booking-input-group">
                                            <label className="booking-input-label">CHỌN NGÀY HẸN</label>
                                            <input
                                                type="date"
                                                className="booking-date-picker"
                                                value={selectedDate}
                                                onChange={(e) => {
                                                    const newDate = e.target.value;
                                                    setSelectedDate(newDate);
                                                    setSelectedTime('');
                                                    setSelectedTimeSlotId(null);
                                                    setMaxUnlockedStep(3); // Reset step progress to Step 3 (chọn giờ)
                                                }}
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                    </div>

                                    {/* CỘT PHẢI: CHỌN KHUNG GIỜ */}
                                    <div className="datetime-right-col">
                                        <div className="booking-input-group">
                                            <label className="booking-input-label">CHỌN KHUNG GIỜ</label>

                                            {loadingSlots ? (
                                                <p style={{ textAlign: 'center', padding: '30px 0', color: '#64748b', fontWeight: '500' }}>Đang tải danh sách khung giờ...</p>
                                            ) : errorSlots ? (
                                                <p style={{ color: '#ef4444', textAlign: 'center', padding: '30px 0', fontWeight: '500' }}>Không thể tải khung giờ: {errorSlots}</p>
                                            ) : timeSlots.length === 0 ? (
                                                <p style={{ textAlign: 'center', padding: '30px 0', color: '#64748b', fontWeight: '500' }}>Không có khung giờ nào hoạt động cho ngày này.</p>
                                            ) : (
                                                <>
                                                    {/* BUỔI SÁNG */}
                                                    {getSlotsForPeriod('morning').length > 0 && (
                                                        <div className="time-period-group">
                                                            <h4 className="time-period-title">BUỔI SÁNG (07:00 - 12:00)</h4>
                                                            <div className="booking-time-grid">
                                                                {getSlotsForPeriod('morning').map(slot => {
                                                                    const timeStr = slot.startTime.substring(0, 5);
                                                                    const isSelected = selectedTime === timeStr;
                                                                    const isDisabled = slot.availableBayCount === 0 || !(slot.isAvailable ?? slot.available);
                                                                    return (
                                                                        <button
                                                                            key={slot.timeSlotId}
                                                                            type="button"
                                                                            disabled={isDisabled}
                                                                            className={`booking-time-slot ${isSelected ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
                                                                            onClick={() => {
                                                                                setSelectedTime(timeStr);
                                                                                setSelectedTimeSlotId(slot.timeSlotId);
                                                                                if (selectedDate) {
                                                                                    setMaxUnlockedStep(Math.max(maxUnlockedStep, 4));
                                                                                }
                                                                            }}
                                                                        >
                                                                            {timeStr}
                                                                            <span className="bay-count">({slot.availableBayCount} khoang)</span>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* BUỔI CHIỀU */}
                                                    {getSlotsForPeriod('afternoon').length > 0 && (
                                                        <div className="time-period-group" style={{ marginTop: '16px' }}>
                                                            <h4 className="time-period-title">BUỔI CHIỀU (12:00 - 17:00)</h4>
                                                            <div className="booking-time-grid">
                                                                {getSlotsForPeriod('afternoon').map(slot => {
                                                                    const timeStr = slot.startTime.substring(0, 5);
                                                                    const isSelected = selectedTime === timeStr;
                                                                    const isDisabled = slot.availableBayCount === 0 || !(slot.isAvailable ?? slot.available);
                                                                    return (
                                                                        <button
                                                                            key={slot.timeSlotId}
                                                                            type="button"
                                                                            disabled={isDisabled}
                                                                            className={`booking-time-slot ${isSelected ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
                                                                            onClick={() => {
                                                                                setSelectedTime(timeStr);
                                                                                setSelectedTimeSlotId(slot.timeSlotId);
                                                                                if (selectedDate) {
                                                                                    setMaxUnlockedStep(Math.max(maxUnlockedStep, 4));
                                                                                }
                                                                            }}
                                                                        >
                                                                            {timeStr}
                                                                            <span className="bay-count">({slot.availableBayCount} khoang)</span>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* BUỔI TỐI */}
                                                    {getSlotsForPeriod('evening').length > 0 && (
                                                        <div className="time-period-group" style={{ marginTop: '16px' }}>
                                                            <h4 className="time-period-title">BUỔI TỐI (17:00 - 22:00)</h4>
                                                            <div className="booking-time-grid">
                                                                {getSlotsForPeriod('evening').map(slot => {
                                                                    const timeStr = slot.startTime.substring(0, 5);
                                                                    const isSelected = selectedTime === timeStr;
                                                                    const isDisabled = slot.availableBayCount === 0 || !(slot.isAvailable ?? slot.available);
                                                                    return (
                                                                        <button
                                                                            key={slot.timeSlotId}
                                                                            type="button"
                                                                            disabled={isDisabled}
                                                                            className={`booking-time-slot ${isSelected ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
                                                                            onClick={() => {
                                                                                setSelectedTime(timeStr);
                                                                                setSelectedTimeSlotId(slot.timeSlotId);
                                                                                if (selectedDate) {
                                                                                    setMaxUnlockedStep(Math.max(maxUnlockedStep, 4));
                                                                                }
                                                                            }}
                                                                        >
                                                                            {timeStr}
                                                                            <span className="bay-count">({slot.availableBayCount} khoang)</span>
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* CỘT TÓM TẮT BÊN PHẢI (SIDEBAR) */}
                    <div className="booking-sidebar">
                        <h3 className="sidebar-summary-title">Tạm tính</h3>

                        <div className="sidebar-car-info">
                            <span>🚗 Xe chăm sóc:</span>
                            {selectedVehicle ? (
                                <strong>
                                    {selectedVehicle.brand} {selectedVehicle.model} ({selectedVehicle.licensePlate})
                                </strong>
                            ) : (
                                <strong>{selectedVehicleType === 'SEDAN' ? 'Sedan (4-5 chỗ)' : 'SUV (5-7 chỗ)'}</strong>
                            )}
                        </div>

                        <div className="sidebar-service-list">
                            {selectedServices.length === 0 ? (
                                <p className="sidebar-empty-state">Chưa chọn dịch vụ nào...</p>
                            ) : (
                                selectedServices.map(service => (
                                    <div key={service.id} className="sidebar-service-item">
                                        <span className="service-name">{service.name}</span>
                                        <span className="service-price">{formatCurrency(getServicePrice(service))}</span>
                                    </div>
                                ))
                            )}
                        </div>

                        {currentStep === 3 && selectedDate && selectedTime && (
                            <div className="sidebar-car-info" style={{ backgroundColor: '#fffdf5', border: '1.5px dashed #f5a623', color: '#b45309' }}>
                                <span>⏱ Hẹn:</span>
                                <strong>{selectedTime} - {selectedDate.split('-').reverse().join('/')}</strong>
                            </div>
                        )}

                        <hr className="sidebar-divider" />

                        <div className="sidebar-total-row">
                            <span className="sidebar-total-label">Tổng cộng</span>
                            <span className="sidebar-total-value">{formatCurrency(calculateTotal())}</span>
                        </div>

                        {currentStep === 2 ? (
                            <button
                                type="button"
                                className="sidebar-btn-next"
                                disabled={selectedServices.length === 0}
                                onClick={handleNextStep}
                            >
                                TIẾP TỤC
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="sidebar-btn-next"
                                disabled={!selectedDate || !selectedTime}
                                onClick={handleNextStep}
                            >
                                TIẾP TỤC
                            </button>
                        )}

                        <button
                            type="button"
                            className="sidebar-btn-back"
                            onClick={handleBackStep}
                        >
                            Quay lại bước trước
                        </button>
                    </div>
                </div>
            )}

            {/* BƯỚC 4: XÁC NHẬN */}
            {currentStep === 4 && (
                <div className="booking-content-layout">
                    {/* CỘT TRÁI: THÔNG TIN TÓM TẮT LỊCH HẸN */}
                    <div className="booking-main-panel">
                        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', boxShadow: '0 8px 24px rgba(13, 27, 75, 0.02)' }}>
                            <h2 className="booking-step-title" style={{ fontSize: '1.4rem', marginBottom: '20px' }}>Chi tiết lịch hẹn</h2>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <h4 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px 0', fontWeight: 'bold' }}>🚗 Xe chăm sóc</h4>
                                    <div style={{ fontSize: '1rem', fontWeight: '700', color: '#0d1b4b' }}>
                                        {selectedVehicle ? (
                                            `${selectedVehicle.brand} ${selectedVehicle.model} (${selectedVehicle.licensePlate})`
                                        ) : (
                                            selectedVehicleType === 'SEDAN' ? 'Xe Sedan (4-5 chỗ)' : 'Xe SUV / Bán tải (5-7 chỗ)'
                                        )}
                                    </div>
                                    <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '500', marginTop: '4px' }}>
                                        Phân khúc: {selectedVehicleType === 'SEDAN' ? 'Sedan (4-5 chỗ)' : 'SUV / Bán tải (5-7 chỗ)'}
                                    </div>
                                </div>

                                <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <h4 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px 0', fontWeight: 'bold' }}>📅 Thời gian hẹn</h4>
                                    <div style={{ fontSize: '1rem', fontWeight: '700', color: '#0d1b4b' }}>
                                        {selectedTime} ngày {selectedDate.split('-').reverse().join('/')}
                                    </div>
                                    <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '500', marginTop: '4px' }}>
                                        Vui lòng đến đúng giờ hẹn để tiệm phục vụ chu đáo nhất
                                    </div>
                                </div>
                            </div>

                            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                                <h4 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px 0', fontWeight: 'bold' }}>🛠 Dịch vụ đã chọn</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {selectedServices.map(service => (
                                        <div key={service.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.92rem', color: '#334155' }}>
                                            <span style={{ fontWeight: '600' }}>• {service.name}</span>
                                            <span style={{ fontWeight: '700', color: '#0d1b4b' }}>{formatCurrency(getServicePrice(service))}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* GHI CHÚ / YÊU CẦU THÊM DỜI SANG CỘT TRÁI ĐỂ CỘT PHẢI CỰC KỲ GỌN GÀNG */}
                            <div style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                                <h4 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px 0', fontWeight: 'bold' }}>📝 Ghi chú / Yêu cầu thêm</h4>
                                <textarea
                                    name="notes"
                                    className="form-input form-textarea"
                                    style={{
                                        width: '100%',
                                        height: '80px',
                                        marginTop: '8px',
                                        fontSize: '0.88rem',
                                        padding: '10px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        resize: 'none',
                                        fontFamily: 'inherit'
                                    }}
                                    placeholder="Ghi chú về tình trạng xe hoặc các yêu cầu thêm..."
                                    value={contactInfo.notes}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* CỘT PHẢI: TỔNG TIỀN & NÚT ĐẶT LỊCH */}
                    <div className="booking-sidebar" style={{ position: 'sticky', top: '85px' }}>
                        <h3 className="sidebar-summary-title" style={{ margin: '0 0 16px 0' }}>Xác nhận đặt lịch</h3>

                        <div className="confirm-summary-card">
                            {(() => {
                                const appPromo = getApplicablePromotion();
                                const originalTotal = calculateTotal();
                                let discountAmount = 0;
                                if (appPromo) {
                                    if (appPromo.discountType === 'PERCENTAGE') {
                                        discountAmount = originalTotal * (appPromo.discountValue / 100);
                                    } else if (appPromo.discountType === 'FIXED_AMOUNT') {
                                        discountAmount = appPromo.discountValue;
                                    }
                                    discountAmount = Math.min(discountAmount, originalTotal);
                                }
                                const finalTotal = originalTotal - discountAmount;

                                if (discountAmount > 0) {
                                    return (
                                        <div className="sidebar-total-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', marginBottom: '16px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                <span className="sidebar-total-label" style={{ fontSize: '0.9rem' }}>Tổng chi phí gốc</span>
                                                <span className="sidebar-total-value" style={{ textDecoration: 'line-through', color: '#64748b', fontSize: '1rem' }}>
                                                    {formatCurrency(originalTotal)}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', borderTop: '1px dashed #e2e8f0', paddingTop: '6px' }}>
                                                <span className="sidebar-total-label" style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.95rem' }}>Sau giảm giá</span>
                                                <span className="sidebar-total-value" style={{ color: '#ef4444', fontSize: '1.3rem', fontWeight: 'bold' }}>
                                                    {formatCurrency(finalTotal)}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: '600', marginTop: '2px', backgroundColor: '#ecfdf5', padding: '4px 8px', borderRadius: '4px', width: '100%', textAlign: 'center' }}>
                                                🎁 Áp dụng: {appPromo.promotionName} (-{formatCurrency(discountAmount)})
                                            </div>
                                        </div>
                                    );
                                } else {
                                    return (
                                        <div className="sidebar-total-row" style={{ marginBottom: '16px' }}>
                                            <span className="sidebar-total-label">Tổng chi phí</span>
                                            <span className="sidebar-total-value" style={{ fontSize: '1.25rem' }}>{formatCurrency(originalTotal)}</span>
                                        </div>
                                    );
                                }
                            })()}

                            {bookingError && (
                                <div style={{
                                    color: '#ef4444',
                                    backgroundColor: '#fef2f2',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: '1px solid #fecaca',
                                    margin: '0 0 12px 0',
                                    fontSize: '0.85rem',
                                    fontWeight: '500'
                                }}>
                                    ⚠️ {bookingError}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="sidebar-btn-confirm"
                                disabled={submitting}
                                onClick={handleSubmitBooking}
                            >
                                {submitting ? "ĐANG XỬ LÝ..." : "XÁC NHẬN ĐẶT LỊCH"}
                            </button>
                            <button
                                type="button"
                                className="sidebar-btn-back"
                                disabled={submitting}
                                onClick={handleBackStep}
                            >
                                Quay lại bước trước
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL THÀNH CÔNG */}
            {isSuccess && (
                <div className="booking-success-modal-backdrop">
                    <div className="booking-success-modal-content">
                        <button
                            type="button"
                            className="modal-close-btn"
                            onClick={handleResetBooking}
                            aria-label="Close"
                        >
                            ✕
                        </button>
                        <div className="success-icon-circle">✓</div>
                        <h2 className="success-title">Đặt lịch thành công!</h2>
                        <p className="success-message">
                            Cảm ơn bạn đã lựa chọn Autowash PRO. Đơn đặt lịch của bạn đã được ghi nhận thành công, chúng tôi sẽ liên hệ sớm nhất để xác nhận.
                        </p>

                        <div className="success-details">
                            <div className="success-detail-item">
                                <span>Khách hàng:</span>
                                <strong>{customer ? customer.fullName : contactInfo.fullname}</strong>
                            </div>
                            <div className="success-detail-item">
                                <span>Số điện thoại:</span>
                                <strong>{customer ? customer.phoneNumber : contactInfo.phone}</strong>
                            </div>
                            <div className="success-detail-item">
                                <span>Xe chăm sóc:</span>
                                <strong>{selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model} (${selectedVehicle.licensePlate})` : (selectedVehicleType === 'SEDAN' ? 'Xe Sedan (4-5 chỗ)' : 'Xe SUV / Bán tải (5-7 chỗ)')}</strong>
                            </div>
                            <div className="success-detail-item">
                                <span>Phân khúc:</span>
                                <strong>{selectedVehicleType === 'SEDAN' ? 'Sedan (4-5 chỗ)' : 'SUV / Bán tải (5-7 chỗ)'}</strong>
                            </div>
                            <div className="success-detail-item">
                                <span>Thời gian:</span>
                                <strong>{selectedTime} - {selectedDate.split('-').reverse().join('/')}</strong>
                            </div>

                            {(() => {
                                const appPromo = getApplicablePromotion();
                                const originalTotal = calculateTotal();
                                let discountAmount = 0;
                                if (appPromo) {
                                    if (appPromo.discountType === 'PERCENTAGE') {
                                        discountAmount = originalTotal * (appPromo.discountValue / 100);
                                    } else if (appPromo.discountType === 'FIXED_AMOUNT') {
                                        discountAmount = appPromo.discountValue;
                                    }
                                    discountAmount = Math.min(discountAmount, originalTotal);
                                }
                                const finalTotal = originalTotal - discountAmount;

                                if (discountAmount > 0) {
                                    return (
                                        <>
                                            <div className="success-detail-item" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: '4px' }}>
                                                <span>Giá gốc:</span>
                                                <span style={{ textDecoration: 'line-through', color: '#64748b' }}>{formatCurrency(originalTotal)}</span>
                                            </div>
                                            <div className="success-detail-item">
                                                <span>Khuyến mãi:</span>
                                                <span style={{ color: '#10b981' }}>{appPromo.promotionName} (-{formatCurrency(discountAmount)})</span>
                                            </div>
                                            <div className="success-detail-item" style={{ fontWeight: 'bold', color: '#ef4444' }}>
                                                <span>Tổng thanh toán:</span>
                                                <strong>{formatCurrency(finalTotal)}</strong>
                                            </div>
                                        </>
                                    );
                                } else {
                                    return (
                                        <div className="success-detail-item" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: '4px', fontWeight: 'bold' }}>
                                            <span>Tổng chi phí:</span>
                                            <strong>{formatCurrency(originalTotal)}</strong>
                                        </div>
                                    );
                                }
                            })()}
                        </div>

                        <button className="btn-success-home" onClick={handleResetBooking}>
                            ĐÓNG
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
