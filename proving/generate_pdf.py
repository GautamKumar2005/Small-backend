import sys
import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def create_pdf(output_filename):
    doc = SimpleDocTemplate(
        output_filename,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    styles = getSampleStyleSheet()
    
    # Palette (Navy / Amber / Slate professional portfolio aesthetic)
    navy_dark = colors.HexColor('#0F172A')
    slate_head = colors.HexColor('#1E293B')
    slate_body = colors.HexColor('#334155')
    accent_amber = colors.HexColor('#D97706')
    accent_blue = colors.HexColor('#2563EB')
    bg_light = colors.HexColor('#F8FAFC')
    bg_alt = colors.HexColor('#F1F5F9')
    border_color = colors.HexColor('#CBD5E1')
    
    title_style = ParagraphStyle(
        name='DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=navy_dark,
        spaceAfter=4
    )
    
    meta_style = ParagraphStyle(
        name='DocMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=slate_body,
        spaceAfter=10
    )
    
    h2_style = ParagraphStyle(
        name='DocH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=accent_amber,
        spaceBefore=10,
        spaceAfter=6
    )
    
    body_style = ParagraphStyle(
        name='DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=slate_body,
        spaceAfter=6
    )
    
    quote_style = ParagraphStyle(
        name='DocQuote',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=12.5,
        textColor=navy_dark,
        spaceAfter=6
    )

    code_style = ParagraphStyle(
        name='DocCode',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=10.5,
        textColor=navy_dark
    )

    table_header_style = ParagraphStyle(
        name='TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white
    )
    
    table_cell_style = ParagraphStyle(
        name='TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10,
        textColor=navy_dark
    )

    table_cell_bold = ParagraphStyle(
        name='TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=10,
        textColor=navy_dark
    )

    story = []
    
    # --- HEADER SECTION ---
    story.append(Paragraph("What Are You Proving? — Proof Statement Report (FL-01)", title_style))
    story.append(Paragraph(
        "<b>Author:</b> Gautam Kumar &nbsp;|&nbsp; <b>Workspace:</b> small-backend/proving &nbsp;|&nbsp; "
        "<b>Track:</b> AI Fluency Week 01 &nbsp;|&nbsp; <b>Date:</b> July 2026",
        meta_style
    ))
    
    # --- PART 1: THE ONE-PARAGRAPH PROOF STATEMENT ---
    story.append(Paragraph("1. The One-Paragraph Proof Statement (Claim + Person + Action)", h2_style))
    statement_text = (
        "<b>\"I can build secure, production-ready backend APIs for third-party widget integrations. "
        "This proof is built specifically for a Senior Engineering Manager or Lead Backend Architect at a B2B SaaS startup "
        "who is hiring a junior backend engineer to own customer-facing integrations and data-capture endpoints. "
        "By examining my <code>small-backend</code> architecture—specifically how I engineered cross-origin resource sharing (CORS) "
        "preflight handshakes, in-memory rate limiting, and webhook lead submissions for an embeddable customer widget—the single "
        "most important action I want them to take is to book a 15-minute technical interview call to inspect my live API endpoints and codebase.\"</b>"
    )
    statement_box = Table([[Paragraph(statement_text, body_style)]], colWidths=[540])
    statement_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#FEF3C7')),
        ('BOX', (0, 0), (-1, -1), 1, accent_amber),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(statement_box)
    story.append(Spacer(1, 8))
    
    # --- PART 2: THE ONE-LINE WHY ---
    story.append(Paragraph("2. The One-Line Honest 'Why' (What This Fixes)", h2_style))
    why_text = (
        "<b>\"A CV or LinkedIn profile can list 'Node.js' and 'REST APIs' as bullet points, but it cannot prove to an engineering manager "
        "that I know how to handle real-world browser security, CORS preflight handshakes, and rate-limited cross-origin requests without breaking production.\"</b>"
    )
    why_box = Table([[Paragraph(why_text, quote_style)]], colWidths=[540])
    why_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), bg_light),
        ('BOX', (0, 0), (-1, -1), 1, accent_blue),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(why_box)
    story.append(Spacer(1, 8))
    
    # --- PART 3: SOCRATIC AI INTERVIEW LOG ---
    story.append(Paragraph("3. Socratic AI Interview Log (How I Owned & Narrowed the Claim)", h2_style))
    interview_dialogue = (
        "<b>Round 1 (Stripping the 'And' Trap):</b> My initial draft claimed full-stack design, frontend, backend, and DevOps. "
        "The AI challenged that claiming everything convinces no one. I pushed back and narrowed the claim to the hardest problem I solved: "
        "<b>secure cross-origin widget communication on port 3000 from an external site on port 3001</b>.<br/>"
        "<b>Round 2 (Narrowing the Audience):</b> The AI challenged who actually reads backend middleware code. I discarded generic recruiters "
        "and targeted the <b>Senior Engineering Manager / Lead Backend Architect</b> at a B2B SaaS startup who evaluates architectural safety.<br/>"
        "<b>Round 3 (Defining the Action & Proof Anchor):</b> I selected <b>booking a 15-minute technical interview call</b> as the primary action. "
        "This statement can only describe my <code>small-backend</code> project because it anchors explicitly on CORS OPTIONS preflight handshakes and rate-limiting middleware."
    )
    interview_box = Table([[Paragraph(interview_dialogue, body_style)]], colWidths=[540])
    interview_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), bg_alt),
        ('BOX', (0, 0), (-1, -1), 1, border_color),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(interview_box)
    story.append(Spacer(1, 8))
    
    # --- PART 4: CODEBASE EVIDENCE & VERIFICATION TABLE ---
    story.append(Paragraph("4. Technical Mapping to small-backend Codebase & Verification Table", h2_style))
    
    code_tree = (
        "small-backend/Script/<br/>"
        "├── public/customer-site.html          --&gt; Third-party embed script host (localhost:3001)<br/>"
        "├── public/cdn/widget.js               --&gt; Async embeddable widget loader<br/>"
        "├── src/middleware/cors.middleware.js  --&gt; HTTP OPTIONS preflight &amp; origin whitelisting<br/>"
        "├── src/middleware/rateLimit.js        --&gt; In-memory sliding window rate limiting (RFC 6585)<br/>"
        "└── src/routes/public.routes.js        --&gt; POST /widgets/:id/submissions endpoint"
    )
    
    code_table = Table([[Paragraph(code_tree, code_style)]], colWidths=[540])
    code_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), bg_light),
        ('BOX', (0, 0), (-1, -1), 0.5, border_color),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(code_table)
    story.append(Spacer(1, 8))
    
    eval_headers = [
        Paragraph("<b>Evaluation Criterion</b>", table_header_style),
        Paragraph("<b>Status</b>", table_header_style),
        Paragraph("<b>Evidence in This Deliverable</b>", table_header_style)
    ]
    
    eval_rows = [
        [
            Paragraph("<b>1. Primary claim is named</b>", table_cell_bold),
            Paragraph("<b>PASS</b>", table_cell_bold),
            Paragraph("<i>\"I can build secure, production-ready backend APIs for third-party widget integrations.\"</i> (No laundry list of skills).", table_cell_style)
        ],
        [
            Paragraph("<b>2. Audience is a specific person</b>", table_cell_bold),
            Paragraph("<b>PASS</b>", table_cell_bold),
            Paragraph("Targeted at a <b>Senior Engineering Manager or Lead Backend Architect at a B2B SaaS startup</b>.", table_cell_style)
        ],
        [
            Paragraph("<b>3. Single primary action</b>", table_cell_bold),
            Paragraph("<b>PASS</b>", table_cell_bold),
            Paragraph("Action: <b>\"Book a 15-minute technical interview call to inspect my live API endpoints and codebase.\"</b>", table_cell_style)
        ],
        [
            Paragraph("<b>4. Unique to this project</b>", table_cell_bold),
            Paragraph("<b>PASS</b>", table_cell_bold),
            Paragraph("Anchored explicitly on CORS preflight handshakes, embed scripts, and rate-limited endpoints in `small-backend`.", table_cell_style)
        ],
        [
            Paragraph("<b>5. Honest one-line 'Why'</b>", table_cell_bold),
            Paragraph("<b>PASS</b>", table_cell_bold),
            Paragraph("Explains why CV bullet points fail to prove real-world browser security and cross-origin integration competence.", table_cell_style)
        ]
    ]
    
    eval_table = Table([eval_headers] + eval_rows, colWidths=[140, 50, 350])
    eval_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), slate_head),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    
    story.append(KeepTogether(eval_table))
    
    doc.build(story)
    print(f"Successfully generated Proof Statement PDF: {output_filename}")

if __name__ == "__main__":
    out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "Proof_Statement_Report.pdf")
    create_pdf(out_path)
