package com.example.fanstatus.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    private final SecretKey key;
    private final long expireDays;

    private String lastToken;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expire-days}") long expireDays
    ) {
        if (secret == null || secret.length() < 32) {
            throw new IllegalArgumentException("app.jwt.secret must be at least 32 chars");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expireDays = expireDays;
    }

    public Instant issueToken(Integer userId, String username) {
        Instant now = Instant.now();
        Instant exp = now.plus(expireDays, ChronoUnit.DAYS);

        Map<String, Object> claims = new HashMap<>();
        claims.put("UserId", userId);

        this.lastToken = Jwts.builder()
                .subject(username)
                .claims(claims)
                .issuedAt(java.util.Date.from(now))
                .expiration(java.util.Date.from(exp))
                .signWith(key)
                .compact();

        return exp;
    }

    public String getLastToken() {
        return lastToken;
    }

    public JwtPayload parse(String token) {
        var jws = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token);

        var claims = jws.getPayload();
        String username = claims.getSubject();
        Integer userId = claims.get("UserId", Integer.class);
        return new JwtPayload(userId, username);
    }

    public record JwtPayload(Integer userId, String username) {}
}
