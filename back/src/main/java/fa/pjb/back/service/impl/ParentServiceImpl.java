package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception.user.UserNotCreatedException;
import fa.pjb.back.model.dto.RegisterDTO;
import fa.pjb.back.model.entity.Parent;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.model.mapper.ParentMapper;
import fa.pjb.back.model.vo.RegisterVO;
import fa.pjb.back.repository.ParentRepository;
import fa.pjb.back.service.AuthService;
import fa.pjb.back.service.ParentService;
import fa.pjb.back.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static fa.pjb.back.model.enums.ERole.ROLE_PARENT;

@RequiredArgsConstructor
@Service
public class ParentServiceImpl implements ParentService {

    private final AuthService authService;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final ParentRepository parentRepository;
    private final ParentMapper parentMapper;

    @Transactional
    @Override
    public RegisterVO saveNewParent(RegisterDTO registerDTO) throws UserNotCreatedException {
        if (authService.checkEmailExists(registerDTO.email())) {
            throw new UserNotCreatedException("Email already exists");
        }
        String username = userService.generateUsername(registerDTO.fullname());
        User user = User.builder()
                .email(registerDTO.email())
                .username(username)
                .password(passwordEncoder.encode(registerDTO.password()))
                .role(ROLE_PARENT)
                .status(true)
                .build();
        Parent parent = Parent.builder()
                .user(user)
                .phone(registerDTO.phone())
                .fullname(registerDTO.fullname())
                .build();
//        user.setParent(parent);
        return parentMapper.toRegisterVO(parentRepository.save(parent));
    }
}
