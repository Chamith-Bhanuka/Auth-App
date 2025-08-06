package lk.ijse.spring.authapp.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = {"http://localhost:63342", "http://127.0.0.1:63342"})
@RestController
@RequestMapping("/hello")
public class HelloController {
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public String helloAdmin(){
        return "Hello World -Admin";
    }
    @GetMapping("/user")
    @PreAuthorize("hasRole('USER')")
    public String helloUser(){
        return "Hello World - User";
    }
}
