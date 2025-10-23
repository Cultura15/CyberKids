package capstone.cyberkids.CyberKids.Service;

import capstone.cyberkids.CyberKids.Entity.Classes;
import capstone.cyberkids.CyberKids.Entity.Student;
import capstone.cyberkids.CyberKids.Entity.Teacher;
import capstone.cyberkids.CyberKids.Repository.ClassRepo;
import capstone.cyberkids.CyberKids.Repository.TeacherRepo;
import capstone.cyberkids.CyberKids.dtos.ClassDTO;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ClassService {

    private final ClassRepo classRepository;
    private final TeacherRepo teacherRepository;

    public ClassService(ClassRepo classRepository, TeacherRepo teacherRepository) {
        this.classRepository = classRepository;
        this.teacherRepository = teacherRepository;
    }

    public Classes createClassByEmail(String email, String grade, String section) {
        Teacher teacher = teacherRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Teacher not found with email: " + email));

        // Check if class with same grade, section, and teacher exists
        boolean exists = classRepository.findByGradeAndSectionAndTeacherId(grade, section, teacher.getId()).isPresent();
        if (exists) {
            throw new RuntimeException("Class with Grade " + grade + " and Section " + section + " already exists for this teacher.");
        }

        String classCode = generateUniqueClassCode();

        Classes classEntity = new Classes(grade, section, teacher, classCode);
        return classRepository.save(classEntity);
    }


    private String generateUniqueClassCode() {
        String code;
        do {
            code = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        } while (classRepository.existsByClassCode(code));
        return code;
    }

    public Long getTeacherIdByEmail(String email) {
        Teacher teacher = teacherRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Teacher not found with email: " + email));
        return teacher.getId();
    }

    public List<Classes> getClassesByTeacher(Long teacherId) {
        return classRepository.findByTeacherId(teacherId);
    }

    public Classes getClassById(Long classId) {
        return classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found with id: " + classId));
    }

    public Classes getClassByCode(String classCode) {
        return classRepository.findByClassCode(classCode)
                .orElseThrow(() -> new RuntimeException("Class not found for code: " + classCode));
    }


    public List<ClassDTO> getAllClasses() {
        List<Classes> classes = classRepository.findAll();
        return classes.stream()
                .map(c -> new ClassDTO(c.getGrade(), c.getSection()))
                .collect(Collectors.toList());
    }

    public Classes updateClass(Long classId, String grade, String section) {
        Classes existingClass = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        existingClass.setGrade(grade);
        existingClass.setSection(section);
        return classRepository.save(existingClass);
    }

    public void deleteClass(Long classId) {
        if (!classRepository.existsById(classId)) {
            throw new RuntimeException("Class not found");
        }
        classRepository.deleteById(classId);
    }
}
