package fa.pjb.back.common.exception._11xx_email;


import io.github.wimdeblauwe.errorhandlingspringbootstarter.ResponseErrorCode;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseErrorCode("1100")
@ResponseStatus(HttpStatus.CONFLICT)
public class EmailAlreadyExistedException extends RuntimeException {
    public EmailAlreadyExistedException(String message) {
        super(message);
    }
}
