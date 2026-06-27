package com.autowashpro.backend.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.autowashpro.backend.exception.RewardException;
import com.autowashpro.backend.exception.UserNotFoundException;
import com.autowashpro.backend.mapper.VoucherMapper;
import com.autowashpro.backend.model.dto.CustomerVoucherResponse;
import com.autowashpro.backend.model.dto.ExchangeVoucherRequest;
import com.autowashpro.backend.model.dto.RewardResponse;
import com.autowashpro.backend.model.dto.VoucherResponse;
import com.autowashpro.backend.model.entity.Customer;
import com.autowashpro.backend.model.entity.PointTransaction;
import com.autowashpro.backend.model.entity.Reward;
import com.autowashpro.backend.model.entity.Voucher;
import com.autowashpro.backend.model.enums.TransactionType;
import com.autowashpro.backend.model.enums.VoucherStatus;
import com.autowashpro.backend.repository.CustomerRepository;
import com.autowashpro.backend.repository.PointTransactionRepository;
import com.autowashpro.backend.repository.RewardRepository;
import com.autowashpro.backend.repository.VoucherRepository;
import com.autowashpro.backend.utils.CodeGenerator;
import com.autowashpro.backend.utils.VoucherCodeGenerator;

@Service
public class VoucherService {

    private final VoucherRepository voucherRepository;
    private final CustomerRepository customerRepository;
    private final RewardRepository rewardRepository;
    private final RewardService rewardService;
    private final CodeGenerator codeGenerator;
    private final PointTransactionRepository pointTransactionRepository;
    private final VoucherMapper voucherMapper;

    @Autowired
    public VoucherService(VoucherRepository voucherRepository, CustomerRepository customerRepository,
            RewardRepository rewardRepository, VoucherCodeGenerator voucherCodeGenerator,
            PointTransactionRepository pointTransactionRepository, VoucherMapper voucherMapper,
            RewardService rewardService) {
        this.voucherRepository = voucherRepository;
        this.customerRepository = customerRepository;
        this.rewardRepository = rewardRepository;
        this.rewardService = rewardService;
        this.codeGenerator = voucherCodeGenerator;
        this.pointTransactionRepository = pointTransactionRepository;
        this.voucherMapper = voucherMapper;
    }

    public VoucherResponse exchangeVoucherForCustomer(ExchangeVoucherRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId()).orElseThrow(
                () -> new UserNotFoundException("Không thể tìm thấy người dùng với id: " + request.getCustomerId()));

        Reward reward = rewardRepository.findById(request.getRewardId())
                .orElseThrow(() -> new RewardException("Không tìm thấy phần thưởng với id: " + request.getRewardId()));

        if (customer.getCurrentPoints() < reward.getPointCost()) {
            throw new RewardException("Điểm người dùng không đủ để quy đổi phần thưởng " + reward.getRewardName());
        }

        Voucher newVoucher = Voucher
                .builder()
                .voucherCode(codeGenerator.generate())
                .reward(reward)
                .discountType(reward.getRewardType())
                .discountValue(reward.getDiscountValue())
                .customer(customer)
                .status(VoucherStatus.ACTIVE)
                .expiresAt(LocalDateTime.now().plusDays(reward.getValidityDays()))
                .build();
        Voucher savedVoucher = voucherRepository.save(newVoucher);

        customer.setCurrentPoints(customer.getCurrentPoints() - reward.getPointCost());
        Customer savedCustomer = customerRepository.save(customer);

        PointTransaction pointTransaction = PointTransaction
                .builder()
                .customer(savedCustomer)
                .voucher(savedVoucher)
                .transactionType(TransactionType.REDEEM)
                .pointsChange(reward.getPointCost())
                .balanceAfter(savedCustomer.getCurrentPoints())
                .description(null)
                .expiryDate(LocalDate.now().plusMonths(6))
                .staff(null)
                .build();
        pointTransactionRepository.save(pointTransaction);
        return voucherMapper.toVoucherResponse(savedVoucher);
    }

    @Transactional
    public List<CustomerVoucherResponse> getCustomerAllVouchers(String email) {
        List<CustomerVoucherResponse> result = new ArrayList<>();
        List<Voucher> vouchers = voucherRepository.findCustomerActiveVouchers(email);
        for (Voucher voucher : vouchers) {
            RewardResponse rewardResponse = rewardService.mapToResponse(voucher.getReward());
            CustomerVoucherResponse newVoucherResponse = CustomerVoucherResponse
                    .builder()
                    .voucherCode(voucher.getVoucherCode())
                    .expiresAt(voucher.getExpiresAt())
                    .reward(rewardResponse)
                    .status(voucher.getStatus())
                    .build();
            result.add(newVoucherResponse);
        }
        return result;
    }
}
