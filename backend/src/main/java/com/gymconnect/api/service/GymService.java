package com.gymconnect.api.service;

import com.gymconnect.api.dto.*;
import com.gymconnect.api.entity.Checkin;
import com.gymconnect.api.entity.Gym;
import com.gymconnect.api.entity.GymMembership;
import com.gymconnect.api.entity.User;
import com.gymconnect.api.repository.CheckinRepository;
import com.gymconnect.api.repository.GymMembershipRepository;
import com.gymconnect.api.repository.GymRepository;
import com.gymconnect.api.repository.UserRepository;
import com.gymconnect.api.util.GeoUtil;
import com.gymconnect.api.util.Names;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GymService {

    private final GymRepository gymRepository;
    private final GymMembershipRepository membershipRepository;
    private final CheckinRepository checkinRepository;
    private final UserRepository userRepository;
    private final CheckinService checkinService;

    private static final int DEFAULT_RADIUS_METERS = 150; // generous — accounts for weak indoor GPS
    private static final int NEARBY_SEARCH_METERS = 2000;
    private static final int HERE_NOW_MINUTES = 90;

    // --- Creation (Case B directory pick, or Case C-onsite manual) ---
    @Transactional
    public GymDTO createGym(UUID userId, CreateGymRequest req) {
        Gym.Source source;
        try {
            source = Gym.Source.valueOf(req.getSource());
        } catch (Exception e) {
            throw new IllegalArgumentException("source must be MAPPLS or MANUAL");
        }
        if (req.getName() == null || req.getName().isBlank()) {
            throw new IllegalArgumentException("Gym name is required");
        }
        if (req.getLat() == null || req.getLng() == null) {
            throw new IllegalArgumentException("Gym location is required");
        }

        if (source == Gym.Source.MAPPLS) {
            if (req.getMapplsPlaceId() == null || req.getMapplsPlaceId().isBlank()) {
                throw new IllegalArgumentException("mapplsPlaceId is required for MAPPLS gyms");
            }
            // Dedup by POI — same place resolves to the existing gym (and joins the caller).
            Optional<Gym> existing = gymRepository.findByMapplsPlaceId(req.getMapplsPlaceId());
            if (existing.isPresent()) {
                ensureMember(userId, existing.get().getId());
                return toDTO(existing.get(), userId, null);
            }
        }

        Gym gym = new Gym();
        gym.setName(req.getName().trim());
        gym.setAddress(req.getAddress());
        gym.setLat(req.getLat());
        gym.setLng(req.getLng());
        gym.setRadiusMeters(req.getRadiusMeters() != null ? req.getRadiusMeters() : DEFAULT_RADIUS_METERS);
        gym.setSource(source);
        gym.setMapplsPlaceId(source == Gym.Source.MAPPLS ? req.getMapplsPlaceId() : null);
        gym.setCreatedByUserId(userId);
        gym.setLocationStatus(Gym.LocationStatus.CONFIRMED); // Stage 1: B & C-onsite both confirmed
        gymRepository.save(gym);

        ensureMember(userId, gym.getId());
        return toDTO(gym, userId, null);
    }

    // --- Discovery / dedup (Case A) ---
    public List<GymDTO> getNearby(UUID userId, double lat, double lng) {
        double dLat = GeoUtil.latDegrees(NEARBY_SEARCH_METERS);
        double dLng = GeoUtil.lngDegrees(NEARBY_SEARCH_METERS, lat);
        return gymRepository.findWithinBox(lat - dLat, lat + dLat, lng - dLng, lng + dLng).stream()
                .filter(g -> GeoUtil.haversineMeters(lat, lng, g.getLat(), g.getLng()) <= NEARBY_SEARCH_METERS)
                .sorted(Comparator.comparingDouble(g -> GeoUtil.haversineMeters(lat, lng, g.getLat(), g.getLng())))
                .map(g -> toDTO(g, userId, GeoUtil.haversineMeters(lat, lng, g.getLat(), g.getLng())))
                .collect(Collectors.toList());
    }

    public List<GymDTO> getMyGyms(UUID userId) {
        return membershipRepository.findByUserId(userId).stream()
                .map(m -> gymRepository.findById(m.getGymId()).orElse(null))
                .filter(Objects::nonNull)
                .map(g -> toDTO(g, userId, null))
                .collect(Collectors.toList());
    }

    public GymDTO getGym(UUID userId, UUID gymId) {
        return toDTO(requireGym(gymId), userId, null);
    }

    // --- Membership ---
    @Transactional
    public GymDTO joinGym(UUID userId, UUID gymId) {
        Gym gym = requireGym(gymId);
        ensureMember(userId, gymId);
        return toDTO(gym, userId, null);
    }

    @Transactional
    public void leaveGym(UUID userId, UUID gymId) {
        membershipRepository.findByGymIdAndUserId(gymId, userId)
                .ifPresent(membershipRepository::delete);
    }

    @Transactional
    public void setVisibility(UUID userId, UUID gymId, boolean visible) {
        membershipRepository.findByGymIdAndUserId(gymId, userId).ifPresent(m -> {
            m.setVisible(visible);
            membershipRepository.save(m);
        });
    }

    // --- Scan → geofence → verified check-in (auto-joins) ---
    @Transactional
    public GymCheckinResponse checkinViaQr(UUID userId, String qrToken, double lat, double lng) {
        Gym gym = gymRepository.findByQrToken(qrToken)
                .orElseThrow(() -> new IllegalArgumentException("Unknown gym code"));

        double dist = GeoUtil.haversineMeters(lat, lng, gym.getLat(), gym.getLng());
        if (dist > gym.getRadiusMeters()) {
            // Not physically there — no check-in recorded (gym check-ins are always verified).
            return new GymCheckinResponse(false, dist, null,
                    "You're " + Math.round(dist) + "m from " + gym.getName() + " — get closer to check in.");
        }

        ensureMember(userId, gym.getId());
        CheckinDTO checkin = checkinService.checkinAtGym(userId, gym.getId(), gym.getName(), true);
        return new GymCheckinResponse(true, dist, checkin, "Checked in at " + gym.getName() + " ✅");
    }

    // --- Roster + who's-here-now ---
    public List<RosterEntryDTO> getRoster(UUID userId, UUID gymId) {
        requireGym(gymId);
        Set<UUID> hereNow = hereNowUserIds(gymId);

        // Visible members, plus always the requesting user (so they see themselves even if hidden).
        List<UUID> ids = membershipRepository.findByGymId(gymId).stream()
                .filter(m -> m.isVisible() || m.getUserId().equals(userId))
                .map(GymMembership::getUserId)
                .collect(Collectors.toList());

        Map<UUID, User> users = userRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        return ids.stream()
                .map(users::get)
                .filter(Objects::nonNull)
                .map(u -> new RosterEntryDTO(
                        u.getId(), Names.shown(u), u.getPhotoUrl(),
                        hereNow.contains(u.getId()),
                        u.getStreakCount() != null ? u.getStreakCount() : 0))
                // Here-now first, then alphabetical.
                .sorted(Comparator.comparing(RosterEntryDTO::isHereNow).reversed()
                        .thenComparing(r -> r.getDisplayName() == null ? "" : r.getDisplayName().toLowerCase()))
                .collect(Collectors.toList());
    }

    // --- Gym-scoped weekly leaderboard ---
    public List<LeaderboardEntryDTO> getLeaderboard(UUID userId, UUID gymId) {
        requireGym(gymId);
        LocalDateTime weekStart = LocalDate.now()
                .with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).atStartOfDay();

        Map<UUID, Long> counts = checkinRepository.countCheckinsThisWeekAtGym(gymId, weekStart).stream()
                .collect(Collectors.toMap(r -> (UUID) r[0], r -> (Long) r[1]));

        List<UUID> ids = membershipRepository.findByGymId(gymId).stream()
                .filter(m -> m.isVisible() || m.getUserId().equals(userId))
                .map(GymMembership::getUserId)
                .collect(Collectors.toList());

        List<LeaderboardEntryDTO> board = new ArrayList<>();
        for (User u : userRepository.findAllById(ids)) {
            int count = counts.getOrDefault(u.getId(), 0L).intValue();
            board.add(new LeaderboardEntryDTO(u.getId(), Names.shown(u), u.getPhotoUrl(),
                    count, u.getStreakCount() != null ? u.getStreakCount() : 0));
        }
        board.sort(Comparator.comparingInt(LeaderboardEntryDTO::getCheckinsThisWeek).reversed());
        return board;
    }

    // --- helpers ---
    private void ensureMember(UUID userId, UUID gymId) {
        if (!membershipRepository.existsByGymIdAndUserId(gymId, userId)) {
            GymMembership m = new GymMembership();
            m.setGymId(gymId);
            m.setUserId(userId);
            membershipRepository.save(m);
        }
    }

    private Gym requireGym(UUID gymId) {
        return gymRepository.findById(gymId)
                .orElseThrow(() -> new IllegalArgumentException("Gym not found"));
    }

    private Set<UUID> hereNowUserIds(UUID gymId) {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(HERE_NOW_MINUTES);
        return checkinRepository.findByGymIdAndVerifiedTrueAndCreatedAtAfter(gymId, cutoff).stream()
                .map(Checkin::getUserId)
                .collect(Collectors.toSet());
    }

    private GymDTO toDTO(Gym g, UUID userId, Double distanceMeters) {
        GymDTO d = new GymDTO();
        d.setId(g.getId());
        d.setName(g.getName());
        d.setAddress(g.getAddress());
        d.setLat(g.getLat());
        d.setLng(g.getLng());
        d.setRadiusMeters(g.getRadiusMeters());
        d.setSource(g.getSource().name());
        d.setLocationStatus(g.getLocationStatus().name());
        d.setQrToken(g.getQrToken());
        d.setMemberCount(membershipRepository.countByGymId(g.getId()));
        d.setHereNowCount(hereNowUserIds(g.getId()).size());
        d.setMember(membershipRepository.existsByGymIdAndUserId(g.getId(), userId));
        d.setDistanceMeters(distanceMeters);
        return d;
    }
}
