package com.gymconnect.api.service;

import com.gymconnect.api.entity.Checkin;
import com.gymconnect.api.entity.Reaction;
import com.gymconnect.api.entity.User;
import com.gymconnect.api.repository.CheckinRepository;
import com.gymconnect.api.repository.ReactionRepository;
import com.gymconnect.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReactionService {

    private final ReactionRepository reactionRepository;
    private final CheckinRepository checkinRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

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
                    notifyCheckinOwner(checkinId, fromUserId);
                    return true; // added
                });
    }

    private void notifyCheckinOwner(String checkinId, String fromUserId) {
        checkinRepository.findById(checkinId).ifPresent(checkin -> {
            if (checkin.getUserId().equals(fromUserId)) return; // don't notify self
            userRepository.findById(checkin.getUserId()).ifPresent(owner -> {
                if (owner.getFcmToken() == null) return;
                userRepository.findById(fromUserId).ifPresent(reactor ->
                        notificationService.sendFistBump(owner.getFcmToken(), reactor.getDisplayName())
                );
            });
        });
    }
}
