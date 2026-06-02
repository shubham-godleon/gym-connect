package com.gymconnect.api.service;

import com.gymconnect.api.entity.Reaction;
import com.gymconnect.api.repository.ReactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReactionService {

    private final ReactionRepository reactionRepository;

    @Transactional
    public boolean toggleReaction(String checkinId, String fromUserId) {
        return reactionRepository.findByCheckinIdAndFromUserId(checkinId, fromUserId)
                .map(existing -> {
                    reactionRepository.delete(existing);
                    return false; // removed
                })
                .orElseGet(() -> {
                    Reaction reaction = new Reaction();
                    reaction.setCheckinId(checkinId);
                    reaction.setFromUserId(fromUserId);
                    reactionRepository.save(reaction);
                    return true; // added
                });
    }
}
