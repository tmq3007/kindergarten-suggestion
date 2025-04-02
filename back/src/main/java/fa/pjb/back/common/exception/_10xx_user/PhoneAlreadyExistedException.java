package fa.pjb.back.common.exception._10xx_user;

import io.github.wimdeblauwe.errorhandlingspringbootstarter.ResponseErrorCode;

@ResponseErrorCode("1004")
public class PhoneAlreadyExistedException extends RuntimeException {
    public PhoneAlreadyExistedException(String message) {
        super(message);
    }
}
