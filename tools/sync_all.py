import os
import docx

def sync():
    # 1. Read main.tex
    with open('report/main.tex', 'r', encoding='utf-8') as f:
        tex_content = f.read()

    # 2. Write report/main.txt
    with open('report/main.txt', 'w', encoding='utf-8') as f:
        f.write(tex_content)
    print('Updated report/main.txt')

    # 3. Update final review docx
    doc = docx.Document()
    for line in tex_content.splitlines():
        p = doc.add_paragraph(line)
        p.paragraph_format.space_before = docx.shared.Pt(0)
        p.paragraph_format.space_after = docx.shared.Pt(0)
        p.paragraph_format.line_spacing = 1.0
    docx_path = os.path.join('final review', 'MINOR PROJECT-I_SS26-27_LaTeX Code.docx')
    doc.save(docx_path)
    print('Updated docx')

    # 4. Update tools/generate_report_tex.py
    script_content = f'''# Auto-generated script to reproduce report/main.tex
import os

content = r\'\'\'{tex_content}\'\'\'

def generate():
    os.makedirs('report', exist_ok=True)
    with open('report/main.tex', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Generated report/main.tex successfully.')

if __name__ == '__main__':
    generate()
'''
    with open('tools/generate_report_tex.py', 'w', encoding='utf-8') as f:
        f.write(script_content)
    print('Updated tools/generate_report_tex.py')

if __name__ == '__main__':
    sync()

