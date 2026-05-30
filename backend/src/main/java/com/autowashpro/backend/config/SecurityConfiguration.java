package com.autowashpro.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

import com.autowashpro.backend.config.jwt.OAuth2LoginSuccessHandler;

@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

    @Autowired
    private OAuth2LoginSuccessHandler handler;

    @Bean
    @Order(1)
    public SecurityFilterChain oauth2FilterChain(HttpSecurity security) throws Exception {
        security.securityMatcher("/login/**", "/oauth2/**", "/logout");
        security.authorizeHttpRequests((authorize) -> authorize.anyRequest().permitAll());

        security.csrf((csrf) -> csrf.disable());

        security.oauth2Login((oauth2) -> oauth2.successHandler(handler));
        return security.build();
    }

    @Bean
    @Order(2)
    public SecurityFilterChain apiFilterChain(HttpSecurity security) throws Exception {
        security.securityMatcher("/api/**", "/auth/**");
        security.authorizeHttpRequests(
                (authorize) -> authorize.requestMatchers("/auth/login").permitAll().anyRequest().authenticated());
        security.csrf((csrf) -> csrf.disable());
        security.oauth2ResourceServer((oauth2) -> oauth2
                .jwt(Customizer.withDefaults()));
        return security.build();
    }
}
