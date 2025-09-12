// ===== 이미지 데이터 배열 (예시, imgur 링크 사용 권장) =====
const images = [
  { src: "https://i.imgur.com/Jcqdcly.png", full: "https://i.imgur.com/Jcqdcly.png", title: "매튜(SP)", tags: ["주인공","빛군"] },
  { src: "https://i.imgur.com/h70cPCo.png", full: "https://i.imgur.com/h70cPCo.png", title: "아멜다(SP)", tags: ["주인공","빛군","인외"] },
  { src: "https://i.imgur.com/28t7hPN.png", full: "https://i.imgur.com/28t7hPN.png", title: "그레니어(SP)", tags: ["빛군"] },
  { src: "https://i.imgur.com/Iv49soD.png", full: "https://i.imgur.com/Iv49soD.png", title: "그레니어(Elio)", tags: ["빛군","특별"] },
  { src: "https://i.imgur.com/nC5SybY.png", full: "https://i.imgur.com/nC5SybY.png", title: "소피아", tags: ["기원","공주","인외"] },
  { src: "https://i.imgur.com/CumER4W.png", full: "https://i.imgur.com/CumER4W.png", title: "페라키아", tags: ["어둠","유성"] },
  { src: "https://i.imgur.com/yvzeToF.png", full: "https://i.imgur.com/yvzeToF.png", title: "프레아", tags: ["기원","공주"] },
  { src: "https://i.imgur.com/kDzJwVB.png", full: "https://i.imgur.com/kDzJwVB.png", title: "발가스", tags: ["제국","전략"] },
  { src: "https://i.imgur.com/Nbl7ocy.png", full: "https://i.imgur.com/Nbl7ocy.png", title: "발가스(니나노오피스)", tags: ["제국","전략","특별"] },
  { src: "https://i.imgur.com/ziTPWQH.png", full: "https://i.imgur.com/ziTPWQH.png", title: "파나", tags: ["제국","어둠"] },
  { src: "https://i.imgur.com/On5Ekmg.png", full: "https://i.imgur.com/On5Ekmg.png", title: "나암", tags: ["빛군","공주","유성"] },
  { src: "https://i.imgur.com/NJa5tSY.png", full: "https://i.imgur.com/NJa5tSY.png", title: "크리스", tags: ["주인공","빛군","공주"] },
  { src: "https://i.imgur.com/hBcRx7C.png", full: "https://i.imgur.com/hBcRx7C.png", title: "키리카제", tags: ["기원","유성"] },
  { src: "https://i.imgur.com/HK5Hfd8.png", full: "https://i.imgur.com/HK5Hfd8.png", title: "실버울프", tags: ["기원","유성"] },
  { src: "https://i.imgur.com/2Vbr75K.png", full: "https://i.imgur.com/2Vbr75K.png", title: "소니아", tags: ["제국","어둠","공주"] },
  { src: "https://i.imgur.com/pSyhe5D.png", full: "https://i.imgur.com/pSyhe5D.png", title: "에마링크", tags: ["제국","전략"] },
  { src: "https://i.imgur.com/01xkyiR.png", full: "https://i.imgur.com/01xkyiR.png", title: "이멜다", tags: ["제국","전략"] },
  { src: "https://i.imgur.com/lR8AWtO.png", full: "https://i.imgur.com/lR8AWtO.png", title: "리파니", tags: ["기원","공주"] },
  { src: "https://i.imgur.com/fWgbaUW.png", full: "https://i.imgur.com/fWgbaUW.png", title: "에그베르트", tags: ["제국","어둠","전략"] },
  { src: "https://i.imgur.com/95ZgjNy.png", full: "https://i.imgur.com/95ZgjNy.png", title: "헤인", tags: ["빛군","제국"] },
  { src: "https://i.imgur.com/KBRTxJ3.png", full: "https://i.imgur.com/KBRTxJ3.png", title: "란스", tags: ["빛군","제국","전략"] },
  { src: "https://i.imgur.com/2ymMqIW.png", full: "https://i.imgur.com/2ymMqIW.png", title: "보젤", tags: ["어둠","인외"] },
  { src: "https://i.imgur.com/VV8UwVv.png", full: "https://i.imgur.com/VV8UwVv.png", title: "레딘", tags: ["주인공","빛군"] },
  { src: "https://i.imgur.com/Y3C1d8i.png", full: "https://i.imgur.com/Y3C1d8i.png", title: "레온", tags: ["제국","전략"] },
  { src: "https://i.imgur.com/9IFHxIG.png", full: "https://i.imgur.com/9IFHxIG.png", title: "레온(서부세계)", tags: ["제국","전략"] },
  { src: "https://i.imgur.com/wRM83vJ.png", full: "https://i.imgur.com/wRM83vJ.png", title: "레온(SP)", tags: ["제국","전략"] },
  { src: "https://i.imgur.com/2hPtr85.png", full: "https://i.imgur.com/2hPtr85.png", title: "레온(어나더쿄)", tags: ["제국","전략","특별"] },
  { src: "https://i.imgur.com/cnt2Ah7.png", full: "https://i.imgur.com/cnt2Ah7.png", title: "베른하르트", tags: ["제국","어둠","인외"] },
  { src: "https://i.imgur.com/6TnLJgs.png", full: "https://i.imgur.com/6TnLJgs.png", title: "라나", tags: ["어둠","공주"] },
  { src: "https://i.imgur.com/RRc4YDY.png", full: "https://i.imgur.com/RRc4YDY.png", title: "라나(월하의 벚꽃 - 빛의 메아리)", tags: ["어둠","공주"] },
  { src: "https://i.imgur.com/CgsMG96.png", full: "https://i.imgur.com/CgsMG96.png", title: "라나(해변의 미인)", tags: ["어둠","공주"] },
  { src: "https://i.imgur.com/QcTUTS2.png", full: "https://i.imgur.com/QcTUTS2.png", title: "엘윈", tags: ["주인공","빛군","제국"] },
  { src: "https://i.imgur.com/URbXdSg.png", full: "https://i.imgur.com/URbXdSg.png", title: "엘윈(방랑하는 기사)", tags: ["주인공","빛군","제국"] },
  { src: "https://i.imgur.com/I0NMfPI.png", full: "https://i.imgur.com/I0NMfPI.png", title: "쉐리(SP)", tags: ["빛군","공주","유성"] },
  { src: "https://i.imgur.com/OWSiG58.png", full: "https://i.imgur.com/OWSiG58.png", title: "리아나", tags: ["주인공","빛군","공주"] },
  { src: "https://i.imgur.com/mtgiMkf.png", full: "https://i.imgur.com/mtgiMkf.png", title: "알테뮬러", tags: ["제국","어둠","전략"] },
  { src: "https://i.imgur.com/GaMaNbz.png", full: "https://i.imgur.com/GaMaNbz.png", title: "루나", tags: ["기원","공주","전략"] },
  { src: "https://i.imgur.com/U60ckal.png", full: "https://i.imgur.com/U60ckal.png", title: "디하르트", tags: ["주인공","기원","유성"] },
  { src: "https://i.imgur.com/tVftCTF.png", full: "https://i.imgur.com/tVftCTF.png", title: "티아리스(SP)", tags: ["주인공","기원","공주"] },
  { src: "https://i.imgur.com/4wlphPN.png", full: "https://i.imgur.com/4wlphPN.png", title: "쥬그라", tags: ["기원","유성","인외"] },
  { src: "https://i.imgur.com/AMbEyL4.png", full: "https://i.imgur.com/AMbEyL4.png", title: "쥬그라(뚱그라)", tags: ["기원","유성","인외"] },
  { src: "https://i.imgur.com/gZ7kGyQ.png", full: "https://i.imgur.com/gZ7kGyQ.png", title: "젤다", tags: ["어둠","유성","인외"] },
  { src: "https://i.imgur.com/9xMOAmt.png", full: "https://i.imgur.com/9xMOAmt.png", title: "제리올&레이라(광란의 밤)", tags: ["기원","전략"] },
  { src: "https://i.imgur.com/A8XQzXC.png", full: "https://i.imgur.com/A8XQzXC.png", title: "셀파닐(순수한 치어리더)", tags: ["공주","전설"] },
  { src: "https://i.imgur.com/ZUfCNZQ.png", full: "https://i.imgur.com/ZUfCNZQ.png", title: "안젤리나(짙푸른 여름)", tags: ["공주","유성","전설"] },
  { src: "https://i.imgur.com/Unz9W65.png", full: "https://i.imgur.com/Unz9W65.png", title: "란포드", tags: ["전략","전설"] },
  { src: "https://i.imgur.com/xZxcN4X.png", full: "https://i.imgur.com/xZxcN4X.png", title: "리스틸", tags: ["어둠","전설"] },
  { src: "https://i.imgur.com/nSpPNmw.png", full: "https://i.imgur.com/nSpPNmw.png", title: "란디우스", tags: ["주인공","전설"] },
  { src: "https://i.imgur.com/LeQNyVs.png", full: "https://i.imgur.com/LeQNyVs.png", title: "레이첼", tags: ["주인공","전설"] },
  { src: "https://i.imgur.com/SHnPpQy.png", full: "https://i.imgur.com/SHnPpQy.png", title: "윌러", tags: ["전략","전설"] },
  { src: "https://i.imgur.com/5yvXzsp.png", full: "https://i.imgur.com/5yvXzsp.png", title: "윌러(그대 마음의 명탐정)", tags: ["전략","전설"] },
  { src: "https://i.imgur.com/7AbhbyO.png", full: "https://i.imgur.com/7AbhbyO.png", title: "기자로프", tags: ["어둠","인외"] },
  { src: "https://i.imgur.com/V3Q1q7H.png", full: "https://i.imgur.com/V3Q1q7H.png", title: "세레나", tags: ["전략","전설"] },
  { src: "https://i.imgur.com/lqKGpZx.png", full: "https://i.imgur.com/lqKGpZx.png", title: "시그마", tags: ["주인공","전설","유성"] },
  { src: "https://i.imgur.com/yJHx0Ju.png", full: "https://i.imgur.com/yJHx0Ju.png", title: "람다", tags: ["주인공","전설","인외"] },
  { src: "https://i.imgur.com/O7H6eRA.png", full: "https://i.imgur.com/O7H6eRA.png", title: "사쿠라(MrTrain)", tags: ["제국","주인공","시공","특별"] },
  { src: "https://i.imgur.com/Nk4Cxpa.png", full: "https://i.imgur.com/Nk4Cxpa.png", title: "안젤리카(얼티밋 안젤리카호)", tags: ["빛군","시공"] },
  { src: "https://i.imgur.com/9G9HJMs.png", full: "https://i.imgur.com/9G9HJMs.png", title: "클라렛", tags: ["공주","전설","유성"] },
  { src: "https://i.imgur.com/hCE9QNS.png", full: "https://i.imgur.com/hCE9QNS.png", title: "엘라스타", tags: ["빛군","기원","전략"] },
  { src: "https://i.imgur.com/bJIcMdJ.png", full: "https://i.imgur.com/bJIcMdJ.png", title: "오메가", tags: ["어둠","유성"] },
  { src: "https://i.imgur.com/UymvHgK.png", full: "https://i.imgur.com/UymvHgK.png", title: "유리아(파멸의 검 - 빛의 메아리)", tags: ["빛군","공주","인외"] },
  { src: "https://i.imgur.com/WUOD1BJ.png", full: "https://i.imgur.com/WUOD1BJ.png", title: "레인폴스(방랑하는 의사 - 빛의 메아리)", tags: ["전략","전설","인외"] },
  { src: "https://i.imgur.com/GlwLH4D.png", full: "https://i.imgur.com/GlwLH4D.png", title: "베티", tags: ["빛군","제국","어둠"] },
  { src: "https://i.imgur.com/wN2MRfI.png", full: "https://i.imgur.com/wN2MRfI.png", title: "알프레드", tags: ["전설","유성"] },
  { src: "https://i.imgur.com/8CvZkOh.png", full: "https://i.imgur.com/8CvZkOh.png", title: "환생 제시카", tags: ["빛군","기원","인외"] },
  { src: "https://i.imgur.com/AaMa161.png", full: "https://i.imgur.com/AaMa161.png", title: "에밀리아", tags: ["제국","공주"] },
  { src: "https://i.imgur.com/QWM5JJi.png", full: "https://i.imgur.com/QWM5JJi.png", title: "비라쥬", tags: ["전설","유성"] },
  { src: "https://i.imgur.com/sqx28wn.png", full: "https://i.imgur.com/sqx28wn.png", title: "미지의기사", tags: ["전략","전설"] },
  { src: "https://i.imgur.com/NfdSWao.png", full: "https://i.imgur.com/NfdSWao.png", title: "아카야", tags: ["빛군","기원","인외"] },
  { src: "https://i.imgur.com/2XaZ4jU.png", full: "https://i.imgur.com/2XaZ4jU.png", title: "브렌다", tags: ["전설","유성"] },
  { src: "https://i.imgur.com/VJrii1X.png", full: "https://i.imgur.com/VJrii1X.png", title: "올리버", tags: ["빛군","전설","유성"] },
  { src: "https://i.imgur.com/1qhYkVn.png", full: "https://i.imgur.com/1qhYkVn.png", title: "아레스", tags: ["주인공","제국","리인카"] },
  { src: "https://i.imgur.com/xQodyNk.png", full: "https://i.imgur.com/xQodyNk.png", title: "마이야(아름다운 자태의 드레스)", tags: ["제국","리인카"] },
  { src: "https://i.imgur.com/5nu0hNY.png", full: "https://i.imgur.com/5nu0hNY.png", title: "일루시아(호숫가의 여름꽃 - 빛의 메아리)", tags: ["빛군","전략"] },
  { src: "https://i.imgur.com/1LiSN05.png", full: "https://i.imgur.com/1LiSN05.png", title: "실린카(레이디 블랙 - 빛의 메아리)", tags: ["유성","인외"] },
  { src: "https://i.imgur.com/87ycQ77.png", full: "https://i.imgur.com/87ycQ77.png", title: "실린카(공중 산책)", tags: ["유성","인외"] },
  { src: "https://i.imgur.com/pfYLFDE.png", full: "https://i.imgur.com/pfYLFDE.png", title: "리코리스", tags: ["어둠","공주","리인카"] },
  { src: "https://i.imgur.com/quti9N4.png", full: "https://i.imgur.com/quti9N4.png", title: "레나타", tags: ["어둠","리인카"] },
  { src: "https://i.imgur.com/lkJ9YCB.png", full: "https://i.imgur.com/lkJ9YCB.png", title: "로자리아", tags: ["빛군","공주","리인카"] },
  { src: "https://i.imgur.com/80hd8Zy.png", full: "https://i.imgur.com/80hd8Zy.png", title: "노에미", tags: ["빛군","리인카"] },
  { src: "https://i.imgur.com/jYArQnv.png", full: "https://i.imgur.com/jYArQnv.png", title: "헬레나", tags: ["빛군","제국"] },
  { src: "https://i.imgur.com/cqpzAqX.png", full: "https://i.imgur.com/cqpzAqX.png", title: "세계수의현자", tags: ["전설","인외"] },
  { src: "https://i.imgur.com/cn7Nm6d.png", full: "https://i.imgur.com/cn7Nm6d.png", title: "플로렌티아", tags: ["제국","전략","리인카"] },
  { src: "https://i.imgur.com/xUGEiKz.png", full: "https://i.imgur.com/xUGEiKz.png", title: "츠바메(미지의 전학생)", tags: ["리인카","유성"] },
  { src: "https://i.imgur.com/d13A2MR.png", full: "https://i.imgur.com/d13A2MR.png", title: "츠바메(젠야타)", tags: ["리인카","유성","특별"] },
  { src: "https://i.imgur.com/2E1eye6.png", full: "https://i.imgur.com/2E1eye6.png", title: "멜파니", tags: ["빛군","공주","전설"] },
  { src: "https://i.imgur.com/U2aXqYj.png", full: "https://i.imgur.com/U2aXqYj.png", title: "로젠실", tags: ["제국","인외","공주"] },
  { src: "https://i.imgur.com/l2SOP5E.png", full: "https://i.imgur.com/l2SOP5E.png", title: "클로테르", tags: ["제국","전략"] },
  { src: "https://i.imgur.com/HY6cc7T.png", full: "https://i.imgur.com/HY6cc7T.png", title: "탄생의빛", tags: ["빛군","기원","리인카"] },
  { src: "https://i.imgur.com/ohPdbDX.png", full: "https://i.imgur.com/ohPdbDX.png", title: "마리엘(빛나는 시계추)", tags: ["빛군","리인카"] },
  { src: "https://i.imgur.com/eeRMkcu.png", full: "https://i.imgur.com/eeRMkcu.png", title: "힐다", tags: ["제국","전략","리인카"] },
  { src: "https://i.imgur.com/otxJ7Ex.png", full: "https://i.imgur.com/otxJ7Ex.png", title: "베르너", tags: ["제국","리인카"] },
  { src: "https://i.imgur.com/o0F7CU0.png", full: "https://i.imgur.com/o0F7CU0.png", title: "크루거", tags: ["어둠","인외"] },
  { src: "https://i.imgur.com/jMm7i4r.png", full: "https://i.imgur.com/jMm7i4r.png", title: "빈센트", tags: ["제국","어둠","유성"] },
  { src: "https://i.imgur.com/fMGiW8t.png", full: "https://i.imgur.com/fMGiW8t.png", title: "토와", tags: ["리인카","기원","전략"] },
  { src: "https://i.imgur.com/OntlBNu.png", full: "https://i.imgur.com/OntlBNu.png", title: "팟시르(미드나이트 퀸)", tags: ["리인카","어둠"] },
  { src: "https://i.imgur.com/4FPOjwi.png", full: "https://i.imgur.com/4FPOjwi.png", title: "크림조의왕", tags: ["기원","어둠","인외"] },
  { src: "https://i.imgur.com/7W9g8iJ.png", full: "https://i.imgur.com/7W9g8iJ.png", title: "화이트 시시", tags: ["빛군","공주"] },
  { src: "https://i.imgur.com/Cx1I6EZ.png", full: "https://i.imgur.com/Cx1I6EZ.png", title: "화이트 시시(행운의 바니걸 - 빛의 메아리)", tags: ["빛군","공주"] },
  { src: "https://i.imgur.com/Fng0atI.png", full: "https://i.imgur.com/Fng0atI.png", title: "오토크라토4세", tags: ["제국","리인카"] },
  { src: "https://i.imgur.com/vAJNWLU.png", full: "https://i.imgur.com/vAJNWLU.png", title: "오토크라토4세(Sukwind)", tags: ["제국","리인카","특별"] },
  { src: "https://i.imgur.com/84hNMDr.png", full: "https://i.imgur.com/84hNMDr.png", title: "루크레치아", tags: ["제국","공주","리인카"] },
  { src: "https://i.imgur.com/OOlaYw4.png", full: "https://i.imgur.com/OOlaYw4.png", title: "입실론", tags: ["어둠","전설","유성"] },
  { src: "https://i.imgur.com/QgaAJuJ.png", full: "https://i.imgur.com/QgaAJuJ.png", title: "뮤", tags: ["전설","인외"] },
  { src: "https://i.imgur.com/nI946rR.png", full: "https://i.imgur.com/nI946rR.png", title: "크리스티안네", tags: ["제국","공주","리인카"] },
  { src: "https://i.imgur.com/6yz7QIQ.png", full: "https://i.imgur.com/6yz7QIQ.png", title: "수제트", tags: ["유성","리인카"] },
  { src: "https://i.imgur.com/KzRMs9I.png", full: "https://i.imgur.com/KzRMs9I.png", title: "초월자", tags: ["어둠","전설","인외"] },
  { src: "https://i.imgur.com/XI5WJvI.png", full: "https://i.imgur.com/XI5WJvI.png", title: "알파", tags: ["제국","어둠"] },
  { src: "https://i.imgur.com/BOw4aL5.png", full: "https://i.imgur.com/BOw4aL5.png", title: "베르너 폰 에길", tags: ["빛군","전설","유성"] },
  { src: "https://i.imgur.com/yKP702V.png", full: "https://i.imgur.com/yKP702V.png", title: "마리안델", tags: ["공주","전설","인외"] },
  { src: "https://i.imgur.com/MPfaMIW.png", full: "https://i.imgur.com/MPfaMIW.png", title: "웨탐", tags: ["주인공","어둠","인외"] },
  { src: "https://i.imgur.com/MsF83kP.png", full: "https://i.imgur.com/MsF83kP.png", title: "웨탐(혼돈의 고양이 사자)", tags: ["주인공","어둠","인외"] },
  { src: "https://i.imgur.com/7mkoFx4.png", full: "https://i.imgur.com/7mkoFx4.png", title: "엘마", tags: ["주인공","빛군","리인카"] },
  { src: "https://i.imgur.com/TJF4X19.png", full: "https://i.imgur.com/TJF4X19.png", title: "엘마(달콤한 보상 - 빛의 메아리)", tags: ["주인공","빛군","리인카"] },
  { src: "https://i.imgur.com/bV2NvGP.png", full: "https://i.imgur.com/bV2NvGP.png", title: "엘마(수제 디저트)", tags: ["주인공","빛군","리인카"] },
  { src: "https://i.imgur.com/IDIqtTM.png", full: "https://i.imgur.com/IDIqtTM.png", title: "켈티스", tags: ["어둠","리인카"] },
  { src: "https://i.imgur.com/HTvDnzA.png", full: "https://i.imgur.com/HTvDnzA.png", title: "로비나 대제", tags: ["주인공","전략","리인카"] },
  { src: "https://i.imgur.com/ISZj9jQ.png", full: "https://i.imgur.com/ISZj9jQ.png", title: "방주의 성녀", tags: ["주인공","공주","인외"] },
  { src: "https://i.imgur.com/ZdlkdGL.png", full: "https://i.imgur.com/ZdlkdGL.png", title: "구스타프", tags: ["어둠","인외","리인카"] },
  { src: "https://i.imgur.com/4poFrAS.png", full: "https://i.imgur.com/4poFrAS.png", title: "미셸", tags: ["빛군","리인카"] },
  { src: "https://i.imgur.com/wiFeLLM.png", full: "https://i.imgur.com/wiFeLLM.png", title: "리자", tags: ["주인공","유성","전설"] },
  { src: "https://i.imgur.com/BOhOnPL.png", full: "https://i.imgur.com/BOhOnPL.png", title: "아이언 챈슬러", tags: ["제국","전략","전설"] },
  { src: "https://i.imgur.com/VWI1ytZ.png", full: "https://i.imgur.com/VWI1ytZ.png", title: "달의집정관", tags: ["전략","전설","인외"] },
  { src: "https://i.imgur.com/lVEVLBt.png", full: "https://i.imgur.com/lVEVLBt.png", title: "아즈사", tags: ["기원","전략","인외"] },
  { src: "https://i.imgur.com/PkMBHCJ.png", full: "https://i.imgur.com/PkMBHCJ.png", title: "아즈사(한적한 오후 - 빛의 메아리)", tags: ["기원","전략","인외"] },
  { src: "https://i.imgur.com/kWiOtQe.png", full: "https://i.imgur.com/kWiOtQe.png", title: "오보로", tags: ["기원","전설","인외"] },
  { src: "https://i.imgur.com/OAryOMT.png", full: "https://i.imgur.com/OAryOMT.png", title: "오보로(기이한 칼날 - 빛의 메아리)", tags: ["기원","전설","인외"] },
  { src: "https://i.imgur.com/zea791E.png", full: "https://i.imgur.com/zea791E.png", title: "카구야", tags: ["공주","전략","인외"] },
  { src: "https://i.imgur.com/1yPCkvG.png", full: "https://i.imgur.com/1yPCkvG.png", title: "캐롤리안(화염 그림자)", tags: ["빛군","제국","전략"] },
  { src: "https://i.imgur.com/v7ZQhGf.png", full: "https://i.imgur.com/v7ZQhGf.png", title: "아샤멜", tags: ["기원","공주","인외"] },
  { src: "https://i.imgur.com/2mJSa35.png", full: "https://i.imgur.com/2mJSa35.png", title: "로스탐", tags: ["기원","전략","유성"] },
  { src: "https://i.imgur.com/YN5U5lM.png", full: "https://i.imgur.com/YN5U5lM.png", title: "방랑투사", tags: ["기원","유성","전설"] },
  { src: "https://i.imgur.com/mZGwRzq.png", full: "https://i.imgur.com/mZGwRzq.png", title: "줄리안", tags: ["어둠","유성","리인카"] },
  { src: "https://i.imgur.com/VNyNypv.png", full: "https://i.imgur.com/VNyNypv.png", title: "리키", tags: ["주인공","빛군","전설"] },
  { src: "https://i.imgur.com/Sm0aXfV.png", full: "https://i.imgur.com/Sm0aXfV.png", title: "마크렌", tags: ["전략","유성","전설"] },
  { src: "https://i.imgur.com/ykYlA3R.png", full: "https://i.imgur.com/ykYlA3R.png", title: "아단켈모", tags: ["전략","전설","인외"] },
  { src: "https://i.imgur.com/yj4DF1R.png", full: "https://i.imgur.com/yj4DF1R.png", title: "빛의 수호사도", tags: ["주인공","빛군","인외"] },
  { src: "https://i.imgur.com/KrCRwTK.png", full: "https://i.imgur.com/KrCRwTK.png", title: "빛의 수호사도(푸른 바다의 영혼)", tags: ["주인공","빛군","인외"] },
  { src: "https://i.imgur.com/43c1Bhy.png", full: "https://i.imgur.com/43c1Bhy.png", title: "빛의 수호사도(꼰대쿤)", tags: ["주인공","빛군","인외","특별"] },
  { src: "https://i.imgur.com/Jo8V7x9.png", full: "https://i.imgur.com/Jo8V7x9.png", title: "빛과 그림자 검의 영혼", tags: ["주인공","인외","리인카"] },
  { src: "https://i.imgur.com/RxbJevY.png", full: "https://i.imgur.com/RxbJevY.png", title: "껍질소녀", tags: ["어둠","공주","리인카"] },
  { src: "https://i.imgur.com/apvYcOY.png", full: "https://i.imgur.com/apvYcOY.png", title: "리오벡", tags: ["제국","어둠","인외"] },
  { src: "https://i.imgur.com/L1JnuQp.png", full: "https://i.imgur.com/L1JnuQp.png", title: "시엔", tags: ["기원","유성","전략"] },
  { src: "https://i.imgur.com/22tCfCz.png", full: "https://i.imgur.com/22tCfCz.png", title: "폴리알", tags: ["어둠","전설","리인카"] },
  { src: "https://i.imgur.com/CK5Jw3u.png", full: "https://i.imgur.com/CK5Jw3u.png", title: "루그너", tags: ["빛군","전략","리인카"] },
  { src: "", full: "", title: "그렌실", tags: ["공주","전략","기원"] },
  { src: "", full: "", title: "요아코니", tags: ["제국","전략","리인카"] },
  { src: "https://i.imgur.com/q5UQJ4b.png", full: "https://i.imgur.com/q5UQJ4b.png", title: "일레인(폐관수련중)", tags: ["전략","유성","시공","특별"] },
  { src: "https://i.imgur.com/sRylHj8.png", full: "https://i.imgur.com/sRylHj8.png", title: "각성자", tags: ["어둠","시공","인외"] },
  { src: "https://i.imgur.com/yJlkJol.png", full: "https://i.imgur.com/yJlkJol.png", title: "각성자(각성기)", tags: ["어둠","시공","인외"] },
  { src: "", full: "", title: "사그니", tags: ["전설","전략","인외"] },
  { src: "", full: "", title: "아마데우스", tags: ["기원","전략","인외"] },
  { src: "", full: "", title: "님프", tags: ["공주","전설","유성"] },
  { src: "", full: "", title: "타탈리아", tags: ["어둠","유성","인외"] },
  { src: "", full: "", title: "투어밀크", tags: ["기원","전설","인외"] },
  { src: "", full: "", title: "이리스", tags: ["유성","전설","인외"] },
  { src: "", full: "", title: "롤랑", tags: ["주인공","빛군","전설"] },
  { src: "https://i.imgur.com/89WC7xS.png", full: "https://i.imgur.com/89WC7xS.png", title: "프레시아", tags: ["주인공","공주","인외"] },
  { src: "https://i.imgur.com/S4oXwEQ.png", full: "https://i.imgur.com/S4oXwEQ.png", title: "강신자", tags: ["어둠","전설","인외"] },
  { src: "", full: "", title: "잭", tags: ["빛군","유성","전설"] },
  { src: "", full: "", title: "안드리올", tags: ["제국","전략","유성"] },
  { src: "", full: "", title: "네미아", tags: ["빛군","전략","전설"] },
  { src: "https://i.imgur.com/Bx5toUe.png", full: "https://i.imgur.com/Bx5toUe.png", title: "에쉬앤", tags: ["빛군","공주","유성"] },
  { src: "", full: "", title: "호프만", tags: ["빛군","전략","유성"] },
  { src: "https://i.imgur.com/9Db5Wsl.png", full: "https://i.imgur.com/9Db5Wsl.png", title: "이졸데", tags: ["전설","유성","인외"] },
  { src: "", full: "", title: "제이스", tags: ["기원","전설","인외"] },
  { src: "", full: "", title: "페트리시아", tags: ["제국","공주","인외"] },
  { src: "", full: "", title: "군", tags: ["전략","전설","유성"] },
  { src: "https://i.imgur.com/gXHXM5Z.png", full: "https://i.imgur.com/gXHXM5Z.png", title: "얼어붙은 심연의 지배자", tags: ["제국","전략","시공"] },
  { src: "", full: "", title: "타브리스", tags: ["공주","전략","유성"] },
  { src: "https://i.imgur.com/zB46ApW.png", full: "https://i.imgur.com/zB46ApW.png", title: "테란틸", tags: ["제국","인외","리인카"] },
  { src: "https://i.imgur.com/pK82H7Y.png", full: "https://i.imgur.com/pK82H7Y.png", title: "세리카", tags: ["빛군","공주","전설"] },
  { src: "https://i.imgur.com/4FkUeet.png", full: "https://i.imgur.com/4FkUeet.png", title: "이미르", tags: ["빛군","어둠","전설"] },
  { src: "https://i.imgur.com/noZhGb9.png", full: "https://i.imgur.com/noZhGb9.png", title: "비리아", tags: ["빛군","공주","전설"] },
  { src: "", full: "", title: "세라피나", tags: ["제국","전략","유성"] },
  { src: "https://i.imgur.com/vBw1wcU.png", full: "https://i.imgur.com/vBw1wcU.png", title: "빛의소환사", tags: ["빛군","공주","인외"] },
  { src: "https://i.imgur.com/wSk6avV.png", full: "https://i.imgur.com/wSk6avV.png", title: "시온", tags: ["주인공","빛군","전설"] },
  { src: "https://i.imgur.com/jzmRIqA.png", full: "https://i.imgur.com/jzmRIqA.png", title: "티아나", tags: ["빛군","유성","전설"] },
  { src: "https://i.imgur.com/xt81v5R.png", full: "https://i.imgur.com/xt81v5R.png", title: "엔야", tags: ["기원","전설","인외"] },
  { src: "", full: "", title: "아리아", tags: ["빛군","기원","공주"] },
  { src: "", full: "", title: "이리아", tags: ["빛군","기원","공주"] },
  { src: "", full: "", title: "노노린", tags: ["빛군","전략","유성"] },
  { src: "", full: "", title: "사프린", tags: ["기원","인외","리인카"] },
  { src: "", full: "", title: "염룡파멸자", tags: ["제국","어둠","전설"] },
  { src: "https://i.imgur.com/Nk421eW.png", full: "https://i.imgur.com/Nk421eW.png", title: "란델", tags: ["어둠","전설","전략"] },
  { src: "", full: "", title: "히비스커스", tags: ["어둠","유성","인외"] },
  { src: "https://i.imgur.com/sfAjMFf.png", full: "https://i.imgur.com/sfAjMFf.png", title: "실나", tags: ["어둠","기원","전설"] },
  { src: "https://i.imgur.com/t3m5z3t.png", full: "https://i.imgur.com/t3m5z3t.png", title: "실나(빛의 메아리)", tags: ["어둠","기원","전설"] }
];


const gallery = document.getElementById('gallery');
const loadMoreBtn = document.getElementById('load-more');
let loadedCount = 0;
const pageSize = 31;

function renderMore() {
  const end = Math.min(loadedCount + pageSize, images.length);
  for (let i = loadedCount; i < end; i++) {
    const img = images[i];
    const fig = document.createElement('figure');
    fig.className = 'card';
    fig.dataset.tags = img.tags.join(',');
    fig.dataset.title = img.title;
    fig.innerHTML = `
      <img src="${img.src}" loading="lazy" decoding="async" 
          alt="${img.title}" data-full="${img.full}"/>
      <span class="badge">${img.title}</span>
      <figcaption class="sr-only">${img.title}</figcaption>
      <button></button>`;
    gallery.appendChild(fig);
  }
  loadedCount = end;

  if (loadedCount >= images.length) loadMoreBtn.style.display = 'none';
}
renderMore();

// 무한 스크롤
window.addEventListener('scroll',()=>{
  if(window.innerHeight+window.scrollY>=document.body.offsetHeight-200){
    renderMore();
  }
});

// 검색 & 필터
const q=document.getElementById('q');
const filterButtons=document.querySelectorAll('.filters .btn');
let activeTag='all';
function applyFilter(){
  const term=(q.value||'').toLowerCase();
  [...gallery.children].forEach(card=>{
    const tags=(card.dataset.tags||'').toLowerCase();
    const title=(card.dataset.title||'').toLowerCase();
    const byTag=activeTag==='all'||tags.includes(activeTag);
    const bySearch=!term||tags.includes(term)||title.includes(term);
    card.style.display=byTag&&bySearch?'':'none';
  });
}
q.addEventListener('input',applyFilter);
filterButtons.forEach(btn=>btn.addEventListener('click',()=>{
  activeTag=btn.dataset.tag;
  filterButtons.forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
  applyFilter();
}));

// 라이트박스 + URL 파라미터 딥링크
const dialog=document.getElementById('lightbox');
const lbImg=document.getElementById('lb-img');
const lbCap=document.getElementById('lb-cap');
let items=[]; let index=0;

function refreshItems(){items=[...gallery.querySelectorAll('.card')];}
function openAt(i){
  refreshItems(); index=i;
  const fig=items[index]; const img=fig.querySelector('img');
  lbImg.src=img.dataset.full||img.src; lbCap.textContent=fig.dataset.title||'';
  dialog.showModal();
  const url=new URL(location); url.searchParams.set('img',index); history.replaceState({},'',url);
}
function close(){dialog.close(); const url=new URL(location); url.searchParams.delete('img'); history.replaceState({},'',url);}
function prev(){openAt((index-1+items.length)%items.length);} 
function next(){openAt((index+1)%items.length);}

gallery.addEventListener('click',e=>{
  const fig=e.target.closest('figure');
  if(fig)openAt([...gallery.children].indexOf(fig));
});
document.querySelector('[data-action="close"]').onclick=close;
document.querySelector('[data-action="prev"]').onclick=prev;
document.querySelector('[data-action="next"]').onclick=next;
document.addEventListener('keydown',e=>{
  if(!dialog.open)return;
  if(e.key==='Escape')close();
  if(e.key==='ArrowLeft')prev();
  if(e.key==='ArrowRight')next();
});
dialog.addEventListener('click',e=>{
  if(!e.target.closest('.viewer'))close();
});

// 드래그&드롭 업로드
gallery.addEventListener('dragover',e=>{e.preventDefault();});
gallery.addEventListener('drop',e=>{
  e.preventDefault();
  const files=[...e.dataTransfer.files].filter(f=>f.type.startsWith('image/'));
  files.forEach(f=>{
    const url=URL.createObjectURL(f);
    images.push({src:url,full:url,title:f.name,tags:["uploaded"]});
    renderMore();
  });
});

// 모바일 제스처 스와이프
let startX=0;
dialog.addEventListener('touchstart',e=>{startX=e.touches[0].clientX;});
dialog.addEventListener('touchend',e=>{
  let dx=e.changedTouches[0].clientX-startX;
  if(Math.abs(dx)>60){if(dx>0)prev();else next();}
});

// URL 딥링크로 바로 열기
window.addEventListener('load',()=>{
  const p=new URL(location).searchParams.get('img');
  if(p!==null){setTimeout(()=>openAt(Number(p)),500);}
});