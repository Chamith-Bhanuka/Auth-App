package lk.ijse.spring.authapp.dto;

import lombok.Data;

@Data
public class RegisterDTO {
    private String username;
    private String emailAddress;
    private String role;
    private String password;
}