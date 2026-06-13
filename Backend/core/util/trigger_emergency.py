def trigger_emergency(user):
    return user.user_type in ['doctor','admin']