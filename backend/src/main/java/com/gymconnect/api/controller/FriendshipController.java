package com.gymconnect.api.controller;

import com.gymconnect.api.dto.UserDTO;
import com.gymconnect.api.entity.Friendship;
import com.gymconnect.api.service.FriendshipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/friends")
@RequiredArgsConstructor
public class FriendshipController {

    private final FriendshipService friendshipService;

    @PostMapping("/request")
    public ResponseEntity<Void> sendRequest(@RequestBody Map<String, String> body) {
        friendshipService.sendRequest(body.get("requesterId"), body.get("addresseeId"));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{friendshipId}/respond")
    public ResponseEntity<Void> respond(
            @PathVariable String friendshipId,
            @RequestBody Map<String, Object> body) {
        friendshipService.respondToRequest(
                friendshipId,
                (String) body.get("addresseeId"),
                (Boolean) body.get("accept")
        );
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<UserDTO>> getFriends(@PathVariable String userId) {
        return ResponseEntity.ok(friendshipService.getFriends(userId));
    }

    @GetMapping("/{userId}/pending")
    public ResponseEntity<List<Friendship>> getPendingRequests(@PathVariable String userId) {
        return ResponseEntity.ok(friendshipService.getPendingRequests(userId));
    }

    @DeleteMapping
    public ResponseEntity<Void> removeFriend(@RequestBody Map<String, String> body) {
        friendshipService.removeFriend(body.get("userId"), body.get("friendId"));
        return ResponseEntity.ok().build();
    }
}
