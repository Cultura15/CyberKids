package capstone.cyberkids.CyberKids.Leaderboard.LeaderboardLevel2;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface Level2Repo extends JpaRepository<Level2Entity, Long> {


    @Query("SELECT e FROM Level2Entity e WHERE e.date = :date " +
            "AND e.id IN (SELECT MAX(e2.id) FROM Level2Entity e2 " +
            "WHERE e2.date = :date AND e2.score = " +
            "(SELECT MAX(e3.score) FROM Level2Entity e3 " +
            "WHERE e3.student = e2.student AND e3.date = :date) " +
            "GROUP BY e2.student) " +
            "ORDER BY e.score DESC, e.totalTimeTaken ASC")
    List<Level2Entity> findBestScoresByDate(@Param("date") LocalDate date);
}
