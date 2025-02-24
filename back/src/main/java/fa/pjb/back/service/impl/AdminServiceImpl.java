package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception.EmailExistException;
import fa.pjb.back.common.exception.InvalidPhoneNumberException;
import fa.pjb.back.model.dto.ParentDTO;
import fa.pjb.back.model.dto.UserDTO;
import fa.pjb.back.model.entity.User;
import fa.pjb.back.repository.UserRepository;
import fa.pjb.back.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service

public class AdminServiceImpl implements AdminService {
    @Autowired
    private EmailServiceImpl emailService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public UserDTO createParent(UserDTO userDTO) {
        Optional<User> existingUserEmail = userRepository.findByEmail(userDTO.getEmail());

        if (existingUserEmail.isPresent()) {
            throw new EmailExistException();
        }
//        if (!userDTO.getPhone().matches("\\d{10}")) {
//            throw new InvalidPhoneNumberException();
//        }
        return null;
    }
}
