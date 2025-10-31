package capstone.cyberkids.CyberKids.Leaderboard.LeaderboardLevel3;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;


public interface Level3Repo extends JpaRepository<Level3Entity, Long> {


    @Query("SELECT e FROM Level3Entity e WHERE e.date = :date " +
            "AND e.id IN (SELECT MAX(e2.id) FROM Level3Entity e2 " +
            "WHERE e2.date = :date AND e2.score = " +
            "(SELECT MAX(e3.score) FROM Level3Entity e3 " +
            "WHERE e3.student = e2.student AND e3.date = :date) " +
            "GROUP BY e2.student) " +
            "ORDER BY e.score DESC, e.totalTimeTaken ASC")
    List<Level3Entity> findBestScoresByDate(@Param("date") LocalDate date);
}
