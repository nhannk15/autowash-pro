package com.autowashpro.backend.exception;

public class ExceedBookingWindowException extends RuntimeException {

    public ExceedBookingWindowException(String message) {
        super(message);
    }
    
}
