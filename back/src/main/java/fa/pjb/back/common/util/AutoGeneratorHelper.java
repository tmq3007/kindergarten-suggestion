package fa.pjb.back.common.util;

import fa.pjb.back.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AutoGeneratorHelper {
    private final UserRepository userRepository;
    // Function to generate random password
    public String generateRandomPassword() {
        return RandomStringUtils.randomAlphanumeric(8) + "9";
    }

    public String generateUsername(String fullName) {

        fullName = removeDiacritics(fullName);

        String[] parts = fullName.trim().split("\\s+");

        String firstName = parts[parts.length - 1];
        firstName = firstName.substring(0, 1).toUpperCase() + firstName.substring(1).toLowerCase();

        StringBuilder initials = new StringBuilder();
        for (int i = 0; i < parts.length - 1; i++) {
            initials.append(parts[i].charAt(0));
        }

        String baseUsername = firstName + initials.toString().toUpperCase();

        List<String> existingUsernames = userRepository.findUsernamesStartingWith(baseUsername);

        int maxNumber = 0;
        for (String username : existingUsernames) {
            String numberPart = username.substring(baseUsername.length());
            if (numberPart.matches("\\d+")) {
                maxNumber = Math.max(maxNumber, Integer.parseInt(numberPart));
            }
        }

        return baseUsername + (maxNumber + 1);
    }
    private String removeDiacritics(String str) {
        String normalized = Normalizer.normalize(str, Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{M}", "").replaceAll("Đ", "D").replaceAll("đ", "d");
    }

}
