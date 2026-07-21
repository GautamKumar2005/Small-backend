from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def create_pdf(output_filename):
    doc = SimpleDocTemplate(output_filename, pagesize=letter)
    styles = getSampleStyleSheet()
    
    # Custom styles with font size 13
    title_style = ParagraphStyle(
        name='CustomTitle',
        parent=styles['Heading1'],
        fontSize=16,
        spaceAfter=14
    )
    
    heading_style = ParagraphStyle(
        name='CustomHeading',
        parent=styles['Heading2'],
        fontSize=13,
        spaceAfter=10,
        spaceBefore=12,
        textColor='#2C3E50'
    )
    
    body_style = ParagraphStyle(
        name='CustomBody',
        parent=styles['Normal'],
        fontSize=13,
        spaceAfter=8,
        leading=16
    )
    
    code_style = ParagraphStyle(
        name='CustomCode',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=11,
        spaceAfter=8,
        leading=14,
        leftIndent=20,
        textColor='#34495E'
    )

    bullet_style = ParagraphStyle(
        name='CustomBullet',
        parent=styles['Normal'],
        fontSize=13,
        spaceAfter=8,
        leading=16,
        leftIndent=20,
        bulletIndent=10
    )

    story = []
    
    # Title
    story.append(Paragraph("Web Scraper for RAG Pipeline", title_style))
    
    # Repository Link
    story.append(Paragraph("<b>1. Project Repository:</b> <a href='https://github.com/GautamKumar2005/Small-backend/tree/main/RAG' color='blue'>https://github.com/GautamKumar2005/Small-backend/tree/main/RAG</a>", body_style))
    story.append(Spacer(1, 10))
    
    # Tools & Language Used
    story.append(Paragraph("2. Language & Tools Used", heading_style))
    story.append(Paragraph("<b>Programming Language:</b> Python (v3.12)", bullet_style))
    story.append(Paragraph("<b>Libraries / Tools:</b>", bullet_style))
    tools = [
        "<b>requests</b>: For handling HTTP communication and sessions.",
        "<b>urllib3</b>: Utilized for robust retry logic and network backoff.",
        "<b>BeautifulSoup4 (bs4)</b>: For parsing HTML DOM and extracting text.",
        "<b>urllib.robotparser</b>: Native Python tool to strictly adhere to robots.txt."
    ]
    for tool in tools:
        story.append(Paragraph(f"• {tool}", ParagraphStyle(name='SubBullet', parent=bullet_style, leftIndent=40)))

    # Steps to Proceed
    story.append(Paragraph("3. Steps to Proceed (How to Process)", heading_style))
    story.append(Paragraph("To execute the scraper locally, follow these steps in your terminal:", body_style))
    story.append(Paragraph("Step 1: Install the required dependencies.", body_style))
    story.append(Paragraph("pip install -r requirements.txt", code_style))
    story.append(Paragraph("Step 2: Run the scraping script.", body_style))
    story.append(Paragraph("python scraper.py", code_style))
    story.append(Paragraph("The script will automatically parse robots.txt, begin traversing the site using a 1-second polite rate limit, and save the data.", body_style))

    # How Output Comes
    story.append(Paragraph("4. How Output Comes", heading_style))
    story.append(Paragraph("The output is generated incrementally and saved into a line-delimited JSON format file named <b>corpus.jsonl</b>. This format is the industry standard for RAG embeddings.", body_style))
    story.append(Paragraph("An example of a single extracted record looks like this:", body_style))
    example_json = (
        '{"text": "The world as we have created it is a process of our thinking...", '
        '"author": "Albert Einstein", '
        '"tags": ["change", "deep-thoughts", "thinking", "world"], '
        '"source_url": "http://quotes.toscrape.com/", '
        '"scraped_at": "2026-07-18T16:13:33.797455Z"}'
    )
    story.append(Paragraph(example_json, code_style))
    
    # Conclusion
    story.append(Paragraph("5. Conclusion", heading_style))
    story.append(Paragraph("This project successfully demonstrates the construction of a professional-grade web scraper. By implementing robots.txt compliance, resilience against server errors through automated retries, polite rate limiting, and clean text extraction stripped of artifacts, the resulting <b>corpus.jsonl</b> dataset is perfectly primed for ingestion into vector databases and embedding models for a Retrieval-Augmented Generation pipeline.", body_style))
    
    doc.build(story)

if __name__ == "__main__":
    create_pdf("RAG_Scraper_Explanation.pdf")
    print("PDF generated successfully.")
