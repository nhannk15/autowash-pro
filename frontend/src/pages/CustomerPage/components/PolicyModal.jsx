import React from 'react';
import './PolicyModal.css';

const PolicyModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="policy-modal-overlay" onClick={onClose}>
            <div className="policy-modal-container" onClick={e => e.stopPropagation()}>
                <div className="policy-modal-header">
                    <h2>Chính Sách & Quy Định</h2>
                    <button className="policy-modal-close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="policy-modal-content">
                    <section className="policy-section">
                        <h3>Điều 1: Quy định chung</h3>
                        <ul>
                            <li>Khách hàng vui lòng mang xe đến đúng giờ đã đặt để đảm bảo tiến độ phục vụ.</li>
                            <li>Trung tâm có quyền từ chối phục vụ nếu tình trạng xe không đúng với thông tin đã đăng ký (ví dụ: xe chở hàng nguy hiểm, quá khổ...).</li>
                        </ul>
                    </section>
                    
                    <section className="policy-section">
                        <h3>Điều 2: Thời gian chờ & Đi trễ</h3>
                        <ul>
                            <li>Trung tâm hỗ trợ giữ chỗ tối đa 15-30 phút so với giờ đã đặt tùy thuộc vào tình trạng trống của gara.</li>
                            <li>Quá thời gian giữ chỗ, lịch hẹn có thể tự động bị hủy và áp dụng chính sách mất cọc tương ứng.</li>
                        </ul>
                    </section>

                    <section className="policy-section highlight">
                        <h3>Điều 3: Chính sách Hủy lịch & Hoàn cọc</h3>
                        <p style={{ color: '#555', marginBottom: '12px' }}>Khi khách hàng chủ động hủy lịch, tỷ lệ hoàn cọc sẽ phụ thuộc vào hạng thành viên và thời gian báo trước:</p>
                        
                        <div className="policy-table-container">
                            <table className="policy-table">
                                <thead>
                                    <tr>
                                        <th>Hạng thành viên</th>
                                        <th>Báo trước (Tối thiểu)</th>
                                        <th>Tỷ lệ hoàn cọc</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Đồng (Bronze)</td>
                                        <td>36 giờ</td>
                                        <td>50%</td>
                                    </tr>
                                    <tr>
                                        <td>Bạc (Silver)</td>
                                        <td>24 giờ</td>
                                        <td>50%</td>
                                    </tr>
                                    <tr>
                                        <td>Vàng (Gold)</td>
                                        <td>24 giờ</td>
                                        <td>70%</td>
                                    </tr>
                                    <tr>
                                        <td>Kim Cương (Diamond)</td>
                                        <td>12 giờ</td>
                                        <td>80%</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="policy-note">
                            <strong>* Lưu ý quan trọng:</strong>
                            <p>Tiền hoàn cọc sẽ được hệ thống quy đổi thành <strong>voucher tương ứng</strong> để sử dụng cho các lần đặt dịch vụ sau.</p>
                            <p>Các trường hợp hủy muộn hơn thời gian quy định ở trên sẽ <strong>không được hoàn cọc (0%)</strong>.</p>
                        </div>
                    </section>

                    <section className="policy-section">
                        <h3>Điều 4: Chính sách đền bù từ phía Trung tâm</h3>
                        <ul>
                            <li>Trong trường hợp bất khả kháng trung tâm phải hủy lịch hẹn của quý khách, trung tâm sẽ hoàn 100% cọc (quy đổi thành voucher hoặc hoàn tiền trực tiếp tùy trường hợp) và tặng kèm ưu đãi cho lần đặt tiếp theo.</li>
                        </ul>
                    </section>
                </div>
                <div className="policy-modal-footer">
                    <button className="policy-btn-primary" onClick={onClose}>Tôi đã hiểu</button>
                </div>
            </div>
        </div>
    );
};

export default PolicyModal;
