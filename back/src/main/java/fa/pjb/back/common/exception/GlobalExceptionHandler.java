package fa.pjb.back.common.exception;

import fa.pjb.back.common.exception._10xx_user.UserNotFoundException;
import fa.pjb.back.common.exception._14xx_data.IncorrectPasswordException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleUserNotFoundException(UserNotFoundException ex) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("code", ex.getCode());
        errorResponse.put("message", ex.getMessage());
        return new ResponseEntity<>(errorResponse, ex.getStatus());
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentialsException(BadCredentialsException ex) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("code", "1000");
        errorResponse.put("message", "Invalid username or password");

        return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(IncorrectPasswordException.class)
    public ResponseEntity<Map<String, Object>> handleIncorrectPasswordException(IncorrectPasswordException ex) {
        Map<String, Object> response = new HashMap<>();
        response.put("code", 6000);
        response.put("message", ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND); // 404
    }
}
