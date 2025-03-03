package fa.pjb.back.common.exception._14xx_data;

import io.github.wimdeblauwe.errorhandlingspringbootstarter.ResponseErrorCode;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseErrorCode("1402")
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidPhoneNumberException extends RuntimeException {
    public InvalidPhoneNumberException( ) {
        super("Invalid phone number, must have 10 number");
    }
}
