package com.gymconnect.api.util;

import com.gymconnect.api.entity.User;

public final class Names {

    private Names() {}

    /** The single name to show for a user — their username, falling back to displayName. */
    public static String shown(User u) {
        if (u == null) return "Someone";
        return (u.getUsername() != null && !u.getUsername().isBlank()) ? u.getUsername() : u.getDisplayName();
    }
}
