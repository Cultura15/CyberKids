package capstone.cyberkids.CyberKids.Leaderboard.Global;

import capstone.cyberkids.CyberKids.Entity.Classes;
import capstone.cyberkids.CyberKids.Entity.Student;
import capstone.cyberkids.CyberKids.Leaderboard.LeaderboardLevel1.Level1Entity;
import capstone.cyberkids.CyberKids.Leaderboard.LeaderboardLevel1.Level1Repo;
import capstone.cyberkids.CyberKids.Leaderboard.LeaderboardLevel2.Level2Entity;
import capstone.cyberkids.CyberKids.Leaderboard.LeaderboardLevel2.Level2Repo;
import capstone.cyberkids.CyberKids.Leaderboard.LeaderboardLevel3.Level3Entity;
import capstone.cyberkids.CyberKids.Leaderboard.LeaderboardLevel3.Level3Repo;
import capstone.cyberkids.CyberKids.Service.ClassService;
import capstone.cyberkids.CyberKids.Service.StudentService;
import capstone.cyberkids.CyberKids.dtos.GlobalLeaderboardDTO;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
public class GlobalService {

    @Autowired private GlobalRepo globalRepo;
    @Autowired private Level1Repo level1Repo;
    @Autowired private Level2Repo level2Repo;
    @Autowired private Level3Repo level3Repo;
    @Autowired private ClassService classService;
    @Autowired private StudentService studentService;

    /** ================== LEVEL 1 ================== **/
    @Transactional
    public void rebuildFromLevel1() {
        rebuildFromLevel(level1Repo.findAll(), "Level 1");
    }

    public List<GlobalLeaderboardDTO> getAllRankedLevel1ForTeacher() {
        return getRankedLeaderboardForTeacher(level1Repo.findAll(), "Level 1");
    }

    /** ================== LEVEL 2 ================== **/
    @Transactional
    public void rebuildFromLevel2() {
        rebuildFromLevel(level2Repo.findAll(), "Level 2");
    }

    public List<GlobalLeaderboardDTO> getAllRankedLevel2ForTeacher() {
        return getRankedLeaderboardForTeacher(level2Repo.findAll(), "Level 2");
    }

    /** ================== LEVEL 3 ================== **/
    @Transactional
    public void rebuildFromLevel3() {
        rebuildFromLevel(level3Repo.findAll(), "Level 3");
    }

    public List<GlobalLeaderboardDTO> getAllRankedLevel3ForTeacher() {
        return getRankedLeaderboardForTeacher(level3Repo.findAll(), "Level 3");
    }

    /** ================== COMBINED ALL LEVELS ================== **/
    public List<GlobalLeaderboardDTO> getAllRankedCombinedForTeacher() {
        Long teacherId = getLoggedInTeacherId();
        Set<Student> students = getStudentsForTeacher(teacherId);

        List<Object> allEntries = new ArrayList<>();
        allEntries.addAll(level1Repo.findAll());
        allEntries.addAll(level2Repo.findAll());
        allEntries.addAll(level3Repo.findAll());

        Map<Student, ScoreTime> bestPerStudent = new HashMap<>();

        for (Object entry : allEntries) {
            Student s;
            int score;
            String time;
            String level;

            if (entry instanceof Level1Entity e) {
                s = e.getStudent(); score = e.getScore(); time = e.getTotalTimeTaken(); level = "Level 1";
            } else if (entry instanceof Level2Entity e) {
                s = e.getStudent(); score = e.getScore(); time = e.getTotalTimeTaken(); level = "Level 2";
            } else if (entry instanceof Level3Entity e) {
                s = e.getStudent(); score = e.getScore(); time = e.getTotalTimeTaken(); level = "Level 3";
            } else continue;

            if (!students.contains(s)) continue;

            ScoreTime currentBest = bestPerStudent.get(s);
            if (currentBest == null || score > currentBest.score ||
                    (score == currentBest.score && compareTime(time, currentBest.time) < 0)) {
                bestPerStudent.put(s, new ScoreTime(score, time, level));
            }
        }

        List<Map.Entry<Student, ScoreTime>> sorted = bestPerStudent.entrySet().stream()
                .sorted(Comparator
                        .comparing((Map.Entry<Student, ScoreTime> e) -> e.getValue().score).reversed()
                        .thenComparing(e -> e.getValue().time))
                .collect(Collectors.toList());

        AtomicInteger rank = new AtomicInteger(1);
        return sorted.stream()
                .map(e -> new GlobalLeaderboardDTO(
                        e.getKey().getRealName(),
                        e.getKey().getRobloxName(),
                        e.getValue().score,
                        e.getValue().time,
                        rank.getAndIncrement(),
                        e.getValue().level
                ))
                .collect(Collectors.toList());
    }

    /** ================== CLASS SPECIFIC LEADERBOARD ================== **/
    public List<GlobalLeaderboardDTO> getRankedByClass(Long classId) {
        validateTeacherOwnership(classId);
        Classes targetClass = classService.getClassById(classId);
        Set<Student> studentsInClass = new HashSet<>(targetClass.getStudents());

        List<GlobalEntity> filtered = globalRepo.findAll().stream()
                .filter(g -> studentsInClass.contains(g.getStudent()))
                .sorted(Comparator.comparing(GlobalEntity::getGlobalRank))
                .collect(Collectors.toList());

        return filtered.stream()
                .map(GlobalLeaderboardDTO::new)
                .collect(Collectors.toList());
    }

    private void validateTeacherOwnership(Long classId) {
        Long teacherId = getLoggedInTeacherId();
        Classes targetClass = classService.getClassById(classId);
        if (!targetClass.getTeacher().getId().equals(teacherId)) {
            throw new RuntimeException("You do not have permission to view this class's leaderboard.");
        }
    }

    /** ================== INTERNAL HELPERS ================== **/
    private <T> void rebuildFromLevel(List<T> entries, String levelName) {
        List<GlobalEntity> newEntries = new ArrayList<>();

        for (T entry : entries) {
            Student student;
            int score;
            String totalTime;

            if (entry instanceof Level1Entity e) {
                student = e.getStudent(); score = e.getScore(); totalTime = e.getTotalTimeTaken();
            } else if (entry instanceof Level2Entity e) {
                student = e.getStudent(); score = e.getScore(); totalTime = e.getTotalTimeTaken();
            } else if (entry instanceof Level3Entity e) {
                student = e.getStudent(); score = e.getScore(); totalTime = e.getTotalTimeTaken();
            } else continue;

            GlobalEntity existing = globalRepo.findByStudent(student);

            if (existing != null) {
                // ✅ Only update if new score is higher or time is better
                if (score > existing.getHighestScore() ||
                        (score == existing.getHighestScore() && compareTime(totalTime, existing.getBestTimeTaken()) < 0)) {

                    existing.setHighestScore(score);
                    existing.setBestTimeTaken(totalTime);
                    existing.setLevel(levelName);

                    globalRepo.save(existing); // 🔥 update individually
                }

            } else {
                // New student — add to batch insert
                GlobalEntity global = new GlobalEntity();
                global.setStudent(student);
                global.setHighestScore(score);
                global.setBestTimeTaken(totalTime);
                global.setLevel(levelName);
                newEntries.add(global);
            }
        }

        // 🧩 Only insert *new* entities (not existing ones)
        if (!newEntries.isEmpty()) {
            globalRepo.saveAll(newEntries);
        }
    }



    private List<GlobalLeaderboardDTO> getRankedLeaderboardForTeacher(List<?> entries, String levelName) {
        Long teacherId = getLoggedInTeacherId();
        Set<Student> students = getStudentsForTeacher(teacherId);

        Map<Student, ScoreTime> bestPerStudent = new HashMap<>();
        for (Object entry : entries) {
            Student s;
            int score;
            String time;

            if (entry instanceof Level1Entity e) {
                s = e.getStudent(); score = e.getScore(); time = e.getTotalTimeTaken();
            } else if (entry instanceof Level2Entity e) {
                s = e.getStudent(); score = e.getScore(); time = e.getTotalTimeTaken();
            } else if (entry instanceof Level3Entity e) {
                s = e.getStudent(); score = e.getScore(); time = e.getTotalTimeTaken();
            } else continue;

            if (!students.contains(s)) continue;

            ScoreTime currentBest = bestPerStudent.get(s);
            if (currentBest == null || score > currentBest.score ||
                    (score == currentBest.score && compareTime(time, currentBest.time) < 0)) {
                bestPerStudent.put(s, new ScoreTime(score, time, levelName));
            }
        }

        List<Map.Entry<Student, ScoreTime>> sorted = bestPerStudent.entrySet().stream()
                .sorted(Comparator
                        .comparing((Map.Entry<Student, ScoreTime> e) -> e.getValue().score).reversed()
                        .thenComparing(e -> e.getValue().time))
                .collect(Collectors.toList());

        AtomicInteger rank = new AtomicInteger(1);
        return sorted.stream()
                .map(e -> new GlobalLeaderboardDTO(
                        e.getKey().getRealName(),
                        e.getKey().getRobloxName(),
                        e.getValue().score,
                        e.getValue().time,
                        rank.getAndIncrement(),
                        e.getValue().level
                ))
                .collect(Collectors.toList());
    }

    private Long getLoggedInTeacherId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email;
        if (authentication.getPrincipal() instanceof UserDetails) {
            email = ((UserDetails) authentication.getPrincipal()).getUsername();
        } else {
            email = authentication.getPrincipal().toString();
        }
        return classService.getTeacherIdByEmail(email);
    }

    private Set<Student> getStudentsForTeacher(Long teacherId) {
        List<Classes> teacherClasses = classService.getClassesByTeacher(teacherId);
        return teacherClasses.stream()
                .flatMap(c -> c.getStudents().stream())
                .collect(Collectors.toSet());
    }

    public List<GlobalLeaderboardDTO> getRankedLevelByClass(Long classId, String levelName) {
        validateTeacherOwnership(classId);
        Classes targetClass = classService.getClassById(classId);
        Set<Student> studentsInClass = new HashSet<>(targetClass.getStudents());

        // Pick level entries
        List<?> entries;
        switch (levelName) {
            case "Level 1": entries = level1Repo.findAll(); break;
            case "Level 2": entries = level2Repo.findAll(); break;
            case "Level 3": entries = level3Repo.findAll(); break;
            default: throw new RuntimeException("Invalid level: " + levelName);
        }

        Map<Student, ScoreTime> bestPerStudent = new HashMap<>();
        for (Object entry : entries) {
            Student s;
            int score;
            String time;

            if (entry instanceof Level1Entity e) { s = e.getStudent(); score = e.getScore(); time = e.getTotalTimeTaken(); }
            else if (entry instanceof Level2Entity e) { s = e.getStudent(); score = e.getScore(); time = e.getTotalTimeTaken(); }
            else if (entry instanceof Level3Entity e) { s = e.getStudent(); score = e.getScore(); time = e.getTotalTimeTaken(); }
            else continue;

            if (!studentsInClass.contains(s)) continue;

            ScoreTime currentBest = bestPerStudent.get(s);
            if (currentBest == null || score > currentBest.score ||
                    (score == currentBest.score && compareTime(time, currentBest.time) < 0)) {
                bestPerStudent.put(s, new ScoreTime(score, time, levelName));
            }
        }

        AtomicInteger rank = new AtomicInteger(1);
        return bestPerStudent.entrySet().stream()
                .sorted(Comparator
                        .comparing((Map.Entry<Student, ScoreTime> e) -> e.getValue().score).reversed()
                        .thenComparing(e -> e.getValue().time))
                .map(e -> new GlobalLeaderboardDTO(
                        e.getKey().getRealName(),
                        e.getKey().getRobloxName(),
                        e.getValue().score,
                        e.getValue().time,
                        rank.getAndIncrement(),
                        e.getValue().level
                ))
                .collect(Collectors.toList());
    }

    public List<GlobalLeaderboardDTO> getAllRankedCombinedByClass(Long classId) {
        validateTeacherOwnership(classId);  // ensure teacher can access this class
        Classes targetClass = classService.getClassById(classId);
        Set<Student> studentsInClass = new HashSet<>(targetClass.getStudents());

        List<Object> allEntries = new ArrayList<>();
        allEntries.addAll(level1Repo.findAll());
        allEntries.addAll(level2Repo.findAll());
        allEntries.addAll(level3Repo.findAll());

        Map<Student, ScoreTime> bestPerStudent = new HashMap<>();

        for (Object entry : allEntries) {
            Student s;
            int score;
            String time;
            String level;

            if (entry instanceof Level1Entity e) {
                s = e.getStudent(); score = e.getScore(); time = e.getTotalTimeTaken(); level = "Level 1";
            } else if (entry instanceof Level2Entity e) {
                s = e.getStudent(); score = e.getScore(); time = e.getTotalTimeTaken(); level = "Level 2";
            } else if (entry instanceof Level3Entity e) {
                s = e.getStudent(); score = e.getScore(); time = e.getTotalTimeTaken(); level = "Level 3";
            } else continue;

            if (!studentsInClass.contains(s)) continue; // filter only students in this class

            ScoreTime currentBest = bestPerStudent.get(s);
            if (currentBest == null || score > currentBest.score ||
                    (score == currentBest.score && compareTime(time, currentBest.time) < 0)) {
                bestPerStudent.put(s, new ScoreTime(score, time, level));
            }
        }

        List<Map.Entry<Student, ScoreTime>> sorted = bestPerStudent.entrySet().stream()
                .sorted(Comparator
                        .comparing((Map.Entry<Student, ScoreTime> e) -> e.getValue().score).reversed()
                        .thenComparing(e -> e.getValue().time))
                .collect(Collectors.toList());

        AtomicInteger rank = new AtomicInteger(1);
        return sorted.stream()
                .map(e -> new GlobalLeaderboardDTO(
                        e.getKey().getRealName(),
                        e.getKey().getRobloxName(),
                        e.getValue().score,
                        e.getValue().time,
                        rank.getAndIncrement(),
                        e.getValue().level
                ))
                .collect(Collectors.toList());
    }

    public List<GlobalLeaderboardDTO> getAllRankedOverallForTeacher() {
        Long teacherId = getLoggedInTeacherId();
        Set<Student> students = getStudentsForTeacher(teacherId);

        List<Object> allEntries = new ArrayList<>();
        allEntries.addAll(level1Repo.findAll());
        allEntries.addAll(level2Repo.findAll());
        allEntries.addAll(level3Repo.findAll());

        Map<Student, ScoreTime> bestPerStudent = new HashMap<>();

        for (Object entry : allEntries) {
            Student s;
            int score;
            String time;
            String level;

            if (entry instanceof Level1Entity e) {
                s = e.getStudent(); score = e.getScore(); time = e.getTotalTimeTaken(); level = "Level 1";
            } else if (entry instanceof Level2Entity e) {
                s = e.getStudent(); score = e.getScore(); time = e.getTotalTimeTaken(); level = "Level 2";
            } else if (entry instanceof Level3Entity e) {
                s = e.getStudent(); score = e.getScore(); time = e.getTotalTimeTaken(); level = "Level 3";
            } else continue;

            if (!students.contains(s)) continue; // only the teacher's students

            ScoreTime currentBest = bestPerStudent.get(s);
            if (currentBest == null || score > currentBest.score ||
                    (score == currentBest.score && compareTime(time, currentBest.time) < 0)) {
                bestPerStudent.put(s, new ScoreTime(score, time, level));
            }
        }

        List<Map.Entry<Student, ScoreTime>> sorted = bestPerStudent.entrySet().stream()
                .sorted(Comparator
                        .comparing((Map.Entry<Student, ScoreTime> e) -> e.getValue().score).reversed()
                        .thenComparing(e -> e.getValue().time))
                .collect(Collectors.toList());

        AtomicInteger rank = new AtomicInteger(1);
        return sorted.stream()
                .map(e -> new GlobalLeaderboardDTO(
                        e.getKey().getRealName(),
                        e.getKey().getRobloxName(),
                        e.getValue().score,
                        e.getValue().time,
                        rank.getAndIncrement(),
                        e.getValue().level
                ))
                .collect(Collectors.toList());
    }




    private static class ScoreTime {
        int score;
        String time;
        String level;
        ScoreTime(int score, String time, String level) { this.score = score; this.time = time; this.level = level; }
    }

    private int compareTime(String t1, String t2) {
        return Integer.compare(toSeconds(t1), toSeconds(t2));
    }

    private int toSeconds(String time) {
        try {
            String[] parts = time.split(":");
            return Integer.parseInt(parts[0]) * 60 + Integer.parseInt(parts[1]);
        } catch (Exception e) {
            return Integer.MAX_VALUE;
        }
    }
}
