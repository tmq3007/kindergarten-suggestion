package fa.pjb.back.common.util;

import io.github.cdimascio.dotenv.Dotenv;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;


@Service
public class JwtUtil {
    private final Dotenv dotenv = Dotenv.load();
    private final String SECRET_KEY = dotenv.get("SECRET_KEY");
    @Value("${access-token-exp}")
    private long ACCESS_TOKEN_EXP;
    @Value("${refresh-token-exp}")
    private long REFRESH_TOKEN_EXP;

    /**
     * Phuơng thức dùng để trích xuất tất cà các claims (thông tin được mã hóa) từ token
     *
     * @param token: JWT token nhận từ client
     *               parser(): tạo 1 đối tượng JwtParser để phân tích JWT
     *               setSigningKey(SECRET_KEY): thiết lập khóa bí mật để xác thực chữ ký của JWT
     *               parseClaimsJws(token): xác minh chữ ký rồi phân tích JWT từ chuỗi token
     *               getBody(): trích xuất phần payload của JWT
     * @return Claims: chứa các thông tin (claims) được mã hóa trong JWT (sub, exp, iat,...)
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Phương thức dùng để trích xuất 1 claim cụ thể từ JWT
     *
     * @param token:          JWT token nhận từ client
     * @param claimsResolver: Functional Interface
     *                        gọi extractAllClaims để trích xuất tất cà các claims từ JWT rồi lưu vào biến claims
     *                        claimsResolver.apply(claims): áp dụng hàm claimsResolver lên claims
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Phương thức dùng để trích xuất sub trong claims được phân tích từ token
     * Claims::getSubject là 1 Functional Interface
     * Áp dụng hàm này lên claims
     *
     * @return sub: subject - chủ thể của token (username/ ID)
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // Phương thức dùng để trích xuất thời gian hết hạn của token
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // Phương thúc dùng để kiểm tra token đã hết hạn hay chưa
    // Nếu thời gian hết hạn trước thời gian hiện tại thì chứng tỏ token đó đã hết hạn
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Phương thức này dùng để tạo JWT token
     *
     * @param claims:  chứa dữ liệu cần lưu trong token (có định dạng là 1 HashMap)
     * @param subject: chủ thể của token (thường là username)
     *                 1. Đặt claims rỗng vào token
     *                 2. Đặt sub (username) vào claims
     *                 3. Đặt iat (ngày phát hành) vào claims
     *                 4. Đặt exp (thời gian hết hạn) vào claims
     *                 5. Ký token bằng thuật toán (HS256)
     *                 6. Chuyển token thành chuỗi
     * @return JWT token
     */
    private String createToken(Map<String, Object> claims, String subject, long expirationTime) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                .compact();
    }

    // Phương thức dùng để tạo ra Access Token từ thông tin người dùng (UserDetails)
    public String generateAccessToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, userDetails.getUsername(), ACCESS_TOKEN_EXP);
    }

    // Phương thức dùng để tạo ra Refresh Token từ thông tin người dùng (UserDetails)
    public String generateRefreshToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, userDetails.getUsername(), REFRESH_TOKEN_EXP);
    }

    // Phương thức dùng để tạo ra CSRF Token
    public String generateCsrfToken() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    // Phương thúc dùng để kiểm tra tính hợp lệ của token
    // Token hợp lệ là token thỏa mãn cả 2 điều kiện:
    // 1. sub (trong trường hợp này là username) phải trùng với username của UserDetails
    // Muốn vậy thì trước khi chạy method này thì ta phải xác thực người dùng trước thông qua loadUserByUsername của UserDetailsService
    // 2. token đó phải chưa hết hạn
    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
}
