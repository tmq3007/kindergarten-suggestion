package fa.pjb.back.common.exception._14xx_data;

import io.github.wimdeblauwe.errorhandlingspringbootstarter.ResponseErrorCode;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseErrorCode("1403")
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class MissingDataException extends RuntimeException {
    public MissingDataException(String message) {
        super(message);
    }
}
