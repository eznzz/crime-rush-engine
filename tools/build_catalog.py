from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
base=root/'sprites'
result={}
for kind in ('characters','vehicles'):
    result[kind]={}
    for folder in sorted((base/kind).iterdir()):
        if not folder.is_dir(): continue
        files={}
        for p in sorted(folder.iterdir()):
            if p.is_file() and p.suffix.lower() in ('.png','.webp'):
                if p.stem not in files or p.suffix.lower()=='.webp': files[p.stem]=p.relative_to(root).as_posix()
        if files: result[kind][folder.name]=files
(base/'catalog.js').write_text('window.SPRITE_CATALOG = '+json.dumps(result,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
