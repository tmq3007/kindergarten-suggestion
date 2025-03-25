package fa.pjb.back.filter;

import fa.pjb.back.common.exception._10xx_user.UserNotFoundException;
import fa.pjb.back.common.exception._12xx_auth.JwtUnauthorizedException;
import fa.pjb.back.common.util.HttpRequestHelper;
import fa.pjb.back.common.util.JwtHelper;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.repository.UserRepository;
import fa.pjb.back.service.impl.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private final UserDetailsServiceImpl userDetailsService;
    private final JwtHelper jwtHelper;
    private final HttpRequestHelper httpRequestHelper;
    private final UserRepository userRepository;

    // List of URLs that do not require authentication
    private static final List<String> PUBLIC_URLS = List.of(
            "/api/auth/login/admin",
            "/api/auth/login/public",
            "/api/auth/refresh-token",
            "/api/auth/forgot-password",
            "/api/auth/refresh",
            "/api/auth/check-email",
            "/api/parent/register",
            "/api/auth/reset-password",
            "/api/school/review",
            "/api/counselling/request",
            "/api/v3/api-doc",
            "/v3/api-doc",
            "/api/swagger-ui",
            "/swagger-ui"

    );

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException, UserNotFoundException {

        // Skip JWT verification if the request belongs to the PUBLIC_URLS list
        String requestURI = request.getRequestURI();
        if (PUBLIC_URLS.stream().anyMatch(requestURI::startsWith)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Check CSRF Token from Cookie and Header
        String csrfTokenFromCookie = httpRequestHelper.extractJwtTokenFromCookie(request, "CSRF_TOKEN");
        String csrfTokenFromHeader = request.getHeader("X-CSRF-TOKEN");
        if (csrfTokenFromCookie == null || !csrfTokenFromCookie.equals(csrfTokenFromHeader)) {
            throw new JwtUnauthorizedException("Invalid CSRF Token");
        }

        // Extract JWT Access Token from Cookie
        String jwt = httpRequestHelper.extractJwtTokenFromCookie(request, "ACCESS_TOKEN");
        if (jwt == null) {
            throw new JwtUnauthorizedException("Invalid Access Token");
        }
        // If JWT exists, extract the username from the JWT
        String username = jwtHelper.extractUsername(jwt);

        if (username == null) {
            throw new JwtUnauthorizedException("Invalid Access Token");
        }
        // If username exists, check if the user is authenticated
        // by verifying if an Authentication (authenticated user) exists in the SecurityContext
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            // If the user is not authenticated, proceed with authentication via UserDetailsService
            User user = userRepository.findByUsername(username).orElseThrow(UserNotFoundException::new);
            UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
            // After authentication is complete, continue to check the validity of the token
            // If the token is valid, create a UsernamePasswordAuthenticationToken
            // containing the user's information and authorities (no need to include the password)
            if (jwtHelper.validateToken(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                // Assign additional information about the request (IP, Session ID, browser information, etc.)
                usernamePasswordAuthenticationToken.setDetails(new WebAuthenticationDetails(request));
                // Put authenticated token into SecurityContext
                SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
            }
        }
        // Continue passing the request through other filters
        filterChain.doFilter(request, response);
    }

}
