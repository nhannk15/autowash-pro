package com.autowashpro.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.autowashpro.backend.mapper.BookingDetailMapper;
import com.autowashpro.backend.model.dto.ApiResponse;
import com.autowashpro.backend.model.entity.BookingDetail;
import com.autowashpro.backend.service.BookingDetailService;

@RestController
@RequestMapping("/api/booking-details")
public class BookingDetailController {

    private final BookingDetailService service;
    private final BookingDetailMapper mapper;
    
    @Autowired
    public BookingDetailController(BookingDetailService service, BookingDetailMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingDetail>>> findAll() {
        return ResponseEntity.ok(ApiResponse.success(service.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingDetail>> findById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(service.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BookingDetail>> create(@RequestBody BookingDetail bookingDetail) {
        return ResponseEntity.ok(ApiResponse.created(service.createNew(bookingDetail)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingDetail>> update(@RequestBody BookingDetail bookingDetail, @PathVariable Long id) {
        BookingDetail target = service.findById(id);
        mapper.updateBookingDetailFromRequest(bookingDetail, target);
        return ResponseEntity.ok(ApiResponse.success(service.update(target)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.noContent());
    }
}
