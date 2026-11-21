"""Adds native PowerPoint slide transitions and entrance animations to presentation.pptx,
driven by the same motion spec the HTML uses (spec/presentation.json).

Mapping (HTML motion -> PowerPoint effect):
  fade / rise / words / count / scale  -> Fade (presetID 10)
  mask (photo)                         -> Wipe from left (presetID 22, subtype 8)
  grow (bars, panels, charts)          -> Wipe from bottom (presetID 22, subtype 4)
  growX                                -> Wipe from left
  draw: horizontal rule                -> Wipe from left;  vertical rule -> Wipe from top;  diagonal -> Fade
  draw: ring arc                       -> Wheel, 1 spoke (presetID 21)
  data-step N (HTML click fragments)   -> Nth on-click group; step 0 starts automatically with the slide
Transitions: Fade on every slide; Morph (with Fade fallback) on slides whose spec transition is 'morph'.
"""
import json, re, sys, zipfile, shutil, os

ROOT = os.path.join(os.path.dirname(__file__), '..')
PPTX = os.path.join(ROOT, 'powerpoint', sys.argv[1] if len(sys.argv) > 1 else 'presentation.pptx')
spec = json.load(open(os.path.join(ROOT, 'spec', 'presentation.json'), encoding='utf-8'))

EFFECTS = {
    'fade': (10, 0, 'fade', 500),
    'float': (42, 0, 'fade', 700),       # Float In: fade + rise
    'floatWords': (42, 0, 'fade', 650),  # Float In, by word (title mask reveal)
    'zoom': (23, 16, 'fade', 600),       # Zoom in from 85% + fade
    'wipeUp': (22, 4, 'wipe(up)', 650),
    'wipeRight': (22, 8, 'wipe(right)', 650),
    'wipeDown': (22, 1, 'wipe(down)', 650),
    'wheel': (21, 1, 'wheel(1)', 1100),
}

def effect_for(el):
    a = el.get('m', {}).get('a')
    if a == 'fade': return 'fade'
    if a in ('rise', 'count'): return 'float'
    if a == 'words': return 'floatWords'
    if a == 'scale': return 'zoom'
    if a == 'mask': return 'wipeRight'
    if a == 'grow': return 'wipeUp'
    if a == 'growX': return 'wipeRight'
    if a == 'draw':
        if el['t'] == 'chart': return 'wheel'
        if el['t'] == 'line':
            if el['y1'] == el['y2']: return 'wipeRight'
            if el['x1'] == el['x2']: return 'wipeDown'
        return 'fade'
    return None

SHAPE_RE = re.compile(r'<p:(sp|pic|graphicFrame|cxnSp)>\s*<p:nv\w+>\s*<p:cNvPr id="(\d+)" name="([^"]*)"')

class Ids:
    def __init__(self): self.n = 0
    def __call__(self): self.n += 1; return self.n

def build_timing(groups, kinds):
    nid = Ids()
    root, main = nid(), nid()
    out = []
    for gi, effs in enumerate(groups):
        if not effs: continue
        auto = gi == 0
        g, g2 = nid(), nid()
        cond = '<p:cond delay="indefinite"/>' + (f'<p:cond evt="onBegin" delay="0"><p:tn val="{main}"/></p:cond>' if auto else '')
        inner = []
        for k, (spid, eff, delay) in enumerate(effs):
            pid, sub, flt, dur = EFFECTS[eff]
            extra, iterate = '', ''
            def anim(attr, frm, to, d=dur):
                return (f'<p:anim calcmode="lin" valueType="num"><p:cBhvr><p:cTn id="{nid()}" dur="{d}" fill="hold"/><p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl>'
                        f'<p:attrNameLst><p:attrName>{attr}</p:attrName></p:attrNameLst></p:cBhvr><p:tavLst>'
                        f'<p:tav tm="0"><p:val><p:strVal val="{frm}"/></p:val></p:tav><p:tav tm="100000"><p:val><p:strVal val="{to}"/></p:val></p:tav></p:tavLst></p:anim>')
            if eff in ('float', 'floatWords'):
                extra = anim('ppt_x', '#ppt_x', '#ppt_x') + anim('ppt_y', '#ppt_y+.04', '#ppt_y')
            if eff == 'floatWords':
                iterate = '<p:iterate type="wd"><p:tmPct val="9000"/></p:iterate>'
            if eff == 'zoom':
                extra = anim('ppt_w', '#ppt_w*0.85', '#ppt_w') + anim('ppt_h', '#ppt_h*0.85', '#ppt_h')
            node = ('afterEffect' if auto else 'clickEffect') if k == 0 else 'withEffect'
            c1, c2, c3 = nid(), nid(), nid()
            inner.append(
                f'<p:par><p:cTn id="{c1}" presetID="{pid}" presetClass="entr" presetSubtype="{sub}" fill="hold" grpId="0" nodeType="{node}">'
                f'<p:stCondLst><p:cond delay="{delay}"/></p:stCondLst>{iterate}<p:childTnLst>'
                f'<p:set><p:cBhvr><p:cTn id="{c2}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst></p:cTn>'
                f'<p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl><p:attrNameLst><p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr>'
                f'<p:to><p:strVal val="visible"/></p:to></p:set>'
                f'<p:animEffect transition="in" filter="{flt}"><p:cBhvr><p:cTn id="{c3}" dur="{dur}"/><p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl></p:cBhvr></p:animEffect>' + extra +
                f'</p:childTnLst></p:cTn></p:par>')
        out.append(f'<p:par><p:cTn id="{g}" fill="hold"><p:stCondLst>{cond}</p:stCondLst><p:childTnLst>'
                   f'<p:par><p:cTn id="{g2}" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
                   + ''.join(inner) + '</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>')
    if not out: return ''
    seen, bld = set(), []
    for effs in groups:
        for spid, _, _ in effs:
            if spid in seen: continue
            seen.add(spid)
            kind = kinds[spid]
            if kind == 'sp': bld.append(f'<p:bldP spid="{spid}" grpId="0" animBg="1"/>')
            elif kind == 'graphicFrame': bld.append(f'<p:bldGraphic spid="{spid}" grpId="0"><p:bldAsOne/></p:bldGraphic>')
    return (f'<p:timing><p:tnLst><p:par><p:cTn id="{root}" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>'
            f'<p:seq concurrent="1" nextAc="seek"><p:cTn id="{main}" dur="indefinite" nodeType="mainSeq"><p:childTnLst>'
            + ''.join(out) +
            '</p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>'
            '<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>'
            '</p:childTnLst></p:cTn></p:par></p:tnLst>' + (f'<p:bldLst>{"".join(bld)}</p:bldLst>' if bld else '') + '</p:timing>')

FADE = '<p:transition spd="med"><p:fade/></p:transition>'
MORPH = ('<mc:AlternateContent xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006">'
         '<mc:Choice xmlns:p159="http://schemas.microsoft.com/office/powerpoint/2015/09/main" Requires="p159">'
         '<p:transition spd="slow"><p159:morph option="byObject"/></p:transition></mc:Choice>'
         '<mc:Fallback><p:transition spd="slow"><p:fade/></p:transition></mc:Fallback></mc:AlternateContent>')

tmp = PPTX + '.tmp'
zin = zipfile.ZipFile(PPTX)
zout = zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED)
report = []
for item in zin.infolist():
    data = zin.read(item.filename)
    m = re.fullmatch(r'ppt/slides/slide(\d+)\.xml', item.filename)
    if m:
        idx = int(m.group(1)) - 1
        s = spec['slides'][idx]
        xml = data.decode('utf-8')
        names, kinds = {}, {}
        for tag, sid, nm in SHAPE_RE.findall(xml):
            names[nm] = sid; kinds[sid] = tag
        title_id = None
        tm = re.search(r'<p:cNvPr id="(\d+)" name="[^"]*"[^>]*>(?:(?!</p:nvSpPr>).)*<p:ph[^>]*type="title"', xml, re.S)
        if tm: title_id = tm.group(1)
        groups = {}
        morph = s.get('transition') == 'morph'
        for el in s['els']:
            eff = effect_for(el)
            if not eff: continue
            if morph and el.get('morph'): continue  # morph carries it in
            nm = el.get('name') or f"{s['id']}__{el['id']}"
            ids = []
            if el.get('role') == 'title' and title_id: ids = [title_id]
            elif el['t'] == 'chart' and el.get('kind') == 'ring':
                ids = [(names.get(nm + '_track'), 'fade'), (names.get(nm), 'wheel')]
            elif nm in names: ids = [names[nm]]
            step = el.get('step', 0)
            d = int(el.get('m', {}).get('d', 0))
            for it in ids:
                spid, e2 = (it if isinstance(it, tuple) else (it, eff))
                if spid: groups.setdefault(step, []).append((spid, e2, d))
        ordered = [sorted(groups.get(k, []), key=lambda t: t[2]) for k in range(0, max(groups.keys(), default=-1) + 1)]
        timing = build_timing(ordered, kinds)
        # Morph on every slide (shared titles/rules glide like the HTML); Fade where PowerPoint lacks Morph
        trans = MORPH
        xml = re.sub(r'<p:transition.*?</p:transition>|<p:timing>.*?</p:timing>', '', xml, flags=re.S)
        xml = xml.replace('</p:clrMapOvr>', '</p:clrMapOvr>' + trans + timing, 1)
        data = xml.encode('utf-8')
        report.append(f"slide {idx + 1:02d} {s['id']:<11} transition=morph effects={sum(len(g) for g in ordered)} clickGroups={max(0, len(ordered) - 1)}")
    zout.writestr(item, data)
zout.close(); zin.close()
shutil.move(tmp, PPTX)
print('\n'.join(report))
