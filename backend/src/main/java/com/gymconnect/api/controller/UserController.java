package com.gymconnect.api.controller;

import com.gymconnect.api.dto.SlackerDTO;
import com.gymconnect.api.dto.UserDTO;
import com.gymconnect.api.dto.UserSearchResultDTO;
import com.gymconnect.api.security.AuthContext;
import com.gymconnect.api.service.UserService;
import com.gymconnect.api.service.WeeklyGoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final WeeklyGoalService weeklyGoalService;
    private final AuthContext authContext;

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUser(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @GetMapping("/by-email/{email}")
    public ResponseEntity<UserDTO> getUserByEmail(@PathVariable String email) {
        return ResponseEntity.ok(userService.getUserByEmail(email));
    }

    // Friend-add username search (prefix match, capped).
    @GetMapping("/search")
    public ResponseEntity<List<UserSearchResultDTO>> search(@RequestParam String q) {
        authContext.currentUserId(); // require auth
        return ResponseEntity.ok(userService.searchByUsername(q));
    }

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody UserDTO dto) {
        // Email always comes from the verified token, never the request body —
        // otherwise anyone could register a profile under someone else's email.
        dto.setEmail(authContext.currentEmail());
        return ResponseEntity.ok(userService.createUser(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable UUID id, @RequestBody UserDTO dto) {
        authContext.requireSelf(id);
        return ResponseEntity.ok(userService.updateUser(id, dto));
    }

    @GetMapping("/{id}/slacking-friends")
    public ResponseEntity<List<SlackerDTO>> getSlackingFriends(@PathVariable UUID id) {
        authContext.requireSelf(id);
        return ResponseEntity.ok(weeklyGoalService.getSlackingFriends(id));
    }

    @PutMapping("/{id}/fcm-token")
    public ResponseEntity<Void> updateFcmToken(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        authContext.requireSelf(id);
        userService.updateFcmToken(id, body.get("fcmToken"));
        return ResponseEntity.ok().build();
    }
}
