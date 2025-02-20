package fa.pjb.back.service;

public interface TokenService {
    void saveTokenInRedis(String prefix, String postfix, String token, int ttl);
}
