package capstone.cyberkids.CyberKids.Service;

import capstone.cyberkids.CyberKids.Entity.Score;
import capstone.cyberkids.CyberKids.Repository.ScoreRepo;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ScoreService {

    private final ScoreRepo scoreRepository;

    @Autowired
    public ScoreService(ScoreRepo scoreRepository) {
        this.scoreRepository = scoreRepository;
    }


    @Transactional
    public Score saveScore(Score score) {
        System.out.println("Saving score for student: " + score.getStudent().getRobloxId());
        return scoreRepository.save(score);
    }

    public List<Score> getAllScores() {
        return scoreRepository.findAll();
    }
}

// CodeRabbit audit trigger