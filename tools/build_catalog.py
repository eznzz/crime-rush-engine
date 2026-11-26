from pathlib import Path
import json
import re
root=Path(__file__).resolve().parents[1]
base=root/'sprites'
result={}
for kind in ('characters','vehicles'):
    result[kind]={}
    for folder in sorted((base/kind).iterdir()):
        if not folder.is_dir(): continue
        files={}
        priorities={}
        for p in sorted(folder.iterdir()):
            if p.is_file() and p.suffix.lower() in ('.png','.webp'):
                match=re.fullmatch(r'(.+)_HD_(\d+)',p.stem,re.IGNORECASE)
                role=match.group(1) if match else p.stem
                priority=(int(match.group(2)) if match else 0,p.suffix.lower()=='.webp')
                if role not in priorities or priority>priorities[role]:
                    files[role]=p.relative_to(root).as_posix()
                    priorities[role]=priority
        if files: result[kind][folder.name]=files
(base/'catalog.js').write_text('window.SPRITE_CATALOG = '+json.dumps(result,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
