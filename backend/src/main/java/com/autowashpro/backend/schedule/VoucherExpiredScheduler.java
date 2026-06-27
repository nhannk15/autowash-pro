package com.autowashpro.backend.schedule;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.autowashpro.backend.model.entity.Voucher;
import com.autowashpro.backend.model.enums.VoucherStatus;
import com.autowashpro.backend.repository.VoucherRepository;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class VoucherExpiredScheduler {
    
    private final VoucherRepository voucherRepository;

    @Autowired
    public VoucherExpiredScheduler(VoucherRepository voucherRepository) {
        this.voucherRepository = voucherRepository;
    }

    @Scheduled(cron = "0 * * * * *")
    public void scheduledCheckVoucherExpire() {
        List<Voucher> expiredVouchers = voucherRepository.findAllExpiredVoucher();
        if (expiredVouchers.size() != 0) {
            for (Voucher voucher: expiredVouchers) {
                log.info("scheduledCheckVoucherExpire() - Voucher {} has expired.", voucher.getVoucherCode());
                voucher.setStatus(VoucherStatus.EXPIRED);
                voucherRepository.save(voucher);
            }
        }
    }

}
