package fa.pjb.back.common.exception;

import io.github.wimdeblauwe.errorhandlingspringbootstarter.ResponseErrorCode;
import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseErrorCode("2000")
@ResponseStatus(HttpStatus.NOT_FOUND)
@Getter
@Setter
public class SchoolNotFoundException extends RuntimeException {
    private final int code;
    private final HttpStatus status;
    public SchoolNotFoundException() {
         super("School not found");
        this.code = 2000;
        this.status = HttpStatus.NOT_FOUND; // 404
    }
}
