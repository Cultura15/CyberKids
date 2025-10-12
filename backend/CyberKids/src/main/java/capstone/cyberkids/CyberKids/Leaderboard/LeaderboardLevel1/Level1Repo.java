package capstone.cyberkids.CyberKids.Leaderboard.LeaderboardLevel1;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface Level1Repo extends JpaRepository<Level1Entity, Long> {

    // Get best entry per student for a specific date
    @Query("SELECT e FROM Level1Entity e WHERE e.date = :date " +
            "AND e.id IN (SELECT MAX(e2.id) FROM Level1Entity e2 " +
            "WHERE e2.date = :date AND e2.score = " +
            "(SELECT MAX(e3.score) FROM Level1Entity e3 " +
            "WHERE e3.student = e2.student AND e3.date = :date) " +
            "GROUP BY e2.student) " +
            "ORDER BY e.score DESC, e.totalTimeTaken ASC")
    List<Level1Entity> findBestScoresByDate(@Param("date") LocalDate date);
}