package capstone.cyberkids.CyberKids.LeaderboardLevel1.Daily;

import capstone.cyberkids.CyberKids.Entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DailyInfoSortingLeaderboardRepo extends JpaRepository<DailyInfoSortingLeaderboardEntry, Long> {

    /**
     * Find all game sessions for a specific date
     */
    List<DailyInfoSortingLeaderboardEntry> findByDate(LocalDate date);

    /**
     * Count how many games a student played on a specific date
     */
    long countByStudentAndDate(Student student, LocalDate date);

    /**
     * Find a student's oldest entry for a specific date
     * Used when player reaches daily limit - we delete the oldest
     */
    @Query("SELECT d FROM DailyInfoSortingLeaderboardEntry d " +
            "WHERE d.student = :student AND d.date = :date " +
            "ORDER BY d.createdAt ASC")
    DailyInfoSortingLeaderboardEntry findOldestByStudentAndDate(
            @Param("student") Student student,
            @Param("date") LocalDate date
    );

    /**
     * Find all sessions for a student on a specific date, ordered by most recent first
     */
    List<DailyInfoSortingLeaderboardEntry> findByStudentAndDateOrderByCreatedAtDesc(
            Student student,
            LocalDate date
    );

    /**
     * Delete all entries before a specific date (for cleanup)
     * Returns the number of deleted entries
     */
    @Modifying
    @Query("DELETE FROM DailyInfoSortingLeaderboardEntry d WHERE d.date < :date")
    int deleteByDateBefore(@Param("date") LocalDate date);

    /**
     * Count total entries for a specific date
     */
    long countByDate(LocalDate date);

    /**
     * Get all unique dates that have leaderboard data (for history view)
     */
    @Query("SELECT DISTINCT d.date FROM DailyInfoSortingLeaderboardEntry d ORDER BY d.date DESC")
    List<LocalDate> findDistinctDates();

    /**
     * Find top N entries for a specific date (alternative to in-memory sorting)
     */
    @Query("SELECT d FROM DailyInfoSortingLeaderboardEntry d " +
            "WHERE d.date = :date " +
            "ORDER BY d.score DESC, d.totalTimeTaken ASC, d.createdAt ASC")
    List<DailyInfoSortingLeaderboardEntry> findTopEntriesByDate(
            @Param("date") LocalDate date
    );
}