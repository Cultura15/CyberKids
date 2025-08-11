package capstone.cyberkids.CyberKids.Service;

import capstone.cyberkids.CyberKids.Entity.Student;
import capstone.cyberkids.CyberKids.Entity.Timer;
import capstone.cyberkids.CyberKids.Model.ChallengeType;
import capstone.cyberkids.CyberKids.Model.TimerRequest;
import capstone.cyberkids.CyberKids.Repository.StudentRepo;
import capstone.cyberkids.CyberKids.Repository.TimerRepo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TimerService {

    private final TimerRepo timerRepository;
    private final StudentRepo studentRepo;

    public TimerService(TimerRepo timerRepository, StudentRepo studentRepo) {
        this.timerRepository = timerRepository;
        this.studentRepo = studentRepo;
    }

    public Timer updateTimer(TimerRequest request) {
        if ("start".equalsIgnoreCase(request.getStatus())) {

            Student student = studentRepo.findByRobloxId(request.getStudent().getRobloxId());
            if (student == null) {
                student = new Student();
                student.setRobloxId(request.getStudent().getRobloxId());
                student.setRobloxName(request.getStudent().getRobloxName() != null
                        ? request.getStudent().getRobloxName()
                        : "Player" + request.getStudent().getRobloxId());
                studentRepo.save(student);
            }
            Timer timer = new Timer();
            timer.setStudent(student);
            timer.setChallengeType(request.getChallengeType());
            timer.setStartTime(request.getStartTime());
            return timerRepository.save(timer);

        } else if ("end".equalsIgnoreCase(request.getStatus())) {
            Timer timer = timerRepository.findById(request.getTimerId())
                    .orElseThrow(() -> new RuntimeException("Timer not found"));
            timer.setEndTime(request.getEndTime());
            timer.calculateTimeTaken();
            return timerRepository.save(timer);

        } else {
            throw new RuntimeException("Invalid status");
        }
    }

    public List<Timer> getTimersByStudentId(Long studentId) {
        return timerRepository.findByStudent_Id(studentId);
    }

    public List<Timer> getTimersByChallengeType(ChallengeType challengeType) {
        return timerRepository.findByChallengeType(challengeType);
    }
}
