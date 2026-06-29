package com.autowashpro.backend.service;

import com.autowashpro.backend.repository.WashSessionRepository;

import lombok.extern.slf4j.Slf4j;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import com.autowashpro.backend.exception.BillingNotFoundException;
import com.autowashpro.backend.exception.BookingNotFoundException;
import com.autowashpro.backend.exception.UserNotFoundException;
import com.autowashpro.backend.exception.VoucherException;
import com.autowashpro.backend.mapper.BillingMapper;
import com.autowashpro.backend.mapper.VoucherMapper;
import com.autowashpro.backend.model.dto.ApplyVoucherToBillingRequest;
import com.autowashpro.backend.model.dto.BillingResponse;
import com.autowashpro.backend.model.dto.VoucherResponse;
import com.autowashpro.backend.model.entity.Billing;
import com.autowashpro.backend.model.entity.Booking;
import com.autowashpro.backend.model.entity.BookingDetail;
import com.autowashpro.backend.model.entity.Customer;
import com.autowashpro.backend.model.entity.PointTransaction;
import com.autowashpro.backend.model.entity.Promotion;
import com.autowashpro.backend.model.entity.Service;
import com.autowashpro.backend.model.entity.Voucher;
import com.autowashpro.backend.model.entity.WashSession;
import com.autowashpro.backend.model.enums.BookingStatus;
import com.autowashpro.backend.model.enums.DepositStatus;
import com.autowashpro.backend.model.enums.PaymentMethod;
import com.autowashpro.backend.model.enums.PaymentStatus;
import com.autowashpro.backend.model.enums.RewardType;
import com.autowashpro.backend.model.enums.TransactionType;
import com.autowashpro.backend.model.enums.VoucherStatus;
import com.autowashpro.backend.model.enums.WashSessionStatus;
import com.autowashpro.backend.repository.BillingRepository;
import com.autowashpro.backend.repository.BookingRepository;
import com.autowashpro.backend.repository.CustomerRepository;
import com.autowashpro.backend.repository.PointTransactionRepository;
import com.autowashpro.backend.repository.VoucherRepository;

@org.springframework.stereotype.Service
@Slf4j
public class BillingService {

    private static final BigDecimal DEPOSIT_PERCENTAGE = new BigDecimal(30L);

    private final WashSessionRepository washSessionRepository;
    private final BillingRepository billingRepository;
    private final BookingRepository bookingRepository;
    private final BillingMapper billingMapper;
    private final VoucherRepository voucherRepository;
    private final CustomerRepository customerRepository;
    private final VoucherMapper voucherMapper;
    private final PointTransactionRepository pointTransactionRepository;
    private final PromotionService promotionService;

    @Autowired
    public BillingService(BillingRepository billingRepository, BookingRepository bookingRepository,
            BillingMapper billingMapper, WashSessionRepository washSessionRepository,
            VoucherRepository voucherRepository, CustomerRepository customerRepository, VoucherMapper voucherMapper,
            PointTransactionRepository pointTransactionRepository, PromotionService promotionService) {
        this.billingRepository = billingRepository;
        this.bookingRepository = bookingRepository;
        this.billingMapper = billingMapper;
        this.washSessionRepository = washSessionRepository;
        this.voucherRepository = voucherRepository;
        this.customerRepository = customerRepository;
        this.voucherMapper = voucherMapper;
        this.pointTransactionRepository = pointTransactionRepository;
        this.promotionService = promotionService;
    }

    @Transactional
    public Billing createPendingBilling(Long bookingId) {
        log.info("createPendingBilling() - start creating new pendingBilling");
        Booking booking = bookingRepository.findByIdWithDetails(bookingId)
                .orElseThrow(() -> new BookingNotFoundException(
                        "Không tìm thấy lịch hẹn với id: " + bookingId));
        Voucher voucher = null;
        BigDecimal originalAmount = booking.getBookingDetails()
                .stream()
                .map(BookingDetail::getPriceAtBooking)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal discountAmount = booking.getBookingDetails()
                .stream()
                .map(BookingDetail::getDiscountAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal finalAmount = booking.getBookingDetails()
                .stream()
                .map(BookingDetail::getFinalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        PaymentMethod paymentMethod = PaymentMethod.CASH;
        PaymentStatus paymentStatus = PaymentStatus.PENDING;
        LocalDateTime paidAt = null;

        log.info("createPendingBilling() - finalAmount before deposit: {}", finalAmount);
        BigDecimal depositAmount = finalAmount.multiply(DEPOSIT_PERCENTAGE).divide(new BigDecimal(100L));
        log.info("createPendingBilling() - depositAmount: {}", depositAmount);
        finalAmount = finalAmount.subtract(depositAmount);
        log.info("createPendingBilling() - finalAmount after deposit: {}", finalAmount);
        Billing newBilling = Billing
                .builder()
                .booking(booking)
                .voucher(voucher)
                .originalAmount(originalAmount)
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .paymentMethod(paymentMethod)
                .paymentStatus(paymentStatus)
                .paidAt(paidAt)
                .depositAmount(depositAmount)
                .depositStatus(DepositStatus.PENDING)
                .build();
        Billing savedBilling = billingRepository.saveAndFlush(newBilling);
        return savedBilling;
    }

    @Transactional
    public List<BillingResponse> getAllBillingAccordingToListOfBookingIds(List<Long> bookingIds) {
        List<Billing> billings = new ArrayList<>();
        for (Long bookingId : bookingIds) {
            Billing billing = billingRepository.findByBookingId(bookingId).orElseThrow(
                    () -> new BillingNotFoundException(
                            "Không tìm thấy hóa đơn với id lịch đặt là: " + bookingId));
            billings.add(billing);
        }
        return billingMapper.toBillingResponses(billings);
    }

    public BillingResponse completeBillingUsingCashMethod(Long billingId) {
        Billing billing = billingRepository.findById(billingId)
                .orElseThrow(() -> new BillingNotFoundException(
                        "Hóa đơn " + billingId + " không tồn tại"));

        billing.setPaymentStatus(PaymentStatus.PAID);
        billing.setPaidAt(LocalDateTime.now());

        for (WashSession washSession : billing.getBooking().getWashSessions()) {
            washSession.setStatus(WashSessionStatus.PAID);
            washSessionRepository.save(washSession);
        }

        Billing savedBilling = billingRepository.saveAndFlush(billing);

        Customer customer = billing.getBooking().getCustomer();
        BigDecimal tempPointsChange = billing.getFinalAmount();
        log.info("pointsChange: {}", tempPointsChange);
        for (WashSession wassSession : billing.getBooking().getWashSessions()) {
            Service service = wassSession.getServicePrice().getService();
            log.info("service {} has pointsMultiplier: {}", service.getServiceName(), service.getPointMultiplier());
            tempPointsChange = tempPointsChange.multiply(service.getPointMultiplier());
        }
        Long pointsChange = tempPointsChange.divide(BigDecimal.valueOf(1000L)).longValue();
        log.info("pointsChange after getting services: {}", pointsChange);
        customer.setCurrentPoints(customer.getCurrentPoints() + pointsChange);
        customer.setLifetimePoints(customer.getLifetimePoints() + pointsChange);

        PointTransaction newPointTransaction = PointTransaction
                .builder()
                .customer(billing.getBooking().getCustomer())
                .billing(savedBilling)
                .transactionType(TransactionType.EARN)
                .pointsChange(pointsChange)
                .balanceAfter(customer.getCurrentPoints())
                .description(null)
                .expiryDate(LocalDate.now().plusMonths(6))
                .staff(null)
                .build();
        customerRepository.save(customer);
        pointTransactionRepository.save(newPointTransaction);

        BillingResponse billingResponse = billingMapper.toBillingResponse(savedBilling);
        billingResponse.setPointsChange(pointsChange);

        Promotion promotion = billing.getBooking().getPromotion();
        promotionService.commitPromotionUsage(promotion == null ? null : promotion.getId(), billingId);
        return billingResponse;
    }

    public VoucherResponse applyVoucherForBilling(ApplyVoucherToBillingRequest request) {
        customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new UserNotFoundException(
                        "Không thể tìm thấy người dùng với id: " + request.getCustomerId()));

        Voucher voucher = voucherRepository.findByVoucherCode(request.getVoucherCode())
                .orElseThrow(() -> new VoucherException("Không tìm thấy Voucher: " + request.getVoucherCode()));
        if (voucher.getStatus().equals(VoucherStatus.EXPIRED)) {
            throw new VoucherException("Voucher đã hết hạn sử dụng: " + request.getVoucherCode());
        } else if (voucher.getStatus().equals(VoucherStatus.USED)) {
            throw new VoucherException("Voucher này đã được sử dụng: " + request.getVoucherCode());
        }

        Billing billing = billingRepository.findById(request.getBillingId())
                .orElseThrow(() -> new BillingNotFoundException(
                        "Không thể tìm thấy hóa đơn với id: " + request.getBillingId()));

        log.info("applyVoucherForBilling() - start applying voucher {} for billingId: {}", voucher.getVoucherCode(),
                billing.getId());
        billing.setVoucher(voucher);
        if (voucher.getDiscountType().equals(RewardType.DISCOUNT_FLAT)) {
            log.info("applyVoucherForBilling() - billingId {}'s finalAmount {}", billing.getId(), billing.getFinalAmount());
            billing.setDiscountAmount(billing.getDiscountAmount().add(voucher.getDiscountValue()));
            billing.setFinalAmount(billing.getFinalAmount().subtract(voucher.getDiscountValue()));

            log.info("applyVoucherForBilling() - billingId {}'s discountAmount {}", billing.getId(), billing.getDiscountAmount());
            log.info("applyVoucherForBilling() - billingId {}'s finalAmount {}", billing.getId(), billing.getFinalAmount());
        } else if (voucher.getDiscountType().equals(RewardType.DISCOUNT_PERCENTAGE)) {
            BigDecimal discountValue = billing.getOriginalAmount()
                    .multiply(voucher.getDiscountValue()
                            .divide(BigDecimal.valueOf(100L)))
                    .add(billing.getDiscountAmount());
            billing.setDiscountAmount(discountValue);

            BigDecimal finalAmount = billing.getOriginalAmount()
                    .subtract(discountValue);
            billing.setFinalAmount(finalAmount);
        } else if (voucher.getDiscountType().equals(RewardType.FREE_WASH)) {
            billing.setDiscountAmount(billing.getOriginalAmount());
            billing.setFinalAmount(BigDecimal.ZERO);
        }
        billingRepository.save(billing);

        voucher.setStatus(VoucherStatus.USED);
        voucher.setIssuedAt(LocalDateTime.now());
        Voucher savedVoucher = voucherRepository.save(voucher);
        return voucherMapper.toVoucherResponse(savedVoucher);
    }

    @Transactional
    public BillingResponse completeBankingPayment(Map<String, String> params) {
        for (String param : params.keySet()) {
            log.info("completeBankingPayment() - keyValue: {} - {}", param, params.get(param));
        }
        String vnpTransactionStatus = params.get("vnp_TransactionStatus");
        if (!vnpTransactionStatus.equals("00")) {
            return null;
        }
        Long billingId = Long.valueOf(params.get("vnp_TxnRef").split("_")[0]);
        Billing billing = billingRepository.findById(billingId)
                .orElseThrow(() -> new BillingNotFoundException(
                        "Hóa đơn " + billingId + " không tồn tại"));
        if (billing.getDepositStatus().equals(DepositStatus.PENDING)) {
            billing.setDepositStatus(DepositStatus.PAID);
            Billing savedBilling = billingRepository.save(billing);

            Booking booking = billing.getBooking();
            booking.setStatus(BookingStatus.CONFIRMED);
            Booking savedBooking = bookingRepository.save(booking);
            savedBooking.setStatus(BookingStatus.CONFIRMED);
            return billingMapper.toBillingResponse(savedBilling);
        }
        billing.setPaymentStatus(PaymentStatus.PAID);
        billing.setPaymentMethod(PaymentMethod.BANK_TRANSFER);
        billing.setPaidAt(LocalDateTime.now());

        for (WashSession washSession : billing.getBooking().getWashSessions()) {
            washSession.setStatus(WashSessionStatus.PAID);
            washSessionRepository.save(washSession);
        }

        Billing savedBilling = billingRepository.save(billing);

        Customer customer = billing.getBooking().getCustomer();
        Long pointsChange = billing.getFinalAmount().divide(BigDecimal.valueOf(1000L)).longValue();
        customer.setCurrentPoints(customer.getCurrentPoints() + pointsChange);
        customer.setLifetimePoints(customer.getLifetimePoints() + pointsChange);

        PointTransaction newPointTransaction = PointTransaction
                .builder()
                .customer(billing.getBooking().getCustomer())
                .billing(savedBilling)
                .transactionType(TransactionType.EARN)
                .pointsChange(pointsChange)
                .balanceAfter(customer.getCurrentPoints())
                .description(null)
                .expiryDate(LocalDate.now().plusMonths(6))
                .staff(null)
                .build();
        customerRepository.save(customer);
        pointTransactionRepository.save(newPointTransaction);

        BillingResponse billingResponse = billingMapper.toBillingResponse(savedBilling);
        billingResponse.setPointsChange(pointsChange);

        Promotion promotion = billing.getBooking().getPromotion();
        promotionService.commitPromotionUsage(promotion == null ? null : promotion.getId(), billingId);
        return billingResponse;
    }

}
