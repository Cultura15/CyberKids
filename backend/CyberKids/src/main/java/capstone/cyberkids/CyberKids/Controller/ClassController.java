package capstone.cyberkids.CyberKids.Controller;

import capstone.cyberkids.CyberKids.Entity.Classes;
import capstone.cyberkids.CyberKids.Entity.Student;
import capstone.cyberkids.CyberKids.Service.ClassService;
import capstone.cyberkids.CyberKids.Service.StudentService;
import capstone.cyberkids.CyberKids.dtos.ClassDTO;
import capstone.cyberkids.CyberKids.dtos.ClassRequest;
import capstone.cyberkids.CyberKids.dtos.StudentDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/classes")
public class ClassController {

    private final ClassService classService;
    private final StudentService studentService;

    public ClassController(ClassService classService, StudentService studentService) {
        this.classService = classService;
        this.studentService = studentService;
    }

    @PostMapping
    public ResponseEntity<Classes> createClass(@RequestBody ClassRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        String email;
        if (authentication.getPrincipal() instanceof UserDetails) {
            email = ((UserDetails) authentication.getPrincipal()).getUsername();
        } else {
            email = authentication.getPrincipal().toString();
        }
        Classes createdClass = classService.createClassByEmail(email, request.getGrade(), request.getSection());
        return ResponseEntity.ok(createdClass);
    }

    @GetMapping("/grade/{grade}/section/{section}/students")
    public ResponseEntity<List<StudentDTO>> getStudentsByGradeAndSection(
            @PathVariable String grade,
            @PathVariable String section) {

        List<Student> students = studentService.getStudentsByGradeAndSection(grade, section);
        List<StudentDTO> studentDTOs = students.stream()
                .map(StudentDTO::new)
                .collect(Collectors.toList());

        return ResponseEntity.ok(studentDTOs);
    }

    @GetMapping("/my-classes")
    public ResponseEntity<List<Classes>> getClassesForLoggedInTeacher() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        String email;
        if (authentication.getPrincipal() instanceof UserDetails) {
            email = ((UserDetails) authentication.getPrincipal()).getUsername();
        } else {
            email = authentication.getPrincipal().toString();
        }

        Long teacherId = classService.getTeacherIdByEmail(email);
        List<Classes> classes = classService.getClassesByTeacher(teacherId);
        return ResponseEntity.ok(classes);
    }

    @GetMapping("/all-classes")
    public ResponseEntity<List<ClassDTO>> getAllClasses() {
        List<ClassDTO> classDTOs = classService.getAllClasses();
        return ResponseEntity.ok(classDTOs);
    }

    @PutMapping("/{classId}")
    public ResponseEntity<Classes> updateClass(
            @PathVariable Long classId,
            @RequestParam String grade,
            @RequestParam String section) {

        Classes updatedClass = classService.updateClass(classId, grade, section);
        return ResponseEntity.ok(updatedClass);
    }

    @DeleteMapping("/{classId}")
    public ResponseEntity<Void> deleteClass(@PathVariable Long classId) {
        classService.deleteClass(classId);
        return ResponseEntity.noContent().build();
    }
}
