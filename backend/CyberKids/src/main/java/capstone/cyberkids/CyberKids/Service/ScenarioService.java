package capstone.cyberkids.CyberKids.Service;

import capstone.cyberkids.CyberKids.Entity.Classes;
import capstone.cyberkids.CyberKids.Entity.Scenario;
import capstone.cyberkids.CyberKids.Entity.Teacher;
import capstone.cyberkids.CyberKids.Model.AnswerTypeLvl1;
import capstone.cyberkids.CyberKids.Repository.ScenarioRepository;
import capstone.cyberkids.CyberKids.Repository.TeacherRepo;
import capstone.cyberkids.CyberKids.dtos.ScenarioDTO;
import capstone.cyberkids.CyberKids.dtos.GameScenarioDTO;
import capstone.cyberkids.CyberKids.dtos.FeedbackResponseDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ScenarioService {

    private final ScenarioRepository scenarioRepository;
    private final TeacherService teacherService;
    private final ClassService classService;
    private final TeacherRepo teacherRepository;
    private final AIService aiService;

    public ScenarioService(ScenarioRepository scenarioRepository, TeacherService teacherService,
                           ClassService classService, TeacherRepo teacherRepository, AIService aiService) {
        this.scenarioRepository = scenarioRepository;
        this.teacherService = teacherService;
        this.classService = classService;
        this.teacherRepository = teacherRepository;
        this.aiService = aiService;
    }

    public Scenario createScenario(String content, Long classId, String correctAnswer) {
        Teacher teacher = teacherService.getLoggedInTeacher();

        if (content == null || content.trim().isEmpty()) {
            throw new RuntimeException("Scenario content cannot be empty");
        }

        if (correctAnswer == null) {
            throw new RuntimeException("Correct answer must be provided (SAFE or UNSAFE)");
        }

        String normalizedAnswer = correctAnswer.trim().toUpperCase();

        AnswerTypeLvl1 answerEnum;
        try {
            answerEnum = AnswerTypeLvl1.valueOf(normalizedAnswer);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Correct answer must be either SAFE or UNSAFE");
        }

        Classes selectedClass = classService.getClassById(classId);

        if (!selectedClass.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("You are not authorized to add a scenario to this class");
        }

        Scenario scenario = new Scenario(content.trim(), teacher, answerEnum);
        scenario.setClassEntity(selectedClass);
        scenario.setActive(true);

        return scenarioRepository.save(scenario);
    }

    public List<ScenarioDTO> getMyScenarios() {
        Teacher teacher = teacherService.getLoggedInTeacher();
        List<Scenario> scenarios = scenarioRepository.findByTeacherOrderByCreatedAtDesc(teacher);

        return scenarios.stream()
                .map(ScenarioDTO::new)
                .collect(Collectors.toList());
    }

    public List<ScenarioDTO> getActiveScenarios() {
        Teacher teacher = teacherService.getLoggedInTeacher();
        List<Scenario> scenarios = scenarioRepository.findByTeacherAndActiveTrue(teacher);

        return scenarios.stream()
                .map(ScenarioDTO::new)
                .collect(Collectors.toList());
    }

    public Long getTeacherIdByEmail(String email) {
        Teacher teacher = teacherRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        return teacher.getId();
    }

    public List<ScenarioDTO> getScenariosByTeacherId(Long teacherId) {
        List<Scenario> scenarios = scenarioRepository.findByTeacherId(teacherId);
        return scenarios.stream()
                .map(scenario -> new ScenarioDTO(scenario))
                .toList();
    }

    public Scenario updateScenario(Long scenarioId, String content) {
        Teacher teacher = teacherService.getLoggedInTeacher();

        Scenario scenario = scenarioRepository.findById(scenarioId)
                .orElseThrow(() -> new RuntimeException("Scenario not found"));

        if (!scenario.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("You can only update your own scenarios");
        }

        if (content != null && !content.trim().isEmpty()) {
            scenario.setContent(content.trim());
        }

        return scenarioRepository.save(scenario);
    }

    public void toggleScenarioStatus(Long scenarioId) {
        Teacher teacher = teacherService.getLoggedInTeacher();

        Scenario scenario = scenarioRepository.findById(scenarioId)
                .orElseThrow(() -> new RuntimeException("Scenario not found"));

        if (!scenario.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("You can only modify your own scenarios");
        }

        scenario.setActive(!scenario.isActive());
        scenarioRepository.save(scenario);
    }

    public void deleteScenario(Long scenarioId) {
        Teacher teacher = teacherService.getLoggedInTeacher();

        Scenario scenario = scenarioRepository.findById(scenarioId)
                .orElseThrow(() -> new RuntimeException("Scenario not found"));

        if (!scenario.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("You can only delete your own scenarios");
        }

        scenarioRepository.delete(scenario);
    }

    // Method for Roblox game to fetch all active scenarios
    public List<Scenario> getAllActiveScenariosForGame() {
        return scenarioRepository.findAllActiveScenarios();
    }

    public List<Scenario> getActiveScenariosByClassCode(String classCode) {
        Classes classEntity = classService.getClassByCode(classCode);
        return scenarioRepository.findByClassEntityAndActiveTrue(classEntity);
    }




    // New method for Roblox game to get scenarios as GameScenarioDTO
    public List<GameScenarioDTO> getAllActiveScenariosForGameDTO() {
        List<Scenario> scenarios = scenarioRepository.findAllActiveScenarios();
        return scenarios.stream()
                .map(GameScenarioDTO::new)
                .collect(Collectors.toList());
    }

    // New method to evaluate answer and generate AI feedback
    public FeedbackResponseDTO evaluateAnswerWithAI(Long scenarioId, String userAnswer) {
        Scenario scenario = scenarioRepository.findById(scenarioId)
                .orElseThrow(() -> new RuntimeException("Scenario not found"));

        if (!scenario.isActive()) {
            throw new RuntimeException("This scenario is not active");
        }

        // Normalize user answer
        String normalizedUserAnswer = userAnswer.trim().toUpperCase();
        String correctAnswer = scenario.getCorrectAnswer().name();

        // Check if answer is correct
        boolean isCorrect = normalizedUserAnswer.equals(correctAnswer);

        // Generate AI feedback
        String aiFeedback = aiService.generateScenarioFeedback(scenario, normalizedUserAnswer, isCorrect);

        return new FeedbackResponseDTO(aiFeedback, isCorrect, correctAnswer, normalizedUserAnswer, scenarioId);
    }

    public long getActiveScenarioCount() {
        Teacher teacher = teacherService.getLoggedInTeacher();
        return scenarioRepository.countByTeacherAndActiveTrue(teacher);
    }
}

// CodeRabbit audit trigger