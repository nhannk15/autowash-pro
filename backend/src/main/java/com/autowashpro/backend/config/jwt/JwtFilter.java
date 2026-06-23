package com.autowashpro.backend.config.jwt;

import java.io.IOException;
import java.text.ParseException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.autowashpro.backend.model.entity.User;
import com.autowashpro.backend.repository.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Autowired
    public JwtFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String accessToken = null;
        String refreshToken = null;

        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (cookie.getName().equals("access_token")) {
                    accessToken = cookie.getValue();
                }
                if (cookie.getName().equals("refresh_token")) {
                    refreshToken = cookie.getValue();
                }
            }
        }

        if (accessToken == null) {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                accessToken = authHeader.substring(7);
            }
        }

        if (accessToken == null) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            if (jwtService.verifyToken(accessToken)) {
                authenticateUser(accessToken);
            } else if (refreshToken != null && jwtService.verifyToken(refreshToken)) {
                String email = jwtService.extractEmail(refreshToken);
                User user = userRepository.findByEmail(email).orElse(null);

                if (user.getRefreshToken().equals(refreshToken)) {
                    String newAccessToken = jwtService.generateAccessToken(user);
                    Cookie newAccessCookie = new Cookie("access_token", newAccessToken);
                    newAccessCookie.setHttpOnly(true);
                    newAccessCookie.setSecure(false); // true khi production
                    newAccessCookie.setPath("/");
                    newAccessCookie.setMaxAge(60 * 15);
                    response.addCookie(newAccessCookie);

                    authenticateUser(newAccessToken);
                }
            }
        } catch (Exception e) {
            // token lỗi → không set auth → Spring Security tự trả 401
        }

        filterChain.doFilter(request, response);

    }

    private void authenticateUser(String accessToken) throws ParseException {
        String email = jwtService.extractEmail(accessToken);

        User user = userRepository.findByEmail(email).orElse(null);
        if (user != null) {
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    email, // principal → getPrincipal() trả về String email
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().toString())));

            SecurityContextHolder.getContext().setAuthentication(authToken);
        }
    }

}
