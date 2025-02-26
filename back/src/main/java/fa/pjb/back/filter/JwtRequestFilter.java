package fa.pjb.back.filter;

import fa.pjb.back.common.exception.user.UserNotFoundException;
import fa.pjb.back.common.util.HttpRequestHelper;
import fa.pjb.back.common.util.JwtHelper;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.repository.UserRepository;
import fa.pjb.back.service.impl.UserDetailsServiceImpl;
import io.jsonwebtoken.JwtException;
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
    private final UserDetailsServiceImpl userDetailsServiceImpl;
    private final JwtHelper jwtHelper;
    private final HttpRequestHelper httpRequestHelper;
    private final UserRepository userRepository;

    // Danh sách URL không cần xác thực
    private static final List<String> PUBLIC_URLS = List.of(
//            "/",
            "/api/auth/login/admin",
            "/api/auth/login/public",
            "/api/auth/refresh",
//            "/api/auth/logout",
            "/api/auth/forgot-password",
            "/api/auth/check-email",
            "/api/parent/register"

    );

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        // Bỏ qua kiểm tra JWT nếu request thuộc danh sách PUBLIC_URLS
        String requestURI = request.getRequestURI();
        if (PUBLIC_URLS.stream().anyMatch(requestURI::startsWith)) {

            filterChain.doFilter(request, response);
            return;
        }

        // Kiểm tra CSRF Token từ Cookie và Header
        String csrfTokenFromCookie = httpRequestHelper.extractJwtTokenFromCookie(request, "CSRF_TOKEN");
        String csrfTokenFromHeader = request.getHeader("X-CSRF-TOKEN");
        if (csrfTokenFromCookie == null || !csrfTokenFromCookie.equals(csrfTokenFromHeader)) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Invalid CSRF Token");
            return;
        }

        // Trích xuất JWT Access Token từ Cookie
        String jwt = httpRequestHelper.extractJwtTokenFromCookie(request, "ACCESS_TOKEN");
        if (jwt == null) {
            throw new JwtException("Invalid Access Token");
        }
        // Nếu có jwt thì trích xuất username từ jwt
        String username = jwtHelper.extractUsername(jwt);

        if (username == null) {

            throw new JwtException("Invalid Access Token");
        }
        // Nếu có username thì kiểm tra người dùng đã xác thực chưa
        // Bằng cách kiểm tra xem có tồn tại Authentication (người dùng đã xác thực) trong SecurityContext hay không
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            // Nếu người dùng chưa xác thực thì ta tiến hành xác thực thông qua UserDetailsService

            User user = userRepository.findByUsername(username).orElseThrow(UserNotFoundException::new);

            UserDetails userDetails = userDetailsServiceImpl.loadUserByUsername(user.getEmail());
            // Sau khi đã xác thực xong, ta tiếp tục kiểm tra tính hợp lệ của token
            // Nếu token hợp lệ, ta tiến hành tạo UsernamePasswordAuthenticationToken chứa thông tin và quyền hạn người dùng (không cần chứa password)
            if (jwtHelper.validateToken(jwt, userDetails)) {

                UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());

                // Gán thông tin bổ sung về request (IP, Session ID, thông tin trình duyệt,...)
                usernamePasswordAuthenticationToken.setDetails(new WebAuthenticationDetails(request));
                // Đặt token vào SecurityContext
                SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
            }
        }
        // Tiếp tục chuyển request qua các filter khác
        filterChain.doFilter(request, response);
    }
}
