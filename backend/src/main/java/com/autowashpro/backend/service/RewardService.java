package com.autowashpro.backend.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.autowashpro.backend.model.dto.RewardRequest;
import com.autowashpro.backend.model.dto.RewardResponse;
import com.autowashpro.backend.model.entity.Reward;
import com.autowashpro.backend.model.entity.ServicePrice;
import com.autowashpro.backend.model.enums.RewardType;
import com.autowashpro.backend.repository.RewardRepository;
import com.autowashpro.backend.repository.ServicePriceRepository;
import com.autowashpro.backend.exception.ResourceNotFoundException;

@Service
public class RewardService {

    private final RewardRepository rewardRepository;
    private final ServicePriceRepository servicePriceRepository;

    @Autowired
    public RewardService(RewardRepository rewardRepository, ServicePriceRepository servicePriceRepository) {
        this.rewardRepository = rewardRepository;
        this.servicePriceRepository = servicePriceRepository;
    }

    public RewardResponse createReward(RewardRequest request) {
        validateRewardRequest(request);

        Reward reward = new Reward();
        mapRequestToEntity(request, reward);
        reward.setActive(true);

        reward = rewardRepository.save(reward);
        return mapToResponse(reward);
    }

    public RewardResponse updateReward(Long id, RewardRequest request) {
        Reward reward = rewardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reward not found with id: " + id));

        validateRewardRequest(request);
        mapRequestToEntity(request, reward);

        reward = rewardRepository.save(reward);
        return mapToResponse(reward);
    }

    public RewardResponse getRewardById(Long id) {
        Reward reward = rewardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reward not found with id: " + id));
        return mapToResponse(reward);
    }

    public List<RewardResponse> getAllRewards() {
        return rewardRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<RewardResponse> getActiveRewards() {
        return rewardRepository.findByActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void deactivateReward(Long id) {
        Reward reward = rewardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reward not found with id: " + id));
        reward.setActive(false);
        rewardRepository.save(reward);
    }

    private void validateRewardRequest(RewardRequest request) {
        if (request.getRewardType() == RewardType.DISCOUNT_FLAT
                || request.getRewardType() == RewardType.DISCOUNT_PERCENTAGE) {
            if (request.getDiscountValue() == null || request.getDiscountValue().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException(
                        "Discount value is required and must be positive for discount rewards");
            }
            if (request.getRewardType() == RewardType.DISCOUNT_PERCENTAGE) {
                if (request.getDiscountValue().compareTo(BigDecimal.ONE) < 0) {
                    throw new IllegalArgumentException("Percentage discount must be at least 1");
                }
                if (request.getDiscountValue().compareTo(new BigDecimal("100")) > 0) {
                    throw new IllegalArgumentException("Percentage discount cannot exceed 100%");
                }
            }
        } else if (request.getRewardType() == RewardType.FREE_WASH || request.getRewardType() == RewardType.ADDON) {
            if (request.getServicePriceId() == null) {
                throw new IllegalArgumentException("ServicePrice ID is required for FREE_WASH or ADDON rewards");
            }
        }
    }

    private void mapRequestToEntity(RewardRequest request, Reward reward) {
        reward.setRewardName(request.getRewardName());
        reward.setRewardType(request.getRewardType());
        reward.setPointCost(request.getPointCost());
        reward.setDiscountValue(request.getDiscountValue() != null ? request.getDiscountValue() : BigDecimal.ZERO);
        reward.setValidityDays(request.getValidityDays());
        reward.setDescription(request.getDescription());

        if (request.getServicePriceId() != null) {
            ServicePrice servicePrice = servicePriceRepository.findById(request.getServicePriceId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "ServicePrice not found with id: " + request.getServicePriceId()));
            reward.setServicePrice(servicePrice);
        } else {
            reward.setServicePrice(null);
        }
    }

    private RewardResponse mapToResponse(Reward entity) {
        RewardResponse response = new RewardResponse();
        response.setId(entity.getId());
        response.setRewardName(entity.getRewardName());
        response.setRewardType(entity.getRewardType());
        response.setPointCost(entity.getPointCost());
        response.setDiscountValue(entity.getDiscountValue());
        response.setValidityDays(entity.getValidityDays());
        response.setDescription(entity.getDescription());
        response.setActive(entity.isActive());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());

        if (entity.getServicePrice() != null) {
            // Include service name + vehicle type for a descriptive name
            String serviceName = entity.getServicePrice().getService().getServiceName()
                    + " - " + entity.getServicePrice().getVehicleType().getTypeName();
            response.setServiceName(serviceName);
        }

        return response;
    }
}
