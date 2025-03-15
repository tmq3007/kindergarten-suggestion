package fa.pjb.back.common.exception._13xx_school;

import io.github.wimdeblauwe.errorhandlingspringbootstarter.ResponseErrorCode;
import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseErrorCode("1302")
@ResponseStatus(HttpStatus.NOT_FOUND)
@Getter
@Setter
public class ReviewNotFoundException extends RuntimeException {
    public ReviewNotFoundException() {
        super("Review not found");
    }
}
