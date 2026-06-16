package com.autowashpro.backend.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;

import com.autowashpro.backend.exception.UserNotFoundException;
import com.autowashpro.backend.mapper.HighlightMapper;
import com.autowashpro.backend.mapper.ServicePriceMapper;
import com.autowashpro.backend.mapper.StepMapper;
import com.autowashpro.backend.model.dto.ServiceAdminResponse;
import com.autowashpro.backend.model.dto.ServicePriceItemResponse;
import com.autowashpro.backend.model.dto.ServiceResponse;
import com.autowashpro.backend.model.entity.Highlight;
import com.autowashpro.backend.model.entity.Service;
import com.autowashpro.backend.model.entity.ServicePrice;
import com.autowashpro.backend.model.entity.Step;
import com.autowashpro.backend.repository.HightlightRepository;
import com.autowashpro.backend.repository.ServicePriceRepository;
import com.autowashpro.backend.repository.ServiceRepository;
import com.autowashpro.backend.repository.StepRepository;

@org.springframework.stereotype.Service
public class ServiceService {

    private final ServiceRepository serviceRepository;
    private final ServicePriceRepository servicePriceRepository;
    private final StepRepository stepRepository;
    private final HightlightRepository hightlightRepository;
    private final ServicePriceMapper servicePriceMapper;
    private final StepMapper stepMapper;
    private final HighlightMapper highlightMapper;

    @Autowired
    public ServiceService(ServiceRepository serviceRepository, ServicePriceRepository servicePriceRepository,
            StepRepository stepRepository, HightlightRepository hightlightRepository,
            ServicePriceMapper servicePriceMapper, StepMapper stepMapper, HighlightMapper highlightMapper) {
        this.serviceRepository = serviceRepository;
        this.servicePriceRepository = servicePriceRepository;
        this.stepRepository = stepRepository;
        this.hightlightRepository = hightlightRepository;
        this.servicePriceMapper = servicePriceMapper;
        this.stepMapper = stepMapper;
        this.highlightMapper = highlightMapper;
    }

    public List<Service> getAllServices() {
        return serviceRepository.findAll();
    }

    public List<ServiceResponse> getAllServiceAndServicePrice() {

        List<ServicePrice> servicePrices = servicePriceRepository.findAllWithServiceAndVehicleType();
        HashMap<Long, List<ServicePrice>> groupByService = new HashMap<>();
        for (ServicePrice servicePrice : servicePrices) {
            Long serviceId = servicePrice.getService().getId();
            if (!groupByService.containsKey(serviceId)) {
                groupByService.put(serviceId, new ArrayList<>());
            }
            groupByService.get(serviceId).add(servicePrice);
        }

        List<ServiceResponse> result = new ArrayList<>();
        for (List<ServicePrice> group : groupByService.values()) {
            Service service = group.get(0).getService();
            List<ServicePriceItemResponse> servicePriceItemResponses = new ArrayList<>();
            for (ServicePrice servicePrice : group) {
                servicePriceItemResponses.add(servicePriceMapper.toServicePriceItemResponse(servicePrice));
            }

            List<Step> steps = stepRepository.findByServiceId(service.getId());
            List<Highlight> highlights = hightlightRepository.findByServiceId(service.getId());

            result.add(new ServiceResponse(
                    service.getId(),
                    service.getServiceName(),
                    service.getDescription(),
                    service.getDurationMinutes(),
                    service.getPointMultiplier(),
                    service.getCategory(),
                    service.isActive(),
                    servicePriceItemResponses,
                    stepMapper.toStepResponseList(steps),
                    highlightMapper.toHighlightResponseList(highlights),
                    service.getImage()));
        }

        return result;

    }

    public Service findById(Long id) {
        return serviceRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Service không tồn tại!"));
    }

    public Service create(Service newService) {
        // Validate unique service name
        if (serviceRepository.findByServiceName(newService.getServiceName()).isPresent()) {
            throw new IllegalArgumentException("Tên dịch vụ đã tồn tại!");
        }

        newService.setActive(true);
        return serviceRepository.save(newService);
    }

    public Service update(Long id, Service updated) {
        Service existing = findById(id);

        // Check unique name if changed
        if (updated.getServiceName() != null
                && !updated.getServiceName().equals(existing.getServiceName())
                && serviceRepository.findByServiceName(updated.getServiceName()).isPresent()) {
            throw new IllegalArgumentException("Tên dịch vụ đã tồn tại!");
        }

        // Update fields if provided
        if (updated.getServiceName() != null)
            existing.setServiceName(updated.getServiceName());
        if (updated.getDescription() != null)
            existing.setDescription(updated.getDescription());
        if (updated.getDurationMinutes() > 0)
            existing.setDurationMinutes(updated.getDurationMinutes());
        if (updated.getPointMultiplier() != null)
            existing.setPointMultiplier(updated.getPointMultiplier());
        if (updated.getCategory() != null)
            existing.setCategory(updated.getCategory());
        if (updated.getImage() != null)
            existing.setImage(updated.getImage());

        return serviceRepository.save(existing);
    }

    public void delete(Long id) {
        Service service = findById(id);
        serviceRepository.delete(service);
    }

    public Service toggleActive(Long id) {
        Service service = findById(id);
        service.setActive(!service.isActive());
        return serviceRepository.save(service);
    }

    public ServiceAdminResponse toServiceAdminResponse(Service service) {
        return new ServiceAdminResponse(
                service.getId(),
                service.getServiceName(),
                service.getDescription(),
                service.getDurationMinutes(),
                service.getPointMultiplier(),
                service.getCategory(),
                service.isActive(),
                service.getImage(),
                service.getCreatedAt(),
                service.getUpdatedAt());
    }

}
