package com.autowashpro.backend.service;

import java.time.DateTimeException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;

import com.autowashpro.backend.exception.PromotionException;
import com.autowashpro.backend.mapper.PromotionMapper;
import com.autowashpro.backend.model.dto.CreatePromotionRequest;
import com.autowashpro.backend.model.dto.PromotionResponse;
import com.autowashpro.backend.model.entity.MembershipTier;
import com.autowashpro.backend.model.entity.Promotion;
import com.autowashpro.backend.model.entity.Service;
import com.autowashpro.backend.model.entity.Staff;
import com.autowashpro.backend.repository.MembershipTierRepository;
import com.autowashpro.backend.repository.PromotionRepository;
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

    @Autowired
    public PromotionService(PromotionRepository repository, PromotionMapper promotionMapper,
            ServiceRepository serviceRepository, MembershipTierRepository membershipTierRepository,
            StaffRepository staffRepository) {
        this.promotionRepository = repository;
        this.promotionMapper = promotionMapper;
        this.serviceRepository = serviceRepository;
        this.membershipTierRepository = membershipTierRepository;
        this.staffRepository = staffRepository;
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

}
