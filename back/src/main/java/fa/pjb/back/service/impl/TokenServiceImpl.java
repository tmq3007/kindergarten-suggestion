package fa.pjb.back.service.impl;

import fa.pjb.back.service.TokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@RequiredArgsConstructor
@Service
public class TokenServiceImpl implements TokenService {

    private final RedisTemplate<String, String> redisTemplate;

    @Override
    public void saveTokenInRedis(String prefix, String postfix, String token, int ttl) {
        String key = prefix + ":" + postfix;
        redisTemplate.opsForValue().set(key, token, Duration.ofSeconds(ttl));
    }

    @Override
    public String getTokenFromRedis(String prefix, String postfix) {
        String key = prefix + ":" + postfix;
        return redisTemplate.opsForValue().get(key);
    }

    @Override
    public void deleteTokenFromRedis(String prefix, String postfix) {
        String key = prefix + ":" + postfix;
        redisTemplate.delete(key);
    }

}
