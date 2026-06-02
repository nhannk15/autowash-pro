import './BookingForm.css'

export default function BookingForm() {
    return (
        <section className="booking-form-section">
            <div className="booking-form__header">
                <h2>THÔNG TIN LIÊN HỆ CAR WASH CENTRE</h2>
                <p>Bạn vui lòng điền thông tin vào mẫu bên dưới.</p>
                <p>Đội ngũ CAR WASH CENTRE sẽ liên hệ với bạn sớm nhất!!!</p>
            </div>

            <div className="booking-form__container">
                <form className="booking-form">
                    <input type="text" placeholder="Họ và Tên" className="form-input" />
                    <input type="text" placeholder="Số điện thoại" className="form-input" />


                    <input type="text" placeholder="Tên dòng xe" className="form-input" />
                    <input type="text" placeholder="Biển số xe" className="form-input" />
                    <input type="text" placeholder="Thời gian muốn làm dịch vụ" className="form-input" />

                    <div className="form-group">
                        <label className="form-label">Bạn quan tâm tới dịch vụ nào?</label>
                        <div className="checkbox-group">
                            <label className="checkbox-label"><input type="checkbox" /> Rửa xe ngoại thất</label>
                            <label className="checkbox-label"><input type="checkbox" /> Hút bụi nội thất</label>
                            <label className="checkbox-label"><input type="checkbox" /> Vệ sinh nội thất chi tiết</label>
                            <label className="checkbox-label"><input type="checkbox" /> Vệ sinh khoang máy (vệ sinh khô)</label>
                            <label className="checkbox-label"><input type="checkbox" /> Tẩy bụi sắt, nhựa đường, keo</label>
                            <label className="checkbox-label"><input type="checkbox" /> Phục hồi nhựa nhám ngoại thất</label>
                            <label className="checkbox-label"><input type="checkbox" /> Thay lọc gió động cơ, lọc gió điều hòa</label>
                            <label className="checkbox-label"><input type="checkbox" /> Châm nước rửa kính</label>
                            <label className="checkbox-label"><input type="checkbox" /> Bảo dưỡng phanh lốp</label>
                            <label className="checkbox-label"><input type="checkbox" /> Bảo dưỡng khoang động cơ</label>
                            <label className="checkbox-label"><input type="checkbox" /> Bảo dưỡng phanh, thắng đĩa</label>
                            <label className="checkbox-label"><input type="checkbox" /> Tất cả</label>
                        </div>
                    </div>

                    <button type="button" className="btn-submit">Đặt lịch ngay</button>
                </form>
            </div>
        </section>
    )
}
