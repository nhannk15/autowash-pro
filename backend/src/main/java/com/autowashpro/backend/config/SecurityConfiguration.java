package com.autowashpro.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

import com.autowashpro.backend.config.jwt.JwtFilter;
import com.autowashpro.backend.config.jwt.OAuth2LoginSuccessHandler;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfiguration {

    private OAuth2LoginSuccessHandler handler;
    private JwtFilter jwtFilter;
    private CorsConfigurationSource corsConfigurationSource;

    @Autowired
    public SecurityConfiguration(OAuth2LoginSuccessHandler handler, JwtFilter jwtFilter,
            CorsConfigurationSource corsConfigurationSource) {
        this.handler = handler;
        this.jwtFilter = jwtFilter;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    @Order(1)
    public SecurityFilterChain oauth2FilterChain(HttpSecurity security) throws Exception {
        security.securityMatcher("/login/**", "/oauth2/**", "/logout");
        security.authorizeHttpRequests((authorize) -> authorize.anyRequest().permitAll());
        security.csrf((csrf) -> csrf.disable());
        security.oauth2Login((oauth2) -> oauth2.successHandler(handler));
        security.cors(cors -> cors.configurationSource(corsConfigurationSource));
        security.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        return security.build();
    }

    @Bean
    @Order(2)
    public SecurityFilterChain apiFilterChain(HttpSecurity security) throws Exception {
        security.securityMatcher("/api/**", "/auth/**");
        security.authorizeHttpRequests(
                (authorize) -> authorize
                        .requestMatchers("/auth/login", "/auth/logout", "/auth/register",
                                "/auth/forgot-password", "/auth/verify-otp", "/auth/reset-password",
                                "/api/services", "/api/payment/vnpay/**")
                        .permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/staff/**").hasRole("STAFF")
                        .anyRequest()
                        .authenticated());
        security.csrf((csrf) -> csrf.disable());
        security.sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        security.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        security.cors(cors -> cors.configurationSource(corsConfigurationSource));
        return security.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
