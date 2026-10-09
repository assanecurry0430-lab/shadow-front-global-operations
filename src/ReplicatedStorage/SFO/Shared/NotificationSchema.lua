local NotificationSchema = {}

NotificationSchema.Priorities = {
    "info",
    "service",
    "caution",
    "urgent",
    "critical",
}

NotificationSchema.Types = {
    "world_news",
    "service_order",
    "mission_offer",
    "mission_prep",
    "crisis_alert",
    "player_message",
    "leave_update",
}

return NotificationSchema
