package com.gymconnect.api.controller;

import com.gymconnect.api.dto.CheckinDTO;
import com.gymconnect.api.dto.CheckinDayDTO;
import com.gymconnect.api.dto.FeedItemDTO;
import com.gymconnect.api.dto.LeaderboardEntryDTO;
import com.gymconnect.api.security.AuthContext;
import com.gymconnect.api.service.CheckinService;
import com.gymconnect.api.service.ReactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/checkins")
@RequiredArgsConstructor
public class CheckinController {

    private final CheckinService checkinService;
    private final ReactionService reactionService;
    private final AuthContext authContext;

    @PostMapping
    public ResponseEntity<?> checkin(@RequestBody Map<String, String> body) {
        UUID userId = UUID.fromString(body.get("userId"));
        authContext.requireSelf(userId);
        String location = body.get("location");
        try {
            return ResponseEntity.ok(checkinService.checkin(userId, location));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/feed/{userId}")
    public ResponseEntity<List<FeedItemDTO>> getFeed(
            @PathVariable UUID userId,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        if (page != null || size != null) {
            return ResponseEntity.ok(checkinService.getFriendsFeed(userId, page != null ? page : 0, size != null ? size : 20));
        }
        return ResponseEntity.ok(checkinService.getFriendsFeed(userId));
    }

    @GetMapping("/calendar/{userId}/{year}")
    public ResponseEntity<List<CheckinDayDTO>> getCalendar(@PathVariable UUID userId, @PathVariable int year) {
        return ResponseEntity.ok(checkinService.getCalendar(userId, year));
    }

    @GetMapping("/leaderboard/{userId}")
    public ResponseEntity<List<LeaderboardEntryDTO>> getLeaderboard(@PathVariable UUID userId) {
        return ResponseEntity.ok(checkinService.getWeeklyLeaderboard(userId));
    }

    @PostMapping("/{checkinId}/react")
    public ResponseEntity<Map<String, Boolean>> react(
            @PathVariable UUID checkinId,
            @RequestBody Map<String, String> body) {
        UUID fromUserId = UUID.fromString(body.get("userId"));
        authContext.requireSelf(fromUserId);
        boolean added = reactionService.toggleReaction(checkinId, fromUserId);
        return ResponseEntity.ok(Map.of("reacted", added));
    }
}
