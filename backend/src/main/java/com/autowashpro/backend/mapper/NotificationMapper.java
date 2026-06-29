package com.autowashpro.backend.mapper;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.autowashpro.backend.model.dto.NotificationResponse;
import com.autowashpro.backend.model.entity.Notification;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface NotificationMapper {
    void updateNotificationFromRequest(Notification source, @MappingTarget Notification target);

    NotificationResponse toNotificationResponse(Notification notification);
    List<NotificationResponse> toNotificationResponses(List<Notification> notifications);
}
