import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import './Booking.css';

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
    const [activeTab, setActiveTab] = useState('all');

    // Mock danh sách xe của khách hàng (thuộc tính tương tự backend)
    const [userVehicles, setUserVehicles] = useState([
        {
            id: 1,
            brand: 'Toyota',
            model: 'Camry',
            licensePlate: '30A-123.45',
            color: 'Đen',
            vehicleType: { typeName: 'SEDAN' }
        },
        {
            id: 2,
            brand: 'Hyundai',
            model: 'SantaFe',
            licensePlate: '30F-678.90',
            color: 'Trắng',
            vehicleType: { typeName: 'SUV' }
        }
    ]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);

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

    // Lấy dữ liệu dịch vụ từ Mock API
    useEffect(() => {
        const fetchServices = async () => {
            setLoadingServices(true);
            setErrorServices(null);
            try {
                const response = await fetch("https://6a1e833ab79eec0d6cef6155.mockapi.io/services");
                if (!response.ok) {
                    throw new Error("Không thể tải danh sách dịch vụ.");
                }
                const result = await response.json();
                if (Array.isArray(result)) {
                    // Chuẩn hóa cấu trúc dịch vụ tương tự trang Dịch Vụ chính
                    const formatted = result.map(item => {
                        const priceSedanItem = item.servicePrices?.find(sp => sp.vehicleType?.typeName === 'SEDAN');
                        const priceSuvItem = item.servicePrices?.find(sp => sp.vehicleType?.typeName === 'SUV');
                        return {
                            id: item.id,
                            name: item.serviceName,
                            type: item.category ? item.category.toLowerCase() : 'basic',
                            shortDesc: item.description || '',
                            priceSedan: priceSedanItem ? priceSedanItem.price : 0,
                            priceSuv: priceSuvItem ? priceSuvItem.price : 0,
                        };
                    });
                    setServices(formatted);
                } else {
                    throw new Error("Định dạng dữ liệu API không đúng.");
                }
            } catch (err) {
                setErrorServices(err.message);
            } finally {
                setLoadingServices(false);
            }
        };
        fetchServices();
    }, []);

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

    // Hàm kiểm tra ngày cuối tuần
    const isWeekend = (dateString) => {
        if (!dateString) return false;
        const date = new Date(dateString);
        const day = date.getDay(); // 0: Chủ Nhật, 6: Thứ Bảy
        return day === 0 || day === 6;
    };

    // Hàm lấy khung giờ tối động dựa trên ngày trong tuần
    const getEveningSlots = (dateString) => {
        return isWeekend(dateString) ? ['18:00', '19:30', '20:30'] : ['18:00', '19:30'];
    };

    // Cập nhật thông tin Form ghi chú/liên hệ
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setContactInfo(prev => ({ ...prev, [name]: value }));
    };

    // Xử lý gửi đặt lịch thành công
    const handleSubmitBooking = (e) => {
        e.preventDefault();
        setIsSuccess(true);
    };

    // Reset lại toàn bộ wizard để đặt lịch mới
    const handleResetBooking = () => {
        setSelectedVehicle(null);
        setSelectedVehicleType(null);
        setSelectedServices([]);
        setSelectedTime('');
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

    if (isSuccess) {
        return (
            <div className="booking-wizard">
                <div className="booking-success-screen">
                    <div className="success-icon-circle">✓</div>
                    <h2 className="success-title">Đặt lịch thành công!</h2>
                    <p className="success-message">
                        Cảm ơn bạn đã lựa chọn Autowash PRO. Đơn đặt lịch của bạn đã được ghi nhận thành công, chúng tôi sẽ liên hệ sớm nhất để xác nhận.
                    </p>
                    <div className="success-details">
                        <div className="success-detail-item">
                            <span>Khách hàng:</span>
                            <strong>{contactInfo.fullname}</strong>
                        </div>
                        <div className="success-detail-item">
                            <span>Số điện thoại:</span>
                            <strong>{contactInfo.phone}</strong>
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
                        <div className="success-detail-item" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: '4px' }}>
                            <span>Tổng chi phí:</span>
                            <strong>{formatCurrency(calculateTotal())}</strong>
                        </div>
                    </div>
                    <button className="btn-success-home" onClick={handleResetBooking}>
                        ĐẶT LỊCH MỚI
                    </button>
                </div>
            </div>
        );
    }

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

                    <div className="vehicle-selection-grid">
                        {userVehicles.map((vehicle) => {
                            const isSelected = selectedVehicle?.id === vehicle.id;
                            const isSedan = vehicle.vehicleType.typeName === 'SEDAN';
                            return (
                                <div
                                    key={vehicle.id}
                                    className={`vehicle-card ${isSelected ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedVehicle(vehicle);
                                        setSelectedVehicleType(vehicle.vehicleType.typeName);
                                        setMaxUnlockedStep(Math.max(maxUnlockedStep, 2));
                                    }}
                                >
                                    <div className="vehicle-card__icon">{isSedan ? '🚗' : '🚙'}</div>
                                    <span className="vehicle-card__type-tag">{isSedan ? 'SEDAN (4-5 chỗ)' : 'SUV (5-7 chỗ)'}</span>
                                    <h3 className="vehicle-card__title">{vehicle.brand} {vehicle.model}</h3>
                                    <div className="vehicle-card__details">
                                        <div className="vehicle-detail-field">
                                            <span className="detail-label">Biển số:</span>
                                            <span className="detail-value license-plate">{vehicle.licensePlate}</span>
                                        </div>
                                        <div className="vehicle-detail-field">
                                            <span className="detail-label">Màu sắc:</span>
                                            <span className="detail-value">{vehicle.color}</span>
                                        </div>
                                    </div>
                                    {isSelected && <span className="vehicle-card__badge">✓ Đã chọn</span>}
                                </div>
                            );
                        })}
                    </div>

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
                                                    // Reset slot 20:30 nếu ngày mới chọn là ngày thường (chỉ mở đến 21:00)
                                                    if (selectedTime === '20:30' && !isWeekend(newDate)) {
                                                        setSelectedTime('');
                                                        setMaxUnlockedStep(3); // khóa lại bước 4
                                                    } else if (newDate && selectedTime) {
                                                        setMaxUnlockedStep(Math.max(maxUnlockedStep, 4));
                                                    }
                                                }}
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                    </div>

                                    {/* CỘT PHẢI: CHỌN KHUNG GIỜ */}
                                    <div className="datetime-right-col">
                                        <div className="booking-input-group">
                                            <label className="booking-input-label">CHỌN KHUNG GIỜ</label>

                                            <div className="time-period-group">
                                                <h4 className="time-period-title">BUỔI SÁNG (07:00 - 12:00)</h4>
                                                <div className="booking-time-grid">
                                                    {['07:30', '09:00', '10:30'].map(slot => (
                                                        <div
                                                            key={slot}
                                                            className={`booking-time-slot ${selectedTime === slot ? 'active' : ''}`}
                                                            onClick={() => {
                                                                setSelectedTime(slot);
                                                                if (selectedDate) {
                                                                    setMaxUnlockedStep(Math.max(maxUnlockedStep, 4));
                                                                }
                                                            }}
                                                        >
                                                            {slot}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="time-period-group" style={{ marginTop: '16px' }}>
                                                <h4 className="time-period-title">BUỔI CHIỀU (12:00 - 17:00)</h4>
                                                <div className="booking-time-grid">
                                                    {['13:30', '15:00', '16:30'].map(slot => (
                                                        <div
                                                            key={slot}
                                                            className={`booking-time-slot ${selectedTime === slot ? 'active' : ''}`}
                                                            onClick={() => {
                                                                setSelectedTime(slot);
                                                                if (selectedDate) {
                                                                    setMaxUnlockedStep(Math.max(maxUnlockedStep, 4));
                                                                }
                                                            }}
                                                        >
                                                            {slot}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="time-period-group" style={{ marginTop: '16px' }}>
                                                <h4 className="time-period-title">
                                                    BUỔI TỐI (17:00 - {isWeekend(selectedDate) ? '22:00' : '21:00'})
                                                </h4>
                                                <div className="booking-time-grid">
                                                    {getEveningSlots(selectedDate).map(slot => (
                                                        <div
                                                            key={slot}
                                                            className={`booking-time-slot ${selectedTime === slot ? 'active' : ''}`}
                                                            onClick={() => {
                                                                setSelectedTime(slot);
                                                                if (selectedDate) {
                                                                    setMaxUnlockedStep(Math.max(maxUnlockedStep, 4));
                                                                }
                                                            }}
                                                        >
                                                            {slot}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
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
                <div className="booking-confirm-layout">
                    {/* CỘT TRÁI: FORM THÔNG TIN LIÊN HỆ */}
                    <form className="booking-confirm-form-panel" onSubmit={handleSubmitBooking}>
                        <h2 className="booking-step-title">Thông tin khách hàng</h2>
                        <p className="booking-step-subtitle">Vui lòng kiểm tra và hoàn thiện thông tin liên hệ đặt lịch</p>

                        <div className="booking-confirm-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">HỌ VÀ TÊN KHÁCH HÀNG</label>
                                    <input
                                        type="text"
                                        name="fullname"
                                        className="form-input"
                                        required
                                        value={contactInfo.fullname}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">SỐ ĐIỆN THOẠI LÊN HỆ</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="form-input"
                                        required
                                        placeholder="Ví dụ: 0912345678"
                                        value={contactInfo.phone}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">ĐỊA CHỈ EMAIL</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-input"
                                    disabled
                                    value={contactInfo.email}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">GHI CHÚ HƯỚNG DẪN / YÊU CẦU THÊM (NẾU CÓ)</label>
                                <textarea
                                    name="notes"
                                    className="form-input form-textarea"
                                    placeholder="Ghi chú về dòng xe, tình trạng xe hiện tại hoặc các yêu cầu đặc biệt khác..."
                                    value={contactInfo.notes}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </form>

                    {/* CỘT PHẢI: BIÊN NHẬN TÓM TẮT & NÚT SUBMIT */}
                    <div className="booking-confirm-sidebar">
                        <h3 className="sidebar-summary-title">Tóm tắt đặt lịch</h3>

                        <div className="confirm-summary-card">
                            <div className="confirm-summary-section">
                                <h4 className="confirm-section-title">🚗 Xe chăm sóc</h4>
                                <div className="confirm-val-text">
                                    {selectedVehicle ? (
                                        `${selectedVehicle.brand} ${selectedVehicle.model} (${selectedVehicle.licensePlate})`
                                    ) : (
                                        selectedVehicleType === 'SEDAN' ? 'Xe Sedan (4-5 chỗ)' : 'Xe SUV / Bán tải (5-7 chỗ)'
                                    )}
                                </div>
                                <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '500', marginTop: '2px' }}>
                                    Phân khúc: {selectedVehicleType === 'SEDAN' ? 'Sedan (4-5 chỗ)' : 'SUV / Bán tải (5-7 chỗ)'}
                                </div>
                            </div>

                            <div className="confirm-summary-section">
                                <h4 className="confirm-section-title">📅 Thời gian hẹn</h4>
                                <div className="confirm-val-text">
                                    {selectedTime} ngày {selectedDate.split('-').reverse().join('/')}
                                </div>
                            </div>

                            <div className="confirm-summary-section">
                                <h4 className="confirm-section-title">🛠 Dịch vụ đã chọn</h4>
                                <div className="confirm-services-mini-list">
                                    {selectedServices.map(service => (
                                        <div key={service.id} className="confirm-mini-item">
                                            <span className="name">• {service.name}</span>
                                            <span className="price">{formatCurrency(getServicePrice(service))}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <hr className="sidebar-divider" />

                            <div className="sidebar-total-row">
                                <span className="sidebar-total-label">Tổng chi phí</span>
                                <span className="sidebar-total-value">{formatCurrency(calculateTotal())}</span>
                            </div>

                            <button
                                type="submit"
                                className="sidebar-btn-next"
                                onClick={handleSubmitBooking}
                            >
                                XÁC NHẬN ĐẶT LỊCH RỬA XE
                            </button>
                            <button
                                type="button"
                                className="sidebar-btn-back"
                                onClick={handleBackStep}
                            >
                                Quay lại bước trước
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
