package fa.pjb.back.common.exception;

import io.github.wimdeblauwe.errorhandlingspringbootstarter.ResponseErrorCode;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseErrorCode("1100")
@ResponseStatus(HttpStatus.NOT_FOUND)
public class EmailNotFoundException extends RuntimeException {

    public EmailNotFoundException(String email) {
        super("Could not found user with email " + email);
    }
}
