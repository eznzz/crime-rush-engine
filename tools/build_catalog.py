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
                yellow=re.fullmatch(r'yellow_(front_quarter|front|rear(?:-\d+)?|side)(?:_HD)?(?:_regenerated)?_(\d+)(?:_steering_right)?',p.stem,re.IGNORECASE)
                match=re.fullmatch(r'(.+)_HD_(\d+)',p.stem,re.IGNORECASE)
                if yellow:
                    raw_role=yellow.group(1)
                    role='front-quarter' if raw_role=='front_quarter' else raw_role
                    hd_rank=int(yellow.group(2))
                else:
                    role=match.group(1) if match else p.stem
                    hd_rank=int(match.group(2)) if match else 0
                if kind=='vehicles' and folder.name=='m412-01':
                    role={"front_quarter":"front-quarter","moskvich_412_rear_05":"rear-05","moskvich_412_rear_30":"rear-30","moskvich_412_rear_40":"rear-40","rear_10":"rear-10","rear_15":"rear-15","rear_20":"rear-20"}.get(p.stem,role)
                if kind=='characters':
                    role={'man_profile_reference_HD_990':'man','man_reference_pixelart_HD':'man-front','man_side_reference_HD_990':'man-side'}.get(p.stem,role)
                    if role not in ('man-front','man','man-side'): continue
                priority=(hd_rank,p.suffix.lower()=='.webp')
                if role not in priorities or priority>priorities[role]:
                    files[role]=p.relative_to(root).as_posix()
                    priorities[role]=priority
        if files: result[kind][folder.name]=files
(base/'catalog.js').write_text('window.SPRITE_CATALOG = '+json.dumps(result,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
