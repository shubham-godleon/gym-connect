package com.gymconnect.api.controller;

import com.gymconnect.api.dto.FriendRequestDTO;
import com.gymconnect.api.dto.UserDTO;
import com.gymconnect.api.service.FriendshipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/friends")
@RequiredArgsConstructor
public class FriendshipController {

    private final FriendshipService friendshipService;

    @PostMapping("/request")
    public ResponseEntity<Void> sendRequest(@RequestBody Map<String, String> body) {
        friendshipService.sendRequest(
                UUID.fromString(body.get("requesterId")),
                UUID.fromString(body.get("addresseeId")));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{friendshipId}/respond")
    public ResponseEntity<Void> respond(
            @PathVariable UUID friendshipId,
            @RequestBody Map<String, Object> body) {
        friendshipService.respondToRequest(
                friendshipId,
                UUID.fromString((String) body.get("addresseeId")),
                (Boolean) body.get("accept")
        );
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<UserDTO>> getFriends(@PathVariable UUID userId) {
        return ResponseEntity.ok(friendshipService.getFriends(userId));
    }

    @GetMapping("/{userId}/pending")
    public ResponseEntity<List<FriendRequestDTO>> getPendingRequests(@PathVariable UUID userId) {
        return ResponseEntity.ok(friendshipService.getPendingRequests(userId));
    }

    @DeleteMapping
    public ResponseEntity<Void> removeFriend(@RequestBody Map<String, String> body) {
        friendshipService.removeFriend(
                UUID.fromString(body.get("userId")),
                UUID.fromString(body.get("friendId")));
        return ResponseEntity.ok().build();
    }
}
