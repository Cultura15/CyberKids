package capstone.cyberkids.CyberKids.LeaderboardLevel1.Daily;


import capstone.cyberkids.CyberKids.Entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DailyInfoSortingLeaderboardRepo extends JpaRepository<DailyInfoSortingLeaderboardEntry, Long> {

    Optional<DailyInfoSortingLeaderboardEntry> findByStudentAndDate(Student student, LocalDate date);

    List<DailyInfoSortingLeaderboardEntry> findTop10ByDateOrderByScoreDesc(LocalDate date);

    // Custom query to update status of leaderboard entries for a specific date
    @Modifying
    @Query("UPDATE DailyInfoSortingLeaderboardEntry e SET e.isActive = :status WHERE e.date = :date")
    void updateStatusForDate(@Param("date") LocalDate date, @Param("status") boolean status);

    // Get current active leaderboard for today
    List<DailyInfoSortingLeaderboardEntry> findByDateAndIsActiveTrue(LocalDate date);
}

