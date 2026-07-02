package com.gymconnect.api.controller;

import com.gymconnect.api.dto.FriendRequestDTO;
import com.gymconnect.api.dto.UserDTO;
import com.gymconnect.api.security.AuthContext;
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
    private final AuthContext authContext;

    @PostMapping("/request")
    public ResponseEntity<Void> sendRequest(@RequestBody Map<String, String> body) {
        UUID requesterId = UUID.fromString(body.get("requesterId"));
        authContext.requireSelf(requesterId);
        friendshipService.sendRequest(
                requesterId,
                UUID.fromString(body.get("addresseeId")));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{friendshipId}/respond")
    public ResponseEntity<Void> respond(
            @PathVariable UUID friendshipId,
            @RequestBody Map<String, Object> body) {
        UUID addresseeId = UUID.fromString((String) body.get("addresseeId"));
        authContext.requireSelf(addresseeId);
        friendshipService.respondToRequest(
                friendshipId,
                addresseeId,
                (Boolean) body.get("accept")
        );
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<UserDTO>> getFriends(@PathVariable UUID userId) {
        authContext.requireSelf(userId);
        return ResponseEntity.ok(friendshipService.getFriends(userId));
    }

    @GetMapping("/{userId}/pending")
    public ResponseEntity<List<FriendRequestDTO>> getPendingRequests(@PathVariable UUID userId) {
        authContext.requireSelf(userId);
        return ResponseEntity.ok(friendshipService.getPendingRequests(userId));
    }

    @DeleteMapping
    public ResponseEntity<Void> removeFriend(@RequestBody Map<String, String> body) {
        UUID userId = UUID.fromString(body.get("userId"));
        authContext.requireSelf(userId);
        friendshipService.removeFriend(
                userId,
                UUID.fromString(body.get("friendId")));
        return ResponseEntity.ok().build();
    }
}
