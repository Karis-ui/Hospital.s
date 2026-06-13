from django.conf import settings
from django.core.mail import send_mail,EmailMessage
from django.template.loader import render_to_string

def send_email(to_email,subject,content,template_name,context):
    from_email = settings.EMAIL_HOST_USER
    message = render_to_string(template_name, content)
    email = EmailMessage(subject, message, from_email, to=to_email)

    email.content_subtype = 'html'
    email.send()