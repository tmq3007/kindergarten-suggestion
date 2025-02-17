package fa.pjb.back.service.impl;

import fa.pjb.back.common.exception.UserNotFoundException;
import fa.pjb.back.service.UserService;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {
    @Override
    public String getUserById(String id) {
        if (id.equals("123")) {
            throw new UserNotFoundException(id);
        }
        return "User found: " + id;
    }
}
