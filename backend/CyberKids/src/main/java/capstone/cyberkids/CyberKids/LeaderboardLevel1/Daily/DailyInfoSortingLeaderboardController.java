package capstone.cyberkids.CyberKids.LeaderboardLevel1.Daily;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import capstone.cyberkids.CyberKids.dtos.LeaderboardResponseDTO;

@RestController
@RequestMapping("/api/leaderboard/info-sorting/daily")
public class DailyInfoSortingLeaderboardController {

    @Autowired
    private DailyInfoSortingLeaderboardService leaderboardService;

    /**
     * NEW LOGIC: Add a new game session
     * Allows multiple entries per player per day (max 10)
     */
    @PostMapping("/add-session/roblox/{robloxId}")
    public ResponseEntity<?> addGameSession(
            @PathVariable String robloxId,
            @RequestBody Map<String, Object> requestData) {

        try {
            System.out.println("=== NEW GAME SESSION REQUEST ===");
            System.out.println("Roblox ID: " + robloxId);
            System.out.println("Request body: " + requestData);

            // Extract data from request
            Integer score = (Integer) requestData.get("score");
            String totalTimeTaken = (String) requestData.get("totalTimeTaken");

            System.out.println("Score: " + score + ", Time: " + totalTimeTaken);

            // Validation
            if (score == null || score < 0) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "error", "Invalid score provided"
                ));
            }

            // Check daily limit
            long gamesPlayedToday = leaderboardService.getStudentGamesPlayedToday(robloxId);

            // Add the game session
            DailyInfoSortingLeaderboardEntry entry =
                    leaderboardService.addGameSession(robloxId, score, totalTimeTaken, LocalDate.now());

            System.out.println("✅ Session saved - ID: " + entry.getId());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "id", entry.getId(),
                    "score", entry.getScore(),
                    "time", entry.getTotalTimeTaken(),
                    "gamesPlayedToday", gamesPlayedToday + 1,
                    "message", "Game session added successfully"
            ));

        } catch (Exception e) {
            System.err.println("❌ ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()
            ));
        }
    }

    /**
     * Get today's leaderboard (top 50 sessions)
     */
    @GetMapping("/today")
    public ResponseEntity<List<LeaderboardResponseDTO>> getTodayLeaderboard() {
        try {
            List<LeaderboardResponseDTO> leaderboard = leaderboardService.getTodayLeaderboard();
            return ResponseEntity.ok(leaderboard);
        } catch (Exception e) {
            System.err.println("❌ ERROR in getTodayLeaderboard: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get leaderboard for a specific date
     */
    @GetMapping("/{date}")
    public ResponseEntity<List<LeaderboardResponseDTO>> getLeaderboardByDate(
            @PathVariable LocalDate date) {
        try {
            List<LeaderboardResponseDTO> leaderboard = leaderboardService.getLeaderboardByDate(date);
            return ResponseEntity.ok(leaderboard);
        } catch (Exception e) {
            System.err.println("❌ ERROR in getLeaderboardByDate: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get how many games a student has played today
     */
    @GetMapping("/games-played/roblox/{robloxId}")
    public ResponseEntity<?> getGamesPlayedToday(@PathVariable String robloxId) {
        try {
            long gamesPlayed = leaderboardService.getStudentGamesPlayedToday(robloxId);
            return ResponseEntity.ok(Map.of(
                    "robloxId", robloxId,
                    "gamesPlayedToday", gamesPlayed

            ));
        } catch (Exception e) {
            System.err.println("❌ ERROR: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()
            ));
        }
    }

    /**
     * Get all of a student's sessions for today
     */
    @GetMapping("/my-sessions/roblox/{robloxId}")
    public ResponseEntity<?> getMySessionsToday(@PathVariable String robloxId) {
        try {
            List<LeaderboardResponseDTO> sessions = leaderboardService.getStudentSessionsToday(robloxId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "sessions", sessions,
                    "totalSessions", sessions.size()
            ));
        } catch (Exception e) {
            System.err.println("❌ ERROR: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()
            ));
        }
    }

    /**
     * Get statistics for a specific date
     */
    @GetMapping("/stats/{date}")
    public ResponseEntity<?> getStatsForDate(@PathVariable LocalDate date) {
        try {
            DailyInfoSortingLeaderboardService.DailyLeaderboardStats stats =
                    leaderboardService.getStatsForDate(date);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            System.err.println("❌ ERROR: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * LEGACY ENDPOINT (for backward compatibility)
     * Redirects to the new add-session endpoint
     */
    @PostMapping("/update/roblox/{robloxId}")
    public ResponseEntity<?> updateLeaderboard(
            @PathVariable String robloxId,
            @RequestBody Map<String, Object> requestData) {

        System.out.println("⚠️ Using legacy endpoint - please update to /add-session");
        return addGameSession(robloxId, requestData);
    }
}