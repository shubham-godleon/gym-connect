package com.gymconnect.api.controller;

import com.gymconnect.api.dto.*;
import com.gymconnect.api.security.AuthContext;
import com.gymconnect.api.service.GymService;
import com.gymconnect.api.service.MapplsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/gyms")
@RequiredArgsConstructor
public class GymController {

    private final GymService gymService;
    private final MapplsService mapplsService;
    private final AuthContext authContext;

    @PostMapping
    public ResponseEntity<GymDTO> create(@RequestBody CreateGymRequest req) {
        return ResponseEntity.ok(gymService.createGym(authContext.currentUserId(), req));
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<GymDTO>> nearby(@RequestParam double lat, @RequestParam double lng) {
        return ResponseEntity.ok(gymService.getNearby(authContext.currentUserId(), lat, lng));
    }

    // Case-B directory search (Mappls proxy). Returns candidate places to create a gym from.
    @GetMapping("/search")
    public ResponseEntity<List<GymSearchResultDTO>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng) {
        authContext.currentUserId(); // require auth
        if (!mapplsService.isConfigured()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Gym directory search is not configured");
        }
        return ResponseEntity.ok(mapplsService.searchGyms(q, lat, lng));
    }

    @GetMapping("/mine")
    public ResponseEntity<List<GymDTO>> mine() {
        return ResponseEntity.ok(gymService.getMyGyms(authContext.currentUserId()));
    }

    @GetMapping("/{gymId}")
    public ResponseEntity<GymDTO> get(@PathVariable UUID gymId) {
        return ResponseEntity.ok(gymService.getGym(authContext.currentUserId(), gymId));
    }

    @PostMapping("/{gymId}/join")
    public ResponseEntity<GymDTO> join(@PathVariable UUID gymId) {
        return ResponseEntity.ok(gymService.joinGym(authContext.currentUserId(), gymId));
    }

    @DeleteMapping("/{gymId}/membership")
    public ResponseEntity<Void> leave(@PathVariable UUID gymId) {
        gymService.leaveGym(authContext.currentUserId(), gymId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{gymId}/visibility")
    public ResponseEntity<Void> visibility(@PathVariable UUID gymId, @RequestBody Map<String, Boolean> body) {
        gymService.setVisibility(authContext.currentUserId(), gymId, Boolean.TRUE.equals(body.get("visible")));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/scan/{qrToken}/checkin")
    public ResponseEntity<GymCheckinResponse> checkinViaQr(
            @PathVariable String qrToken, @RequestBody GymCheckinRequest req) {
        if (req.getLat() == null || req.getLng() == null) {
            throw new IllegalArgumentException("Your location is required to check in");
        }
        return ResponseEntity.ok(
                gymService.checkinViaQr(authContext.currentUserId(), qrToken, req.getLat(), req.getLng()));
    }

    @GetMapping("/{gymId}/roster")
    public ResponseEntity<List<RosterEntryDTO>> roster(@PathVariable UUID gymId) {
        return ResponseEntity.ok(gymService.getRoster(authContext.currentUserId(), gymId));
    }

    @GetMapping("/{gymId}/leaderboard")
    public ResponseEntity<List<LeaderboardEntryDTO>> leaderboard(@PathVariable UUID gymId) {
        return ResponseEntity.ok(gymService.getLeaderboard(authContext.currentUserId(), gymId));
    }
}
