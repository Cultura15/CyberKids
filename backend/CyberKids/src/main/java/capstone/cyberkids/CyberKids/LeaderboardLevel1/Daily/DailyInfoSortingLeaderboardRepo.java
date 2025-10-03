package capstone.cyberkids.CyberKids.LeaderboardLevel1.Daily;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface DailyInfoSortingLeaderboardRepo extends JpaRepository<DailyInfoSortingLeaderboardEntry, Long> {

    // Get best entry per student for a specific date
    @Query("SELECT e FROM DailyInfoSortingLeaderboardEntry e WHERE e.date = :date " +
            "AND e.id IN (SELECT MAX(e2.id) FROM DailyInfoSortingLeaderboardEntry e2 " +
            "WHERE e2.date = :date AND e2.score = " +
            "(SELECT MAX(e3.score) FROM DailyInfoSortingLeaderboardEntry e3 " +
            "WHERE e3.student = e2.student AND e3.date = :date) " +
            "GROUP BY e2.student) " +
            "ORDER BY e.score DESC, e.totalTimeTaken ASC")
    List<DailyInfoSortingLeaderboardEntry> findBestScoresByDate(@Param("date") LocalDate date);
}