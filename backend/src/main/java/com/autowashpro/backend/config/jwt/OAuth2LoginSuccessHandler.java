package com.autowashpro.backend.config.jwt;

import java.io.IOException;
import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.autowashpro.backend.model.entity.Customer;
import com.autowashpro.backend.model.entity.MembershipTier;
import com.autowashpro.backend.model.entity.User;
import com.autowashpro.backend.model.enums.Role;
import com.autowashpro.backend.repository.CustomerRepository;
import com.autowashpro.backend.repository.MembershipTierRepository;
import com.autowashpro.backend.repository.UserRepository;
import com.nimbusds.jose.JOSEException;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private MembershipTierRepository membershipTierRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    String googleId = oAuth2User.getAttribute("sub");
                    String fullName = oAuth2User.getAttribute("name");
                    String avatarUrl = oAuth2User.getAttribute("picture");

                    MembershipTier bronze = membershipTierRepository.findByTierName("Bronze").orElseThrow();

                    Customer newCustomer = new Customer();
                    newCustomer.setEmail(email);
                    newCustomer.setGoogleId(googleId);
                    newCustomer.setFullName(fullName);
                    newCustomer.setAvatarUrl(avatarUrl);
                    newCustomer.setPassword(null);
                    newCustomer.setRole(Role.CUSTOMER);
                    newCustomer.setActive(true);
                    newCustomer.setTier(bronze);
                    newCustomer.setCurrentPoints(0L);
                    newCustomer.setLifetimePoints(0L);
                    newCustomer.setTierStartDate(LocalDate.now());
                    newCustomer.setTierEndDate(LocalDate.now().plusYears(1));
                    newCustomer.setNextReviewDate(LocalDate.now().plusMonths(6));

                    return customerRepository.save(newCustomer);
                });

        /**
         * Generate Access Token for that USER.
         */
        String accessToken = null;
        try {
            accessToken = jwtService.generateToken(user);
        } catch (JOSEException ex) {
            ex.printStackTrace();
        }

        Cookie cookie = new Cookie("access_token", accessToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(60 * 60);
        response.addCookie(cookie);
        // response.sendRedirect("http://3.36.70.151/");
        response.sendRedirect("http://localhost:5173");

    }

}
