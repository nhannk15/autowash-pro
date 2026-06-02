package com.autowashpro.backend.exception;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ErrorResponse {

    private LocalDateTime timestamp;
    private int statuscode;
    private String error;
    private String message;
    private String path;

    public ErrorResponse(LocalDateTime timestamp, int statuscode, String error, String message, String path) {
        this.timestamp = LocalDateTime.now();
        this.statuscode = statuscode;
        this.error = error;
        this.message = message;
        this.path = path;
    }

}
