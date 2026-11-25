import mimetypes

from django.http import FileResponse
from rest_framework.exceptions import NotFound


def profile_photo_response(photo):
    if not photo:
        raise NotFound('Profile photo has not been uploaded.')

    try:
        photo.open('rb')
    except FileNotFoundError as error:
        raise NotFound('Stored profile photo is missing.') from error

    content_type = mimetypes.guess_type(photo.name)[0] or 'application/octet-stream'
    return FileResponse(photo, content_type=content_type)
