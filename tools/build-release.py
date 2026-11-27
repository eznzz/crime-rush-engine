"""Build portable releases with sibling library layout preserved."""
import argparse
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
root=Path(__file__).resolve().parent.parent
p=argparse.ArgumentParser()
p.add_argument("target",choices=["engine","game","library","all"])
p.add_argument("--output",default="dist")
a=p.parse_args()
out=Path(a.output)
out.mkdir(parents=True,exist_ok=True)
groups={"engine":["crime-rush","crime-rush-library"],"game":["crime-rush","crime-rush-library","stance-rush"],"library":["crime-rush-library"]}
for target in (groups if a.target=="all" else [a.target]):
    version=(root/("stance-rush" if target=="game" else "crime-rush-library" if target=="library" else "crime-rush")/"VERSION").read_text().strip()
    dest=out/f"crime-rush-{target}-{version}.zip"
    entry={"engine":"crime-rush/","game":"stance-rush/","library":"crime-rush-library/"}[target]
    with ZipFile(dest,"w",ZIP_DEFLATED) as z:
        for group in groups[target]:
            for f in sorted((root/group).rglob("*")):
                if f.is_file() and "tests" not in f.relative_to(root).parts:
                    z.write(f,f.relative_to(root).as_posix())
        z.writestr("index.html",f'<!doctype html><meta charset="utf-8"><script>location.replace("{entry}")</script><a href="{entry}">Open</a>')
        z.write(root/"LICENSE","LICENSE")
    print(dest)
