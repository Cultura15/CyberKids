package capstone.cyberkids.CyberKids.auth.controller;

import capstone.cyberkids.CyberKids.auth.service.AuthService;
import capstone.cyberkids.CyberKids.auth.JWT.JwtUtil;
import capstone.cyberkids.CyberKids.auth.dto.AuthRequest;
import capstone.cyberkids.CyberKids.auth.dto.AuthResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;

    public AuthController(AuthService authService, JwtUtil jwtUtil) {
        this.authService = authService;
        this.jwtUtil = jwtUtil;
    }

    // Teacher Login with JWT
    // PROBLEM: previous use was userEntity
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody AuthRequest request) {
        AuthResponse authResponse = authService.login(request.getEmail(), request.getPassword());

        Map<String, Object> user = new HashMap<>();
        user.put("id", authResponse.getId());
        user.put("username", authResponse.getUsername());
        user.put("role", authResponse.getRole());

        Map<String, Object> response = new HashMap<>();
        response.put("token", authResponse.getToken());
        response.put("user", user);

        return ResponseEntity.ok(response);
    }

    // Validate teacher via token
    // TODO: Research this implementation
//    @GetMapping("/token-login")
//    public ResponseEntity<Map<String, String>> tokenLogin(@RequestHeader("Authorization") String authHeader) {
//        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
//            return ResponseEntity.badRequest().build();
//        }
//
//        String token = authHeader.substring(7);
//        String email = jwtUtil.extractUsername(token);
//
//        if (email == null || jwtUtil.isTokenExpired(token)) {
//            return ResponseEntity.status(401).build();
//        }
//
//        Teacher user = teacherRepo.findByEmail(email)
//                .orElseThrow(() -> new RuntimeException("User not found"));
//
//        Map<String, String> response = new HashMap<>();
//        response.put("token", token);
//        response.put("role", user.getRole().name());
//
//        return ResponseEntity.ok(response);
//    }
}

