package fa.pjb.back.config;

import fa.pjb.back.filter.JwtRequestFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;

@RequiredArgsConstructor
@EnableWebSecurity
@EnableMethodSecurity
@Configuration
public class SecurityConfig {
    public static final String SWAGGER_UI_URL = "/swagger-ui/**";
    public static final String API_DOCS_URL = "/v3/api-docs/**";
    public static final String[] ALLOWED_URLS = {
            SWAGGER_UI_URL, API_DOCS_URL
    };
    private final JwtRequestFilter jwtRequestFilter;

    // Use AuthenticationConfiguration to get the AuthenticationManager
    // Spring Security will automatically configure the AuthenticationManager
    // based on the UserDetailsService and PasswordEncoder that have been declared
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .authorizeHttpRequests(auth -> auth
                                .requestMatchers(ALLOWED_URLS).permitAll()
                                .requestMatchers("/api/auth/login/admin").permitAll()
                                .requestMatchers("/api/auth/login/public").permitAll()
                                .requestMatchers("/api/auth/refresh-token").permitAll()
                                .requestMatchers("/api/auth/forgot-password").permitAll()
                                .requestMatchers("/api/auth/reset-password").permitAll()
                                .requestMatchers("/api/auth/check-email").permitAll()
                                .requestMatchers("/api/parent/register").permitAll()
                                .requestMatchers("/api/school/review/top4").permitAll()
                                .requestMatchers("/api/school/search-by-criteria").permitAll()
                                .requestMatchers("/api/counselling/request").permitAll()
                                .requestMatchers("/api/v3/api-doc/**").permitAll()
                                .requestMatchers("/api/swagger-ui/**").permitAll()
                                .anyRequest().authenticated()
                )
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000", "http://marcowu.shop"));
        configuration.setAllowedMethods(Collections.singletonList("*"));
        configuration.setAllowCredentials(true);
        configuration.setAllowedHeaders(Collections.singletonList("*"));
        configuration.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public static PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

}
