package capstone.cyberkids.CyberKids.Leaderboard.LeaderboardLevel1;

import capstone.cyberkids.CyberKids.entity.Student;
import capstone.cyberkids.CyberKids.Leaderboard.Global.GlobalService;
import capstone.cyberkids.CyberKids.repository.StudentRepo;
import capstone.cyberkids.CyberKids.dto.LeaderboardResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class Level1Service {

    @Autowired
    private Level1Repo leaderboardRepo;

    @Autowired
    private StudentRepo studentRepo;

    @Autowired
    private GlobalService globalLeaderboardService;

    public Level1Entity updateStudentDailyScoreAndTimeByRobloxId(String robloxId, int score, String totalTimeTaken, LocalDate date) {
        Student student = studentRepo.findByRobloxId(robloxId);
        if (student == null) {
            throw new RuntimeException("Student not found with Roblox ID: " + robloxId);
        }

        String cleanTime = cleanTimeInput(totalTimeTaken);

        Level1Entity entry = new Level1Entity(student, score, cleanTime, date);
        Level1Entity savedEntry = leaderboardRepo.save(entry);

        globalLeaderboardService.rebuildFromLevel1();
        return savedEntry;

    }

    private String cleanTimeInput(String timeInput) {
        if (timeInput == null || timeInput.trim().isEmpty()) {
            return "00:00";
        }

        String trimmed = timeInput.trim();

        if (trimmed.matches("\\d{1,2}:\\d{2}")) {
            return trimmed;
        }

        try {
            int totalSeconds = Integer.parseInt(trimmed);
            int minutes = totalSeconds / 60;
            int seconds = totalSeconds % 60;
            String formatted = String.format("%d:%02d", minutes, seconds);
            return formatted;
        } catch (NumberFormatException e) {
            return "00:00";
        }
    }

    public List<LeaderboardResponseDTO> getTodayLeaderboard() {
        return getLeaderboardByDate(LocalDate.now());
    }

    public List<LeaderboardResponseDTO> getLeaderboardByDate(LocalDate date) {
        List<Level1Entity> entries = leaderboardRepo.findBestScoresByDate(date);

        return entries.stream()
                .limit(10)
                .map(LeaderboardResponseDTO::new)
                .collect(Collectors.toList());
    }
}
