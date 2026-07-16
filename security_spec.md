# Security Specification for DevScope Firestore

## Data Invariants
1. A student's profile inside `/users/{userId}` can only be accessed or modified by the authenticated user whose `request.auth.uid == userId`.
2. A student's logged activities inside `/users/{userId}/activities/{activityId}` can only be read or written by the authenticated owner.
3. Synchronized Google Calendar events or mock schedules inside `/users/{userId}/events/{eventId}` can only be managed by the owner.
4. Immature email or identity spoofing is rejected: Any write to `users/{userId}` must verify `request.auth.token.email_verified == true`.

## The "Dirty Dozen" Payloads (Vulnerability Scenarios)
1. **Malicious Profile Write (Identity Spoofing)**: Attacker attempts to update `users/targetUser` with their own credentials.
2. **Ghost Field Injection**: Attacker tries to inject an unauthorized `isAdmin` or `role` property into `users/myUser`.
3. **Activity Log Scraping**: Attacker attempts to read logs belonging to `/users/otherUser/activities/log123`.
4. **Anonymously Authored Write**: Unauthenticated user tries to register a profile.
5. **Payload Size Flood**: Attacker tries to write a 10MB string into `gitUsername`.
6. **Path character poisoning**: Attempting to inject SQL or path injection characters inside `{userId}`.
7. **Malicious Calendar Event Insertion**: Attacker tries to insert an event into another user's calendar event collection.
8. **Invalid Enum Injection**: Attacker tries to inject an invalid `module` name (e.g. "HACKED") into their activities.
9. **Spamming Future Timestamps**: Attacker tries to set a future or spoofed `updatedAt` instead of `request.time`.
10. **Unverified Email Signup**: Write profile with `email_verified == false`.
11. **Immutability Breach**: Attempting to change the `uid` property after creation.
12. **Blanket Query Scraping**: Attempting to read all activities from all users without filter restrictions.

## Security Rules Test Definition
All of the above scenarios will be blocked by `firestore.rules`.
