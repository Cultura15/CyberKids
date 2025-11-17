package capstone.cyberkids.CyberKids.Controller;

import capstone.cyberkids.CyberKids.Entity.Scenario;
import capstone.cyberkids.CyberKids.Service.ScenarioService;
import capstone.cyberkids.CyberKids.dtos.ScenarioDTO;
import capstone.cyberkids.CyberKids.dtos.ScenarioRequestDTO;
import capstone.cyberkids.CyberKids.dtos.GameScenarioDTO;
import capstone.cyberkids.CyberKids.dtos.AnswerSubmissionDTO;
import capstone.cyberkids.CyberKids.dtos.FeedbackResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/scenarios")
public class ScenarioController {

    private final ScenarioService scenarioService;

    public ScenarioController(ScenarioService scenarioService) {
        this.scenarioService = scenarioService;
    }

    // Create Questions for Leve 1 Game
    @PostMapping
    public ResponseEntity<?> createScenario(@RequestBody ScenarioRequestDTO request) {
        try {
            Scenario scenario = scenarioService.createScenario(
                    request.getContent(),
                    request.getClassId(),
                    request.getCorrectAnswer()
            );
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ScenarioDTO(scenario));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Roblox endpoint to submit answers and receive AI feedback
    @PostMapping("/game/submit-answer")
    public ResponseEntity<?> submitAnswerForFeedback(@RequestBody AnswerSubmissionDTO submission) {
        try {
            if (submission.getScenarioId() == null || submission.getUserAnswer() == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Scenario ID and user answer are required"));
            }

            FeedbackResponseDTO feedback = scenarioService.evaluateAnswerWithAI(
                    submission.getScenarioId(),
                    submission.getUserAnswer()
            );

            return ResponseEntity.ok(feedback);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An error occurred while processing your answer"));
        }
    }


    // Get Questions for logged in teacher
    @GetMapping("/my-scenarios")
    public ResponseEntity<List<ScenarioDTO>> getMyScenarios() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        String email;
        if (authentication.getPrincipal() instanceof UserDetails) {
            email = ((UserDetails) authentication.getPrincipal()).getUsername();
        } else {
            email = authentication.getPrincipal().toString();
        }

        Long teacherId = scenarioService.getTeacherIdByEmail(email);
        List<ScenarioDTO> scenarios = scenarioService.getScenariosByTeacherId(teacherId);

        return ResponseEntity.ok(scenarios);
    }

    // Roblox endpoint to fetch active questions
    @GetMapping("/game/active")
    public ResponseEntity<List<GameScenarioDTO>> getActiveScenariosForGame() {
        try {
            List<GameScenarioDTO> scenarios = scenarioService.getAllActiveScenariosForGameDTO();
            return ResponseEntity.ok(scenarios);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    // Roblox endpoint to count how many active questions
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getScenarioCount() {
        try {
            long count = scenarioService.getActiveScenarioCount();
            return ResponseEntity.ok(Map.of("activeCount", count));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    // Edit a question
    @PutMapping("/{scenarioId}")
    public ResponseEntity<?> updateScenario(
            @PathVariable Long scenarioId,
            @RequestBody ScenarioRequestDTO request) {
        try {
            Scenario scenario = scenarioService.updateScenario(
                    scenarioId,
                    request.getContent(),
                    request.getCorrectAnswer()
            );
            return ResponseEntity.ok(new ScenarioDTO(scenario));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }


    // Delete a question
    @DeleteMapping("/{scenarioId}")
    public ResponseEntity<?> deleteScenario(@PathVariable Long scenarioId) {
        try {
            scenarioService.deleteScenario(scenarioId);
            return ResponseEntity.ok(Map.of("message", "Scenario deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}