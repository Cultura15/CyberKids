package capstone.cyberkids.CyberKids.JWT;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.function.Function;


@Component
public class JwtUtil {

        @Value("${jwt.secret}")
        private String SECRET_KEY;


        public String generateToken(String username, String role, Long userId, String email) {
            return Jwts.builder()
                    .setSubject(username)
                    .claim("role", role)
                    .claim("id", userId)
                    .claim("email", email)
                    .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10)) // 10 hours expiration
                    .signWith(SignatureAlgorithm.HS256, SECRET_KEY)
                    .compact();
        }

        public String extractUsername(String token) {
            return extractClaim(token, Claims::getSubject);
        }


        public String extractRole(String token) {
            return extractClaim(token, claims -> claims.get("role", String.class)); // Extract role claim
        }

        public Date extractExpiration(String token) {
            return extractClaim(token, Claims::getExpiration);
        }

        public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
            final Claims claims = Jwts.parser()
                    .setSigningKey(SECRET_KEY)
                    .parseClaimsJws(token)
                    .getBody();
            return claimsResolver.apply(claims);
        }

        public boolean validateToken(String token, String username) {
            return (extractUsername(token).equals(username) && !isTokenExpired(token));
        }

        public boolean isTokenExpired(String token) {
            return extractExpiration(token).before(new Date());
        }
}
