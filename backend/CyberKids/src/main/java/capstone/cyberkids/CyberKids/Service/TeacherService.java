package capstone.cyberkids.CyberKids.Service;

import capstone.cyberkids.CyberKids.Entity.Teacher;
import capstone.cyberkids.CyberKids.Model.Role;
import capstone.cyberkids.CyberKids.Repository.TeacherRepo;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TeacherService {
    private final TeacherRepo teacherRepo;
    private final PasswordEncoder passwordEncoder;

    public TeacherService(TeacherRepo teacherRepo, PasswordEncoder passwordEncoder) {
        this.teacherRepo = teacherRepo;
        this.passwordEncoder = passwordEncoder;
    }
    public Teacher getLoggedInTeacher() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return teacherRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
    }

    public Teacher registerTeacher(Teacher teacher) {
        if (teacherRepo.findByEmail(teacher.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already in use");
        }

        teacher.setPassword(passwordEncoder.encode(teacher.getPassword()));
        teacher.setRole(Role.TEACHER);

        return teacherRepo.save(teacher);
    }
}

// CodeRabbit audit trigger