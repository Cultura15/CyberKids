package capstone.cyberkids.CyberKids.JWT;


import capstone.cyberkids.CyberKids.Entity.Teacher;
import capstone.cyberkids.CyberKids.Repository.TeacherRepo;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final TeacherRepo teacherRepo;
    private final JwtUtil jwtUtil;

    public AuthController(AuthService authService, TeacherRepo teacherRepo, JwtUtil jwtUtil) {
        this.authService = authService;
        this.teacherRepo = teacherRepo;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody AuthRequest request) {
        String token = authService.login(request.getEmail(), request.getPassword());

        Teacher userEntity = teacherRepo.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> user = new HashMap<>();
        user.put("id", userEntity.getId());
        user.put("username", userEntity.getFullName());
        user.put("role", userEntity.getRole().name());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", user);

        return ResponseEntity.ok(response);
    }


    @GetMapping("/token-login")
    public ResponseEntity<Map<String, String>> tokenLogin(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().build();
        }

        String token = authHeader.substring(7);
        String email = jwtUtil.extractUsername(token);

        if (email == null || jwtUtil.isTokenExpired(token)) {
            return ResponseEntity.status(401).build();
        }

        Teacher user = teacherRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("role", user.getRole().name());

        return ResponseEntity.ok(response);
    }
}

// CodeRabbit audit trigger
