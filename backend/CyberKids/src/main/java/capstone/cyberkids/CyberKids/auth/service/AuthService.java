package capstone.cyberkids.CyberKids.auth.service;

import capstone.cyberkids.CyberKids.auth.JWT.JwtUtil;
import capstone.cyberkids.CyberKids.entity.Teacher;
import capstone.cyberkids.CyberKids.exception.InvalidCredentialsException;
import capstone.cyberkids.CyberKids.auth.dto.AuthResponse;
import capstone.cyberkids.CyberKids.repository.TeacherRepo;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final TeacherRepo teacherRepo;

    public AuthService(AuthenticationManager authenticationManager, JwtUtil jwtUtil, TeacherRepo teacherRepo) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.teacherRepo = teacherRepo;
    }

    public AuthResponse login(String email, String password) {
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));

            Teacher teacher = teacherRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

            String token = jwtUtil.generateToken(
                    teacher.getEmail(),
                    teacher.getRole().name(),
                    teacher.getId(),
                    teacher.getEmail()
            );

            return new AuthResponse(token, teacher.getId(), teacher.getRole().name(), teacher.getFullName());
        } catch (BadCredentialsException e) {
            throw new InvalidCredentialsException();
        }
    }
}

