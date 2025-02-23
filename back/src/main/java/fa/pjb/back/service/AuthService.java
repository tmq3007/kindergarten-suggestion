package fa.pjb.back.service;

import fa.pjb.back.model.dto.ForgotPasswordDTO;
import fa.pjb.back.model.dto.LoginDTO;
import fa.pjb.back.model.dto.ResetPasswordDTO;
import fa.pjb.back.model.vo.ForgotPasswordVO;
import fa.pjb.back.model.vo.LoginVO;
import jakarta.servlet.http.HttpServletResponse;

public interface AuthService {
    LoginVO login(LoginDTO loginDTO, HttpServletResponse response);

    LoginVO refresh(LoginDTO loginDTO, HttpServletResponse response);

    LoginVO logout(HttpServletResponse response);

    ForgotPasswordVO forgotpassword(ForgotPasswordDTO forgotPasswordDTO, HttpServletResponse response);

    void resetPassword(ResetPasswordDTO resetPasswordDTO, HttpServletResponse response);

    boolean checkEmailExists(String email);
}
