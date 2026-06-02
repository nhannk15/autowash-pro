package com.autowashpro.backend.service;

import java.util.List;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import com.autowashpro.backend.model.entity.Voucher;
import com.autowashpro.backend.repository.VoucherRepository;

@Service
public class VoucherService {

    private VoucherRepository repository;

    public VoucherService() {
    }

    @org.springframework.beans.factory.annotation.Autowired
    public VoucherService(VoucherRepository repository) {
        this.repository = repository;
    }

    public Voucher createNew(@NonNull Voucher voucher) {
        return repository.save(voucher);
    }

    public Voucher findById(@NonNull Long id) {
        return repository.findById(id).get();
    }

    public List<Voucher> findAll() {
        return repository.findAll();
    }

    public Voucher update(@NonNull Voucher voucher) {
        return repository.save(voucher);
    }

    public void delete(Long id) {
        Voucher voucher = findById(id);
        repository.delete(voucher);
    }

}
