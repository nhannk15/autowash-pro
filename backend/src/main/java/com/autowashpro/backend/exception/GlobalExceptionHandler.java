package com.autowashpro.backend.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import jakarta.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private String getRequestPath(WebRequest request) {
        if (request instanceof ServletWebRequest) {
            HttpServletRequest servletRequest = ((ServletWebRequest) request).getRequest();
            return servletRequest.getRequestURI();
        }
        return "";
    }

    private ErrorResponse createErrorResponse(HttpStatus status, String error,
            String message, WebRequest request) {
        return new ErrorResponse(
                status.value(),
                error,
                message,
                getRequestPath(request));
    }

    /**
     * Validation Exceptions
     * @param ex
     * @param request
     * @return
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex, WebRequest request) {

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        String message = "Validation failed: " + errors;

        ErrorResponse errorResponse = createErrorResponse(
                HttpStatus.BAD_REQUEST, "Bad Request", message, request);

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }



    /**
     * Bean Validation Exceptions
     * @param ex
     * @param request
     * @return
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex, WebRequest request) {
        ErrorResponse error = createErrorResponse(HttpStatus.BAD_REQUEST, ex.getClass().getSimpleName(), ex.getMessage(), request);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(MethodArgumentTypeMismatchException ex, WebRequest request) {
        ErrorResponse error = createErrorResponse(HttpStatus.BAD_REQUEST, ex.getClass().getSimpleName(), ex.getMessage(), request);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Booking Exceptions
     * @param ex
     * @param request
     * @return
     */
    @ExceptionHandler(CreateBookingException.class)
    public ResponseEntity<ErrorResponse> handleScheduleError(CreateBookingException ex, WebRequest request) {
        ErrorResponse error = createErrorResponse(HttpStatus.BAD_REQUEST, ex.getClass().getSimpleName(), ex.getMessage(), request);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(BookingNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleBookingNotFound(BookingNotFoundException ex, WebRequest request) {
        System.out.println("BOOKING HANDLER CALLED");
        ErrorResponse error = createErrorResponse(HttpStatus.BAD_REQUEST, ex.getClass().getSimpleName(), ex.getMessage(), request);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(ExceedBookingWindowException.class)
    public ResponseEntity<ErrorResponse> handleExceedBookingWindowException(ExceedBookingWindowException ex, WebRequest request) {
        ErrorResponse error = createErrorResponse(HttpStatus.BAD_REQUEST, ex.getClass().getSimpleName(), ex.getMessage(), request);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(SlotInavailabilityException.class)
    public ResponseEntity<ErrorResponse> handleSlotInavailabilityException(SlotInavailabilityException ex, WebRequest request) {
        ErrorResponse error = createErrorResponse(HttpStatus.BAD_REQUEST, ex.getClass().getSimpleName(), ex.getMessage(), request);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Vehicle Exceptions
     * @param ex
     * @param request
     * @return
     */
    @ExceptionHandler(VehicleNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleExceedBookingWindowException(VehicleNotFoundException ex, WebRequest request) {
        ErrorResponse error = createErrorResponse(HttpStatus.BAD_REQUEST, ex.getClass().getSimpleName(), ex.getMessage(), request);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(WashBayInavailableException.class)
    public ResponseEntity<ErrorResponse> handleWashBayInavailableException(WashBayInavailableException ex, WebRequest request) {
        ErrorResponse error = createErrorResponse(HttpStatus.BAD_REQUEST, ex.getClass().getSimpleName(), ex.getMessage(), request);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Billing Exceptions
     * @param ex
     * @param request
     * @return
     */
    @ExceptionHandler(BillingNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleBilliongNotFoundException(BillingNotFoundException ex, WebRequest request) {
        ErrorResponse error = createErrorResponse(HttpStatus.BAD_REQUEST, ex.getClass().getSimpleName(), ex.getMessage(), request);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Promotion exceptions
     * @param ex
     * @param request
     * @return
     */
    @ExceptionHandler(PromotionException.class)
    public ResponseEntity<ErrorResponse> handlePromotionException(PromotionException ex, WebRequest request) {
        ErrorResponse error = createErrorResponse(HttpStatus.BAD_REQUEST, ex.getClass().getSimpleName(), ex.getMessage(), request);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * HttpMessage Exceptions
     * @param ex
     * @param request
     * @return
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageException(HttpMessageNotReadableException ex, WebRequest request) {
        ErrorResponse error = createErrorResponse(HttpStatus.BAD_REQUEST, ex.getClass().getSimpleName(), ex.getMessage(), request);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * User, Customer, Staff Exceptions.
     * @param ex
     * @param request
     * @return
     */
    @ExceptionHandler(AccountExistedException.class)
    public ResponseEntity<ErrorResponse> handleAccountExisted(AccountExistedException ex, WebRequest request) {
        ErrorResponse error = createErrorResponse(HttpStatus.CONFLICT, ex.getClass().getSimpleName(), ex.getMessage(), request);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFoundException(UserNotFoundException ex, WebRequest request) {
        ErrorResponse error = createErrorResponse(HttpStatus.NOT_FOUND, ex.getClass().getSimpleName(), ex.getMessage(), request);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(WrongPasswordException.class)
    public ResponseEntity<ErrorResponse> handleWrongPasswordException(WrongPasswordException ex, WebRequest request) {
        ErrorResponse error = createErrorResponse(HttpStatus.CONFLICT, ex.getClass().getSimpleName(), ex.getMessage(), request);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
        ErrorResponse error = createErrorResponse(HttpStatus.NOT_FOUND, "RESOURCE NOT FOUND", ex.getMessage(), request);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleCommonException(Exception ex, WebRequest request) {
        ErrorResponse error = createErrorResponse(HttpStatus.CONFLICT, ex.getClass().getSimpleName(), ex.getMessage(), request);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
        ErrorResponse error = createErrorResponse(HttpStatus.NOT_FOUND, "RESOURCE NOT FOUND", ex.getMessage(), request);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }


    @ExceptionHandler(VoucherException.class)
    public ResponseEntity<ErrorResponse> handleVoucherException(VoucherException ex, WebRequest request) {
        ErrorResponse error = createErrorResponse(HttpStatus.BAD_REQUEST, ex.getClass().getSimpleName(), ex.getMessage(), request);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }
}
