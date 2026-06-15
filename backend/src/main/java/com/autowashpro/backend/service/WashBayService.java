package com.autowashpro.backend.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.autowashpro.backend.mapper.WashBayMapper;
import com.autowashpro.backend.mapper.WashSessionMapper;
import com.autowashpro.backend.model.dto.CurrentSessionResponse;
import com.autowashpro.backend.model.dto.WashBayResponse;
import com.autowashpro.backend.model.entity.WashBay;
import com.autowashpro.backend.model.entity.WashSession;
import com.autowashpro.backend.model.enums.WashSessionStatus;
import com.autowashpro.backend.repository.WashBayRepository;

@Service
public class WashBayService {

    private final WashBayRepository washBayRepository;
    private final WashBayMapper washBayMapper;
    private final WashSessionMapper washSessionMapper;

    @Autowired
    public WashBayService(WashBayRepository washBayRepository, WashBayMapper washBayMapper,
            WashSessionMapper washSessionMapper) {
        this.washBayRepository = washBayRepository;
        this.washBayMapper = washBayMapper;
        this.washSessionMapper = washSessionMapper;
    }

    @Transactional
    public List<WashBayResponse> getWashBayListInTheCurrentSession() {
        List<WashBay> washBays = washBayRepository.findAll();
        List<WashBayResponse> washBayResponses = new ArrayList<>();

        for (WashBay washBay : washBays) {
            WashBayResponse washBayResponse = washBayMapper.toWashBayResponse(washBay);

            WashSession washSessions = washBay.getWashSessions().stream()
                    .filter(session -> session.getStatus().equals(WashSessionStatus.IN_PROGRESS))
                    .findFirst()
                    .orElse(null);
            CurrentSessionResponse currentSessionResponse = washSessionMapper.toCurrentSessionResponse(washSessions);
            washBayResponse.setCurrentSession(currentSessionResponse);
            washBayResponses.add(washBayResponse);
        }

        return washBayResponses;
    }

}
