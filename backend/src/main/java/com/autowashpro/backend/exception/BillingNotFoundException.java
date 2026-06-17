package com.autowashpro.backend.exception;

public class BillingNotFoundException extends RuntimeException {

    public BillingNotFoundException(String message) {
        super(message);
    }
    
}
