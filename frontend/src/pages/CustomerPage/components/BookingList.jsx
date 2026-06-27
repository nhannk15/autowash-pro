import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { CarOutlined } from '@ant-design/icons';
import './Booking.css';
import { message, Select } from 'antd';
import { getAvailableSlot, getApplicablePromotion as getApplicablePromotionAPI, getService, getVehicleByCustomer, createBooking, getMembershipTier, getVoucher } from '../../../service/customerService';
function VehicleImage({ src, alt, fallbackIcon }) {
    const [hasError, setHasError] = useState(false);
    // Mục đích: Dùng để ghi nhận xem ảnh của xe có bị lỗi khi tải hay không.
    // Mặc định là false (chưa có lỗi).
    // Nếu trong quá trình tải ảnh xảy ra lỗi (link hỏng, ảnh không tồn tại), state này sẽ được cập nhật thành true để component biết và chuyển sang hiển thị biểu tượng dự phòng (fallbackIcon).

    if (!src || hasError) {
        return fallbackIcon;
    }

    return (
        <img
            src={src}
            alt={alt}
            className="vehicle-card__image"
            referrerPolicy="no-referrer"
            //Ý nghĩa: Đây là một thuộc tính bảo mật và quyền riêng tư của thẻ <img> trong HTML5.
            // Mục đích: Khi trình duyệt gửi yêu cầu tải ảnh từ link src (có thể là link ảnh lưu trên host khác như Google Drive, Firebase, Cloudinary, v.v.), trình duyệt sẽ không gửi kèm thông tin về trang web hiện tại (Header Referer) của bạn tới máy chủ chứa ảnh đó.
            onError={() => setHasError(true)}
        //Ý nghĩa: Đây là một trình lắng nghe sự kiện (Event Listener) của thẻ <img>, nó sẽ tự động được kích hoạt khi trình duyệt không thể tải được ảnh từ đường dẫn src (ví dụ: lỗi 404 không tìm thấy file, lỗi mất kết nối mạng, hoặc link ảnh bị hỏng).
        // Mục đích: Khi sự kiện lỗi xảy ra, hàm mũi tên () => setHasError(true) sẽ được chạy để cập nhật state hasError từ false thành true.
        // Kết quả: Khi hasError trở thành true, component VehicleImage sẽ re-render, rơi vào điều kiện if (!src || hasError) ở dòng 10 và lập tức hiển thị fallbackIcon (biểu tượng xe dự phòng) thay thế cho chiếc ảnh bị lỗi, giúp giao diện không bị hiện biểu tượng "ảnh vỡ" mất thẩm mỹ.

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
    const [applicablePromotion, setApplicablePromotion] = useState(null);
    const [vouchers, setVouchers] = useState([]);
    const [membershipTier, setMembershipTier] = useState();
    const [submitting, setSubmitting] = useState(false);
    const [bookingError, setBookingError] = useState(null);
    const [selectedVoucher, setSelectedVoucher] = useState(null);

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
                const result = await getVehicleByCustomer()
                const vehicleList = result?.data || [];

                // Lọc bỏ những xe đã bị xóa mềm/vô hiệu hóa
                const activeVehicles = vehicleList.filter(v => v.active !== false && v.isActive !== false);
                setUserVehicles(activeVehicles);

                // Tự động chọn xe hoạt động đầu tiên nếu có danh sách
                if (activeVehicles.length > 0) {
                    setSelectedVehicle(activeVehicles[0]);
                    setSelectedVehicleType(activeVehicles[0].typeName);
                    setMaxUnlockedStep(2);
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
    useEffect(() => {
        const fetchMembershipTier = async () => {
            try {
                const result = await getMembershipTier()
                setMembershipTier(result || undefined)
            } catch (err) {
                console.error("Failed to fetch membershipTier:", err);
                message.warning(err.response?.data.message || err.message || "không thể tải membership tier")
            }
        }
        fetchMembershipTier()
    }, [])

    // Lấy chương trình khuyến mãi tự động áp dụng dựa trên thời gian hẹn
    useEffect(() => {
        const fetchApplicablePromotion = async () => {
            if (!selectedDate || !selectedTime) {
                setApplicablePromotion(null);
                return;
            }
            try {
                const dateTimeStr = `${selectedDate}T${selectedTime}:00`;
                const result = await getApplicablePromotionAPI(dateTimeStr);
                setApplicablePromotion(result || null);
            } catch (err) {
                console.error("Failed to fetch applicable promotion:", err);
                setApplicablePromotion(null);
            }
        };
        fetchApplicablePromotion();
    }, [selectedDate, selectedTime]);

    // Lấy danh sách voucher của người dùng
    useEffect(() => {
        const fetchVoucher = async () => {
            try {
                const result = await getVoucher()
                setVouchers(result || []);
            } catch (err) {
                console.error("Failed to fetch vouchers:", err);
                message.warning(err.response?.data.message || err.message || "không thể tải danh sách voucher")
            }
        };
        fetchVoucher();
    }, []);

    // Tìm chương trình khuyến mãi phù hợp dựa trên ngày đặt lịch và hạng thành viên
    const getApplicablePromotion = () => {
        return applicablePromotion;
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
                const result = await getService()
                const serviceList = result?.data || [];
                if (Array.isArray(serviceList)) {
                    // kiểm tra serviceList có phải là 1 mảng không và chỉ lấy dịch vụ đang hoạt động
                    const activeServices = serviceList.filter(item => item.isActive !== false);
                    // Chuẩn hóa cấu trúc dịch vụ tương tự trang Dịch Vụ chính
                    const formatted = activeServices.map(item => {
                        const priceSedanItem = item.servicePrices?.find(sp => sp.vehicleType?.typeName === 'SEDAN');
                        // Dấu ?. trong JavaScript được gọi là toán tử Optional Chaining (Liên kết tùy chọn).
                        // Khi có dấu ?: Nếu item.servicePrices là null/undefined, JS sẽ dừng lại ngay tại đó, không gọi hàm .find() nữa mà trả về luôn giá trị undefined. Nhờ vậy, chương trình vẫn chạy tiếp bình thường mà không bị lỗi.
                        const priceSuvItem = item.servicePrices?.find(sp => sp.vehicleType?.typeName === 'SUV');

                        // nhiệm vụ chuẩn hóa (format/mapping) lại cấu trúc dữ liệu của từng dịch vụ (item) nhận về từ API Backend thành một đối tượng mới có cấu trúc gọn gàng, đồng nhất để dễ dàng quản lý và hiển thị ở phía Frontend
                        return {
                            id: item.serviceId, // Sử dụng serviceId từ API thực tế
                            name: item.serviceName,
                            type: item.category ? item.category.toLowerCase() : 'basic',
                            shortDesc: item.description || '',
                            priceSedan: priceSedanItem ? priceSedanItem.price : 0,
                            priceSuv: priceSuvItem ? priceSuvItem.price : 0,

                            priceSedanId: priceSedanItem ? priceSedanItem.servicePriceId : null,
                            priceSuvId: priceSuvItem ? priceSuvItem.servicePriceId : null,
                            // lưu lại ID của bản ghi giá ứng với từng loại xe. Mục đích cuối cùng của chúng là để gửi lên API Backend khi khách hàng bấm Đặt lịch.


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
                const result = await getAvailableSlot(selectedDate)
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

            const appPromo = getApplicablePromotion();
            const payload = {
                customerId: user ? user.id : 3, // Sử dụng ID của tài khoản đang đăng nhập
                vehicleId: selectedVehicle ? selectedVehicle.vehicleId : null,
                timeSlotId: selectedTimeSlotId,
                bookingDate: selectedDate,
                servicePriceIds: servicePriceIds,
                notes: contactInfo.notes,
                promotionId: appPromo ? appPromo.id : null,
                voucherCode: selectedVoucher ? selectedVoucher.voucherCode : null
            };

            await createBooking(payload)

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
        setSelectedVoucher(null);
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
                    const isCompleted = step.num < currentStep; //nghĩa là người dùng đã đi qua bước này và hoàn thành xong thông tin của nó. (Ví dụ: Bạn đang ở Bước 3 thì Bước 1 và 2 sẽ có isCompleted = true).
                    const isActive = step.num === currentStep; //Xác định xem đây có phải là bước mà người dùng hiện tại đang nhìn thấy trên màn hình hay không.
                    const isClickable = step.num <= maxUnlockedStep; //maxUnlockedStep lưu trữ bước xa nhất mà người dùng đã đạt được sau khi điền đầy đủ thông tin bắt buộc của các bước trước đó. (Ví dụ: Bạn đã chọn xe ở Bước 1 và chọn dịch vụ ở Bước 2, lúc này maxUnlockedStep sẽ là 3. Bạn có thể tự do click qua lại giữa Bước 1, 2 và 3, nhưng không thể click sang Bước 4 vì chưa chọn thời gian ở Bước 3).


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
                                            setMaxUnlockedStep(2);
                                        }}
                                    >
                                        {/* Hình ảnh xe hoặc Icon phân khúc xe */}
                                        <div className="vehicle-card__image-container">
                                            <VehicleImage
                                                src={vehicle.image}
                                                alt={`${vehicle.brand} ${vehicle.model}`}
                                                fallbackIcon={
                                                    // Thuộc tính fallbackIcon ở dòng 460 được dùng làm ảnh/biểu tượng thay thế dự phòng khi ảnh chính của xe không thể hiển thị được.
                                                    // Nếu bạn nhìn lên phần định nghĩa component VehicleImage ở đầu file (từ dòng 7 đến dòng 23):
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
                // Step 2 & Step 3 dùng chung Layout 2 cột
                // Khi người dùng ở Bước 2 (Dịch vụ) và Bước 3 (Thời gian), giao diện lúc này chia làm 2 cột:
                // Cột bên trái (booking-main-panel): Nội dung thay đổi động tùy theo bước:
                // Nếu ở Bước 2 (currentStep === 2): Hiện danh sách gói dịch vụ.
                // Nếu ở Bước 3 (currentStep === 3): Hiện bảng chọn ngày & giờ hẹn.
                // Cột bên phải (booking-sidebar): Luôn hiển thị bảng Tóm tắt tạm tính (thông tin xe đã chọn, danh sách các dịch vụ đã tick chọn và tổng tiền thanh toán).

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

                            {/* ÁP DỤNG VOUCHER */}
                            <div style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginBottom: '20px' }}>
                                <h4 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px 0', fontWeight: 'bold' }}>🎟 Áp dụng Voucher</h4>
                                <Select
                                    placeholder="Chọn voucher để nhận ưu đãi"
                                    style={{ width: '100%', marginTop: '8px' }}
                                    allowClear
                                    value={selectedVoucher ? selectedVoucher.voucherCode : undefined}
                                    onChange={(value) => {
                                        if (!value) {
                                            setSelectedVoucher(null);
                                        } else {
                                            const activeVouchers = vouchers.filter(v => {
                                                if (v.status !== 'ACTIVE') return false;
                                                if (!v.expiresAt) return false;
                                                const expDate = new Date(v.expiresAt);
                                                const now = new Date();
                                                return expDate > now;
                                            });
                                            const chosen = activeVouchers.find(v => v.voucherCode === value);
                                            setSelectedVoucher(chosen);
                                        }
                                    }}
                                >
                                    {vouchers.filter(v => {
                                        if (v.status !== 'ACTIVE') return false;
                                        if (!v.expiresAt) return false;
                                        const expDate = new Date(v.expiresAt);
                                        const now = new Date();
                                        return expDate > now;
                                    }).map(v => {
                                        const expDate = new Date(v.expiresAt);
                                        const now = new Date();
                                        const diffDays = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
                                        return (
                                            <Select.Option key={v.voucherCode} value={v.voucherCode}>
                                                [{v.voucherCode}] {v.reward?.rewardName || 'Voucher'} (Hạn còn {diffDays} ngày)
                                            </Select.Option>
                                        );
                                    })}
                                </Select>
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

                                let promoDiscount = 0;
                                if (appPromo) {
                                    if (appPromo.discountType === 'PERCENTAGE') {
                                        promoDiscount = originalTotal * (appPromo.discountValue / 100);
                                    } else if (appPromo.discountType === 'FIXED_AMOUNT') {
                                        promoDiscount = appPromo.discountValue;
                                    }
                                    promoDiscount = Math.min(promoDiscount, originalTotal);
                                }
                                const totalAfterPromo = originalTotal - promoDiscount;

                                let voucherDiscount = 0;
                                if (selectedVoucher) {
                                    const rType = selectedVoucher.reward.rewardType;
                                    const vVal = selectedVoucher.reward.discountValue;
                                    if (rType === 'DISCOUNT_FLAT') {
                                        voucherDiscount = vVal;
                                    } else if (rType === 'DISCOUNT_PERCENTAGE') {
                                        voucherDiscount = originalTotal * (vVal / 100);
                                    } else if (rType === 'FREE_WASH') {
                                        voucherDiscount = totalAfterPromo;
                                    }
                                    voucherDiscount = Math.min(voucherDiscount, totalAfterPromo);
                                }

                                const finalTotal = totalAfterPromo - voucherDiscount;

                                return (
                                    <div className="sidebar-total-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                            <span className="sidebar-total-label" style={{ fontSize: '0.9rem' }}>Tổng chi phí gốc</span>
                                            <span className="sidebar-total-value" style={{ color: '#64748b', fontSize: '1rem' }}>
                                                {formatCurrency(originalTotal)}
                                            </span>
                                        </div>
                                        {promoDiscount > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', borderTop: '1px dashed #e2e8f0', paddingTop: '6px' }}>
                                                <span className="sidebar-total-label" style={{ color: '#10b981', fontSize: '0.9rem' }}>Khuyến mãi ({appPromo.promotionName})</span>
                                                <span className="sidebar-total-value" style={{ color: '#10b981', fontSize: '1rem' }}>
                                                    -{formatCurrency(promoDiscount)}
                                                </span>
                                            </div>
                                        )}
                                        {voucherDiscount > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', borderTop: '1px dashed #e2e8f0', paddingTop: '6px' }}>
                                                <span className="sidebar-total-label" style={{ color: '#faad14', fontSize: '0.9rem' }}>Voucher ({selectedVoucher.reward.rewardName})</span>
                                                <span className="sidebar-total-value" style={{ color: '#faad14', fontSize: '1rem' }}>
                                                    -{formatCurrency(voucherDiscount)}
                                                </span>
                                            </div>
                                        )}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', borderTop: '1px solid #e2e8f0', paddingTop: '6px' }}>
                                            <span className="sidebar-total-label" style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.95rem' }}>Tổng thanh toán</span>
                                            <span className="sidebar-total-value" style={{ color: '#ef4444', fontSize: '1.3rem', fontWeight: 'bold' }}>
                                                {formatCurrency(finalTotal)}
                                            </span>
                                        </div>
                                    </div>
                                );
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

                                let promoDiscount = 0;
                                if (appPromo) {
                                    if (appPromo.discountType === 'PERCENTAGE') {
                                        promoDiscount = originalTotal * (appPromo.discountValue / 100);
                                    } else if (appPromo.discountType === 'FIXED_AMOUNT') {
                                        promoDiscount = appPromo.discountValue;
                                    }
                                    promoDiscount = Math.min(promoDiscount, originalTotal);
                                }
                                const totalAfterPromo = originalTotal - promoDiscount;

                                let voucherDiscount = 0;
                                if (selectedVoucher) {
                                    const rType = selectedVoucher.reward.rewardType;
                                    const vVal = selectedVoucher.reward.discountValue;
                                    if (rType === 'DISCOUNT_FLAT') {
                                        voucherDiscount = vVal;
                                    } else if (rType === 'DISCOUNT_PERCENTAGE') {
                                        voucherDiscount = originalTotal * (vVal / 100);
                                    } else if (rType === 'FREE_WASH') {
                                        voucherDiscount = totalAfterPromo;
                                    }
                                    voucherDiscount = Math.min(voucherDiscount, totalAfterPromo);
                                }

                                const finalTotal = totalAfterPromo - voucherDiscount;

                                return (
                                    <>
                                        <div className="success-detail-item" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: '4px' }}>
                                            <span>Giá gốc:</span>
                                            <span style={{ textDecoration: promoDiscount > 0 || voucherDiscount > 0 ? 'line-through' : 'none', color: '#64748b' }}>{formatCurrency(originalTotal)}</span>
                                        </div>
                                        {promoDiscount > 0 && (
                                            <div className="success-detail-item">
                                                <span>Khuyến mãi:</span>
                                                <span style={{ color: '#10b981' }}>{appPromo.promotionName} (-{formatCurrency(promoDiscount)})</span>
                                            </div>
                                        )}
                                        {voucherDiscount > 0 && (
                                            <div className="success-detail-item">
                                                <span>Voucher:</span>
                                                <span style={{ color: '#faad14' }}>{selectedVoucher.reward.rewardName} (-{formatCurrency(voucherDiscount)})</span>
                                            </div>
                                        )}
                                        <div className="success-detail-item" style={{ fontWeight: 'bold', color: '#ef4444' }}>
                                            <span>Tổng thanh toán:</span>
                                            <strong>{formatCurrency(finalTotal)}</strong>
                                        </div>
                                    </>
                                );
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
