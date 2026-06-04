package com.autowashpro.backend.exception;

public class AccountExistedException extends RuntimeException {

    public AccountExistedException(String message) {
        super(message);
    }
    
}
