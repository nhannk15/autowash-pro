package com.autowashpro.backend.mapper;

import java.util.ArrayList;
import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.autowashpro.backend.model.dto.RecentTransactionResponse;
import com.autowashpro.backend.model.entity.Billing;
import com.autowashpro.backend.model.entity.PointTransaction;
import com.autowashpro.backend.model.entity.WashSession;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface PointTransactionMapper {
    void updatePointTransactionFromRequest(PointTransaction source, @MappingTarget PointTransaction target);

    @Mapping(target = "services", source = "billing", qualifiedByName = "toServices")
    @Mapping(target = "voucherName", source = "voucher.reward.rewardName")
    RecentTransactionResponse toRecentTransactionResponse(PointTransaction pointTransaction);
    List<RecentTransactionResponse> toRecentTransactionResponses(List<PointTransaction> pointTransactions);

    @Named("toServices")
    default List<String> toServices(Billing billing) {
        if (billing == null) {
            return List.of();
        }
        List<String> services = new ArrayList<>();
        for (WashSession washSession: billing.getBooking().getWashSessions()) {
            services.add(washSession.getServicePrice().getService().getServiceName());
        }
        return services;
    }


}
