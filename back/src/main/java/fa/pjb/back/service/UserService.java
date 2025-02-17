package fa.pjb.back.service;

import org.springframework.stereotype.Service;

@Service
public interface UserService {
    String getUserById(String id);
}
