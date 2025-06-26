package capstone.cyberkids.CyberKids.JWT;

import capstone.cyberkids.CyberKids.Entity.Teacher;
import capstone.cyberkids.CyberKids.Repository.TeacherRepo;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final TeacherRepo teacherRepo;

    public CustomUserDetailsService(TeacherRepo teacherRepo) {
        this.teacherRepo = teacherRepo;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Optional<Teacher> teacher = teacherRepo.findByEmail(email);

        if (teacher.isEmpty()) {
            throw new UsernameNotFoundException("User not found: " + email);
        }

        return User.withUsername(teacher.get().getEmail())
                .password(teacher.get().getPassword())
                .roles(teacher.get().getRole().name())
                .build();
    }

}
