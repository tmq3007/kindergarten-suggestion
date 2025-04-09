package fa.pjb.back.service;

import fa.pjb.back.model.dto.ForgotPasswordDTO;
import fa.pjb.back.model.dto.LoginDTO;
import fa.pjb.back.model.dto.ResetPasswordDTO;
import fa.pjb.back.model.vo.ForgotPasswordVO;
import fa.pjb.back.model.vo.LoginVO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public interface AuthService {

    LoginVO loginWithCondition(LoginDTO loginDTO, boolean checkParent);

    LoginVO loginAdmin(LoginDTO loginDTO);

    LoginVO loginPublic(LoginDTO loginDTO);

    LoginVO refresh(HttpServletRequest request);

    void logout(HttpServletResponse response);

    ForgotPasswordVO forgotPassword(ForgotPasswordDTO forgotPasswordDTO, HttpServletResponse response);

    void resetPassword(ResetPasswordDTO resetPasswordDTO, HttpServletRequest request);

    boolean checkEmailExists(String email);

}
