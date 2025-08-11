package capstone.cyberkids.CyberKids.MsTeams;

import capstone.cyberkids.CyberKids.Entity.Teacher;
import capstone.cyberkids.CyberKids.JWT.JwtUtil;
import capstone.cyberkids.CyberKids.Model.Role;
import capstone.cyberkids.CyberKids.Repository.TeacherRepo;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/oauth")
public class OAuthController {

    private final JwtUtil jwtUtil;
    private final TeacherRepo teacherRepo;

    public OAuthController(JwtUtil jwtUtil, TeacherRepo teacherRepo) {
        this.jwtUtil = jwtUtil;
        this.teacherRepo = teacherRepo;
    }

    @GetMapping("/redirect")
    public ResponseEntity<?> redirectAfterLogin(@AuthenticationPrincipal OAuth2User principal) {
        String email = principal.getAttribute("email");
        String name = principal.getAttribute("name");
        String oid = principal.getAttribute("oid");

        Teacher teacher = teacherRepo.findByEmail(email).orElseGet(() -> {
            Teacher newTeacher = new Teacher();
            newTeacher.setEmail(email);
            newTeacher.setFullName(name);
            newTeacher.setRole(Role.TEACHER);
            newTeacher.setPassword("oauth2");
            return teacherRepo.save(newTeacher);
        });

        String jwt = jwtUtil.generateToken(
                teacher.getEmail(),
                teacher.getRole().name(),
                teacher.getId(),
                teacher.getEmail()
        );

        Map<String, Object> response = new HashMap<>();
        response.put("token", jwt);
        response.put("user", Map.of(
                "id", teacher.getId(),
                "email", teacher.getEmail(),
                "fullName", teacher.getFullName(),
                "role", teacher.getRole().name()
        ));

        return ResponseEntity.ok(response);
    }
}
