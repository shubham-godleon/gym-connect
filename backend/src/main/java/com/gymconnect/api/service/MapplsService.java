package com.gymconnect.api.service;

import com.gymconnect.api.dto.GymSearchResultDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Proxies the Mappls Search APIs for Case-B gym creation. Holds the OAuth
 * client-credentials server-side; the mobile app never sees them. Token is
 * cached until shortly before expiry.
 */
@Service
@Slf4j
public class MapplsService {

    private final String clientId;
    private final String clientSecret;
    private final String tokenUrl;
    private final String baseUrl;
    private final RestTemplate rest = new RestTemplate();

    private volatile String cachedToken;
    private volatile long tokenExpiryEpochSec;

    public MapplsService(
            @Value("${mappls.client-id:}") String clientId,
            @Value("${mappls.client-secret:}") String clientSecret,
            @Value("${mappls.token-url}") String tokenUrl,
            @Value("${mappls.base-url}") String baseUrl) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.tokenUrl = tokenUrl;
        this.baseUrl = baseUrl;
    }

    public boolean isConfigured() {
        return clientId != null && !clientId.isBlank()
                && clientSecret != null && !clientSecret.isBlank();
    }

    /** Search gyms: keyword-nearby when q is blank, else text search biased to the location. */
    public List<GymSearchResultDTO> searchGyms(String q, Double lat, Double lng) {
        String token = getToken();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        String url;
        if (q != null && !q.isBlank()) {
            url = baseUrl + "/api/places/search/json?query=" + enc(q);
            if (lat != null && lng != null) url += "&location=" + lat + "," + lng;
        } else {
            if (lat == null || lng == null) {
                throw new IllegalArgumentException("Provide a search term or your location");
            }
            url = baseUrl + "/api/places/nearby/json?keywords=gym&refLocation=" + lat + "," + lng;
        }

        ResponseEntity<Map> resp = rest.exchange(url, HttpMethod.GET, new HttpEntity<>(headers), Map.class);
        return parseResults(resp.getBody());
    }

    @SuppressWarnings("unchecked")
    private List<GymSearchResultDTO> parseResults(Map<String, Object> body) {
        List<GymSearchResultDTO> out = new ArrayList<>();
        if (body == null) return out;
        Object locs = body.get("suggestedLocations");
        if (!(locs instanceof List)) return out;

        for (Object o : (List<Object>) locs) {
            if (!(o instanceof Map)) continue;
            Map<String, Object> m = (Map<String, Object>) o;
            Double lat = toDouble(m.get("latitude"));
            Double lng = toDouble(m.get("longitude"));
            if (lat == null || lng == null) continue; // no coords -> unusable for geofencing
            out.add(new GymSearchResultDTO(
                    str(m.get("eLoc")),
                    str(m.get("placeName")),
                    str(m.get("placeAddress")),
                    lat, lng,
                    toDouble(m.get("distance"))));
        }
        return out;
    }

    private synchronized String getToken() {
        long now = Instant.now().getEpochSecond();
        if (cachedToken != null && now < tokenExpiryEpochSec - 30) return cachedToken;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "client_credentials");
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);

        ResponseEntity<Map> resp = rest.postForEntity(tokenUrl, new HttpEntity<>(form, headers), Map.class);
        Map<String, Object> b = resp.getBody();
        if (b == null || b.get("access_token") == null) {
            throw new IllegalStateException("Mappls token response had no access_token");
        }
        cachedToken = str(b.get("access_token"));
        Object expiresIn = b.get("expires_in");
        long ttl = (expiresIn instanceof Number) ? ((Number) expiresIn).longValue() : 3600L;
        tokenExpiryEpochSec = now + ttl;
        return cachedToken;
    }

    private static String enc(String s) {
        return UriUtils.encode(s, StandardCharsets.UTF_8);
    }

    private static String str(Object o) {
        return o == null ? null : String.valueOf(o);
    }

    private static Double toDouble(Object o) {
        if (o == null) return null;
        if (o instanceof Number) return ((Number) o).doubleValue();
        try {
            return Double.parseDouble(String.valueOf(o));
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
