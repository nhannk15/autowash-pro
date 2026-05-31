package com.autowashpro.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.autowashpro.backend.model.entity.MembershipTier;
import com.autowashpro.backend.repository.MembershipTierRepository;

@Service
public class MembershipTierService {
    
    private MembershipTierRepository repository;

    public MembershipTierService() {
    }

    @org.springframework.beans.factory.annotation.Autowired
    public MembershipTierService(MembershipTierRepository repository) {
        this.repository = repository;
    }

    public MembershipTier createNew(MembershipTier membershipTier) {
        return repository.save(membershipTier);
    }

    public MembershipTier findById(Long id) {
        return repository.findById(id).get();
    }

    public List<MembershipTier> findAll() {
        return repository.findAll();
    }

    public MembershipTier update(MembershipTier membershipTier) {
        return repository.save(membershipTier);
    }

    public void delete(Long id) {
        MembershipTier membershipTier = findById(id);
        repository.delete(membershipTier);
    }

}
