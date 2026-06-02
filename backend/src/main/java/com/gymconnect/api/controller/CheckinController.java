package com.gymconnect.api.controller;

import com.gymconnect.api.dto.CheckinDTO;
import com.gymconnect.api.dto.LeaderboardEntryDTO;
import com.gymconnect.api.service.CheckinService;
import com.gymconnect.api.service.ReactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/checkins")
@RequiredArgsConstructor
public class CheckinController {

    private final CheckinService checkinService;
    private final ReactionService reactionService;

    @PostMapping
    public ResponseEntity<CheckinDTO> checkin(@RequestBody Map<String, String> body) {
        String userId = body.get("userId");
        String gymName = body.get("gymName");
        String note = body.get("note");
        return ResponseEntity.ok(checkinService.checkin(userId, gymName, note));
    }

    @GetMapping("/feed/{userId}")
    public ResponseEntity<List<CheckinDTO>> getFeed(@PathVariable String userId) {
        return ResponseEntity.ok(checkinService.getFriendsFeed(userId));
    }

    @GetMapping("/leaderboard/{userId}")
    public ResponseEntity<List<LeaderboardEntryDTO>> getLeaderboard(@PathVariable String userId) {
        return ResponseEntity.ok(checkinService.getWeeklyLeaderboard(userId));
    }

    @PostMapping("/{checkinId}/react")
    public ResponseEntity<Map<String, Boolean>> react(
            @PathVariable String checkinId,
            @RequestBody Map<String, String> body) {
        boolean added = reactionService.toggleReaction(checkinId, body.get("userId"));
        return ResponseEntity.ok(Map.of("reacted", added));
    }
}
