package com.autowashpro.backend.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.autowashpro.backend.mapper.StaffMapper;
import com.autowashpro.backend.model.dto.ApiResponse;
import com.autowashpro.backend.model.dto.StaffInfoResponse;
import com.autowashpro.backend.model.entity.Staff;
import com.autowashpro.backend.service.StaffService;

@RestController
public class StaffController {

    private StaffService service;
    private StaffMapper mapper;

    @Autowired
    public StaffController(StaffService service, StaffMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Staff>>> findAll() {
        return ResponseEntity.ok(ApiResponse.success(service.findAll()));
    }

    @GetMapping("/api/staff/{id}")
    public ResponseEntity<ApiResponse<Staff>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Staff>> create(@RequestBody Staff staff) {
        return ResponseEntity.ok(ApiResponse.created(service.createNew(staff)));
    }

    @PatchMapping("/api/staff/{id}")
    public ResponseEntity<ApiResponse<Staff>> update(@RequestBody Staff staff, @PathVariable Long id) {
        Staff target = service.findById(id);
        mapper.updateStaffFromRequest(staff, target);
        return ResponseEntity.ok(ApiResponse.success(service.update(target)));
    }

    @DeleteMapping("/api/staff/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.noContent());
    }

    @GetMapping("/api/staff/info")
    public ResponseEntity<StaffInfoResponse> getStaffInfo(@AuthenticationPrincipal String email) {
        return ResponseEntity.ok().body(service.getCurrentStaffInfo(email));
    }

    @GetMapping("/api/customer/all-staffs")
    public ResponseEntity<List<StaffInfoResponse>> getAllStaffForCustomer(@RequestParam("timeSlotId") Long timeSlotId,
            @RequestParam("bookingDate") LocalDate bookingDate) {
        return ResponseEntity.ok().body(service.getAvailableStaffsForASpecificDay(timeSlotId, bookingDate));
    }
}
