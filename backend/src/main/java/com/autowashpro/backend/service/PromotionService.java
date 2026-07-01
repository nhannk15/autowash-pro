package com.autowashpro.backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DateTimeException;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;

import com.autowashpro.backend.exception.PromotionException;
import com.autowashpro.backend.exception.UserNotFoundException;
import com.autowashpro.backend.mapper.PromotionMapper;
import com.autowashpro.backend.model.dto.CreatePromotionRequest;
import com.autowashpro.backend.model.dto.PromotionResponse;
import com.autowashpro.backend.model.entity.Billing;
import com.autowashpro.backend.model.entity.Customer;
import com.autowashpro.backend.model.entity.MembershipTier;
import com.autowashpro.backend.model.entity.Promotion;
import com.autowashpro.backend.model.entity.PromotionUsage;
import com.autowashpro.backend.model.entity.Service;
import com.autowashpro.backend.model.entity.Staff;
import com.autowashpro.backend.model.enums.PromotionDiscountType;
import com.autowashpro.backend.repository.BillingRepository;
import com.autowashpro.backend.repository.CustomerRepository;
import com.autowashpro.backend.repository.MembershipTierRepository;
import com.autowashpro.backend.repository.PromotionRepository;
import com.autowashpro.backend.repository.PromotionUsageRepository;
import com.autowashpro.backend.repository.ServiceRepository;
import com.autowashpro.backend.repository.StaffRepository;

import lombok.extern.slf4j.Slf4j;

@org.springframework.stereotype.Service
@Slf4j
public class PromotionService {

    private final PromotionRepository promotionRepository;
    private final ServiceRepository serviceRepository;
    private final MembershipTierRepository membershipTierRepository;
    private final StaffRepository staffRepository;
    private final PromotionMapper promotionMapper;
    private final CustomerRepository customerRepository;
    private final BillingRepository billingRepository;
    private final PromotionUsageRepository promotionUsageRepository;

    @Autowired
    public PromotionService(PromotionRepository repository, PromotionMapper promotionMapper,
            ServiceRepository serviceRepository, MembershipTierRepository membershipTierRepository,
            StaffRepository staffRepository, CustomerRepository customerRepository,
            BillingRepository billingRepository, PromotionUsageRepository promotionUsageRepository) {
        this.promotionRepository = repository;
        this.promotionMapper = promotionMapper;
        this.serviceRepository = serviceRepository;
        this.membershipTierRepository = membershipTierRepository;
        this.staffRepository = staffRepository;
        this.customerRepository = customerRepository;
        this.billingRepository = billingRepository;
        this.promotionUsageRepository = promotionUsageRepository;
    }

    public List<PromotionResponse> findAll() {
        List<Promotion> allPromotions = promotionRepository.findAll();
        return allPromotions
                .stream()
                .map(promotionMapper::toPromotionResponse)
                .toList();
    }

    public PromotionResponse createPromotion(CreatePromotionRequest request, Long staffId) {

        Service service = null;
        if (request.getServiceId() != null) {
            Optional<Service> optionalService = serviceRepository.findById(request.getServiceId());
            if (optionalService.isPresent()) {
                service = optionalService.get();
            }
        }

        MembershipTier membershipTier = null;
        if (request.getMinTierId() != null) {
            Optional<MembershipTier> optionalMembershipTier = membershipTierRepository.findById(request.getMinTierId());
            if (optionalMembershipTier.isPresent()) {
                membershipTier = optionalMembershipTier.get();
            }
        }

        Staff staff = null;
        if (staffId != null) {
            Optional<Staff> optionalStaff = staffRepository.findById(staffId);
            if (optionalStaff.isPresent()) {
                staff = optionalStaff.get();
            }
        }

        LocalDateTime startDate = request.getStartDate();
        LocalDateTime endDate = request.getEndDate();
        if (startDate.isAfter(endDate)) {
            throw new DateTimeException("Ngày bắt đầu phải trước ngày kết thúc!");
        }

        Promotion newPromotion = Promotion
                .builder()
                .promotionName(request.getPromotionName())
                .description(request.getDescription())
                .startDate(startDate)
                .endDate(endDate)
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .service(service)
                .membershipTier(membershipTier)
                .maxUsesTotal(request.getMaxUsesTotal())
                .maxUsesPerCustomer(request.getMaxUsesPerCustomer())
                .usageCount(request.getUsageCount())
                .staff(staff)
                .build();

        Promotion savedPromotion = promotionRepository.save(newPromotion);
        return promotionMapper.toPromotionResponse(savedPromotion);
    }

    public PromotionResponse updatePromotion(CreatePromotionRequest request, Long staffId, Long promotionId) {

        Promotion promotion = promotionRepository
                .findById(promotionId)
                .orElseThrow(() -> new PromotionException("Không tìm thấy ID ưu đãi."));

        Service service = null;
        if (request.getServiceId() != null) {
            Optional<Service> optionalService = serviceRepository.findById(request.getServiceId());
            if (optionalService.isPresent()) {
                service = optionalService.get();
            }
        }

        MembershipTier membershipTier = null;
        if (request.getMinTierId() != null) {
            Optional<MembershipTier> optionalMembershipTier = membershipTierRepository.findById(request.getMinTierId());
            if (optionalMembershipTier.isPresent()) {
                membershipTier = optionalMembershipTier.get();
            }
        }

        Staff staff = null;
        if (staffId != null) {
            Optional<Staff> optionalStaff = staffRepository.findById(staffId);
            if (optionalStaff.isPresent()) {
                staff = optionalStaff.get();
            }
        }

        LocalDateTime startDate = request.getStartDate();
        LocalDateTime endDate = request.getEndDate();
        if (startDate.isAfter(endDate)) {
            throw new DateTimeException("Ngày bắt đầu phải trước ngày kết thúc!");
        }

        Promotion newPromotion = Promotion
                .builder()
                .promotionName(request.getPromotionName())
                .description(request.getDescription())
                .startDate(startDate)
                .endDate(endDate)
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .service(service)
                .membershipTier(membershipTier)
                .maxUsesTotal(request.getMaxUsesTotal())
                .maxUsesPerCustomer(request.getMaxUsesPerCustomer())
                .usageCount(request.getUsageCount())
                .staff(staff)
                .active(true)
                .build();

        promotionMapper.updatePromotionFromRequest(newPromotion, promotion);
        Promotion savedPromotion = promotionRepository.save(promotion);
        return promotionMapper.toPromotionResponse(savedPromotion);
    }

    public PromotionResponse deletePromotion(Long promotionId) {

        Promotion promotion = promotionRepository
                .findById(promotionId)
                .orElseThrow(() -> new PromotionException("Không tìm thấy ID ưu đãi."));

        promotion.setActive(false);

        Promotion savedPromotion = promotionRepository.save(promotion);

        return promotionMapper.toPromotionResponse(savedPromotion);

    }

    public Promotion autoFindApplicablePromotion(String email, LocalDateTime bookingDateTime) {

        BigDecimal totalOriginalPrice = new BigDecimal("10000000");

        log.info("Email khách hàng: {}", email);
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy khách hàng với email: " + email));
        log.info("Customer date of birth: {}", customer.getDateOfBirth());
        log.info("Booking date: {}", bookingDateTime);
        List<Promotion> applicablePromotions = promotionRepository.findApplicablePromotions(bookingDateTime,
                customer.getTier().getId());
        log.info("Promotions size: {}", applicablePromotions.size());

        boolean isBirthday = customer.getDateOfBirth() != null
                && bookingDateTime != null
                && customer.getDateOfBirth().getMonth() == bookingDateTime.getMonth()
                && customer.getDateOfBirth().getDayOfMonth() == bookingDateTime.getDayOfMonth();
        log.info("Is bookingdate customer's birthday: {}", isBirthday);

        Promotion finalPromotion = applicablePromotions.stream()
                .filter(p -> {
                    if (p.getPromotionName().equals("Ưu Đãi Sinh Nhật")) {
                        return isBirthday;
                    }
                    return true;
                })
                .max(Comparator.comparing(p -> calculateDiscountValue(p, totalOriginalPrice)))
                .orElse(null);
        log.info("Promotion's name: {}", finalPromotion == null ? null : finalPromotion.getPromotionName());
        return finalPromotion;
    }

    public BigDecimal calculateDiscountValue(Promotion promotion, BigDecimal totalOriginalPrice) {
        if (promotion == null || totalOriginalPrice == null) {
            return BigDecimal.ZERO;
        }
        if (promotion.getDiscountType().equals(PromotionDiscountType.FIXED_AMOUNT)) {
            return promotion.getDiscountValue();
        } else if (promotion.getDiscountType().equals(PromotionDiscountType.PERCENTAGE)) {
            return totalOriginalPrice
                    .multiply(promotion.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else {
            return totalOriginalPrice;
        }
    }

    public void commitPromotionUsage(Long promotionId, Long billingId) {
        if (promotionId != null) {
            Promotion promotion = new Promotion();
            Optional<Promotion> optionalPromotion = promotionRepository.findById(promotionId);
            Billing billing = billingRepository.findById(billingId).get();
            if (optionalPromotion.isPresent()) {
                promotion = optionalPromotion.get();
            }

            log.info("Increase promotion usage count with id: {}", promotionId);
            if (promotion != null) {
                promotion.setUsageCount(promotion.getUsageCount() + 1L);
                promotionRepository.save(promotion);
            }

            BigDecimal discountAmount = BigDecimal.ZERO;
            if (promotion == null) {
                //--- Do nothing.
            } else if (promotion.getDiscountType().equals(PromotionDiscountType.FIXED_AMOUNT)) {
                discountAmount = promotion.getDiscountValue();
            } else if (promotion.getDiscountType().equals(PromotionDiscountType.PERCENTAGE)) {
                discountAmount = billing.getOriginalAmount().multiply(promotion.getDiscountValue()).divide(new BigDecimal(100L));
            } else if (promotion.getDiscountType().equals(PromotionDiscountType.FREE_SERVICE)) {
                discountAmount = billing.getOriginalAmount();
            }

            PromotionUsage promotionUsage = PromotionUsage
                    .builder()
                    .promotion(promotion)
                    .billing(billing)
                    .discountAmount(discountAmount)
                    .build();
            promotionUsageRepository.save(promotionUsage);
        }
    }

}
