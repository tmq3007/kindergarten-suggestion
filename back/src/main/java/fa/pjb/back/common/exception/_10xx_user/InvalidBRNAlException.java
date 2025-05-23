package fa.pjb.back.common.exception._10xx_user;

import io.github.wimdeblauwe.errorhandlingspringbootstarter.ResponseErrorCode;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseErrorCode("1004")
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidBRNAlException extends RuntimeException {
    public InvalidBRNAlException(String message) {
        super(message);
    }
}
