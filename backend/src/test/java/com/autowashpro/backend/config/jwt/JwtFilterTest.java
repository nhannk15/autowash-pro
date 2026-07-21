package com.autowashpro.backend.config.jwt;

import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import com.autowashpro.backend.model.entity.User;
import com.autowashpro.backend.repository.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.Cookie;

@ExtendWith(MockitoExtension.class)
class JwtFilterTest {

    @Mock
    private JwtService jwtService;
    @Mock
    private UserRepository userRepository;
    @Mock
    private FilterChain filterChain;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void validAccessTokenDoesNotAuthenticateInactiveUser() throws Exception {
        String accessToken = "access-token";
        User user = new User();
        user.setEmail("inactive@example.com");
        user.setActive(false);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new Cookie("access_token", accessToken));
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(jwtService.verifyToken(accessToken)).thenReturn(true);
        when(jwtService.extractEmail(accessToken)).thenReturn(user.getEmail());
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        new JwtFilter(jwtService, userRepository).doFilter(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void revokedRefreshTokenDoesNotCreateAuthentication() throws Exception {
        String staleRefreshToken = "stale-refresh-token";
        User user = new User();
        user.setEmail("customer@example.com");
        user.setActive(true);
        user.setRefreshToken("different-refresh-token");

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new Cookie("refresh_token", staleRefreshToken));
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(jwtService.verifyToken(staleRefreshToken)).thenReturn(true);
        when(jwtService.extractEmail(staleRefreshToken)).thenReturn(user.getEmail());
        when(userRepository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        new JwtFilter(jwtService, userRepository).doFilter(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        assertEqualsNoCookies(response);
        verify(filterChain).doFilter(request, response);
    }

    private void assertEqualsNoCookies(MockHttpServletResponse response) {
        assertNull(response.getCookie("access_token"));
    }
}
