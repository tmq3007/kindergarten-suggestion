package fa.pjb.back.common.exception._14xx_data;

import io.github.wimdeblauwe.errorhandlingspringbootstarter.ResponseErrorCode;

@ResponseErrorCode("1405")
public class UploadFileException extends RuntimeException {
    public UploadFileException(String message) {
        super(message);
    }
}
