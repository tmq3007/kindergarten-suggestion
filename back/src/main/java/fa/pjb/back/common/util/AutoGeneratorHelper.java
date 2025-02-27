package fa.pjb.back.common.util;

import fa.pjb.back.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AutoGeneratorHelper {
    private final UserRepository userRepository;
    // Function to generate random password
    public String generateRandomPassword() {
        return RandomStringUtils.randomAlphanumeric(8) + "a";
    }

    //Generate username from fullname
    public String generateUsername(String fullName) {
        String[] parts = fullName.trim().split("\\s+");

        String firstName = parts[parts.length - 1];
        firstName = firstName.substring(0, 1).toUpperCase() + firstName.substring(1).toLowerCase();

        StringBuilder initials = new StringBuilder();
        for (int i = 0; i < parts.length - 1; i++) {
            initials.append(parts[i].charAt(0));
        }

        String baseUsername = firstName + initials.toString().toUpperCase();

        // Count the number of usernames that already exist with this prefix
        long count = userRepository.countByUsernameStartingWith(baseUsername);

        return count == 0 ? baseUsername + 1 : baseUsername + (count + 1);
    }
}
