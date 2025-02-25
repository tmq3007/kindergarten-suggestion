package fa.pjb.back.common.exception;

import org.springframework.http.HttpStatus;

public class IncorrectPasswordException extends RuntimeException {
    private final int code;
    private final HttpStatus status;
    public IncorrectPasswordException() {
        super("Please Enter Correct Password");
        this.code = 6000;
        this.status = HttpStatus.NOT_FOUND; // 404
    }
}
