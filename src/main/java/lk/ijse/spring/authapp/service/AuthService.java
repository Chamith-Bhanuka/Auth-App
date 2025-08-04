package lk.ijse.spring.authapp.service;

import lk.ijse.spring.authapp.dto.AuthDTO;
import lk.ijse.spring.authapp.dto.AuthResponseDTO;
import lk.ijse.spring.authapp.dto.RegisterDTO;
import lk.ijse.spring.authapp.entity.Role;
import lk.ijse.spring.authapp.entity.User;
import lk.ijse.spring.authapp.repository.UserRepository;
import lk.ijse.spring.authapp.util.JWTUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTUtil jwtUtil;

    public AuthResponseDTO authenticate(AuthDTO authDTO){
        // validate credentials
        User user=userRepository.findByUsername(authDTO.getUsername())
                .orElseThrow(()->new RuntimeException("User not found"));
        // check password
        if (!passwordEncoder.matches(
                authDTO.getPassword(),
                user.getPassword())){
            throw new BadCredentialsException("Invalid credentials");
        }
        // generate token
        String token=jwtUtil.generateToken(authDTO.username, user.getRole().name());
        return new AuthResponseDTO(token);
    }
    // register user
    public String register(RegisterDTO registerDTO){
        if (userRepository.findByUsername(registerDTO.getUsername())
                .isPresent()){
            throw new RuntimeException("Username already exists");
        }
        User user=User.builder()
                .username(registerDTO.getUsername())
                .password(passwordEncoder.encode(registerDTO.getPassword()))
                .emailAddress(registerDTO.getEmailAddress())
                .role(Role.valueOf(registerDTO.getRole()))
                .build();
        userRepository.save(user);
        return "User registered successfully";
    }
}
