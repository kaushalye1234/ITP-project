package com.itp.skilledworker.config;

import com.itp.skilledworker.entity.User;
import com.itp.skilledworker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Standalone UserDetailsService that breaks the SecurityConfig ↔ JwtFilter
 * circular dependency.
 * Previously this was an inner @Bean in SecurityConfig, which caused a cycle
 * because:
 * SecurityConfig (has JwtFilter) → JwtFilter (needs UserDetailsService) →
 * SecurityConfig (provides UDS bean)
 * By making it a proper @Service Spring can instantiate it independently.
 */
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPasswordHash())
                .authorities(new SimpleGrantedAuthority("ROLE_" + user.getRole().name().toUpperCase()))
                .build();
    }
}
