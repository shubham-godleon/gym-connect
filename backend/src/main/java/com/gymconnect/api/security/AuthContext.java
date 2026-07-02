package com.gymconnect.api.security;

import com.gymconnect.api.entity.User;
import com.gymconnect.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class AuthContext {

    private final UserRepository userRepository;

    public String currentEmail() {
        Jwt jwt = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email = jwt.getClaimAsString("email");
        if (email == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token has no email claim");
        }
        return email;
    }

    public UUID currentUserId() {
        return userRepository.findByEmail(currentEmail())
                .map(User::getId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No account for this token"));
    }

    public void requireSelf(UUID claimedUserId) {
        if (!currentUserId().equals(claimedUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only act on your own account");
        }
    }
}
