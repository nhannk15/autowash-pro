package com.autowashpro.backend.service;

import java.util.HashMap;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.autowashpro.backend.exception.NotificationException;
import com.autowashpro.backend.exception.UserNotFoundException;
import com.autowashpro.backend.mapper.NotificationMapper;
import com.autowashpro.backend.model.dto.NotificationResponse;
import com.autowashpro.backend.model.entity.Booking;
import com.autowashpro.backend.model.entity.Customer;
import com.autowashpro.backend.model.entity.MembershipTier;
import com.autowashpro.backend.model.entity.Notification;
import com.autowashpro.backend.model.entity.PointTransaction;
import com.autowashpro.backend.model.enums.NotificationType;
import com.autowashpro.backend.repository.CustomerRepository;
import com.autowashpro.backend.repository.NotificationRepository;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final CustomerRepository customerRepository;
    private final NotificationMapper notificationMapper;

    @Autowired
    public NotificationService(NotificationRepository repository, CustomerRepository customerRepository, NotificationMapper notificationMapper) {
        this.notificationRepository = repository;
        this.customerRepository = customerRepository;
        this.notificationMapper = notificationMapper;
    }

    public Notification createNew(Notification notification) {
        return notificationRepository.save(notification);
    }

    @Transactional
    public void createBookingConfirmedNotification(Booking booking) {
        Notification newNotification = Notification
                .builder()
                .customer(booking.getCustomer())
                .notificationType(NotificationType.BOOKING_CONFIRMED)
                .title("Thông báo lịch hẹn.")
                .body(String.format("Lịch hẹn %s của bạn đã được xác nhận.", booking.getBookingCode()))
                .refId(booking.getId())
                .refType("BOOKING")
                .build();
        notificationRepository.save(newNotification);
        log.info(
                "createBookingConfirmedNotification() - created a new Notification for user {}, notiication's type: {}",
                booking.getCustomer().getFullName(), newNotification.getNotificationType());
    }

    @Transactional
    public void createTierChangeNotification(Customer customer, MembershipTier oldTier, MembershipTier newTier) {
        NotificationType notificationType = NotificationType.TIER_DOWNGRADE;
        if (oldTier.getTierLevel() < newTier.getTierLevel()) {
            notificationType = NotificationType.TIER_UPGRADE;
        }

        Notification newNotification = Notification
                .builder()
                .customer(customer)
                .notificationType(notificationType)
                .title("Thông báo lịch hẹn.")
                .body(String.format("Hạng thành viên của bạn thay đổi từ %s thành %s", oldTier.getTierName(),
                        newTier.getTierName()))
                .refId(newTier.getId())
                .refType("MEMBERSHIP_TIER")
                .build();
        notificationRepository.save(newNotification);
        log.info(
                "createTierChangeNotification() - created a new Notification for user {}, notiication's type: {}",
                newNotification.getCustomer().getFullName(), notificationType);
    }

    @Transactional
    public void createPointEarnNotification(PointTransaction pointTransaction) {
        Notification newNotification = Notification
                .builder()
                .customer(pointTransaction.getCustomer())
                .notificationType(NotificationType.POINTS_EARN)
                .title("Thông báo điểm.")
                .body("Điểm của bạn được cộng: " + pointTransaction.getPointsChange())
                .refId(pointTransaction.getId())
                .refType("POINT_TRANSACTION")
                .build();
        notificationRepository.save(newNotification);
        log.info(
                "createPointEarnNotification() - created a new Notification for user {}, notiication's type: {}",
                newNotification.getCustomer().getFullName(), NotificationType.POINTS_EARN);
    }

    @Transactional
    public void createPointExpiryNotification(PointTransaction pointTransaction) {
        Notification newNotification = Notification
                .builder()
                .customer(pointTransaction.getCustomer())
                .notificationType(NotificationType.POINTS_EXPIRY)
                .title("Thông báo điểm.")
                .body("Một phần điểm của bạn bị hết hạn: " + pointTransaction.getPointsChange())
                .refId(pointTransaction.getId())
                .refType("POINT_TRANSACTION")
                .build();
        notificationRepository.save(newNotification);
        log.info(
                "createPointExpiryNotification() - created a new Notification for user {}, notiication's type: {}",
                newNotification.getCustomer().getFullName(), NotificationType.POINTS_EXPIRY);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getCustomerAllNotifications(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy khách hàng với email: " + email));
        List<Notification> result = notificationRepository.findCustomerAllNotifications(customer.getId());
        return notificationMapper.toNotificationResponses(result);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getCustomerUnreadNotifications(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy khách hàng với email: " + email));
        List<Notification> result = notificationRepository.findCustomerUnreadNotifications(customer.getId());
        return notificationMapper.toNotificationResponses(result);
    }

    @Transactional(readOnly = true)
    public HashMap<String, Integer> getCustomerUnreadNotificationsCount(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy khách hàng với email: " + email));
        List<Notification> result = notificationRepository.findCustomerUnreadNotifications(customer.getId());
        
        HashMap<String, Integer> map = new HashMap<>();
        map.put("unreadsCount", result.size());
        return map;
    }

    @Transactional
    public NotificationResponse markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotificationException("Thông báo không tồn tại với id: " + notificationId));
        notification.setRead(true);
        Notification savedNotification = notificationRepository.save(notification);
        return notificationMapper.toNotificationResponse(savedNotification);
    }

    @Transactional
    public List<NotificationResponse> markAllAsRead(String email) {
        Customer customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy khách hàng với email: " + email));
        List<Notification> unreadNotifications = notificationRepository.findCustomerAllNotifications(customer.getId());
        for (Notification notification: unreadNotifications) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
        return notificationMapper.toNotificationResponses(unreadNotifications);
    }

}
