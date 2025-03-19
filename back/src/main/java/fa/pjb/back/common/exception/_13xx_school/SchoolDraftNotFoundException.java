package fa.pjb.back.common.exception._13xx_school;

import io.github.wimdeblauwe.errorhandlingspringbootstarter.ResponseErrorCode;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseErrorCode("1304")
@ResponseStatus(HttpStatus.NOT_FOUND)
public class SchoolDraftNotFoundException extends RuntimeException {
    public SchoolDraftNotFoundException(String message) {
        super(message);
    }
}
