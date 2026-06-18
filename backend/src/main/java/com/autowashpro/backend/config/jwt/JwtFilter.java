package com.autowashpro.backend.config.jwt;

import java.io.IOException;
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

        String token = null;

        // Đọc từ Cookie (Google login + Email/Password login)
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (cookie.getName().equals("access_token")) {
                    token = cookie.getValue();
                    break;
                }
            }
        }

        // Nếu không có trong Cookie, đọc từ Authorization header (Bearer token)
        if (token == null) {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            }
        }

        // Không có token → bỏ qua
        if (token == null) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            if (jwtService.verifyToken(token)) {
                String email = jwtService.extractEmail(token);

                User user = userRepository.findByEmail(email).orElse(null);
                if (user != null) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            email, // principal → getPrincipal() trả về String email
                            null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().toString())));

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // token lỗi → không set auth → Spring Security tự trả 401
        }

        filterChain.doFilter(request, response);

    }

}
