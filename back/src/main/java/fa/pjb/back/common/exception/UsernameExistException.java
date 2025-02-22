package fa.pjb.back.common.exception;

import io.github.wimdeblauwe.errorhandlingspringbootstarter.ResponseErrorCode;
import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseErrorCode("1000")
@ResponseStatus(HttpStatus.NOT_FOUND)
@Getter
@Setter
public class UsernameExistException extends RuntimeException {
  private final int code;
  private final HttpStatus status;

  public UsernameExistException() {
    super("Username Exist");
    this.code = 1003;
    this.status = HttpStatus.NOT_FOUND; // 404
  }
}
