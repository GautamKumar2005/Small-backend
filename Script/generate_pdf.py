import sys
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def create_pdf(output_filename):
    doc = SimpleDocTemplate(output_filename, pagesize=letter, leftMargin=40, rightMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        name='CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        spaceAfter=14,
        textColor=colors.HexColor('#1E293B'),
        leading=22
    )
    
    heading_style = ParagraphStyle(
        name='CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        spaceAfter=10,
        spaceBefore=14,
        textColor=colors.HexColor('#334155'),
        leading=18
    )
    
    body_style = ParagraphStyle(
        name='CustomBody',
        parent=styles['Normal'],
        fontSize=11,
        spaceAfter=8,
        leading=15,
        textColor=colors.HexColor('#475569')
    )
    
    code_style = ParagraphStyle(
        name='CustomCode',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=10,
        spaceAfter=8,
        leading=13,
        leftIndent=15,
        textColor=colors.HexColor('#1E293B')
    )

    bullet_style = ParagraphStyle(
        name='CustomBullet',
        parent=styles['Normal'],
        fontSize=11,
        spaceAfter=6,
        leading=15,
        leftIndent=15,
        bulletIndent=8,
        textColor=colors.HexColor('#475569')
    )

    story = []
    
    # Title
    story.append(Paragraph("<b>Capstone Report: Embeddable Widget & Lead-Capture Platform</b>", title_style))
    story.append(Paragraph("<b>Track:</b> Backend AI Engineering — Week 9 Capstone | <b>Workload:</b> 32h", body_style))
    story.append(Paragraph("<b>Repository:</b> <a href='https://github.com/GautamKumar2005/Small-backend/tree/main/Script' color='blue'>https://github.com/GautamKumar2005/Small-backend/tree/main/Script</a>", body_style))
    story.append(Spacer(1, 10))
    
    # 1. Executive Summary
    story.append(Paragraph("<b>1. Executive Summary</b>", heading_style))
    story.append(Paragraph("This capstone project builds a production-grade, cross-origin Embeddable Widget and Lead-Capture Platform. Customers can define customizable widgets via an authenticated Admin API, copy a one-line &lt;script&gt; embed snippet, and place it on any external website. Because submission endpoints face untrusted browsers across the public internet, the system implements comprehensive security hardening: CORS preflight handling, boundary size checking (413 Payload Too Large), spam honeypot filters (422 Unprocessable Entity), burst rate limiting (429 Too Many Requests), a 3-provider IP-to-Geo fallback chain, and safe side-effect decoupling.", body_style))
    story.append(Spacer(1, 8))

    # 2. Key Deliverables & Architecture
    story.append(Paragraph("<b>2. Key Architectural Deliverables Built</b>", heading_style))
    story.append(Paragraph("• <b>Authenticated Admin API:</b> Tenant-isolated CRUD for widgets, embed snippet generator, and live analytics.", bullet_style))
    story.append(Paragraph("• <b>CDN Config Delivery:</b> Serves minified JS assets and JSON config with CDN Cache-Control and ETag (304 Not Modified).", bullet_style))
    story.append(Paragraph("• <b>CORS & Boundary Validation:</b> Explicit OPTIONS preflight handling (204) and Content-Length boundary checks (413).", bullet_style))
    story.append(Paragraph("• <b>3-Provider Enrichment Fallback Chain:</b> IP to Geo resolution trying primary → secondary → fallback providers in sequence. Includes an admin toggle to simulate primary failure and verify zero-error failover.", bullet_style))
    story.append(Paragraph("• <b>Abuse Resistance:</b> Automatic honeypot detection (_hp_trap), timing heuristics (< 1.2s), and sliding-window rate limiting (10 requests/min).", bullet_style))
    story.append(Paragraph("• <b>Safe Side-Effect Decoupling:</b> Async email/webhook notification dispatch wrapped in error isolation so upstream failures never fail the lead submission (HTTP 201).", bullet_style))
    story.append(Spacer(1, 8))

    # 3. Automated Test Summary Table
    story.append(Paragraph("<b>3. Automated Verification Results (10 PASSED / 0 FAILED)</b>", heading_style))
    
    table_data = [
        [Paragraph("<b>Test Case</b>", body_style), Paragraph("<b>Requirement Verified</b>", body_style), Paragraph("<b>Status</b>", body_style)],
        [Paragraph("1. Cache-Control & ETag", body_style), Paragraph("GET /api/widgets/:id/config returns cache headers", body_style), Paragraph("<b>PASS (200)</b>", body_style)],
        [Paragraph("2. 304 Not Modified", body_style), Paragraph("If-None-Match ETag header returns 304 Not Modified", body_style), Paragraph("<b>PASS (304)</b>", body_style)],
        [Paragraph("3. CORS Preflight", body_style), Paragraph("OPTIONS request returns correct ACAO origin headers", body_style), Paragraph("<b>PASS (204)</b>", body_style)],
        [Paragraph("4. Malformed Payload", body_style), Paragraph("Invalid JSON / empty body rejected with 400", body_style), Paragraph("<b>PASS (400)</b>", body_style)],
        [Paragraph("5. Oversized Payload", body_style), Paragraph("Payload > 10 KB rejected immediately with 413", body_style), Paragraph("<b>PASS (413)</b>", body_style)],
        [Paragraph("6. Primary Geo Enrichment", body_style), Paragraph("Clean lead enriched by mock-geo-primary", body_style), Paragraph("<b>PASS (201)</b>", body_style)],
        [Paragraph("7. Geo Fallback Chain", body_style), Paragraph("Primary DOWN -> seamless failover to mock-geo-secondary", body_style), Paragraph("<b>PASS (201)</b>", body_style)],
        [Paragraph("8. Safe Side Effects", body_style), Paragraph("Upstream SMTP/webhook failure never fails submission", body_style), Paragraph("<b>PASS (201)</b>", body_style)],
        [Paragraph("9. Honeypot Spam Filter", body_style), Paragraph("Hidden _hp_trap field rejected by spam filter", body_style), Paragraph("<b>PASS (422)</b>", body_style)],
        [Paragraph("10. Burst Rate Limiting", body_style), Paragraph("12 rapid requests trigger HTTP 429 Too Many Requests", body_style), Paragraph("<b>PASS (429)</b>", body_style)],
    ]

    table = Table(table_data, colWidths=[130, 290, 90])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F1F5F9')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#1E293B')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
    ]))
    story.append(table)
    story.append(Spacer(1, 14))

    # 4. How to Run Locally
    story.append(Paragraph("<b>4. How to Run & Execute Live Demo</b>", heading_style))
    story.append(Paragraph("1. Start the platform servers (`npm start` starts port 3000 and demo site on port 3001).", body_style))
    story.append(Paragraph("2. Open the Owner Dashboard at <b>http://localhost:3000/dashboard.html</b>.", body_style))
    story.append(Paragraph("3. Open the Demo Customer Site at <b>http://localhost:3001/customer-site.html</b> to test cross-origin lead capture.", body_style))
    story.append(Paragraph("4. Use the Dashboard's <b>Resilience & Attack Demo</b> panel to trigger CORS, rate limit bursts, spam traps, and geo provider failovers live.", body_style))

    doc.build(story)
    print(f"Successfully generated PDF report: {output_filename}")

if __name__ == '__main__':
    create_pdf('Script_Project_Report.pdf')
