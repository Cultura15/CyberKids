package capstone.cyberkids.CyberKids.service;

import capstone.cyberkids.CyberKids.entity.Score;
import capstone.cyberkids.CyberKids.repository.ScoreRepo;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
}