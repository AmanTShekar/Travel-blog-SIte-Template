import re

with open('about.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

def html_to_jsx(html_str):
    if not html_str: return ''
    jsx = html_str.replace('class="', 'className="')
    attrs = ['viewBox', 'stroke-width', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin', 'fill-rule', 'clip-rule', 'vector-effect']
    for attr in attrs:
        camel_attr = ''.join(word.capitalize() if i > 0 else word for i, word in enumerate(attr.split('-')))
        jsx = jsx.replace(f'{attr}="', f'{camel_attr}="')
    
    jsx = jsx.replace('style="color: rgba(255,255,255,0.7);"', 'style={{ color: "rgba(255,255,255,0.7)" }}')
    jsx = jsx.replace('style="max-width: 600px; margin: 0 auto;"', 'style={{ maxWidth: "600px", margin: "0 auto" }}')
    jsx = jsx.replace('style="font-size: 0.6rem;"', 'style={{ fontSize: "0.6rem" }}')
    jsx = jsx.replace('<br>', '<br />')
    jsx = jsx.replace('autoplay muted loop playsinline', 'autoPlay muted loop playsInline')
    jsx = re.sub(r'<img(.*?)(?<!/)>', r'<img\1 />', jsx)
    jsx = re.sub(r'<source(.*?)(?<!/)>', r'<source\1 />', jsx)
    return jsx

sections = re.findall(r'<section.*?</section>', html_content, re.DOTALL)
footer = re.search(r'<footer.*?</footer>', html_content, re.DOTALL)

react_component = """import React, { useEffect, useRef, useState } from 'react';
import styles from './About.module.css';

const AboutOdyssey = () => {
    const [activeState, setActiveState] = useState(null);

    useEffect(() => {
        // Interactivity logic handled here or via global scripts
    }, []);

    return (
        <main className="bg-[#050505] text-[#f4f4f5] min-h-screen">
"""

for sec in sections:
    react_component += html_to_jsx(sec) + '\n\n'

if footer:
    react_component += html_to_jsx(footer.group(0)) + '\n'

react_component += """
        </main>
    );
};

export default AboutOdyssey;
"""

with open('About.jsx', 'w', encoding='utf-8') as f:
    f.write(react_component)
print("About.jsx generated successfully!")
