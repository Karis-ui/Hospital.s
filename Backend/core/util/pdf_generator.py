from django.template.loader import get_template
from xhtml2pdf import pisa
from io import BytesIO

def generate_pdf(template_path,context):
    template = get_template(template_path)
    html = template.render(context)
    result = BytesIO()

    pdf = pisa.pisaDocument(BytesIO(html.encode("UTF-8")),result)
    if not pdf.err:
        return result.getvalue()
    return None