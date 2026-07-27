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
    
    # Palette (Navy / Crimson / Indigo engineering audit aesthetic)
    navy_dark = colors.HexColor('#0F172A')
    slate_head = colors.HexColor('#1E293B')
    slate_body = colors.HexColor('#334155')
    accent_indigo = colors.HexColor('#4F46E5')
    accent_red = colors.HexColor('#DC2626')
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
        textColor=accent_indigo,
        spaceBefore=8,
        spaceAfter=5
    )
    
    body_style = ParagraphStyle(
        name='DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11.5,
        textColor=slate_body,
        spaceAfter=5
    )

    table_header_style = ParagraphStyle(
        name='TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.white
    )
    
    table_cell_style = ParagraphStyle(
        name='TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7,
        leading=9.5,
        textColor=navy_dark
    )

    table_cell_bold = ParagraphStyle(
        name='TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7,
        leading=9.5,
        textColor=navy_dark
    )

    table_cell_code = ParagraphStyle(
        name='TableCellCode',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=6.5,
        leading=8.5,
        textColor=navy_dark
    )

    story = []
    
    # --- HEADER SECTION ---
    story.append(Paragraph("Prompt Ladder: One-Layer-at-a-Time Engineering Audit (FL-07)", title_style))
    story.append(Paragraph(
        "<b>Author:</b> Gautam Kumar &nbsp;|&nbsp; <b>Workspace:</b> small-backend/ladder &nbsp;|&nbsp; "
        "<b>Track:</b> AI Fluency Week 07 &nbsp;|&nbsp; <b>Date:</b> July 2026",
        meta_style
    ))
    
    # --- PART 1: OVERVIEW ---
    story.append(Paragraph("1. Audit Methodology & The 'Made It Worse' Discovery", h2_style))
    p1_text = (
        "This audit evaluates prompt engineering discipline by adding exactly <b>one named layer at a time</b> across 6 runs "
        "(Baseline + 5 versions) for backend rate-limiting middleware in <code>small-backend</code>. "
        "Crucially, <b>Version 3</b> documents an honest <b>'this made it worse'</b> moment: adding an arbitrary line-count constraint "
        "(<i>&lt;25 lines</i>) caused the AI to omit background cleanup timers, introducing a severe <b>infinite Map memory leak (OOM risk)</b>."
    )
    story.append(Paragraph(p1_text, body_style))
    
    # --- PART 2: SIDE-BY-SIDE LADDER TABLE (6 RUNS) ---
    story.append(Paragraph("2. Side-by-Side Prompt Ladder Table (6 Runs Total)", h2_style))
    
    ladder_headers = [
        Paragraph("<b>Run # / Version</b>", table_header_style),
        Paragraph("<b>Layer Added</b>", table_header_style),
        Paragraph("<b>Prompt Excerpt</b>", table_header_style),
        Paragraph("<b>What Improved in Output (Result)</b>", table_header_style),
        Paragraph("<b>What Still Failed / Degraded</b>", table_header_style)
    ]
    
    ladder_rows = [
        [
            Paragraph("<b>Run 0</b><br/>Baseline", table_cell_bold),
            Paragraph("<i>None</i><br/>(Weak Prompt)", table_cell_style),
            Paragraph("\"Write backend code for rate limiting.\"", table_cell_code),
            Paragraph("N/A — Guessed Python/Flask instead of Node.js/Express.", table_cell_style),
            Paragraph("Wrong language, hardcoded 10 req limit, zero RFC headers, no architecture separation.", table_cell_style)
        ],
        [
            Paragraph("<b>Run 1</b><br/>Version 1", table_cell_bold),
            Paragraph("<b>Clearer Goal & Stack Context</b>", table_cell_bold),
            Paragraph("\"Write Express.js (Node.js) middleware for rate limiting a public POST route.\"", table_cell_code),
            Paragraph("Stopped Python/Flask hallucinations; produced valid Node.js/Express middleware syntax.", table_cell_style),
            Paragraph("Lazily used third-party `express-rate-limit` npm package; wrong 15-minute window.", table_cell_style)
        ],
        [
            Paragraph("<b>Run 2</b><br/>Version 2", table_cell_bold),
            Paragraph("<b>Real Context & Proxy Headers</b>", table_cell_bold),
            Paragraph("Required zero third-party packages, 10 req/60s, and proxy fallback (`x-forwarded-for`).", table_cell_code),
            Paragraph("Eliminated npm dependency; correctly extracted proxy client IPs; implemented sliding counter.", table_cell_style),
            Paragraph("Returned plain text string; zero RFC headers; Map grew infinitely without cleanup.", table_cell_style)
        ],
        [
            Paragraph("<b>Run 3</b><br/>Version 3", table_cell_bold),
            Paragraph("<b>Line Count Trap (&lt;25 lines)</b><br/><i>[MADE IT WORSE]</i>", table_cell_bold),
            Paragraph("\"Keep code strictly under 25 lines total; no helper functions or intervals.\"", table_cell_code),
            Paragraph("Reduced line count to 11 lines and switched to basic `.json({ error: ... })` body.", table_cell_style),
            Paragraph("<b>MADE IT WORSE:</b> Caused infinite Map memory leak (OOM crash risk) & unreadable variables.", table_cell_style)
        ],
        [
            Paragraph("<b>Run 4</b><br/>Version 4", table_cell_bold),
            Paragraph("<b>Output Format & RFC Headers</b>", table_cell_bold),
            Paragraph("Removed brevity trap; required RFC 6585 headers (`Retry-After`), JSON error, and 5-min eviction timer.", table_cell_code),
            Paragraph("Fixed V3 memory leak with automatic Map eviction; added RFC observability headers & clean JSON.", table_cell_style),
            Paragraph("Lacked JSDoc annotations; no verification test suite example; hardcoded config options.", table_cell_style)
        ],
        [
            Paragraph("<b>Run 5</b><br/>Version 5", table_cell_bold),
            Paragraph("<b>Few-Shot Pattern & Test Spec</b>", table_cell_bold),
            Paragraph("Added inline JSDoc factory signature example & Jest/Supertest verification test requirements.", table_cell_code),
            Paragraph("<b>Gold Standard:</b> Generated configurable factory `createRateLimiter` + automated Jest verification suite.", table_cell_style),
            Paragraph("<b>None</b> — 100% testable, memory-safe, and production-ready.", table_cell_bold)
        ]
    ]
    
    ladder_table = Table([ladder_headers] + ladder_rows, colWidths=[45, 80, 115, 150, 150])
    ts = TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), slate_head),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ])
    # Highlight Run 3 (made it worse) with light amber/reddish background
    ts.add('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#FEE2E2'))
    ladder_table.setStyle(ts)
    story.append(ladder_table)
    story.append(Spacer(1, 8))
    
    # --- PART 3: 4 SHORT NOTES PER VERSION SUMMARY ---
    story.append(Paragraph("3. Summary of Four Audit Notes per Version (What Actually Improved)", h2_style))
    
    notes_headers = [
        Paragraph("<b>Version</b>", table_header_style),
        Paragraph("<b>1) What Changed in Prompt</b>", table_header_style),
        Paragraph("<b>2) What Actually Improved in Output</b>", table_header_style),
        Paragraph("<b>3) What Still Failed</b>", table_header_style),
        Paragraph("<b>4) What I Would Try Next</b>", table_header_style)
    ]
    
    notes_rows = [
        [
            Paragraph("<b>V1</b>", table_cell_bold),
            Paragraph("Added framework context (`Express/Node`).", table_cell_style),
            Paragraph("Stopped Python/Flask output; produced idiomatic Express middleware.", table_cell_style),
            Paragraph("Lazily used third-party npm package.", table_cell_style),
            Paragraph("Require zero external packages & add proxy IP fallback.", table_cell_style)
        ],
        [
            Paragraph("<b>V2</b>", table_cell_bold),
            Paragraph("Added in-memory Map & `x-forwarded-for` fallback.", table_cell_style),
            Paragraph("Wrote custom Map logic and parsed multi-hop proxy IPs.", table_cell_style),
            Paragraph("Sent plain text error; no RFC headers; no memory eviction.", table_cell_style),
            Paragraph("Add strict line count (<25 lines) to simplify code.", table_cell_style)
        ],
        [
            Paragraph("<b>V3</b><br/><i>(Worse)</i>", table_cell_bold),
            Paragraph("Added `<25 lines` & no intervals constraint.", table_cell_style),
            Paragraph("Code shrunk to 11 lines; used basic JSON body.", table_cell_style),
            Paragraph("<b>Memory leak (OOM risk)</b>; unreadable names (`m`,`r`); no headers.", table_cell_style),
            Paragraph("Discard brevity trap; add RFC 6585 headers & automatic eviction.", table_cell_style)
        ],
        [
            Paragraph("<b>V4</b>", table_cell_bold),
            Paragraph("Added RFC headers, JSON schema, & `.unref()` timer.", table_cell_style),
            Paragraph("Fixed OOM leak; added RFC observability headers & retry countdowns.", table_cell_style),
            Paragraph("Hardcoded options; lacked JSDoc & verification unit tests.", table_cell_style),
            Paragraph("Provide few-shot factory patterns & Jest test spec.", table_cell_style)
        ],
        [
            Paragraph("<b>V5</b>", table_cell_bold),
            Paragraph("Added JSDoc export pattern & Supertest spec.", table_cell_style),
            Paragraph("Generated configurable factory `createRateLimiter` + automated test suite.", table_cell_style),
            Paragraph("None — 100% verified production-ready.", table_cell_bold),
            Paragraph("Package as standalone Reusable Master Prompt.", table_cell_style)
        ]
    ]
    
    notes_table = Table([notes_headers] + notes_rows, colWidths=[45, 115, 140, 120, 120])
    ts_notes = TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), slate_head),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ])
    ts_notes.add('BACKGROUND', (0, 3), (-1, 3), colors.HexColor('#FEE2E2'))
    notes_table.setStyle(ts_notes)
    story.append(KeepTogether(notes_table))
    story.append(Spacer(1, 8))
    
    # --- PART 4: REUSABLE MASTER PROMPT ---
    story.append(Paragraph("4. Reusable Engineering Master Prompt (Cleaned for Strangers)", h2_style))
    master_prompt_text = (
        "<b>TASK:</b> Write a production-ready Express.js rate-limiting middleware factory <code>createRateLimiter(opts)</code> "
        "implementing an in-memory sliding window without external npm packages.<br/>"
        "<b>ARCHITECTURAL REQUIREMENTS:</b> 1) Extract client IP from <code>x-forwarded-for</code>, <code>x-real-ip</code>, or <code>req.ip</code>. "
        "2) Accept configurable options <code>{ windowMs = 60000, maxRequests = 10 }</code>. 3) Include an automatic <code>setInterval</code> cleanup timer "
        "(using <code>.unref()</code>) to delete expired IP entries every window period to prevent OOM memory leaks.<br/>"
        "<b>HTTP CONTRACT:</b> On every response, set RFC 6585 headers (<code>Limit</code>, <code>Remaining</code>, <code>Reset</code>). "
        "When throttled, set <code>Retry-After</code> and return HTTP 429 with JSON: <code>{ \"error\": \"RATE_LIMIT_EXCEEDED\", \"message\": \"...\", \"retryAfterSeconds\": N }</code>.<br/>"
        "<b>DELIVERABLE:</b> Complete ES6+ middleware file with JSDoc headers AND an accompanying Jest+Supertest verification test file asserting 200/429 status transitions."
    )
    prompt_box = Table([[Paragraph(master_prompt_text, body_style)]], colWidths=[540])
    prompt_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), bg_alt),
        ('BOX', (0, 0), (-1, -1), 1, accent_indigo),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(KeepTogether(prompt_box))
    
    doc.build(story)
    print(f"Successfully generated Prompt Ladder PDF: {output_filename}")

if __name__ == "__main__":
    out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "Prompt_Ladder_Report.pdf")
    create_pdf(out_path)
