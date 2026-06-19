package capstone.cyberkids.CyberKids.Leaderboard.LeaderboardLevel3;


import capstone.cyberkids.CyberKids.dto.LeaderboardResponseDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/leaderboard/phishing/daily")
public class Level3Controller {

    @Autowired
    private Level3Service leaderboardService;

    @PostMapping("/update/roblox/{robloxId}")
    public ResponseEntity<?> updateDailyLeaderboardByRobloxId(
            @PathVariable String robloxId,
            @RequestBody Map<String, Object> requestData) {

        try {

            Integer score = (Integer) requestData.get("score");
            String totalTimeTaken = (String) requestData.get("totalTimeTaken");

            if (score == null || score < 0) {
                return ResponseEntity.badRequest().body("Invalid score provided");
            }

            Level3Entity updatedEntry =
                    leaderboardService.updateStudentDailyScoreAndTimeByRobloxId(
                            robloxId, score, totalTimeTaken, LocalDate.now());


            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "id", updatedEntry.getId(),
                    "score", updatedEntry.getScore(),
                    "time", updatedEntry.getTotalTimeTaken(),
                    "message", "Leaderboard updated successfully"
            ));

        } catch (Exception e) {
            log.error("ERROR in updateDailyLeaderboardByRobloxId: " + e.getMessage());
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
            log.error("ERROR in getTodayLeaderboard: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{date}")
    public ResponseEntity<List<LeaderboardResponseDTO>> getLeaderboardByDate(@PathVariable LocalDate date) {
        try {
            List<LeaderboardResponseDTO> leaderboard = leaderboardService.getLeaderboardByDate(date);
            return ResponseEntity.ok(leaderboard);
        } catch (Exception e) {
            log.error("ERROR in getLeaderboardByDate: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}

