package capstone.cyberkids.CyberKids.JWT;

import capstone.cyberkids.CyberKids.Entity.Teacher;
import capstone.cyberkids.CyberKids.Repository.TeacherRepo;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final TeacherRepo teacherRepo;

    public AuthService(AuthenticationManager authenticationManager, CustomUserDetailsService userDetailsService, JwtUtil jwtUtil, TeacherRepo teacherRepo) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
        this.teacherRepo = teacherRepo;
    }

    public String login(String email, String password) {
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));

            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            Teacher teacher = teacherRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

            return jwtUtil.generateToken(userDetails.getUsername(), teacher.getRole().name(), teacher.getId(), teacher.getEmail());
        } catch (BadCredentialsException e) {
            throw new RuntimeException("Invalid email or password");
        }
    }
}

