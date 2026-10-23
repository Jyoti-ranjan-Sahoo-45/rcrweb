import os
import re

src_dir = r'c:\jyoti\rcrweb\loanapp\frontend\src'
missing = []

for root, dirs, files in os.walk(src_dir):
    for f in files:
        if f.endswith('.jsx') or f.endswith('.js'):
            fpath = os.path.join(root, f)
            with open(fpath, 'r', encoding='utf-8') as file:
                content = file.read()
            
            # Check if useState is used
            uses_state = bool(re.search(r'\buseState\b', content))
            uses_effect = bool(re.search(r'\buseEffect\b', content))
            
            # Check imports from react
            react_import_match = re.search(r'import\s+.*?from\s+[\'"]react[\'"]', content, re.DOTALL)
            react_import = react_import_match.group(0) if react_import_match else ''
            
            if uses_state and 'useState' not in react_import:
                missing.append((fpath, 'useState'))
            if uses_effect and 'useEffect' not in react_import:
                missing.append((fpath, 'useEffect'))

print(f'Files with missing React hook imports: {len(missing)}')
for p, hook in missing:
    print(f'- {p}: missing {hook}')
