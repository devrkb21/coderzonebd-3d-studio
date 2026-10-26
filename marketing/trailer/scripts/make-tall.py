# Builds tall/index.html (9:16) from wide/index.html: same beats, re-laid for 1080x1920,
# with the vertical footage's own in-points.  python scripts/make-tall.py
import re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
s = (root / 'wide/index.html').read_text(encoding='utf-8')
rep = [
  ('16:9 (1920×1080', '9:16 (1080×1920'),
  ('width=1920, height=1080', 'width=1080, height=1920'),
  ('width: 1920px;\n        height: 1080px;\n        overflow: hidden;', 'width: 1080px;\n        height: 1920px;\n        overflow: hidden;'),
  ('width: 1920px;\n        height: 1080px;\n        object-fit: cover;', 'width: 1080px;\n        height: 1920px;\n        object-fit: cover;'),
  ('      .chip {\n        position: absolute;\n        left: 120px;\n        top: 150px;\n      }', '      .chip {\n        position: absolute;\n        left: 70px;\n        top: 230px;\n      }'),
  ('      #c-walk {\n        top: 560px;\n      }', '      #c-walk {\n        top: 1150px;\n      }'),
  ('<span class="w">studio</span> <span class="w">in</span>', '<span class="w">studio</span><br /><span class="w">in</span>'),
  ('        padding: 26px 40px 20px;', '        max-width: 940px;\n        padding: 30px 44px 24px;'),
  ('        color: #fff;\n        white-space: nowrap;\n      }', '        color: #fff;\n      }'),
  ('        font-size: 72px;\n        line-height: 1.08;', '        font-size: 84px;\n        line-height: 1.1;'),
  ('        left: 520px;\n        top: 300px;\n        width: 880px;', '        left: 100px;\n        top: 620px;\n        width: 880px;'),
  ('        left: 0;\n        width: 1920px;\n        top: 590px;\n        text-align: center;\n        font-size: 76px;', '        left: 70px;\n        width: 940px;\n        top: 930px;\n        text-align: center;\n        line-height: 1.12;\n        font-size: 96px;'),
  ('        left: 0;\n        width: 1920px;\n        top: 735px;', '        left: 0;\n        width: 1080px;\n        top: 1210px;'),
  ('data-width="1920" data-height="1080"', 'data-width="1080" data-height="1920"'),
  ('circle(0% at 50% 62%)', 'circle(0% at 30% 60%)'), ('circle(120% at 50% 62%)', 'circle(130% at 30% 60%)'),
]
for a, b in rep:
    assert a in s, a
    s = s.replace(a, b)
# montage: five 2 s shots (the courier walk-by becomes the team beat), vertical in-points
montage = '''      <video id="v-svc" class="clip shot" src="assets/footage/tour.mp4" data-start="6.6" data-duration="2.0" data-media-start="1.0" data-track-index="0" muted playsinline style="z-index: 1"></video>
      <video id="v-prod" class="clip shot" src="assets/footage/tour.mp4" data-start="8.6" data-duration="2.0" data-media-start="5.6" data-track-index="0" muted playsinline style="z-index: 1"></video>
      <video id="v-work" class="clip shot" src="assets/footage/tour.mp4" data-start="10.6" data-duration="1.9" data-media-start="11.8" data-track-index="0" muted playsinline style="z-index: 1"></video>
      <video id="v-tech" class="clip shot" src="assets/footage/tour.mp4" data-start="12.5" data-duration="2.0" data-media-start="17.8" data-track-index="0" muted playsinline style="z-index: 1"></video>
      <video id="v-proc" class="clip shot" src="assets/footage/tour.mp4" data-start="14.5" data-duration="2.1" data-media-start="27.4" data-track-index="0" muted playsinline style="z-index: 1"></video>
      <video id="v-street" class="clip shot" src="assets/footage/street.mp4" data-start="16.6" data-duration="2.8" data-media-start="8.4" data-track-index="0" muted playsinline style="z-index: 1"></video>
      <video id="v-team" class="clip shot" src="assets/footage/tour.mp4" data-start="19.4" data-duration="2.4" data-media-start="22.8" data-track-index="0" muted playsinline style="z-index: 1"></video>
'''
s = re.sub(r'      <video id="v-svc".*?</div>\n      </div>\n', montage, s, flags=re.S)
s = s.replace('the team at their desks (punch-in on the overview pan)', 'a team member walks past the courier kiosk')
(root / 'tall/index.html').write_text(s, encoding='utf-8')
print('ok')
