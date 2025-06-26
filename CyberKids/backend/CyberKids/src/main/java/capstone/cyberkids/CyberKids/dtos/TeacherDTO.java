package capstone.cyberkids.CyberKids.dtos;

import capstone.cyberkids.CyberKids.Entity.Teacher;

public class TeacherDTO {
    private Long id;
    private String name;
    private String email;

    public TeacherDTO(Teacher teacher) {
        this.id = teacher.getId();
        this.name = teacher.getFullName();
        this.email = teacher.getEmail();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
