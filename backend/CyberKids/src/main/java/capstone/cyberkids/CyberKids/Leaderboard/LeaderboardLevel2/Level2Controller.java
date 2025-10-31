package capstone.cyberkids.CyberKids.Leaderboard.LeaderboardLevel2;


import capstone.cyberkids.CyberKids.dtos.LeaderboardResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leaderboard/password-sec/daily")
public class Level2Controller {

    @Autowired
    private Level2Service leaderboardService;

    @PostMapping("/update/roblox/{robloxId}")
    public ResponseEntity<?> updateDailyLeaderboardByRobloxId(
            @PathVariable String robloxId,
            @RequestBody Map<String, Object> requestData) {

        try {
            System.out.println("=== CONTROLLER UPDATE REQUEST ===");
            System.out.println("Roblox ID: " + robloxId);
            System.out.println("Request body: " + requestData);

            Integer score = (Integer) requestData.get("score");
            String totalTimeTaken = (String) requestData.get("totalTimeTaken");

            System.out.println("Parsed score: " + score);
            System.out.println("Parsed time: '" + totalTimeTaken + "'");

            if (score == null || score < 0) {
                return ResponseEntity.badRequest().body("Invalid score provided");
            }

            Level2Entity updatedEntry =
                    leaderboardService.updateStudentDailyScoreAndTimeByRobloxId(
                            robloxId, score, totalTimeTaken, LocalDate.now());

            System.out.println("=== UPDATE SUCCESS ===");
            System.out.println("Entry ID: " + updatedEntry.getId());
            System.out.println("Final score: " + updatedEntry.getScore());
            System.out.println("Final time: '" + updatedEntry.getTotalTimeTaken() + "'");

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "id", updatedEntry.getId(),
                    "score", updatedEntry.getScore(),
                    "time", updatedEntry.getTotalTimeTaken(),
                    "message", "Leaderboard updated successfully"
            ));

        } catch (Exception e) {
            System.err.println("ERROR in updateDailyLeaderboardByRobloxId: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()
            ));
        }
    }

    @GetMapping("/today")
    public ResponseEntity<List<LeaderboardResponseDTO>> getTodayLeaderboard() {
        try {
            List<LeaderboardResponseDTO> leaderboard = leaderboardService.getTodayLeaderboard();
            return ResponseEntity.ok(leaderboard);
        } catch (Exception e) {
            System.err.println("ERROR in getTodayLeaderboard: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{date}")
    public ResponseEntity<List<LeaderboardResponseDTO>> getLeaderboardByDate(@PathVariable LocalDate date) {
        try {
            List<LeaderboardResponseDTO> leaderboard = leaderboardService.getLeaderboardByDate(date);
            return ResponseEntity.ok(leaderboard);
        } catch (Exception e) {
            System.err.println("ERROR in getLeaderboardByDate: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}

