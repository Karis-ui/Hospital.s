from django.apps import AppConfig
from django.db.models.signals import post_migrate

class SystemConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'system'

    def ready(self):
        from . import signals
        post_migrate.connect(signals.create_default_settings,sender=self)