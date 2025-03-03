package fa.pjb.back.common.exception._14xx_data;

import io.github.wimdeblauwe.errorhandlingspringbootstarter.ResponseErrorCode;

@ResponseErrorCode("1404")
public class InvalidFileFormatException extends RuntimeException {
    public InvalidFileFormatException(String message) {
        super(message);
    }
}
