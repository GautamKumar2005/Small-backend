import sys
import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

def create_pdf(output_filename):
    # Setup document with 0.5 inch margins to ensure clean 2-page layout
    doc = SimpleDocTemplate(
        output_filename,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    styles = getSampleStyleSheet()
    
    # Define color palette (Slate / Navy professional engineering aesthetic)
    navy_dark = colors.HexColor('#0F172A')
    slate_head = colors.HexColor('#1E293B')
    slate_body = colors.HexColor('#334155')
    accent_blue = colors.HexColor('#2563EB')
    bg_light = colors.HexColor('#F8FAFC')
    bg_alt = colors.HexColor('#F1F5F9')
    border_color = colors.HexColor('#CBD5E1')
    
    # Custom typography styles
    title_style = ParagraphStyle(
        name='AuditTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=navy_dark,
        spaceAfter=4
    )
    
    meta_style = ParagraphStyle(
        name='AuditMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=slate_body,
        spaceAfter=10
    )
    
    h2_style = ParagraphStyle(
        name='AuditH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=accent_blue,
        spaceBefore=10,
        spaceAfter=6
    )
    
    body_style = ParagraphStyle(
        name='AuditBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=slate_body,
        spaceAfter=6
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
    
    table_header_style = ParagraphStyle(
        name='TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white
    )

    code_box_style = ParagraphStyle(
        name='CodeBox',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7,
        leading=9.5,
        textColor=navy_dark
    )

    story = []
    
    # --- HEADER SECTION ---
    story.append(Paragraph("AI Fluency: Framework & Foundations — Workflow Audit Report", title_style))
    story.append(Paragraph(
        "<b>Author:</b> Gauta &nbsp;|&nbsp; <b>Workspace:</b> small-backend/workflow &nbsp;|&nbsp; "
        "<b>Phase:</b> Setup (FL-01) &nbsp;|&nbsp; <b>Date:</b> July 2026",
        meta_style
    ))
    
    # --- PART 1: 15 RECURRING TASKS AUDIT TABLE ---
    story.append(Paragraph("1. 15 Real-Week Recurring Tasks Audit Table (Ethan Mollick Framework)", h2_style))
    
    headers = [
        Paragraph("<b>#</b>", table_header_style),
        Paragraph("<b>Recurring Task Description</b>", table_header_style),
        Paragraph("<b>Context</b>", table_header_style),
        Paragraph("<b>Time</b>", table_header_style),
        Paragraph("<b>Quadrant</b>", table_header_style),
        Paragraph("<b>One-Line Rationale</b>", table_header_style)
    ]
    
    tasks_data = [
        ("01", "API Auth & RBAC Security Sign-Off", "Work", "2.5h", "Just Me", 
         "Final architectural security decisions and threat modeling require human accountability and ethical sign-off."),
        ("02", "Junior Developer Mentoring", "Work", "3.0h", "Just Me", 
         "Mentorship and constructive interpersonal communication require emotional intelligence and human empathy."),
        ("03", "System Architecture & Schema Planning", "Side/Work", "2.0h", "Just Me", 
         "Conceptual synthesis and strategic goal-setting must originate from human intuition and project vision."),
        ("04", "Express.js Route & Controller Creation", "Work", "4.0h", "Delegate (Review)", 
         "AI generates syntax-accurate handlers rapidly, but human review is mandatory for error boundaries & business rules."),
        ("05", "SQL/Prisma Query Optimization", "Work", "2.0h", "Delegate (Review)", 
         "AI excels at syntactic SQL restructuring, but query plans must be benchmarked against live data volumes."),
        ("06", "OpenAPI/Swagger Doc Generation", "Work", "1.5h", "Delegate (Review)", 
         "AI accurately maps route signatures to OpenAPI specs, but requires review for edge-case auth header descriptions."),
        ("07", "Dockerfile Multi-Stage Build Optimization", "DevOps", "1.5h", "Delegate (Review)", 
         "AI generates standard layers efficiently, but security stripping and Alpine dependency compat require manual check."),
        ("08", "Debugging Async Race Conditions & Pooling", "Work", "3.5h", "Collaborate", 
         "Pairing with AI as an analytical sounding board accelerates hypotheses while human intuition guides experiments."),
        ("09", "Designing RAG Embedding & Chunking Strategy", "Side (RAG)", "3.0h", "Collaborate", 
         "Iterating on embedding architectures benefits from dialogue where AI suggests algorithms and human tests quality."),
        ("10", "Refactoring Legacy Controllers to Services", "Work", "2.5h", "Collaborate", 
         "Refactoring works best as an interactive dialogue where AI drafts structural separation and developer guides flow."),
        ("11", "Learning Concurrency & Cryptography", "Study", "3.0h", "Collaborate", 
         "AI acts as an on-demand tutor providing customized analogies and interactive code examples that speed learning."),
        ("12", "Generating Jest/Supertest Unit Tests", "Work", "4.0h", "Fully Automate", 
         "Given a clean controller contract, automated AI test generation reliably produces unit test coverage and edge cases."),
        ("13", "Project Report & PDF Document Styling", "Academic", "1.5h", "Fully Automate", 
         "Document formatting, table rendering, and ReportLab script generation are deterministic tasks that execute reliably."),
        ("14", "Git Commit Styling & CHANGELOG Generation", "Work", "1.0h", "Fully Automate", 
         "Parsing syntax diffs into standardized commit summaries is a structured pattern-matching task suited for automation."),
        ("15", "Syntax Formatting, Prettier & Linter Fixes", "All", "1.0h", "Fully Automate", 
         "Code linting and mechanical formatting rules are purely algorithmic transformations requiring no human cognitive load.")
    ]
    
    table_data = [headers]
    for row in tasks_data:
        # Highlight "Just Me" with bold style
        q_style = table_cell_bold if "Just Me" in row[4] else table_cell_style
        table_data.append([
            Paragraph(row[0], table_cell_style),
            Paragraph(f"<b>{row[1]}</b>", table_cell_style),
            Paragraph(row[2], table_cell_style),
            Paragraph(row[3], table_cell_style),
            Paragraph(f"<b>{row[4]}</b>", q_style),
            Paragraph(row[5], table_cell_style)
        ])
    
    # Table widths total 540 pt (letter width 612 - 72 margins)
    col_widths = [20, 115, 50, 30, 75, 250]
    task_table = Table(table_data, colWidths=col_widths, repeatRows=1)
    
    ts = TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), slate_head),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ])
    
    for i in range(1, len(table_data)):
        bg = bg_light if i % 2 == 0 else colors.white
        if "Just Me" in tasks_data[i-1][4]:
            bg = colors.HexColor('#FEF3C7') # Soft amber highlight for Just Me
        ts.add('BACKGROUND', (0, i), (-1, i), bg)
        
    task_table.setStyle(ts)
    story.append(task_table)
    story.append(Spacer(1, 10))
    
    # --- PART 2: FREE TOOLKIT & ACADEMY EVIDENCE ---
    story.append(Paragraph("2. Free Toolkit Setup & Anthropic Academy Enrollment Evidence", h2_style))
    
    evidence_data = [
        [Paragraph("<b>Tool / Platform</b>", table_header_style),
         Paragraph("<b>Account Status & Tier</b>", table_header_style),
         Paragraph("<b>Primary Purpose & Workflow Role</b>", table_header_style)],
        [Paragraph("<b>Anthropic Claude</b>", table_cell_bold),
         Paragraph("Verified Pro/Free Tier (Claude 3.5)", table_cell_style),
         Paragraph("Primary coding collaborator, architectural reasoning, and Claude Project knowledge base.", table_cell_style)],
        [Paragraph("<b>OpenAI ChatGPT</b>", table_cell_bold),
         Paragraph("Verified Account (GPT-4o)", table_cell_style),
         Paragraph("Cross-verification of SQL/regex patterns and secondary code review perspective.", table_cell_style)],
        [Paragraph("<b>Anthropic Academy</b>", table_cell_bold),
         Paragraph("<b>ENROLLED & MODULE 1 COMPLETED</b>", table_cell_bold),
         Paragraph("Course: <i>AI Fluency: Framework & Foundations</i> (FL-01). Applied delegation matrix & guardrails.", table_cell_style)]
    ]
    
    ev_table = Table(evidence_data, colWidths=[110, 160, 270])
    ev_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), slate_head),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('BACKGROUND', (0, 1), (-1, -1), bg_light),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(ev_table)
    story.append(Spacer(1, 10))
    
    # --- PART 3: CLAUDE PROJECT CONFIGURATION SCREENSHOT / UI LAYOUT ---
    story.append(Paragraph("3. Configured Claude Project Screenshot & Custom Instructions", h2_style))
    
    project_ui_text = (
        "<b>Project Title:</b> Full-Stack & Backend AI Intern (small-backend) &nbsp;|&nbsp; <b>Workspace:</b> small-backend/workflow<br/>"
        "<b>Knowledge Base Files Attached:</b> README.md (Architecture), public.routes.js (Routing), generate_pdf.py (ReportLab)<br/>"
        "<b>Custom Instructions Panel (Verified Active):</b><br/>"
        "&nbsp;&nbsp;• <b>WHO YOU ARE:</b> Senior Full-Stack & Backend AI Intern assisting Gauta with Node.js/Express REST APIs and Python scripting.<br/>"
        "&nbsp;&nbsp;• <b>TONE PREFERENCES:</b> Direct, pragmatic, engineering-first. No introductory filler. Include standard HTTP status codes.<br/>"
        "&nbsp;&nbsp;• <b>CURRENT GOALS:</b> 1) Build modular REST endpoints in Script/src/. 2) Generate Jest unit tests (>=85% cov). 3) Support PDF reporting.<br/>"
        "&nbsp;&nbsp;• <b>TECHNICAL RULES:</b> Strict Zod/Joi validation, async/await try/catch boundaries, zero security flaws, preserve existing docstrings."
    )
    
    ui_box = Table([[Paragraph(project_ui_text, code_box_style)]], colWidths=[540])
    ui_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), bg_alt),
        ('BOX', (0, 0), (-1, -1), 1, accent_blue),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(ui_box)
    story.append(Spacer(1, 10))
    
    # --- PART 4: THREE TARGET AUDIT TASKS WITH SUCCESS DEFINITIONS ---
    story.append(Paragraph("4. Three Target Audit Tasks for FL-02 through FL-04 (with Success Definitions)", h2_style))
    
    target_headers = [
        Paragraph("<b>Module</b>", table_header_style),
        Paragraph("<b>Target Audit Task & Quadrant</b>", table_header_style),
        Paragraph("<b>Measurable Quantitative Metrics</b>", table_header_style),
        Paragraph("<b>Qualitative Success Criteria</b>", table_header_style)
    ]
    
    target_rows = [
        [
            Paragraph("<b>FL-02</b><br/>Structured Prompts", table_cell_bold),
            Paragraph("<b>Boilerplate Express.js CRUD Routes & Controllers</b><br/><i>[Delegate to AI with review]</i>", table_cell_style),
            Paragraph("• <b>70% time reduction:</b> 45 min &rarr; &lt;15 min per CRUD endpoint.<br/>"
                      "• <b>100% first-pass pass rate</b> for ESLint & Zod syntax.", table_cell_style),
            Paragraph("Clean route/controller separation, standard HTTP status codes (200, 201, 400, 404, 500), concise JSDoc headers.", table_cell_style)
        ],
        [
            Paragraph("<b>FL-03</b><br/>Multi-Turn Collab", table_cell_bold),
            Paragraph("<b>Debugging Async Race Conditions & DB Pooling</b><br/><i>[Collaborate with AI]</i>", table_cell_style),
            Paragraph("• <b>60% triage time reduction:</b> &lt;30 min resolution vs. 2+ hrs.<br/>"
                      "• <b>0 memory leaks</b> under 500 req/sec load test.", table_cell_style),
            Paragraph("Clear root-cause explanation in PR commit messages, zero happy-path regressions, targeted logging.", table_cell_style)
        ],
        [
            Paragraph("<b>FL-04</b><br/>Automated Pipelines", table_cell_bold),
            Paragraph("<b>Automated Jest/Supertest Unit Test Suite Gen</b><br/><i>[Fully Automate]</i>", table_cell_style),
            Paragraph("• <b>&ge;85% branch & function coverage</b> on target controllers.<br/>"
                      "• <b>100% unattended CI/CD pass rate</b> without flaky mocks.", table_cell_style),
            Paragraph("Explicit assertion of edge cases and auth failure traps (not just happy paths), clean afterEach cleanup.", table_cell_style)
        ]
    ]
    
    target_table = Table([target_headers] + target_rows, colWidths=[70, 130, 170, 170])
    target_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), slate_head),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    
    story.append(KeepTogether(target_table))
    
    doc.build(story)
    print(f"Successfully generated workflow audit PDF: {output_filename}")

if __name__ == "__main__":
    out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "Workflow_Audit_Report.pdf")
    create_pdf(out_path)
