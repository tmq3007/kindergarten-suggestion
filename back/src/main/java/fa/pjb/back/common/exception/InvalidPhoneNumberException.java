package fa.pjb.back.common.exception;

import org.springframework.http.HttpStatus;

public class InvalidPhoneNumberException extends RuntimeException {
    private final int code;
    private final HttpStatus status;
    public InvalidPhoneNumberException( ) {
        super("Invalid phone number, must have 10 number");
        this.code = 5000;
        this.status = HttpStatus.NOT_FOUND; // 404
    }
}
