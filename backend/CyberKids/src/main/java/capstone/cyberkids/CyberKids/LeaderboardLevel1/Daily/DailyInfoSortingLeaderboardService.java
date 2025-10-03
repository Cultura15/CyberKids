package capstone.cyberkids.CyberKids.LeaderboardLevel1.Daily;

import capstone.cyberkids.CyberKids.Entity.Student;
import capstone.cyberkids.CyberKids.Repository.StudentRepo;
import capstone.cyberkids.CyberKids.dtos.LeaderboardResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DailyInfoSortingLeaderboardService {

    @Autowired
    private DailyInfoSortingLeaderboardRepo leaderboardRepo;

    @Autowired
    private StudentRepo studentRepo;

    // Configuration constants
    private static final int LEADERBOARD_DISPLAY_LIMIT = 50;
    private static final int DATA_RETENTION_DAYS = 7;

    /**
     * Adds a new game session entry for the student.
     * - Allows unlimited entries per player per day
     * - Each game session is saved as a separate entry
     */
    @Transactional
    public DailyInfoSortingLeaderboardEntry addGameSession(
            String robloxId, int score, String totalTimeTaken, LocalDate date) {

        // Find student by Roblox ID
        Student student = studentRepo.findByRobloxId(robloxId);
        if (student == null) {
            throw new RuntimeException("Student not found with Roblox ID: " + robloxId);
        }

        System.out.println("=== NEW GAME SESSION ===");
        System.out.println("Student: " + student.getRobloxName());
        System.out.println("Score: " + score + ", Time: " + totalTimeTaken);

        // Clean and validate the time input
        String cleanTime = cleanTimeInput(totalTimeTaken);

        // Create and save new entry (no limit check)
        DailyInfoSortingLeaderboardEntry newEntry = new DailyInfoSortingLeaderboardEntry(
                student, score, cleanTime, date
        );
        DailyInfoSortingLeaderboardEntry savedEntry = leaderboardRepo.save(newEntry);

        System.out.println("✅ New session saved - ID: " + savedEntry.getId());
        System.out.println("=== END ===");

        return savedEntry;
    }

    /**
     * Cleans and validates time input, converts to MM:SS format
     */
    private String cleanTimeInput(String timeInput) {
        if (timeInput == null || timeInput.trim().isEmpty()) {
            return "0:00";
        }

        String trimmed = timeInput.trim();

        // If already in MM:SS format, validate and return
        if (trimmed.matches("\\d{1,2}:\\d{2}")) {
            String[] parts = trimmed.split(":");
            int minutes = Integer.parseInt(parts[0]);
            int seconds = Integer.parseInt(parts[1]);
            if (seconds >= 60) {
                minutes += seconds / 60;
                seconds = seconds % 60;
            }
            return String.format("%d:%02d", minutes, seconds);
        }

        // If it's a number (seconds), convert to MM:SS
        try {
            int totalSeconds = Integer.parseInt(trimmed);
            int minutes = totalSeconds / 60;
            int seconds = totalSeconds % 60;
            return String.format("%d:%02d", minutes, seconds);
        } catch (NumberFormatException e) {
            System.out.println("Invalid time format: " + trimmed + ", defaulting to 0:00");
            return "0:00";
        }
    }

    /**
     * Gets today's leaderboard (top 50 game sessions)
     */
    public List<LeaderboardResponseDTO> getTodayLeaderboard() {
        return getLeaderboardByDate(LocalDate.now());
    }

    /**
     * Gets leaderboard for a specific date (top 50 game sessions)
     * Sorted by: Score (desc) → Time (asc) → CreatedAt (asc)
     */
    public List<LeaderboardResponseDTO> getLeaderboardByDate(LocalDate date) {
        System.out.println("📊 Fetching leaderboard for: " + date);

        // Get all game sessions for the date
        List<DailyInfoSortingLeaderboardEntry> allSessions = leaderboardRepo.findByDate(date);

        System.out.println("Found " + allSessions.size() + " total game sessions");

        // Sort by score (desc), then by time (asc), then by createdAt (asc)
        List<DailyInfoSortingLeaderboardEntry> sortedSessions = allSessions.stream()
                .sorted((a, b) -> {
                    // First: Compare by score (higher is better)
                    int scoreCompare = Integer.compare(b.getScore(), a.getScore());
                    if (scoreCompare != 0) return scoreCompare;

                    // Second: Compare by time (lower is better)
                    int timeCompare = compareTime(a.getTotalTimeTaken(), b.getTotalTimeTaken());
                    if (timeCompare != 0) return timeCompare;

                    // Third: Compare by timestamp (earlier is better - first to achieve)
                    return a.getCreatedAt().compareTo(b.getCreatedAt());
                })
                .limit(LEADERBOARD_DISPLAY_LIMIT) // Top 50 only
                .collect(Collectors.toList());

        System.out.println("Returning top " + sortedSessions.size() + " sessions");

        return sortedSessions.stream()
                .map(LeaderboardResponseDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Compares two time strings in MM:SS format
     * Returns: negative if time1 < time2, 0 if equal, positive if time1 > time2
     */
    private int compareTime(String time1, String time2) {
        int seconds1 = parseTimeToSeconds(time1);
        int seconds2 = parseTimeToSeconds(time2);
        return Integer.compare(seconds1, seconds2);
    }

    /**
     * Converts MM:SS format to total seconds
     */
    private int parseTimeToSeconds(String timeStr) {
        if (timeStr == null || timeStr.isEmpty()) return Integer.MAX_VALUE;

        String[] parts = timeStr.split(":");
        if (parts.length != 2) return Integer.MAX_VALUE;

        try {
            int minutes = Integer.parseInt(parts[0]);
            int seconds = Integer.parseInt(parts[1]);
            return minutes * 60 + seconds;
        } catch (NumberFormatException e) {
            return Integer.MAX_VALUE;
        }
    }

    /**
     * AUTOMATIC CLEANUP JOB
     * Runs every day at midnight (00:00:00)
     * Deletes entries older than 7 days
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void cleanupOldLeaderboardEntries() {
        LocalDate cutoffDate = LocalDate.now().minusDays(DATA_RETENTION_DAYS);

        System.out.println("=== DAILY CLEANUP JOB ===");
        System.out.println("Deleting entries older than: " + cutoffDate);

        int deletedCount = leaderboardRepo.deleteByDateBefore(cutoffDate);

        System.out.println("✅ Deleted " + deletedCount + " old entries");
        System.out.println("=== CLEANUP COMPLETE ===");
    }

    /**
     * Get how many games a student has played today
     */
    public long getStudentGamesPlayedToday(String robloxId) {
        Student student = studentRepo.findByRobloxId(robloxId);
        if (student == null) {
            return 0;
        }
        return leaderboardRepo.countByStudentAndDate(student, LocalDate.now());
    }

    /**
     * Get a student's game sessions for today
     */
    public List<LeaderboardResponseDTO> getStudentSessionsToday(String robloxId) {
        Student student = studentRepo.findByRobloxId(robloxId);
        if (student == null) {
            throw new RuntimeException("Student not found with Roblox ID: " + robloxId);
        }

        List<DailyInfoSortingLeaderboardEntry> sessions =
                leaderboardRepo.findByStudentAndDateOrderByCreatedAtDesc(student, LocalDate.now());

        return sessions.stream()
                .map(LeaderboardResponseDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Optional: Get statistics for a specific date
     */
    public DailyLeaderboardStats getStatsForDate(LocalDate date) {
        List<DailyInfoSortingLeaderboardEntry> entries = leaderboardRepo.findByDate(date);

        long totalSessions = entries.size();
        long uniquePlayers = entries.stream()
                .map(e -> e.getStudent().getId())
                .distinct()
                .count();

        int highestScore = entries.stream()
                .mapToInt(DailyInfoSortingLeaderboardEntry::getScore)
                .max()
                .orElse(0);

        double avgScore = entries.stream()
                .mapToInt(DailyInfoSortingLeaderboardEntry::getScore)
                .average()
                .orElse(0.0);

        return new DailyLeaderboardStats(totalSessions, uniquePlayers, highestScore, avgScore, date);
    }

    // Inner class for statistics
    public static class DailyLeaderboardStats {
        private long totalSessions;
        private long uniquePlayers;
        private int highestScore;
        private double averageScore;
        private LocalDate date;

        public DailyLeaderboardStats(long totalSessions, long uniquePlayers,
                                     int highestScore, double averageScore, LocalDate date) {
            this.totalSessions = totalSessions;
            this.uniquePlayers = uniquePlayers;
            this.highestScore = highestScore;
            this.averageScore = averageScore;
            this.date = date;
        }

        // Getters
        public long getTotalSessions() { return totalSessions; }
        public long getUniquePlayers() { return uniquePlayers; }
        public int getHighestScore() { return highestScore; }
        public double getAverageScore() { return averageScore; }
        public LocalDate getDate() { return date; }
    }
}