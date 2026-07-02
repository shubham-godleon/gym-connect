package com.gymconnect.api.repository;

import com.gymconnect.api.entity.Gym;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GymRepository extends JpaRepository<Gym, UUID> {

    Optional<Gym> findByQrToken(String qrToken);

    Optional<Gym> findByMapplsPlaceId(String mapplsPlaceId);

    // Coarse bounding-box prefilter; callers refine with a precise Haversine distance.
    @Query("SELECT g FROM Gym g WHERE g.lat BETWEEN :minLat AND :maxLat AND g.lng BETWEEN :minLng AND :maxLng")
    List<Gym> findWithinBox(@Param("minLat") double minLat, @Param("maxLat") double maxLat,
                            @Param("minLng") double minLng, @Param("maxLng") double maxLng);
}
