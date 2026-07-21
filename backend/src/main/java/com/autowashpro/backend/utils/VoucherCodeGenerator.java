package com.autowashpro.backend.utils;

import java.security.SecureRandom;

import org.springframework.stereotype.Component;

@Component
public class VoucherCodeGenerator implements CodeGenerator {
    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final int VOUCHER_CODE_LENGTH = 6;
    private final SecureRandom random = new SecureRandom();

    @Override
    public String generate() {
        StringBuilder voucherCode = new StringBuilder();
        for (int charIndex = 0; charIndex < VOUCHER_CODE_LENGTH; charIndex++) {
            voucherCode.append(CHARACTERS.charAt(random.nextInt(CHARACTERS.length())));
        }
        return voucherCode.toString();
    }
}
