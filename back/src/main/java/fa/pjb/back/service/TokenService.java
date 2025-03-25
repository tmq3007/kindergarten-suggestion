package fa.pjb.back.service;

public interface TokenService {

    void saveTokenInRedis(String prefix, String postfix, String token, int ttl);

    String getTokenFromRedis(String prefix, String postfix);

    void deleteTokenFromRedis(String prefix, String postfix);

}
