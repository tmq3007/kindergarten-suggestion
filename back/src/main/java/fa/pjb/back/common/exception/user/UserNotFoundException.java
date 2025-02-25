package fa.pjb.back.common.exception.user;

import io.github.wimdeblauwe.errorhandlingspringbootstarter.ResponseErrorCode;
import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseErrorCode("1000")
@ResponseStatus(HttpStatus.NOT_FOUND)
@Getter
@Setter
public class UserNotFoundException extends RuntimeException {
    private final String code;
    private final HttpStatus status;

    public UserNotFoundException() {
        super("User not found");
        this.code = "1000";
        this.status = HttpStatus.NOT_FOUND; // 404
    }
}
