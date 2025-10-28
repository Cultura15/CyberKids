package capstone.cyberkids.CyberKids.Controller;

import capstone.cyberkids.CyberKids.Entity.Student;
import capstone.cyberkids.CyberKids.Entity.Timer;
import capstone.cyberkids.CyberKids.Model.ChallengeType;
import capstone.cyberkids.CyberKids.Model.TimerRequest;
import capstone.cyberkids.CyberKids.Repository.StudentRepo;
import capstone.cyberkids.CyberKids.Service.TimerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/timer")
public class TimerController {

    private final TimerService timerService;
    private final StudentRepo studentRepo;

    public TimerController(TimerService timerService, StudentRepo studentRepo) {
        this.timerService = timerService;
        this.studentRepo = studentRepo;
    }

    @PostMapping("/update")
    public ResponseEntity<Timer> updateTimer(@RequestBody TimerRequest request) {
        try {
            Timer timer = timerService.updateTimer(request);
            return ResponseEntity.ok(timer);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Timer>> getByStudent(@PathVariable Long studentId) {
        List<Timer> list = timerService.getTimersByStudentId(studentId);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/challenge/{type}")
    public ResponseEntity<List<Timer>> getByChallenge(@PathVariable String type) {
        try {
            ChallengeType ct = ChallengeType.valueOf(type.toUpperCase());
            return ResponseEntity.ok(timerService.getTimersByChallengeType(ct));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/delete-latest/{robloxId}")
    public ResponseEntity<String> deleteLatestTimer(@PathVariable String robloxId) {
        try {
            boolean deleted = timerService.deleteLatestTimerByRobloxId(robloxId);
            if (deleted) {
                return ResponseEntity.ok("Latest unfinished timer deleted for robloxId: " + robloxId);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error deleting timer: " + e.getMessage());
        }
    }

}
