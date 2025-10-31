package capstone.cyberkids.CyberKids.Controller;

import capstone.cyberkids.CyberKids.Entity.Classes;
import capstone.cyberkids.CyberKids.Entity.Scenario;
import capstone.cyberkids.CyberKids.Entity.Student;
import capstone.cyberkids.CyberKids.Model.StudentRequest;
import capstone.cyberkids.CyberKids.Repository.ClassRepo;
import capstone.cyberkids.CyberKids.Repository.StudentRepo;
import capstone.cyberkids.CyberKids.Service.NotificationService;
import capstone.cyberkids.CyberKids.Service.ScenarioService;
import capstone.cyberkids.CyberKids.Service.StudentService;
import capstone.cyberkids.CyberKids.dtos.GameScenarioDTO;
import capstone.cyberkids.CyberKids.dtos.StudentDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student")
public class StudentController {

    @Autowired private StudentService studentService;
    @Autowired private StudentRepo studentRepo;
    @Autowired private ClassRepo classRepo;
    @Autowired private NotificationService notificationService;
    @Autowired private ScenarioService scenarioService;

    // Roblox endpoint to auto register roblox id
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> registerStudent(@RequestBody StudentRequest req) {
        Student student = studentRepo.findByRobloxId(req.getRobloxId());

        if (student == null) {
            student = new Student();
            student.setRobloxId(req.getRobloxId());
            student.setRobloxName(req.getRobloxName());
            studentService.save(student);
        }

        boolean isOnline = req.getOnline() != null ? req.getOnline() : true;

        student.setOnline(isOnline);
        studentService.save(student);

        notificationService.notifyStudentStatusChanged(student.getRobloxId(), isOnline);

        boolean needsManualRegister = student.getRealName() == null || student.getRealName().isBlank();

        Map<String, Object> payload = new HashMap<>();
        payload.put("student", student);
        payload.put("needsManualRegister", needsManualRegister);

        return ResponseEntity.ok(payload);
    }

    // Roblox endpoint to join a class via class code
    @PostMapping("/manual-register")
    public ResponseEntity<Map<String, Object>> manualRegister(@RequestBody StudentRequest req) {
        Student student = studentRepo.findByRobloxId(req.getRobloxId());
        if (student == null) {
            return ResponseEntity.status(HttpStatus.PRECONDITION_REQUIRED)
                    .body(Map.of("error", "Please auto-register first"));
        }

        Classes classEntity = classRepo.findByClassCode(req.getClassCode())
                .orElseThrow(() -> new RuntimeException("Class with code " + req.getClassCode() + " does not exist"));

        boolean alreadyManual = student.getRealName() != null && !student.getRealName().isBlank()
                && student.getClassEntity() != null;

        if (!alreadyManual && studentRepo.existsByRealNameIgnoreCaseAndClassEntity_ClassCode(req.getRealName(), req.getClassCode())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "That name is already taken in this class. Please choose a different name."));
        }

        if (!alreadyManual) {
            student.setRealName(req.getRealName());
            student.setClassEntity(classEntity);
            student.setGrade(req.getGrade());
            student.setSection(req.getSection());
            student = studentRepo.save(student);

            String teacherEmail = classEntity.getTeacher().getEmail();
            notificationService.notifyTeacherStudentJoined(teacherEmail, new StudentDTO(student));
        }

        return ResponseEntity.ok(Map.of("student", new StudentDTO(student), "manualRegistered", true));
    }

    // Roblox endpoint to post game complete and notifies the teacher
    @PostMapping("/game-complete")
    public ResponseEntity<Map<String, Object>> studentCompletedGame(@RequestBody Map<String, String> req) {
        String robloxId = req.get("robloxId");
        String challengeType = req.get("challengeType");

        if (robloxId == null || challengeType == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing robloxId or challengeType"));
        }

        Student student = studentRepo.findByRobloxId(robloxId);
        if (student == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Student not found"));
        }

        if (student.getClassEntity() == null || student.getClassEntity().getTeacher() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Student is not assigned to a class or teacher"));
        }

        String teacherEmail = student.getClassEntity().getTeacher().getEmail();

        String missionName;
        try {
            missionName = capstone.cyberkids.CyberKids.Model.ChallengeType.valueOf(challengeType).name().replace("_", " ");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid challenge type"));
        }

        notificationService.notifyTeacherStudentCompletedGame(
                teacherEmail,
                student.getRealName() != null ? student.getRealName() : student.getRobloxName(),
                missionName
        );

        return ResponseEntity.ok(Map.of(
                "message", "Game completion notification sent to teacher",
                "student", student.getRealName(),
                "challengeType", missionName
        ));
    }


    // Get student by roblox id
    @GetMapping("/by-roblox-id/{robloxId}")
    public ResponseEntity<Map<String, Object>> getStudentByRobloxId(@PathVariable String robloxId) {
        Student student = studentRepo.findByRobloxId(robloxId);

        if (student == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Student not found"));
        }

        boolean manualRegistered = student.getRealName() != null && !student.getRealName().isBlank()
                && student.getClassEntity() != null;

        StudentRequest response = new StudentRequest();
        response.setRobloxId(student.getRobloxId());
        response.setRobloxName(student.getRobloxName());
        response.setRealName(student.getRealName());
        response.setGrade(student.getGrade());
        response.setSection(student.getSection());
        response.setClassCode(student.getClassEntity() != null ? student.getClassEntity().getClassCode() : null);

        Map<String, Object> payload = new HashMap<>();
        payload.put("student", response);
        payload.put("manualRegistered", manualRegistered);

        return ResponseEntity.ok(payload);
    }

    // Roblox endpoint to fetch questions
    @GetMapping("/getquestions")
    public ResponseEntity<List<GameScenarioDTO>> getActiveScenariosForGame(@RequestParam String classCode) {
        try {
            List<Scenario> scenarios = scenarioService.getActiveScenariosByClassCode(classCode);
            List<GameScenarioDTO> gameScenarios = scenarios.stream()
                    .map(GameScenarioDTO::new)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(gameScenarios);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Roblox endpoint to Generate NPC's per questions created
    @GetMapping("/game/npc-info")
    public ResponseEntity<Map<String, Object>> getNpcInfo() {
        try {
            List<Scenario> scenarios = scenarioService.getAllActiveScenariosForGame();
            int activeCount = scenarios.size();

            // Generate spawn locations or other NPC data
            return ResponseEntity.ok(Map.of(
                    "npcCount", activeCount,
                    "scenarios", scenarios.stream()
                            .map(GameScenarioDTO::new)
                            .collect(Collectors.toList())
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Roblox endpoint to check if student's being moved to another game
    @GetMapping("/students/{robloxId}/target-world")
    public ResponseEntity<Map<String, String>> getStudentTargetWorld(@PathVariable String robloxId) {
        Student student = studentRepo.findByRobloxId(robloxId);
        if (student != null && student.getTargetWorld() != null && !student.getTargetWorld().isBlank()) {
            Map<String, String> response = new HashMap<>();
            response.put("targetWorld", student.getTargetWorld());
            response.put("targetLevel", student.getTargetLevel());

            student.setTargetWorld(null);
            student.setTargetLevel(null);
            studentRepo.save(student);

            return ResponseEntity.ok(response);
        }
        return ResponseEntity.notFound().build();
    }



//    @GetMapping("/{id}")
//    public ResponseEntity<Student> getById(@PathVariable Long id) {
//        return studentRepo.findById(id)
//                .map(ResponseEntity::ok)
//                .orElse(ResponseEntity.notFound().build());
//    }
//
//    @GetMapping
//    public List<Student> listAll() {
//        return studentRepo.findAll();
//    }
//
//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> delete(@PathVariable Long id) {
//        if (!studentRepo.existsById(id)) {
//            return ResponseEntity.notFound().build();
//        }
//        studentService.delete(id);
//        return ResponseEntity.noContent().build();
//    }
}
