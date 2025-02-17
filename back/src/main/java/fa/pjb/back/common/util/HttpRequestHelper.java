package fa.pjb.back.common.util;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

@Service
public class HttpRequestHelper {
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String TOKEN_PREFIX = "Bearer ";

    /**
     * Trích xuất JWT từ header Authorization
     * @param request HTTP request từ client
     * @return JWT token hoặc null nếu không hợp lệ
     */
    public String extractJwtFromRequestHeader(HttpServletRequest request) {
        String authorizationHeader = request.getHeader(AUTHORIZATION_HEADER);
        if (authorizationHeader != null && authorizationHeader.startsWith(TOKEN_PREFIX)) {
            return authorizationHeader.substring(TOKEN_PREFIX.length());
        }
        return null;
    }

    /**
     * Trích xuất JWT từ Cookie dựa vào tên Cookie
     * @param request HTTP Request
     * @param cookieName Tên Cookie chứa JWT
     * @return JWT nếu có, null nếu không tìm thấy
     */
    public String extractJwtTokenFromCookie(HttpServletRequest request, String cookieName) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals(cookieName)) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}
