package capstone.cyberkids.CyberKids.Service;

import capstone.cyberkids.CyberKids.Entity.Classes;
import capstone.cyberkids.CyberKids.Entity.Teacher;
import capstone.cyberkids.CyberKids.Repository.ClassRepo;
import capstone.cyberkids.CyberKids.Repository.TeacherRepo;
import jakarta.transaction.Transactional;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;


import java.util.*;
import java.util.stream.Collectors;

@Service
public class ClassService {

    private final ClassRepo classRepository;
    private final TeacherRepo teacherRepository;

    public ClassService(ClassRepo classRepository, TeacherRepo teacherRepository) {
        this.classRepository = classRepository;
        this.teacherRepository = teacherRepository;
    }

    public Classes createClassByEmail(String email, String grade, String section, String colorTheme, Integer maxStudents) {
        Teacher teacher = teacherRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Teacher not found with email: " + email));

        boolean exists = classRepository.findByGradeAndSectionAndTeacherId(grade, section, teacher.getId()).isPresent();
        if (exists) {
            throw new RuntimeException("Class with Grade " + grade + " and Section " + section + " already exists for this teacher.");
        }

        List<String> validThemes = Arrays.asList(
                "indigo-purple", "blue-cyan", "green-emerald",
                "orange-red", "pink-rose", "violet-fuchsia"
        );
        if (!validThemes.contains(colorTheme)) {
            throw new RuntimeException("Invalid color theme selected.");
        }

        String classCode = generateUniqueClassCode();

        Classes classEntity = new Classes(grade, section, teacher, classCode, colorTheme, maxStudents);
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


    @Transactional
    public void lockWorldForClass(String classCode, String worldName, String teacherEmail) {
        Teacher teacher = teacherRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        Classes clazz = classRepository.findByClassCode(classCode)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        if (!clazz.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("You are not authorized to lock worlds for this class.");
        }

        if (clazz.getLockedWorlds() == null) {
            clazz.setLockedWorlds(new HashSet<>());
        }

        clazz.getLockedWorlds().add(worldName);
        classRepository.save(clazz);
    }


    @Transactional
    public void unlockWorldForClass(String classCode, String worldName, String teacherEmail) {
        Teacher teacher = teacherRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        Classes clazz = classRepository.findByClassCode(classCode)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        if (!clazz.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("You are not authorized to unlock worlds for this class.");
        }

        if (clazz.getLockedWorlds() != null) {
            clazz.getLockedWorlds().remove(worldName);
        }

        classRepository.save(clazz);
    }


    public Classes getClassByCode(String classCode) {
        return classRepository.findByClassCode(classCode)
                .orElseThrow(() -> new RuntimeException("Class not found for code: " + classCode));
    }


    public Classes getClassById(Long classId) {
        return classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found with id: " + classId));
    }

    @Transactional
    public Classes updateClassDetails(Long classId, String teacherEmail,
                                      String grade, String section, Integer maxStudents) {

        Teacher teacher = teacherRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        Classes clazz = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        if (!clazz.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("You are not authorized to edit this class.");
        }

        Optional<Classes> existing = classRepository.findByGradeAndSectionAndTeacherId(grade, section, teacher.getId());
        if (existing.isPresent() && !existing.get().getId().equals(classId)) {
            throw new RuntimeException("Another class with this Grade & Section already exists.");
        }

        if (grade != null) clazz.setGrade(grade);
        if (section != null) clazz.setSection(section);
        if (maxStudents != null) clazz.setMaxStudents(maxStudents);

        return classRepository.save(clazz);
    }

    public void deleteClass(Long classId) {
        if (!classRepository.existsById(classId)) {
            throw new RuntimeException("Class not found");
        }
        classRepository.deleteById(classId);
    }
}
