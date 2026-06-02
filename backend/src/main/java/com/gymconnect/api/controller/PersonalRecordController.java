package com.gymconnect.api.controller;

import com.gymconnect.api.dto.PersonalRecordDTO;
import com.gymconnect.api.service.PersonalRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/prs")
@RequiredArgsConstructor
public class PersonalRecordController {
    private final PersonalRecordService prService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PersonalRecordDTO>> getUserPRs(@PathVariable String userId) {
        return ResponseEntity.ok(prService.getUserPRs(userId));
    }

    @PostMapping
    public ResponseEntity<PersonalRecordDTO> createPR(@RequestBody PersonalRecordDTO dto) {
        return ResponseEntity.ok(prService.createPR(dto.getUserId(), dto));
    }
}
