#!/usr/bin/env python3
"""Optional local typography asset generator. Public pages have no Pillow dependency."""
import argparse,json,re
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--font',type=Path,required=True);args=parser.parse_args()
    root=Path(__file__).resolve().parents[2];directory=Path(__file__).parent/'pages'
    for path in sorted(directory.glob('*.json')):
        page=json.loads(path.read_text());im=Image.new('RGB',(1200,630),'#10141b');draw=ImageDraw.Draw(im)
        draw.rectangle((0,0,17,630),fill='#ff8990');draw.line((70,135,1130,135),fill='#36404f',width=2)
        draw.text((70,40),'スロ探究',font=ImageFont.truetype(str(args.font),54),fill='#f5f5f2')
        draw.text((70,160),page['label'],font=ImageFont.truetype(str(args.font),28),fill='#ff8990')
        font=ImageFont.truetype(str(args.font),52);lines=[];line=''
        for segment in re.split(r'(?<=[。｜、])',page['title']):
            if line and draw.textlength(line+segment,font=font)>1060:lines.append(line);line=''
            for ch in segment:
                if draw.textlength(line+ch,font=font)>1060:lines.append(line);line=ch
                else:line+=ch
        if line:lines.append(line)
        # Optional editorial line breaks for titles whose words must stay together.
        if 'share_lines' in page:
            lines=page['share_lines']
            if not isinstance(lines,list) or not lines or any(not isinstance(x,str) or not x or draw.textlength(x,font=font)>1060 for x in lines):raise ValueError('Invalid share lines')
        if len(lines)>4:raise ValueError('Share title too long')
        for i,line in enumerate(lines):draw.text((70,220+i*74),line,font=font,fill='#f5f5f2')
        draw.text((70,550),'シュウ３  /  '+page['updated'],font=ImageFont.truetype(str(args.font),26),fill='#bac3d0')
        target=root/'docs/slot-tankyu/assets'/page['share_image'];im.save(target,optimize=True)
        print(target.relative_to(root))
if __name__=='__main__':main()
