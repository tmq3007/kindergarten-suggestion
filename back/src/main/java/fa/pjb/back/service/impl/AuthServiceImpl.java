package fa.pjb.back.service.impl;

import fa.pjb.back.common.util.JwtUtil;
import fa.pjb.back.model.dto.LoginDTO;
import fa.pjb.back.model.vo.LoginVO;
import fa.pjb.back.service.AuthService;
import io.github.cdimascio.dotenv.Dotenv;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class AuthServiceImpl implements AuthService {
    private final JwtUtil jwtUtil;
    private final Dotenv dotenv = Dotenv.load();
    private final int ACCESS_TOKEN_EXP = Integer.parseInt(dotenv.get("ACCESS_TOKEN_EXP"));
    private final int REFRESH_TOKEN_EXP = Integer.parseInt(dotenv.get("REFRESH_TOKEN_EXP"));
    private final int CSRF_TOKEN_EXP = Integer.parseInt(dotenv.get("CSRF_TOKEN_EXP"));

    @Override
    public LoginVO login(LoginDTO loginDTO, HttpServletResponse response) {
        // Xác thực để trả về UserDetails rồi lưu trong SecurityContext

        // Tạo ra các Token
        // Access Token: Lưu vào Cookie với HttpOnly
        String accessToken = jwtUtil.generateAccessToken(null);
        Cookie accessTokenCookie = new Cookie("ACCESS_TOKEN", accessToken);
        // Thiết lập cờ HttpOnly để ngăn truy cập côokie thông qua JavaScript
        accessTokenCookie.setHttpOnly(true);
        // Thiết lập cờ Secure = false để gửi Cookie qua HTTP
        accessTokenCookie.setSecure(false);
        // Thiết lập đường dẫn mà Cookie có hiệu lực ("/" có nghĩa là toàn bộ ứng dụng)
        accessTokenCookie.setPath("/");
        // Thiết lập thời gian sống
        accessTokenCookie.setMaxAge(ACCESS_TOKEN_EXP);

        response.addCookie(accessTokenCookie);


        // CSRF Token: Lưu vào Cookie không HttpOnly
        String csrfToken = jwtUtil.generateCsrfToken();

        Cookie csrfTokenCookie = new Cookie("CSRF_TOKEN", csrfToken);
        csrfTokenCookie.setSecure(false);
        csrfTokenCookie.setPath("/");
        csrfTokenCookie.setMaxAge(CSRF_TOKEN_EXP);

        response.addCookie(csrfTokenCookie);

        // Refresh Token: Lưu vào Redis


        return null;
    }

    @Override
    public LoginVO refresh(LoginDTO loginDTO, HttpServletResponse response) {
        return null;
    }

    @Override
    public LoginVO logout(HttpServletResponse response) {
        return null;
    }
}
