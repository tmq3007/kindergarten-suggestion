package fa.pjb.back.common.exception.auth;

import io.github.wimdeblauwe.errorhandlingspringbootstarter.ResponseErrorCode;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseErrorCode("1200")
@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class JwtUnauthorizedException extends RuntimeException {

    public JwtUnauthorizedException(String message) {
        super(message);
    }
}
