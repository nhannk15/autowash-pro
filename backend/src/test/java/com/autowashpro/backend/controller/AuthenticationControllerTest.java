package com.autowashpro.backend.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.autowashpro.backend.config.jwt.JwtService;
import com.autowashpro.backend.exception.AccountInactiveException;
import com.autowashpro.backend.model.dto.LoginRequest;
import com.autowashpro.backend.model.entity.User;
import com.autowashpro.backend.repository.UserRepository;
import com.autowashpro.backend.service.CustomerService;
import com.autowashpro.backend.service.OtpService;

import jakarta.servlet.http.Cookie;

@ExtendWith(MockitoExtension.class)
class AuthenticationControllerTest {

    @Mock
    private UserRepository repository;
    @Mock
    private JwtService jwtService;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private CustomerService customerService;
    @Mock
    private OtpService otpService;

    @InjectMocks
    private AuthenticationController controller;

    @Test
    void loginRejectsInactiveAccountBeforeCheckingPassword() {
        User user = new User();
        user.setEmail("inactive@example.com");
        user.setActive(false);
        when(repository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        LoginRequest request = new LoginRequest(user.getEmail(), "password");

        assertThrows(AccountInactiveException.class,
                () -> controller.login(request, new MockHttpServletResponse()));
        verifyNoInteractions(passwordEncoder, jwtService);
    }

    @Test
    void logoutRevokesStoredRefreshTokenAndExpiresBothCookies() throws Exception {
        String refreshToken = "refresh-token";
        User user = new User();
        user.setEmail("customer@example.com");
        user.setRefreshToken(refreshToken);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new Cookie("access_token", "access-token"),
                new Cookie("refresh_token", refreshToken));
        MockHttpServletResponse response = new MockHttpServletResponse();

        when(jwtService.extractEmail(refreshToken)).thenReturn(user.getEmail());
        when(repository.findByEmail(user.getEmail())).thenReturn(Optional.of(user));

        assertEquals(200, controller.logout(request, response).getStatusCode().value());
        assertEquals(null, user.getRefreshToken());
        verify(repository).save(user);

        Cookie[] cookies = response.getCookies();
        assertEquals(2, cookies.length);
        assertTrue(Arrays.stream(cookies)
                .anyMatch(cookie -> cookie.getName().equals("access_token") && cookie.getMaxAge() == 0));
        assertTrue(Arrays.stream(cookies)
                .anyMatch(cookie -> cookie.getName().equals("refresh_token") && cookie.getMaxAge() == 0));
    }
}
