package lk.ijse.spring.authapp.controller;

import lk.ijse.spring.authapp.dto.APIResponse;
import lk.ijse.spring.authapp.dto.AuthDTO;
import lk.ijse.spring.authapp.dto.RegisterDTO;
import lk.ijse.spring.authapp.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:63342")
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<APIResponse> registerUser(
            @RequestBody RegisterDTO registerDTO){
        return ResponseEntity.ok(
                new APIResponse(
                        200,
                        "User registered successfully",
                        authService.register(registerDTO)
                )
        );
    }
    @PostMapping("/login")
    public ResponseEntity<APIResponse> login(@RequestBody AuthDTO authDTO){
        return ResponseEntity.ok(new APIResponse(200,
                "OK",authService.authenticate(authDTO)));
    }

}
