package capstone.cyberkids.CyberKids.Controller;

import capstone.cyberkids.CyberKids.Entity.Classes;
import capstone.cyberkids.CyberKids.Entity.Scenario;
import capstone.cyberkids.CyberKids.Entity.Student;
import capstone.cyberkids.CyberKids.Entity.StudentStatusLog;
import capstone.cyberkids.CyberKids.Model.StudentRequest;
import capstone.cyberkids.CyberKids.Repository.ClassRepo;
import capstone.cyberkids.CyberKids.Repository.StudentRepo;
import capstone.cyberkids.CyberKids.Repository.StudentStatusLogRepository;
import capstone.cyberkids.CyberKids.Service.NotificationService;
import capstone.cyberkids.CyberKids.Service.ScenarioService;
import capstone.cyberkids.CyberKids.Service.StudentService;
import capstone.cyberkids.CyberKids.dtos.ClassRequest;
import capstone.cyberkids.CyberKids.dtos.GameScenarioDTO;
import capstone.cyberkids.CyberKids.dtos.StudentDTO;
import capstone.cyberkids.CyberKids.dtos.StudentStatusDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student")
public class StudentController {

    @Autowired private StudentService studentService;
    @Autowired private StudentRepo studentRepo;
    @Autowired private ClassRepo classRepo;
    @Autowired private NotificationService notificationService;
    @Autowired private SimpMessagingTemplate messagingTemplate;
    @Autowired private StudentStatusLogRepository statusLogRepository;
    @Autowired private ScenarioService scenarioService;


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

        StudentStatusLog log = new StudentStatusLog(student, isOnline, LocalDateTime.now());
        statusLogRepository.save(log);

        student.setOnline(isOnline);
        studentService.save(student);

        notificationService.notifyStudentStatusChanged(student.getRobloxId(), isOnline);

        boolean needsManualRegister = student.getRealName() == null || student.getRealName().isBlank();

        Map<String, Object> payload = new HashMap<>();
        payload.put("student", student);
        payload.put("needsManualRegister", needsManualRegister);

        return ResponseEntity.ok(payload);
    }


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

        if (!alreadyManual) {
            student.setRealName(req.getRealName());
            student.setClassEntity(classEntity);
            student = studentRepo.save(student);

            String teacherEmail = classEntity.getTeacher().getEmail();
            notificationService.notifyTeacherStudentJoined(teacherEmail, new StudentDTO(student));
        }

        return ResponseEntity.ok(Map.of("student", new StudentDTO(student), "manualRegistered", true));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> getById(@PathVariable Long id) {
        return studentRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public List<Student> listAll() {
        return studentRepo.findAll();
    }

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

    // Endpoint for Roblox game to fetch scenarios
    @GetMapping("/getquestions")
    public ResponseEntity<List<GameScenarioDTO>> getActiveScenariosForGame() {
        try {
            List<Scenario> scenarios = scenarioService.getAllActiveScenariosForGame();

            List<GameScenarioDTO> gameScenarios = scenarios.stream()
                    .map(GameScenarioDTO::new)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(gameScenarios);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

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

//    @PostMapping("/status")
//    public ResponseEntity<?> updateOnlineStatus(@RequestBody StudentStatusDTO request) {
//        Student student = studentRepo.findByRobloxId(request.getRobloxId());
//        if (student == null) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Student not found"));
//        }
//
//        student.setOnline(request.isOnline());
//        studentRepo.save(student);
//
//        messagingTemplate.convertAndSend("/topic/student-status",
//                new StudentStatusDTO(student.getRobloxId(), request.isOnline()));
//
//        return ResponseEntity.ok(Map.of("message", "Status updated"));
//    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!studentRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        studentService.delete(id);
        return ResponseEntity.noContent().build();
    }


}
