package capstone.cyberkids.CyberKids.dtos;

public class ClassDTO {

    private String grade;
    private String section;

    public ClassDTO() {}

    public ClassDTO(String grade, String section) {
        this.grade = grade;
        this.section = section;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }
}


