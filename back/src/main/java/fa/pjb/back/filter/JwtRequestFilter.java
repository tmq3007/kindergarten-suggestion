package fa.pjb.back.filter;

import fa.pjb.back.common.util.HttpRequestHelper;
import fa.pjb.back.common.util.JwtUtil;
import fa.pjb.back.service.impl.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@RequiredArgsConstructor
@Component
public class JwtRequestFilter extends OncePerRequestFilter {
    private final UserDetailsServiceImpl userDetailsServiceImpl;
    private final JwtUtil jwtUtil;
    private final HttpRequestHelper httpRequestHelper;

    // Danh sách URL không cần xác thực
    private static final List<String> PUBLIC_URLS = List.of(
            "/",
            "/auth/login",
            "/auth/register",
            "/public/",
            "/docs"
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
        String username = null;
        // Nếu có jwt thì trích xuất username từ jwt
        if (jwt != null) {
            username = jwtUtil.extractUsername(jwt);
        }
        // Nếu có username thì kiểm tra người dùng đã xác thực chưa
        // Bằng cách kiểm tra xem có tồn tại Authentication (người dùng đã xác thực) trong SecurityContext hay không
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Nếu người dùng chưa xác thực thì ta tiến hành xác thực thông qua UserDetailsService
            UserDetails userDetails = userDetailsServiceImpl.loadUserByUsername(username);
            // Sau khi đã xác thực xong, ta tiếp tục kiểm tra tính hợp lệ của token
            // Nếu token hợp lệ, ta tiến hành tạo UsernamePasswordAuthenticationToken chứa thông tin và quyền hạn người dùng (không cần chứa password)
            if (jwtUtil.validateToken(jwt, userDetails)) {
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
