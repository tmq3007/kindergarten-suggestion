package fa.pjb.back.service;

import fa.pjb.back.model.dto.ForgotPasswordDTO;
import fa.pjb.back.model.dto.LoginDTO;
import fa.pjb.back.model.dto.ResetPasswordDTO;
import fa.pjb.back.model.vo.ForgotPasswordVO;
import fa.pjb.back.model.vo.LoginVO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public interface AuthService {
    LoginVO loginWithCondition(LoginDTO loginDTO, boolean checkAdmin);

    LoginVO loginByAdmin(LoginDTO loginDTO);

    LoginVO loginByParent(LoginDTO loginDTO);

    LoginVO refresh(HttpServletRequest request);

    void logout();

    ForgotPasswordVO forgotPassword(ForgotPasswordDTO forgotPasswordDTO, HttpServletResponse response);

    void resetPassword(ResetPasswordDTO resetPasswordDTO, HttpServletRequest request);

    boolean checkEmailExists(String email);
}
