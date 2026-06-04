package com.autowashpro.backend.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;

import com.autowashpro.backend.mapper.ServicePriceMapper;
import com.autowashpro.backend.model.dto.ServicePriceItemResponse;
import com.autowashpro.backend.model.dto.ServiceResponse;
import com.autowashpro.backend.model.entity.Service;
import com.autowashpro.backend.model.entity.ServicePrice;
import com.autowashpro.backend.repository.ServicePriceRepository;
import com.autowashpro.backend.repository.ServiceRepository;

@org.springframework.stereotype.Service
public class ServiceService {

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private ServicePriceRepository servicePriceRepository;

    @Autowired
    private ServicePriceMapper servicePriceMapper;

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
            result.add(new ServiceResponse(
                    service.getId(),
                    service.getServiceName(),
                    service.getDescription(),
                    service.getDurationMinutes(),
                    service.getPointMultiplier(),
                    service.getCategory(),
                    service.isActive(),
                    servicePriceItemResponses));
        }

        return result;

    }

}
