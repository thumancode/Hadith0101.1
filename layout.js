// Layout profiles in Full HD base coordinates (4K = same page at device scale 2, HD = downscaled).
// wide=true -> scenes re-arrange horizontally; left=true -> brand bar left-aligned.
const LAYOUTS={
'9x16':{w:1080,h:1920,brandY:58,brandH:112,sy:215,sh:1200,subY:1445,subH:330,subW:960,fs:60,fl:52,barY:1850,m:60,wide:false},
'4x5':{w:1080,h:1350,brandY:30,brandH:90,sy:135,sh:800,subY:960,subH:270,subW:960,fs:52,fl:46,barY:1290,m:50,wide:false},
'3x4':{w:1080,h:1440,brandY:40,brandH:90,sy:150,sh:860,subY:1040,subH:280,subW:960,fs:56,fl:48,barY:1385,m:50,wide:false},
'1x1':{w:1080,h:1080,brandY:24,brandH:76,sy:100,sh:700,subY:815,subH:190,subW:960,fs:46,fl:40,barY:1045,m:40,wide:false},
'16x9':{w:1920,h:1080,brandY:28,brandH:80,sy:115,sh:725,subY:860,subH:160,subW:1680,fs:54,fl:46,barY:1056,m:80,wide:true,left:true},
'4x3':{w:1440,h:1080,brandY:28,brandH:80,sy:115,sh:705,subY:840,subH:180,subW:1280,fs:52,fl:44,barY:1054,m:60,wide:true}
};
