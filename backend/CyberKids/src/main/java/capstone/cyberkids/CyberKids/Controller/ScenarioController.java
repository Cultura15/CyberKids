package capstone.cyberkids.CyberKids.Controller;

import capstone.cyberkids.CyberKids.Entity.Scenario;
import capstone.cyberkids.CyberKids.Service.ScenarioService;
import capstone.cyberkids.CyberKids.dtos.ScenarioDTO;
import capstone.cyberkids.CyberKids.dtos.ScenarioRequestDTO;
import capstone.cyberkids.CyberKids.dtos.GameScenarioDTO;
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

    @PostMapping
    public ResponseEntity<?> createScenario(@RequestBody ScenarioRequestDTO request) {
        try {
            Scenario scenario = scenarioService.createScenario(
                    request.getContent(),
                    request.getClassId()
            );
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ScenarioDTO(scenario));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

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



    @PutMapping("/{scenarioId}")
    public ResponseEntity<?> updateScenario(
            @PathVariable Long scenarioId,
            @RequestBody ScenarioRequestDTO request) {
        try {
            Scenario scenario = scenarioService.updateScenario(scenarioId, request.getContent());
            return ResponseEntity.ok(new ScenarioDTO(scenario));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{scenarioId}/toggle")
    public ResponseEntity<?> toggleScenarioStatus(@PathVariable Long scenarioId) {
        try {
            scenarioService.toggleScenarioStatus(scenarioId);
            return ResponseEntity.ok(Map.of("message", "Scenario status updated"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

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

    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getScenarioCount() {
        try {
            long count = scenarioService.getActiveScenarioCount();
            return ResponseEntity.ok(Map.of("activeCount", count));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

}
