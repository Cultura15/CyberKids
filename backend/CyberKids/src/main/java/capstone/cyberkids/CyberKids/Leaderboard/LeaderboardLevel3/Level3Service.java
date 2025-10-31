package capstone.cyberkids.CyberKids.Leaderboard.LeaderboardLevel3;

import capstone.cyberkids.CyberKids.Entity.Student;
import capstone.cyberkids.CyberKids.Leaderboard.Global.GlobalService;
import capstone.cyberkids.CyberKids.Repository.StudentRepo;
import capstone.cyberkids.CyberKids.dtos.LeaderboardResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class Level3Service {

    @Autowired
    private Level3Repo leaderboardRepo;

    @Autowired
    private StudentRepo studentRepo;

    @Autowired
    private GlobalService globalLeaderboardService;

    public Level3Entity updateStudentDailyScoreAndTimeByRobloxId(String robloxId, int score, String totalTimeTaken, LocalDate date) {
        Student student = studentRepo.findByRobloxId(robloxId);
        if (student == null) {
            throw new RuntimeException("Student not found with Roblox ID: " + robloxId);
        }

        System.out.println("=== LEADERBOARD UPDATE DEBUG ===");
        System.out.println("Student: " + student.getRobloxName());
        System.out.println("Raw score: " + score);
        System.out.println("Raw time received: '" + totalTimeTaken + "'");

        String cleanTime = cleanTimeInput(totalTimeTaken);
        System.out.println("Cleaned time: '" + cleanTime + "'");

        Level3Entity entry = new Level3Entity(student, score, cleanTime, date);
        Level3Entity savedEntry = leaderboardRepo.save(entry);

        System.out.println("Saved entry - ID: " + savedEntry.getId() + ", Time: '" + savedEntry.getTotalTimeTaken() + "'");
        System.out.println("=== END DEBUG ===");

        globalLeaderboardService.rebuildFromLevel3();

        return savedEntry;
    }

    private String cleanTimeInput(String timeInput) {
        if (timeInput == null || timeInput.trim().isEmpty()) {
            System.out.println("Time input is null/empty, defaulting to 00:00");
            return "00:00";
        }

        String trimmed = timeInput.trim();
        System.out.println("Trimmed input: '" + trimmed + "'");

        if (trimmed.matches("\\d{1,2}:\\d{2}")) {
            System.out.println("Time already in MM:SS format");
            return trimmed;
        }

        try {
            int totalSeconds = Integer.parseInt(trimmed);
            int minutes = totalSeconds / 60;
            int seconds = totalSeconds % 60;
            String formatted = String.format("%d:%02d", minutes, seconds);
            System.out.println("Converted " + totalSeconds + " seconds to " + formatted);
            return formatted;
        } catch (NumberFormatException e) {
            System.out.println("Could not parse '" + trimmed + "' as number, defaulting to 00:00");
            return "00:00";
        }
    }

    public List<LeaderboardResponseDTO> getTodayLeaderboard() {
        return getLeaderboardByDate(LocalDate.now());
    }

    public List<LeaderboardResponseDTO> getLeaderboardByDate(LocalDate date) {
        System.out.println("Fetching best scores for date: " + date);

        List<Level3Entity> entries = leaderboardRepo.findBestScoresByDate(date);

        return entries.stream()
                .limit(10)
                .map(LeaderboardResponseDTO::new)
                .collect(Collectors.toList());
    }
}
