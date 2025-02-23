package fa.pjb.back.common.exception;


import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class EmailAlreadyExistedException extends RuntimeException {
    public EmailAlreadyExistedException(String message) {
        super(message);
    }
}
