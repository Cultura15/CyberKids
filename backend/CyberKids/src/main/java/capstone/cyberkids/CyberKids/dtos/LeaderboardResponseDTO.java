package capstone.cyberkids.CyberKids.dtos;

import capstone.cyberkids.CyberKids.Leaderboard.LeaderboardLevel1.Level1Entity;
import capstone.cyberkids.CyberKids.Leaderboard.LeaderboardLevel2.Level2Entity;
import capstone.cyberkids.CyberKids.Leaderboard.LeaderboardLevel3.Level3Entity;

public class LeaderboardResponseDTO {
    private Long id;
    private int score;
    private String totalTimeTaken;
    private String date;
    private StudentDTO student;

    public LeaderboardResponseDTO(Level1Entity entry) {
        this.id = entry.getId();
        this.score = entry.getScore();
        this.totalTimeTaken = entry.getTotalTimeTaken();
        this.date = entry.getDate().toString();
        this.student = new StudentDTO(entry.getStudent());
    }

    public LeaderboardResponseDTO(Level2Entity entry) {
        this.id = entry.getId();
        this.score = entry.getScore();
        this.totalTimeTaken = entry.getTotalTimeTaken();
        this.date = entry.getDate().toString();
        this.student = new StudentDTO(entry.getStudent());
    }

    public LeaderboardResponseDTO(Level3Entity entry) {
        this.id = entry.getId();
        this.score = entry.getScore();
        this.totalTimeTaken = entry.getTotalTimeTaken();
        this.date = entry.getDate().toString();
        this.student = new StudentDTO(entry.getStudent());
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public String getTotalTimeTaken() { return totalTimeTaken; }
    public void setTotalTimeTaken(String totalTimeTaken) { this.totalTimeTaken = totalTimeTaken; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public StudentDTO getStudent() { return student; }
    public void setStudent(StudentDTO student) { this.student = student; }

    public static class StudentDTO {
        private Long id;
        private String robloxId;
        private String robloxName;
        private String realName;

        public StudentDTO(capstone.cyberkids.CyberKids.Entity.Student student) {
            this.id = student.getId();
            this.robloxId = student.getRobloxId();
            this.robloxName = student.getRobloxName();
            this.realName = student.getRealName();
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getRobloxId() { return robloxId; }
        public void setRobloxId(String robloxId) { this.robloxId = robloxId; }

        public String getRobloxName() { return robloxName; }
        public void setRobloxName(String robloxName) { this.robloxName = robloxName; }

        public String getRealName() { return realName; }
        public void setRealName(String realName) { this.realName = realName; }
    }
}