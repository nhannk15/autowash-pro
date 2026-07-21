package com.autowashpro.backend.config.jwt;

import java.text.ParseException;
import java.time.temporal.ChronoUnit;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.autowashpro.backend.model.entity.User;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.KeyLengthException;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

@Service
public class JwtService {

    @Value("${jwt.secret-key}")
    private String secretKey;

    public String generateAccessToken(User user) throws KeyLengthException, JOSEException {
        Date issuedTime = new Date();
        Date expiredTime = Date.from(issuedTime.toInstant().plus(15, ChronoUnit.MINUTES));

        /**
         * Generate JWT Header.
         */
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        /**
         * Generate JWT Payload.
         */
        JWTClaimsSet payload = new JWTClaimsSet.Builder()
                .subject(user.getEmail())
                .issueTime(issuedTime)
                .expirationTime(expiredTime)
                .claim("role", user.getRole())
                .claim("fullname", user.getFullName())
                .claim("avatar", user.getAvatarUrl())
                .build();
        
        /**
         * Generate System own JWT Signature.
         */
        SignedJWT signature = new SignedJWT(header, payload);
        signature.sign(new MACSigner(secretKey));

        /**
         * Return the JWT String token.
         */
        return signature.serialize();
    }

    public String generateRefreshToken(User user) throws KeyLengthException, JOSEException {
        Date issuedTime = new Date();
        Date expiredTime = Date.from(issuedTime.toInstant().plus(7, ChronoUnit.DAYS));

        /**
         * Generate JWT Header.
         */
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        /**
         * Generate JWT Payload.
         */
        JWTClaimsSet payload = new JWTClaimsSet.Builder()
                .subject(user.getEmail())
                .issueTime(issuedTime)
                .expirationTime(expiredTime)
                .claim("role", user.getRole())
                .claim("fullname", user.getFullName())
                .claim("avatar", user.getAvatarUrl())
                .build();
        
        /**
         * Generate System own JWT Signature.
         */
        SignedJWT signature = new SignedJWT(header, payload);
        signature.sign(new MACSigner(secretKey));

        /**
         * Return the JWT String token.
         */
        return signature.serialize();
    }

    public boolean verifyToken(String token) throws ParseException, JOSEException {
        if (token.startsWith("Bearer: ")) {
            token = token.substring(7);
        }

        SignedJWT signature = SignedJWT.parse(token);
        Date expirationTime = signature.getJWTClaimsSet().getExpirationTime();

        if (expirationTime == null || expirationTime.before(new Date())) {
            return false;
        }

        return signature.verify(new MACVerifier(this.secretKey));
    }

    public String extractEmail(String token) throws ParseException {
        SignedJWT signedJWT = SignedJWT.parse(token);
        return signedJWT.getJWTClaimsSet().getSubject();
    }

}
