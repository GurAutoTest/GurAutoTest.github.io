/* qrcode-generator bundle */
/**
 * Minified by jsDelivr using Terser v5.37.0.
 * Original file: /npm/qrcode-generator@1.4.4/qrcode.js
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
var qrcode=function(){var t=function(t,r){var e=t,n=g[r],o=null,i=0,a=null,u=[],f={},c=function(t,r){o=function(t){for(var r=new Array(t),e=0;e<t;e+=1){r[e]=new Array(t);for(var n=0;n<t;n+=1)r[e][n]=null}return r}(i=4*e+17),l(0,0),l(i-7,0),l(0,i-7),s(),h(),d(t,r),e>=7&&v(t),null==a&&(a=p(e,n,u)),w(a,r)},l=function(t,r){for(var e=-1;e<=7;e+=1)if(!(t+e<=-1||i<=t+e))for(var n=-1;n<=7;n+=1)r+n<=-1||i<=r+n||(o[t+e][r+n]=0<=e&&e<=6&&(0==n||6==n)||0<=n&&n<=6&&(0==e||6==e)||2<=e&&e<=4&&2<=n&&n<=4)},h=function(){for(var t=8;t<i-8;t+=1)null==o[t][6]&&(o[t][6]=t%2==0);for(var r=8;r<i-8;r+=1)null==o[6][r]&&(o[6][r]=r%2==0)},s=function(){for(var t=B.getPatternPosition(e),r=0;r<t.length;r+=1)for(var n=0;n<t.length;n+=1){var i=t[r],a=t[n];if(null==o[i][a])for(var u=-2;u<=2;u+=1)for(var f=-2;f<=2;f+=1)o[i+u][a+f]=-2==u||2==u||-2==f||2==f||0==u&&0==f}},v=function(t){for(var r=B.getBCHTypeNumber(e),n=0;n<18;n+=1){var a=!t&&1==(r>>n&1);o[Math.floor(n/3)][n%3+i-8-3]=a}for(n=0;n<18;n+=1){a=!t&&1==(r>>n&1);o[n%3+i-8-3][Math.floor(n/3)]=a}},d=function(t,r){for(var e=n<<3|r,a=B.getBCHTypeInfo(e),u=0;u<15;u+=1){var f=!t&&1==(a>>u&1);u<6?o[u][8]=f:u<8?o[u+1][8]=f:o[i-15+u][8]=f}for(u=0;u<15;u+=1){f=!t&&1==(a>>u&1);u<8?o[8][i-u-1]=f:u<9?o[8][15-u-1+1]=f:o[8][15-u-1]=f}o[i-8][8]=!t},w=function(t,r){for(var e=-1,n=i-1,a=7,u=0,f=B.getMaskFunction(r),c=i-1;c>0;c-=2)for(6==c&&(c-=1);;){for(var g=0;g<2;g+=1)if(null==o[n][c-g]){var l=!1;u<t.length&&(l=1==(t[u]>>>a&1)),f(n,c-g)&&(l=!l),o[n][c-g]=l,-1==(a-=1)&&(u+=1,a=7)}if((n+=e)<0||i<=n){n-=e,e=-e;break}}},p=function(t,r,e){for(var n=A.getRSBlocks(t,r),o=b(),i=0;i<e.length;i+=1){var a=e[i];o.put(a.getMode(),4),o.put(a.getLength(),B.getLengthInBits(a.getMode(),t)),a.write(o)}var u=0;for(i=0;i<n.length;i+=1)u+=n[i].dataCount;if(o.getLengthInBits()>8*u)throw"code length overflow. ("+o.getLengthInBits()+">"+8*u+")";for(o.getLengthInBits()+4<=8*u&&o.put(0,4);o.getLengthInBits()%8!=0;)o.putBit(!1);for(;!(o.getLengthInBits()>=8*u||(o.put(236,8),o.getLengthInBits()>=8*u));)o.put(17,8);return function(t,r){for(var e=0,n=0,o=0,i=new Array(r.length),a=new Array(r.length),u=0;u<r.length;u+=1){var f=r[u].dataCount,c=r[u].totalCount-f;n=Math.max(n,f),o=Math.max(o,c),i[u]=new Array(f);for(var g=0;g<i[u].length;g+=1)i[u][g]=255&t.getBuffer()[g+e];e+=f;var l=B.getErrorCorrectPolynomial(c),h=k(i[u],l.getLength()-1).mod(l);for(a[u]=new Array(l.getLength()-1),g=0;g<a[u].length;g+=1){var s=g+h.getLength()-a[u].length;a[u][g]=s>=0?h.getAt(s):0}}var v=0;for(g=0;g<r.length;g+=1)v+=r[g].totalCount;var d=new Array(v),w=0;for(g=0;g<n;g+=1)for(u=0;u<r.length;u+=1)g<i[u].length&&(d[w]=i[u][g],w+=1);for(g=0;g<o;g+=1)for(u=0;u<r.length;u+=1)g<a[u].length&&(d[w]=a[u][g],w+=1);return d}(o,n)};f.addData=function(t,r){var e=null;switch(r=r||"Byte"){case"Numeric":e=M(t);break;case"Alphanumeric":e=x(t);break;case"Byte":e=m(t);break;case"Kanji":e=L(t);break;default:throw"mode:"+r}u.push(e),a=null},f.isDark=function(t,r){if(t<0||i<=t||r<0||i<=r)throw t+","+r;return o[t][r]},f.getModuleCount=function(){return i},f.make=function(){if(e<1){for(var t=1;t<40;t++){for(var r=A.getRSBlocks(t,n),o=b(),i=0;i<u.length;i++){var a=u[i];o.put(a.getMode(),4),o.put(a.getLength(),B.getLengthInBits(a.getMode(),t)),a.write(o)}var g=0;for(i=0;i<r.length;i++)g+=r[i].dataCount;if(o.getLengthInBits()<=8*g)break}e=t}c(!1,function(){for(var t=0,r=0,e=0;e<8;e+=1){c(!0,e);var n=B.getLostPoint(f);(0==e||t>n)&&(t=n,r=e)}return r}())},f.createTableTag=function(t,r){t=t||2;var e="";e+='<table style="',e+=" border-width: 0px; border-style: none;",e+=" border-collapse: collapse;",e+=" padding: 0px; margin: "+(r=void 0===r?4*t:r)+"px;",e+='">',e+="<tbody>";for(var n=0;n<f.getModuleCount();n+=1){e+="<tr>";for(var o=0;o<f.getModuleCount();o+=1)e+='<td style="',e+=" border-width: 0px; border-style: none;",e+=" border-collapse: collapse;",e+=" padding: 0px; margin: 0px;",e+=" width: "+t+"px;",e+=" height: "+t+"px;",e+=" background-color: ",e+=f.isDark(n,o)?"#000000":"#ffffff",e+=";",e+='"/>';e+="</tr>"}return e+="</tbody>",e+="</table>"},f.createSvgTag=function(t,r,e,n){var o={};"object"==typeof arguments[0]&&(t=(o=arguments[0]).cellSize,r=o.margin,e=o.alt,n=o.title),t=t||2,r=void 0===r?4*t:r,(e="string"==typeof e?{text:e}:e||{}).text=e.text||null,e.id=e.text?e.id||"qrcode-description":null,(n="string"==typeof n?{text:n}:n||{}).text=n.text||null,n.id=n.text?n.id||"qrcode-title":null;var i,a,u,c,g=f.getModuleCount()*t+2*r,l="";for(c="l"+t+",0 0,"+t+" -"+t+",0 0,-"+t+"z ",l+='<svg version="1.1" xmlns="http://www.w3.org/2000/svg"',l+=o.scalable?"":' width="'+g+'px" height="'+g+'px"',l+=' viewBox="0 0 '+g+" "+g+'" ',l+=' preserveAspectRatio="xMinYMin meet"',l+=n.text||e.text?' role="img" aria-labelledby="'+y([n.id,e.id].join(" ").trim())+'"':"",l+=">",l+=n.text?'<title id="'+y(n.id)+'">'+y(n.text)+"</title>":"",l+=e.text?'<description id="'+y(e.id)+'">'+y(e.text)+"</description>":"",l+='<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>',l+='<path d="',a=0;a<f.getModuleCount();a+=1)for(u=a*t+r,i=0;i<f.getModuleCount();i+=1)f.isDark(a,i)&&(l+="M"+(i*t+r)+","+u+c);return l+='" stroke="transparent" fill="black"/>',l+="</svg>"},f.createDataURL=function(t,r){t=t||2,r=void 0===r?4*t:r;var e=f.getModuleCount()*t+2*r,n=r,o=e-r;return I(e,e,(function(r,e){if(n<=r&&r<o&&n<=e&&e<o){var i=Math.floor((r-n)/t),a=Math.floor((e-n)/t);return f.isDark(a,i)?0:1}return 1}))},f.createImgTag=function(t,r,e){t=t||2,r=void 0===r?4*t:r;var n=f.getModuleCount()*t+2*r,o="";return o+="<img",o+=' src="',o+=f.createDataURL(t,r),o+='"',o+=' width="',o+=n,o+='"',o+=' height="',o+=n,o+='"',e&&(o+=' alt="',o+=y(e),o+='"'),o+="/>"};var y=function(t){for(var r="",e=0;e<t.length;e+=1){var n=t.charAt(e);switch(n){case"<":r+="&lt;";break;case">":r+="&gt;";break;case"&":r+="&amp;";break;case'"':r+="&quot;";break;default:r+=n}}return r};return f.createASCII=function(t,r){if((t=t||1)<2)return function(t){t=void 0===t?2:t;var r,e,n,o,i,a=1*f.getModuleCount()+2*t,u=t,c=a-t,g={"██":"█","█ ":"▀"," █":"▄","  ":" "},l={"██":"▀","█ ":"▀"," █":" ","  ":" "},h="";for(r=0;r<a;r+=2){for(n=Math.floor((r-u)/1),o=Math.floor((r+1-u)/1),e=0;e<a;e+=1)i="█",u<=e&&e<c&&u<=r&&r<c&&f.isDark(n,Math.floor((e-u)/1))&&(i=" "),u<=e&&e<c&&u<=r+1&&r+1<c&&f.isDark(o,Math.floor((e-u)/1))?i+=" ":i+="█",h+=t<1&&r+1>=c?l[i]:g[i];h+="\n"}return a%2&&t>0?h.substring(0,h.length-a-1)+Array(a+1).join("▀"):h.substring(0,h.length-1)}(r);t-=1,r=void 0===r?2*t:r;var e,n,o,i,a=f.getModuleCount()*t+2*r,u=r,c=a-r,g=Array(t+1).join("██"),l=Array(t+1).join("  "),h="",s="";for(e=0;e<a;e+=1){for(o=Math.floor((e-u)/t),s="",n=0;n<a;n+=1)i=1,u<=n&&n<c&&u<=e&&e<c&&f.isDark(o,Math.floor((n-u)/t))&&(i=0),s+=i?g:l;for(o=0;o<t;o+=1)h+=s+"\n"}return h.substring(0,h.length-1)},f.renderTo2dContext=function(t,r){r=r||2;for(var e=f.getModuleCount(),n=0;n<e;n++)for(var o=0;o<e;o++)t.fillStyle=f.isDark(n,o)?"black":"white",t.fillRect(n*r,o*r,r,r)},f};t.stringToBytes=(t.stringToBytesFuncs={default:function(t){for(var r=[],e=0;e<t.length;e+=1){var n=t.charCodeAt(e);r.push(255&n)}return r}}).default,t.createStringToBytes=function(t,r){var e=function(){for(var e=S(t),n=function(){var t=e.read();if(-1==t)throw"eof";return t},o=0,i={};;){var a=e.read();if(-1==a)break;var u=n(),f=n()<<8|n();i[String.fromCharCode(a<<8|u)]=f,o+=1}if(o!=r)throw o+" != "+r;return i}(),n="?".charCodeAt(0);return function(t){for(var r=[],o=0;o<t.length;o+=1){var i=t.charCodeAt(o);if(i<128)r.push(i);else{var a=e[t.charAt(o)];"number"==typeof a?(255&a)==a?r.push(a):(r.push(a>>>8),r.push(255&a)):r.push(n)}}return r}};var r,e,n,o,i,a=1,u=2,f=4,c=8,g={L:1,M:0,Q:3,H:2},l=0,h=1,s=2,v=3,d=4,w=5,p=6,y=7,B=(r=[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],e=1335,n=7973,i=function(t){for(var r=0;0!=t;)r+=1,t>>>=1;return r},(o={}).getBCHTypeInfo=function(t){for(var r=t<<10;i(r)-i(e)>=0;)r^=e<<i(r)-i(e);return 21522^(t<<10|r)},o.getBCHTypeNumber=function(t){for(var r=t<<12;i(r)-i(n)>=0;)r^=n<<i(r)-i(n);return t<<12|r},o.getPatternPosition=function(t){return r[t-1]},o.getMaskFunction=function(t){switch(t){case l:return function(t,r){return(t+r)%2==0};case h:return function(t,r){return t%2==0};case s:return function(t,r){return r%3==0};case v:return function(t,r){return(t+r)%3==0};case d:return function(t,r){return(Math.floor(t/2)+Math.floor(r/3))%2==0};case w:return function(t,r){return t*r%2+t*r%3==0};case p:return function(t,r){return(t*r%2+t*r%3)%2==0};case y:return function(t,r){return(t*r%3+(t+r)%2)%2==0};default:throw"bad maskPattern:"+t}},o.getErrorCorrectPolynomial=function(t){for(var r=k([1],0),e=0;e<t;e+=1)r=r.multiply(k([1,C.gexp(e)],0));return r},o.getLengthInBits=function(t,r){if(1<=r&&r<10)switch(t){case a:return 10;case u:return 9;case f:case c:return 8;default:throw"mode:"+t}else if(r<27)switch(t){case a:return 12;case u:return 11;case f:return 16;case c:return 10;default:throw"mode:"+t}else{if(!(r<41))throw"type:"+r;switch(t){case a:return 14;case u:return 13;case f:return 16;case c:return 12;default:throw"mode:"+t}}},o.getLostPoint=function(t){for(var r=t.getModuleCount(),e=0,n=0;n<r;n+=1)for(var o=0;o<r;o+=1){for(var i=0,a=t.isDark(n,o),u=-1;u<=1;u+=1)if(!(n+u<0||r<=n+u))for(var f=-1;f<=1;f+=1)o+f<0||r<=o+f||0==u&&0==f||a==t.isDark(n+u,o+f)&&(i+=1);i>5&&(e+=3+i-5)}for(n=0;n<r-1;n+=1)for(o=0;o<r-1;o+=1){var c=0;t.isDark(n,o)&&(c+=1),t.isDark(n+1,o)&&(c+=1),t.isDark(n,o+1)&&(c+=1),t.isDark(n+1,o+1)&&(c+=1),0!=c&&4!=c||(e+=3)}for(n=0;n<r;n+=1)for(o=0;o<r-6;o+=1)t.isDark(n,o)&&!t.isDark(n,o+1)&&t.isDark(n,o+2)&&t.isDark(n,o+3)&&t.isDark(n,o+4)&&!t.isDark(n,o+5)&&t.isDark(n,o+6)&&(e+=40);for(o=0;o<r;o+=1)for(n=0;n<r-6;n+=1)t.isDark(n,o)&&!t.isDark(n+1,o)&&t.isDark(n+2,o)&&t.isDark(n+3,o)&&t.isDark(n+4,o)&&!t.isDark(n+5,o)&&t.isDark(n+6,o)&&(e+=40);var g=0;for(o=0;o<r;o+=1)for(n=0;n<r;n+=1)t.isDark(n,o)&&(g+=1);return e+=Math.abs(100*g/r/r-50)/5*10},o),C=function(){for(var t=new Array(256),r=new Array(256),e=0;e<8;e+=1)t[e]=1<<e;for(e=8;e<256;e+=1)t[e]=t[e-4]^t[e-5]^t[e-6]^t[e-8];for(e=0;e<255;e+=1)r[t[e]]=e;var n={glog:function(t){if(t<1)throw"glog("+t+")";return r[t]},gexp:function(r){for(;r<0;)r+=255;for(;r>=256;)r-=255;return t[r]}};return n}();function k(t,r){if(void 0===t.length)throw t.length+"/"+r;var e=function(){for(var e=0;e<t.length&&0==t[e];)e+=1;for(var n=new Array(t.length-e+r),o=0;o<t.length-e;o+=1)n[o]=t[o+e];return n}(),n={getAt:function(t){return e[t]},getLength:function(){return e.length},multiply:function(t){for(var r=new Array(n.getLength()+t.getLength()-1),e=0;e<n.getLength();e+=1)for(var o=0;o<t.getLength();o+=1)r[e+o]^=C.gexp(C.glog(n.getAt(e))+C.glog(t.getAt(o)));return k(r,0)},mod:function(t){if(n.getLength()-t.getLength()<0)return n;for(var r=C.glog(n.getAt(0))-C.glog(t.getAt(0)),e=new Array(n.getLength()),o=0;o<n.getLength();o+=1)e[o]=n.getAt(o);for(o=0;o<t.getLength();o+=1)e[o]^=C.gexp(C.glog(t.getAt(o))+r);return k(e,0).mod(t)}};return n}var A=function(){var t=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12,7,37,13],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],r=function(t,r){var e={};return e.totalCount=t,e.dataCount=r,e},e={};return e.getRSBlocks=function(e,n){var o=function(r,e){switch(e){case g.L:return t[4*(r-1)+0];case g.M:return t[4*(r-1)+1];case g.Q:return t[4*(r-1)+2];case g.H:return t[4*(r-1)+3];default:return}}(e,n);if(void 0===o)throw"bad rs block @ typeNumber:"+e+"/errorCorrectionLevel:"+n;for(var i=o.length/3,a=[],u=0;u<i;u+=1)for(var f=o[3*u+0],c=o[3*u+1],l=o[3*u+2],h=0;h<f;h+=1)a.push(r(c,l));return a},e}(),b=function(){var t=[],r=0,e={getBuffer:function(){return t},getAt:function(r){var e=Math.floor(r/8);return 1==(t[e]>>>7-r%8&1)},put:function(t,r){for(var n=0;n<r;n+=1)e.putBit(1==(t>>>r-n-1&1))},getLengthInBits:function(){return r},putBit:function(e){var n=Math.floor(r/8);t.length<=n&&t.push(0),e&&(t[n]|=128>>>r%8),r+=1}};return e},M=function(t){var r=a,e=t,n={getMode:function(){return r},getLength:function(t){return e.length},write:function(t){for(var r=e,n=0;n+2<r.length;)t.put(o(r.substring(n,n+3)),10),n+=3;n<r.length&&(r.length-n==1?t.put(o(r.substring(n,n+1)),4):r.length-n==2&&t.put(o(r.substring(n,n+2)),7))}},o=function(t){for(var r=0,e=0;e<t.length;e+=1)r=10*r+i(t.charAt(e));return r},i=function(t){if("0"<=t&&t<="9")return t.charCodeAt(0)-"0".charCodeAt(0);throw"illegal char :"+t};return n},x=function(t){var r=u,e=t,n={getMode:function(){return r},getLength:function(t){return e.length},write:function(t){for(var r=e,n=0;n+1<r.length;)t.put(45*o(r.charAt(n))+o(r.charAt(n+1)),11),n+=2;n<r.length&&t.put(o(r.charAt(n)),6)}},o=function(t){if("0"<=t&&t<="9")return t.charCodeAt(0)-"0".charCodeAt(0);if("A"<=t&&t<="Z")return t.charCodeAt(0)-"A".charCodeAt(0)+10;switch(t){case" ":return 36;case"$":return 37;case"%":return 38;case"*":return 39;case"+":return 40;case"-":return 41;case".":return 42;case"/":return 43;case":":return 44;default:throw"illegal char :"+t}};return n},m=function(r){var e=f,n=t.stringToBytes(r),o={getMode:function(){return e},getLength:function(t){return n.length},write:function(t){for(var r=0;r<n.length;r+=1)t.put(n[r],8)}};return o},L=function(r){var e=c,n=t.stringToBytesFuncs.SJIS;if(!n)throw"sjis not supported.";!function(){var t=n("友");if(2!=t.length||38726!=(t[0]<<8|t[1]))throw"sjis not supported."}();var o=n(r),i={getMode:function(){return e},getLength:function(t){return~~(o.length/2)},write:function(t){for(var r=o,e=0;e+1<r.length;){var n=(255&r[e])<<8|255&r[e+1];if(33088<=n&&n<=40956)n-=33088;else{if(!(57408<=n&&n<=60351))throw"illegal char at "+(e+1)+"/"+n;n-=49472}n=192*(n>>>8&255)+(255&n),t.put(n,13),e+=2}if(e<r.length)throw"illegal char at "+(e+1)}};return i},D=function(){var t=[],r={writeByte:function(r){t.push(255&r)},writeShort:function(t){r.writeByte(t),r.writeByte(t>>>8)},writeBytes:function(t,e,n){e=e||0,n=n||t.length;for(var o=0;o<n;o+=1)r.writeByte(t[o+e])},writeString:function(t){for(var e=0;e<t.length;e+=1)r.writeByte(t.charCodeAt(e))},toByteArray:function(){return t},toString:function(){var r="";r+="[";for(var e=0;e<t.length;e+=1)e>0&&(r+=","),r+=t[e];return r+="]"}};return r},S=function(t){var r=t,e=0,n=0,o=0,i={read:function(){for(;o<8;){if(e>=r.length){if(0==o)return-1;throw"unexpected end of file./"+o}var t=r.charAt(e);if(e+=1,"="==t)return o=0,-1;t.match(/^\s$/)||(n=n<<6|a(t.charCodeAt(0)),o+=6)}var i=n>>>o-8&255;return o-=8,i}},a=function(t){if(65<=t&&t<=90)return t-65;if(97<=t&&t<=122)return t-97+26;if(48<=t&&t<=57)return t-48+52;if(43==t)return 62;if(47==t)return 63;throw"c:"+t};return i},I=function(t,r,e){for(var n=function(t,r){var e=t,n=r,o=new Array(t*r),i={setPixel:function(t,r,n){o[r*e+t]=n},write:function(t){t.writeString("GIF87a"),t.writeShort(e),t.writeShort(n),t.writeByte(128),t.writeByte(0),t.writeByte(0),t.writeByte(0),t.writeByte(0),t.writeByte(0),t.writeByte(255),t.writeByte(255),t.writeByte(255),t.writeString(","),t.writeShort(0),t.writeShort(0),t.writeShort(e),t.writeShort(n),t.writeByte(0);var r=a(2);t.writeByte(2);for(var o=0;r.length-o>255;)t.writeByte(255),t.writeBytes(r,o,255),o+=255;t.writeByte(r.length-o),t.writeBytes(r,o,r.length-o),t.writeByte(0),t.writeString(";")}},a=function(t){for(var r=1<<t,e=1+(1<<t),n=t+1,i=u(),a=0;a<r;a+=1)i.add(String.fromCharCode(a));i.add(String.fromCharCode(r)),i.add(String.fromCharCode(e));var f,c,g,l=D(),h=(f=l,c=0,g=0,{write:function(t,r){if(t>>>r!=0)throw"length over";for(;c+r>=8;)f.writeByte(255&(t<<c|g)),r-=8-c,t>>>=8-c,g=0,c=0;g|=t<<c,c+=r},flush:function(){c>0&&f.writeByte(g)}});h.write(r,n);var s=0,v=String.fromCharCode(o[s]);for(s+=1;s<o.length;){var d=String.fromCharCode(o[s]);s+=1,i.contains(v+d)?v+=d:(h.write(i.indexOf(v),n),i.size()<4095&&(i.size()==1<<n&&(n+=1),i.add(v+d)),v=d)}return h.write(i.indexOf(v),n),h.write(e,n),h.flush(),l.toByteArray()},u=function(){var t={},r=0,e={add:function(n){if(e.contains(n))throw"dup key:"+n;t[n]=r,r+=1},size:function(){return r},indexOf:function(r){return t[r]},contains:function(r){return void 0!==t[r]}};return e};return i}(t,r),o=0;o<r;o+=1)for(var i=0;i<t;i+=1)n.setPixel(i,o,e(i,o));var a=D();n.write(a);for(var u=function(){var t=0,r=0,e=0,n="",o={},i=function(t){n+=String.fromCharCode(a(63&t))},a=function(t){if(t<0);else{if(t<26)return 65+t;if(t<52)return t-26+97;if(t<62)return t-52+48;if(62==t)return 43;if(63==t)return 47}throw"n:"+t};return o.writeByte=function(n){for(t=t<<8|255&n,r+=8,e+=1;r>=6;)i(t>>>r-6),r-=6},o.flush=function(){if(r>0&&(i(t<<6-r),t=0,r=0),e%3!=0)for(var o=3-e%3,a=0;a<o;a+=1)n+="="},o.toString=function(){return n},o}(),f=a.toByteArray(),c=0;c<f.length;c+=1)u.writeByte(f[c]);return u.flush(),"data:image/gif;base64,"+u};return t}();qrcode.stringToBytesFuncs["UTF-8"]=function(t){return function(t){for(var r=[],e=0;e<t.length;e++){var n=t.charCodeAt(e);n<128?r.push(n):n<2048?r.push(192|n>>6,128|63&n):n<55296||n>=57344?r.push(224|n>>12,128|n>>6&63,128|63&n):(e++,n=65536+((1023&n)<<10|1023&t.charCodeAt(e)),r.push(240|n>>18,128|n>>12&63,128|n>>6&63,128|63&n))}return r}(t)},function(t){"function"==typeof define&&define.amd?define([],t):"object"==typeof exports&&(module.exports=t())}((function(){return qrcode}));
//# sourceMappingURL=/sm/26b4b0d0b1e283d6b3ec9857ac597d7a60c76ac17be1ef4c965f03086de426bb.map

/* ==========================================================================
   CODEMARCA — DASHBOARD SHELL + DEMO DATA
   Loaded by every page under dashboard/<flow>/. Two jobs, nothing else:

     1. render the chrome  — sidebar (desktop) / top bar + tabs (mobile)
     2. hand the page a DUMMY account object to draw itself from

   ── FOR THE REACT BUILD ────────────────────────────────────────────────
   · CM.shell()      becomes <DashboardLayout page="home" title="Home">
   · CM.account()    becomes whatever the session/API hook returns.
     The shape of the object it returns is the shape the API should
     answer with — it is written out in full below on purpose.
   · CM.qr()         is a FAKE pattern. It only exists so the UI has
     something QR-shaped to lay out. Swap for a real encoder.
   · the .demo switcher at the bottom-right is a handoff toy. Delete it.

   ── THE ONE REAL DECISION BAKED IN HERE ────────────────────────────────
   A printed code is identified by a PERMANENT id (code.id, e.g. "x7k9m2")
   and resolves at codemarca.com/c/<id>. The handle (codemarca.com/garry)
   is a pretty alias that points at the same profile. That is why changing
   the handle in settings does not brick a sticker that is already stuck
   on something — the sticker never carried the handle in the first place.

   ONE PROFILE = ONE QR, FOR GOOD — decided 2026-09-16, Garry.
   The code is minted with the profile and never changes again. Ordering a
   second pack reprints the SAME code; losing a sticker gets the SAME code
   reprinted too, because the owner already holds every control that matters
   (pause it, edit the page behind it, switch it off). So an account holds a
   single `code`, never a list — which is why the tab is "My QR", one thing
   shown large, and not "Codes", a list of them.

   ========================================================================== */

(function (window, document) {
  "use strict";

  var CM = {};

  /* No photo yet: a person silhouette in light cool grey — never a letter,
     never violet (Garry, 2026-10-03). The same shape the page preview uses. */
  CM.FACE = '<svg class="face" viewBox="0 0 96 96" aria-hidden="true"><rect width="96" height="96" fill="#E7E9EE"/>' +
      '<circle cx="48" cy="38" r="16" fill="#B3B8C2"/><path d="M16 96c4-19 17-28 32-28s28 9 32 28z" fill="#B3B8C2"/></svg>';

  /* ══ 1. THE ACCOUNT ═════════════════════════════════════════════════════
     The dummy account no longer lives in this file. Every flow folder under
     dashboard/ ships its own state.js, which sets:

       window.CM_FLOW   = { id, label, home, states:[{ k, label }] }
       window.CM_STATES = { <k>: <account object>, … }

     That is what makes the folders worth having: 4-active/state.js only
     ever describes a finished account, 1-empty/state.js only ever an empty
     one, and neither has to carry the other's shape. The switcher at the
     bottom-right moves between the states of THIS flow only — to see a
     different kind of user you open a different folder.

     ── FOR THE REACT BUILD ──────────────────────────────────────────────
     CM.account() becomes the session hook. The object shape each state.js
     returns is the shape the API should answer with. */

  var FLOW   = window.CM_FLOW   || { id: "flow", label: "", states: [] };
  var STATES = window.CM_STATES || {};

  function firstKey() {
    return (FLOW.states[0] && FLOW.states[0].k) || Object.keys(STATES)[0];
  }

  var KEY = "cm.demo." + FLOW.id;

  CM.account = function () {
    var k;
    /* ?state= wins and sticks — checkout hands a buyer to the state they
       are now in (2-page-live/home.html?state=coming) */
    var asked = new URLSearchParams(window.location.search).get("state");
    if (asked && STATES[asked]) {
      try { window.localStorage.setItem(KEY, asked); } catch (e) {}
      k = asked;
    } else {
      try { k = window.localStorage.getItem(KEY); } catch (e) { k = null; }
    }
    var base = STATES[k] || STATES[firstKey()] || {};
    var acc = JSON.parse(JSON.stringify(base));

    // Overlay custom dynamic user profile saved in localStorage
    try {
      var customAccount = null;
      try {
        var raw = window.localStorage.getItem("cm.account.custom");
        if (raw) customAccount = JSON.parse(raw);
      } catch (e) {}

      var customUsername = window.localStorage.getItem("cm.username") ||
                           (customAccount && customAccount.profile && customAccount.profile.handle) ||
                           "";
      if (!customUsername || customUsername === "garry" || customUsername === "yourname") {
        customUsername = (acc.profile && acc.profile.handle) || "";
        if (customUsername === "garry" || customUsername === "yourname") customUsername = "";
      }
      if (customUsername) customUsername = customUsername.toLowerCase().trim();

      var rawName = window.localStorage.getItem("cm.name") ||
                    (customAccount && customAccount.user && customAccount.user.name) ||
                    (customAccount && customAccount.profile && customAccount.profile.title) ||
                    (customAccount && customAccount.profile && customAccount.profile.name) ||
                    "";

      var isDummy = (
        rawName === "Garry Singh" || rawName === "Garry" || rawName === "Gurdeep Singh" ||
        rawName === "Your Name" || rawName === "Simran Kaur" || rawName === "User" ||
        rawName === "My Account"
      );
      if (isDummy) {
        rawName = "";
      }

      var customName = rawName || customUsername;

      var rawEmail = window.localStorage.getItem("cm.email") ||
                     (customAccount && customAccount.user && customAccount.user.email) ||
                     (customAccount && customAccount.profile && customAccount.profile.email) ||
                     "";
      if (rawEmail === "garry@example.com" || rawEmail === "you@example.com" || rawEmail === "garry@gmail.com") {
        rawEmail = "";
      }
      var customEmail = rawEmail || (customUsername ? (customUsername + "@gmail.com") : "");

      var rawPhone = window.localStorage.getItem("cm.phone") ||
                     (customAccount && customAccount.profile && customAccount.profile.phone) ||
                     (customAccount && customAccount.user && customAccount.user.phone) ||
                     "";
      if (rawPhone === "9876543210" || rawPhone === "98765 43210") {
        rawPhone = "";
      }

      var customPhoto = (customAccount && customAccount.profile && customAccount.profile.photo) || null;
      if (!customPhoto) {
        try { customPhoto = window.localStorage.getItem("cm.photo"); } catch(e) {}
      }

      var customBio = (customAccount && customAccount.profile && customAccount.profile.bio) || "";
      var customLinks = (customAccount && customAccount.profile && customAccount.profile.links) || null;
      var customCustoms = (customAccount && customAccount.profile && customAccount.profile.customs) || null;

      acc.profile = acc.profile || {};
      acc.user = acc.user || {};
      acc.code = acc.code || {};

      if (customUsername) {
        acc.profile.handle = customUsername;
        acc.code.id = (customAccount && customAccount.code && customAccount.code.id) || customUsername.slice(0, 8);
        acc.code.url = "codemarca.com/c/" + acc.code.id;
      }
      if (customName) {
        acc.profile.title = customName;
        acc.profile.name = customName;
        acc.user.name = customName;
      }
      if (customBio) acc.profile.bio = customBio;
      if (customPhoto) acc.profile.photo = customPhoto;
      if (customLinks) acc.profile.links = customLinks;
      if (customCustoms) acc.profile.customs = customCustoms;
      if (customEmail) {
        acc.profile.email = customEmail;
        acc.user.email = customEmail;
      }
      if (rawPhone) {
        acc.profile.phone = rawPhone.replace(/\D/g, "");
        acc.user.phone = "+91 " + rawPhone.replace(/\D/g, "");
      }
      if (customAccount && customAccount.profile) {
        if (customAccount.profile.theme) acc.profile.theme = customAccount.profile.theme;
        if (customAccount.profile.order) acc.profile.order = customAccount.profile.order;
        if (customAccount.profile.socialOrder) acc.profile.socialOrder = customAccount.profile.socialOrder;
        if (customAccount.profile.live !== undefined) acc.profile.live = customAccount.profile.live;
      }

      var customTheme = window.localStorage.getItem("cm.theme") ||
                        (customAccount && customAccount.profile && customAccount.profile.theme) ||
                        "";
      if (customTheme) {
        acc.profile.theme = customTheme;
      }
      var customFace = window.localStorage.getItem("cm.face") ||
                       (customAccount && customAccount.profile && customAccount.profile.face) || null;
      if (customFace) {
        acc.profile.face = customFace;
      }

      if (customUsername && !CM._syncTriggered) {
        CM._syncTriggered = true;
        setTimeout(function () {
          CM.syncProfileFromDB(customUsername);
        }, 120);
      }
    } catch (e) {}

    return acc;
  };

  CM.SUPABASE_URL = "https://inzigrmttewawjjkggbd.supabase.co";
  CM.SUPABASE_ANON = "sb_publishable_t03O5VnqWX8kbRPDSfdprQ_gjJFAUsg";
  CM.SUPABASE_KEY = CM.SUPABASE_ANON;

  CM.saveProfile = function (profileData, callback) {
    if (!profileData) return;
    try {
      var customAccount = JSON.parse(window.localStorage.getItem("cm.account.custom") || "{}");
      customAccount.profile = customAccount.profile || {};
      customAccount.user = customAccount.user || {};

      var username = profileData.handle || window.localStorage.getItem("cm.username") || (customAccount.profile && customAccount.profile.handle) || "";
      if (username) username = username.toLowerCase().trim();

      for (var k in profileData) {
        if (profileData[k] !== undefined) {
          customAccount.profile[k] = profileData[k];
        }
      }
      if (profileData.name) {
        customAccount.user.name = profileData.name;
        customAccount.profile.title = profileData.name;
        window.localStorage.setItem("cm.name", profileData.name);
      }
      if (profileData.bio !== undefined) {
        window.localStorage.setItem("cm.bio", profileData.bio);
      }
      if (profileData.theme) {
        window.localStorage.setItem("cm.theme", profileData.theme);
      }
      if (profileData.photo) {
        try { window.localStorage.setItem("cm.photo", profileData.photo); } catch (e) {}
      } else if (profileData.photo === null) {
        try { window.localStorage.removeItem("cm.photo"); } catch (e) {}
      }
      if (profileData.face) {
        window.localStorage.setItem("cm.face", profileData.face);
      }
      if (profileData.phone) window.localStorage.setItem("cm.phone", profileData.phone);
      if (profileData.email) window.localStorage.setItem("cm.email", profileData.email);
      if (username) window.localStorage.setItem("cm.username", username);

      window.localStorage.setItem("cm.account.custom", JSON.stringify(customAccount));
      window.localStorage.setItem("cm.profile", JSON.stringify(customAccount.profile));

      // ── Remote Sync: Supabase Direct PATCH ──
      if (username) {
        var patchPayload = {
          updated_at: new Date().toISOString()
        };
        if (profileData.name !== undefined) patchPayload.display_name = profileData.name;
        if (profileData.bio !== undefined) patchPayload.bio = profileData.bio;
        if (profileData.theme !== undefined) patchPayload.theme = profileData.theme;
        if (profileData.photo !== undefined) patchPayload.avatar_url = profileData.photo;
        if (profileData.phone !== undefined) patchPayload.phone = profileData.phone;
        if (profileData.phoneOn !== undefined) patchPayload.phone_visible = profileData.phoneOn;
        if (profileData.wa !== undefined) patchPayload.whatsapp = profileData.wa;
        if (profileData.waOn !== undefined) patchPayload.whatsapp_visible = profileData.waOn;
        if (profileData.email !== undefined) patchPayload.email = profileData.email;
        if (profileData.emailOn !== undefined) patchPayload.email_visible = profileData.emailOn;
        if (profileData.live !== undefined) patchPayload.is_live = profileData.live;

        fetch(CM.SUPABASE_URL + "/rest/v1/profiles?username=eq." + encodeURIComponent(username), {
          method: "PATCH",
          headers: {
            "apikey": CM.SUPABASE_KEY,
            "Authorization": "Bearer " + CM.SUPABASE_KEY,
            "Content-Type": "application/json",
            "Prefer": "return=representation"
          },
          body: JSON.stringify(patchPayload)
        }).then(function (res) {
          return res.json();
        }).then(function (data) {
          if (callback) callback(null, data);
        }).catch(function (err) {
          if (callback) callback(err);
        });

        // Also hit Next.js get-values POST route if running
        fetch("/api/dashboard/get-values", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: username,
            profile: profileData
          })
        }).catch(function () {});
      }
      try {
        window.dispatchEvent(new CustomEvent("cm-profile-updated", { detail: customAccount.profile }));
      } catch (e) {}
    } catch (err) {
      console.warn("CM.saveProfile error:", err);
      if (callback) callback(err);
    }
  };

  CM.syncProfileFromDB = function (username, callback) {
    if (!username) {
      username = window.localStorage.getItem("cm.username") || "";
      if (!username) {
        try {
          var ca = JSON.parse(window.localStorage.getItem("cm.account.custom") || "{}");
          username = (ca.profile && ca.profile.handle) || "";
        } catch (e) {}
      }
    }
    if (!username || username === "garry" || username === "gurdeep") return;
    username = username.toLowerCase().trim();

    fetch(CM.SUPABASE_URL + "/rest/v1/profiles?username=eq." + encodeURIComponent(username) + "&select=*", {
      headers: {
        "apikey": CM.SUPABASE_ANON,
        "Authorization": "Bearer " + CM.SUPABASE_ANON
      }
    }).then(function (res) {
      return res.json();
    }).then(function (rows) {
      if (!rows || !rows[0]) return;
      var dbRow = rows[0];
      var customAccount = JSON.parse(window.localStorage.getItem("cm.account.custom") || "{}");
      customAccount.profile = customAccount.profile || {};
      customAccount.user = customAccount.user || {};

      if (dbRow.display_name) {
        customAccount.profile.name = dbRow.display_name;
        customAccount.profile.title = dbRow.display_name;
        customAccount.user.name = dbRow.display_name;
        window.localStorage.setItem("cm.name", dbRow.display_name);
      }
      if (dbRow.bio !== undefined && dbRow.bio !== null) {
        customAccount.profile.bio = dbRow.bio;
        window.localStorage.setItem("cm.bio", dbRow.bio);
      }
      if (dbRow.theme) {
        customAccount.profile.theme = dbRow.theme;
        window.localStorage.setItem("cm.theme", dbRow.theme);
      }
      if (dbRow.avatar_url) {
        customAccount.profile.photo = dbRow.avatar_url;
        try { window.localStorage.setItem("cm.photo", dbRow.avatar_url); } catch (e) {}
      }
      if (dbRow.phone) {
        customAccount.profile.phone = dbRow.phone;
        window.localStorage.setItem("cm.phone", dbRow.phone);
      }
      if (dbRow.whatsapp) customAccount.profile.wa = dbRow.whatsapp;
      if (dbRow.email) {
        customAccount.profile.email = dbRow.email;
        customAccount.user.email = dbRow.email;
        window.localStorage.setItem("cm.email", dbRow.email);
      }
      if (dbRow.is_live !== undefined && dbRow.is_live !== null) {
        customAccount.profile.live = dbRow.is_live;
      }

      window.localStorage.setItem("cm.account.custom", JSON.stringify(customAccount));
      window.localStorage.setItem("cm.profile", JSON.stringify(customAccount.profile));

      try {
        window.dispatchEvent(new CustomEvent("cm-profile-synced", { detail: customAccount.profile }));
      } catch (e) {}
      if (callback) callback(null, customAccount.profile);
    }).catch(function (err) {
      if (callback) callback(err);
    });
  };

  CM.setState = function (k) {
    try { window.localStorage.setItem(KEY, k); } catch (e) {}
    /* drop a ?state= from the address, or it would overrule the pick */
    var u = new URL(window.location.href);
    u.searchParams.delete("state");
    window.location.href = u.toString();
  };

  /* ══ 2. ICONS ═══════════════════════════════════════════════════════════ */

  var I = {
    home:  '<path d="M3 10.2 12 3l9 7.2V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    user:  '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
    box:   '<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="m3 7.5 9 4.5 9-4.5M12 12v9"/>',
    qr:    '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20v.01M20 20v.01M17.5 20v.01M20 17.5v.01"/>',
    gear:  '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5v.2a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
    chev:  '<path d="m9 6 6 6-6 6"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    back:  '<path d="m15 6-6 6 6 6"/>',
    check: '<path d="m5 12 5 5L19 7"/>',
    copy:  '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
    share: '<path d="M12 15V3m0 0L8 7m4-4 4 4"/><path d="M4 13v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6"/>',
    eye:   '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
    lock:  '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    plus:  '<path d="M12 5v14M5 12h14"/>',
    truck: '<path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/>',
    pen:   '<path d="M4 20h4L20 8l-4-4L4 16z"/>',
    out:   '<path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/><path d="M10 8 6 12l4 4M6 12h10"/>',
    link:  '<path d="M10.5 13.5a4 4 0 0 0 5.7 0l2.8-2.8a4 4 0 1 0-5.7-5.7l-1.4 1.4"/><path d="M13.5 10.5a4 4 0 0 0-5.7 0l-2.8 2.8a4 4 0 1 0 5.7 5.7l1.4-1.4"/>',
    grip:  '<circle cx="9" cy="6" r="1.3"/><circle cx="15" cy="6" r="1.3"/><circle cx="9" cy="12" r="1.3"/><circle cx="15" cy="12" r="1.3"/><circle cx="9" cy="18" r="1.3"/><circle cx="15" cy="18" r="1.3"/>',
    card:  '<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 9.5h19M6 14.5h4"/>',
    tag:   '<path d="M3 11.2V4.5A1.5 1.5 0 0 1 4.5 3h6.7a2 2 0 0 1 1.4.6l7.8 7.8a2 2 0 0 1 0 2.8l-6.2 6.2a2 2 0 0 1-2.8 0L3.6 12.6a2 2 0 0 1-.6-1.4Z"/><circle cx="7.8" cy="7.8" r="1.4"/>',
    pause: '<rect x="8" y="5" width="3" height="14" rx="1"/><rect x="13" y="5" width="3" height="14" rx="1"/>',
    play:  '<path d="M8 5.5v13l11-6.5z"/>',
    trash: '<path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M6 7v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7"/>',
    down:  '<path d="M12 4v11m0 0 4-4m-4 4-4-4"/><path d="M5 19h14"/>',
    chat:  '<path d="M20.5 11.5a8 8 0 0 1-11.8 7L3.5 20l1.6-4.7A8 8 0 1 1 20.5 11.5Z"/>',
    mail:  '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>',
    phone: '<path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6L16.5 13l4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z"/>',
    shield:'<path d="M12 3.2 5 6v5.4c0 4 2.9 7.7 7 9.4 4.1-1.7 7-5.4 7-9.4V6z"/><path d="m9 12 2 2 4-4"/>',
    help:  '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.3 2.4c-.6.2-.9.8-.9 1.4v.3"/><path d="M12 17v.01"/>',
    bell:  '<path d="M18 9a6 6 0 1 0-12 0c0 4.2-1.3 5.6-1.9 6.2a.9.9 0 0 0 .6 1.5h14.6a.9.9 0 0 0 .6-1.5c-.6-.6-1.9-2-1.9-6.2Z"/><path d="M10.2 20a2.1 2.1 0 0 0 3.6 0"/>',
    more:  '<circle cx="5.5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18.5" cy="12" r="1.5"/>',
    gift:  '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v7.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V12M12 8v13"/><path d="M12 8C10.6 5.2 7 4.6 7 6.6 7 8 9.8 8 12 8Zm0 0c1.4-2.8 5-3.4 5-1.4C17 8 14.2 8 12 8Z"/>'
  };

  /* SOLID SET — worn by the current nav item, in the sidebar and in the
     bottom tabs. Every outline above is a closed shape, so filling it gives
     the same silhouette with no jump between states; only the gear needs a
     path of its own, because it has to keep the hole in the middle and an
     even-odd subpath is what puts it there. */
  var IF = {
    /* stroke-less, so the 2px ribbon down the middle stays open when filled */
    gift: '<g stroke="none"><path d="M2.1 8.7a1.6 1.6 0 0 1 1.6-1.6H11v5.2H3.7a1.6 1.6 0 0 1-1.6-1.6z"/><path d="M13 7.1h7.3a1.6 1.6 0 0 1 1.6 1.6v2a1.6 1.6 0 0 1-1.6 1.6H13z"/><path d="M4.1 13.3H11v8.6H6.1a2 2 0 0 1-2-2z"/><path d="M13 13.3h6.9v6.6a2 2 0 0 1-2 2H13z"/><path d="M11 7.1C9.6 4.3 6.2 3.6 6.2 5.8c0 1.3 1.9 1.3 4.8 1.3Z"/><path d="M13 7.1c1.4-2.8 4.8-3.5 4.8-1.3 0 1.3-1.9 1.3-4.8 1.3Z"/></g>',
    more: '<g stroke="none"><circle cx="5.5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="18.5" cy="12" r="2"/></g>',
    gear: '<path fill-rule="evenodd" d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5v.2a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1zM12 9.1a2.9 2.9 0 1 0 0 5.8 2.9 2.9 0 0 0 0-5.8z"/>'
  };

  CM.icon = function (name, cls) {
    return '<svg class="' + (cls || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      (I[name] || "") + "</svg>";
  };

  CM.iconSolid = function (name, cls) {
    return '<svg class="' + (cls || "") + '" viewBox="0 0 24 24" fill="currentColor" ' +
      'stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true">' + (IF[name] || I[name] || "") + "</svg>";
  };

  /* the wordmark and the mark, lifted from checkout.html so every screen
     in the product is carrying the same file */
  var LOGO_WM = '<svg class="wm" viewBox="0 0 257 40" fill="none" role="img" aria-label="Codemarca"><g fill="#6E27E6"><path d="M33.1134 20.2323H23.257C21.5532 20.2323 20.1719 18.851 20.1719 17.1473V7.29084C20.1719 5.58706 18.7907 4.20581 17.0869 4.20581H7.2291C5.52529 4.20581 4.14404 5.58706 4.14404 7.29084V17.1479C4.14404 18.8517 5.52529 20.233 7.2291 20.233H17.0855C18.7893 20.233 20.1706 21.6142 20.1706 23.318V33.1744C20.1706 34.8782 21.5518 36.2595 23.2556 36.2595H33.1134C34.8172 36.2595 36.1984 34.8782 36.1984 33.1744V23.3173C36.1984 21.6135 34.8172 20.2323 33.1134 20.2323Z"/><path d="M31.7853 17.9021C35.4337 16.3909 37.1662 12.2083 35.655 8.55988C34.1438 4.9115 29.9612 3.17899 26.3128 4.69019C22.6644 6.20139 20.9319 10.3841 22.4431 14.0324C23.9543 17.6808 28.137 19.4133 31.7853 17.9021Z"/><path d="M11.2943 36.2599C15.2432 36.2599 18.4445 33.0587 18.4445 29.1097C18.4445 25.1607 15.2432 21.9595 11.2943 21.9595C7.34533 21.9595 4.14404 25.1607 4.14404 29.1097C4.14404 33.0587 7.34533 36.2599 11.2943 36.2599Z"/></g><g fill="#101215"><path d="M245.956 14.0999H252.172V34.82H245.956V32.8723C244.589 34.447 242.558 35.4002 239.782 35.4002C234.353 35.4002 229.877 30.6345 229.877 24.46C229.877 18.2854 234.353 13.5198 239.782 13.5198C242.558 13.5198 244.589 14.4729 245.956 16.0476V14.0999ZM241.025 29.5157C243.884 29.5157 245.956 27.568 245.956 24.46C245.956 21.352 243.884 19.4043 241.025 19.4043C238.165 19.4043 236.093 21.352 236.093 24.46C236.093 27.568 238.165 29.5157 241.025 29.5157Z"/><path d="M220.695 35.4002C214.396 35.4002 209.713 30.6345 209.713 24.46C209.713 18.2854 214.396 13.5198 220.695 13.5198C224.714 13.5198 228.278 15.6332 230.06 18.8241L224.631 21.9736C223.927 20.5232 222.435 19.6529 220.612 19.6529C217.918 19.6529 215.929 21.6006 215.929 24.46C215.929 27.3193 217.918 29.267 220.612 29.267C222.435 29.267 223.968 28.3968 224.631 26.9464L230.06 30.0544C228.278 33.2867 224.756 35.4002 220.695 35.4002Z"/><path d="M203.477 17.7881C204.306 15.0116 207.083 13.6855 209.693 13.6855V20.7304C207.124 20.316 203.477 21.352 203.477 25.4545V34.82H197.261V14.1H203.477V17.7881Z"/><path d="M187.728 14.0999H193.944V34.82H187.728V32.8723C186.361 34.447 184.33 35.4002 181.554 35.4002C176.125 35.4002 171.649 30.6345 171.649 24.46C171.649 18.2854 176.125 13.5198 181.554 13.5198C184.33 13.5198 186.361 14.4729 187.728 16.0476V14.0999ZM182.797 29.5157C185.656 29.5157 187.728 27.568 187.728 24.46C187.728 21.352 185.656 19.4043 182.797 19.4043C179.937 19.4043 177.865 21.352 177.865 24.46C177.865 27.568 179.937 29.5157 182.797 29.5157Z"/><path d="M161.806 13.5198C166.571 13.5198 169.679 16.9179 169.679 22.0979V34.82H163.463V22.6366C163.463 20.5646 162.469 19.2385 160.479 19.2385C158.407 19.2385 157.247 20.6889 157.247 23.1339V34.82H151.031V22.6366C151.031 20.5646 150.037 19.2385 148.047 19.2385C145.975 19.2385 144.815 20.6889 144.815 23.1339V34.82H138.599V14.0999H144.815V16.0062C145.768 14.5972 147.592 13.5198 150.368 13.5198C152.813 13.5198 154.636 14.5143 155.797 16.2548C156.957 14.5972 158.863 13.5198 161.806 13.5198Z"/><path d="M121.357 26.9464C122.144 29.1013 124.051 29.8472 126.33 29.8472C128.029 29.8472 129.479 29.1841 130.308 28.2725L135.281 31.1318C133.25 33.9497 130.184 35.4002 126.247 35.4002C119.161 35.4002 114.768 30.6345 114.768 24.46C114.768 18.2854 119.244 13.5198 125.791 13.5198C131.841 13.5198 136.317 18.2025 136.317 24.46C136.317 25.3302 136.234 26.159 136.068 26.9464H121.357ZM121.233 22.3051H130.142C129.479 19.9016 127.614 19.0313 125.75 19.0313C123.388 19.0313 121.813 20.1916 121.233 22.3051Z"/><path d="M106.271 5.81201H112.487V34.8201H106.271V32.8724C104.903 34.4471 102.873 35.4002 100.096 35.4002C94.6674 35.4002 90.1919 30.6346 90.1919 24.4601C90.1919 18.2855 94.6674 13.5199 100.096 13.5199C102.873 13.5199 104.903 14.473 106.271 16.0477V5.81201ZM101.339 29.5158C104.199 29.5158 106.271 27.5681 106.271 24.4601C106.271 21.3521 104.199 19.4044 101.339 19.4044C98.4799 19.4044 96.4079 21.3521 96.4079 24.4601C96.4079 27.5681 98.4799 29.5158 101.339 29.5158Z"/><path d="M77.9738 35.4002C71.8821 35.4002 66.9922 30.6345 66.9922 24.46C66.9922 18.2854 71.8821 13.5198 77.9738 13.5198C84.0655 13.5198 88.9554 18.2854 88.9554 24.46C88.9554 30.6345 84.0655 35.4002 77.9738 35.4002ZM77.9738 29.3499C80.6674 29.3499 82.7394 27.4022 82.7394 24.46C82.7394 21.5177 80.6674 19.57 77.9738 19.57C75.2802 19.57 73.2082 21.5177 73.2082 24.46C73.2082 27.4022 75.2802 29.3499 77.9738 29.3499Z"/><path d="M57.8088 35.4002C51.5099 35.4002 46.8271 30.6345 46.8271 24.46C46.8271 18.2854 51.5099 13.5198 57.8088 13.5198C61.8285 13.5198 65.3923 15.6332 67.1742 18.8241L61.7456 21.9736C61.0411 20.5232 59.5493 19.6529 57.7259 19.6529C55.0323 19.6529 53.0432 21.6006 53.0432 24.46C53.0432 27.3193 55.0323 29.267 57.7259 29.267C59.5493 29.267 61.0825 28.3968 61.7456 26.9464L67.1742 30.0544C65.3923 33.2867 61.8699 35.4002 57.8088 35.4002Z"/></g></svg>';
  var LOGO_MK = '<svg class="mk" viewBox="0 0 40 40" fill="#6E27E6" role="img" aria-label="Codemarca"><path d="M33.1134 20.2323H23.257C21.5532 20.2323 20.1719 18.851 20.1719 17.1473V7.29084C20.1719 5.58706 18.7907 4.20581 17.0869 4.20581H7.2291C5.52529 4.20581 4.14404 5.58706 4.14404 7.29084V17.1479C4.14404 18.8517 5.52529 20.233 7.2291 20.233H17.0855C18.7893 20.233 20.1706 21.6142 20.1706 23.318V33.1744C20.1706 34.8782 21.5518 36.2595 23.2556 36.2595H33.1134C34.8172 36.2595 36.1984 34.8782 36.1984 33.1744V23.3173C36.1984 21.6135 34.8172 20.2323 33.1134 20.2323Z"/><path d="M31.7853 17.9021C35.4337 16.3909 37.1662 12.2083 35.655 8.55988C34.1438 4.9115 29.9612 3.17899 26.3128 4.69019C22.6644 6.20139 20.9319 10.3841 22.4431 14.0324C23.9543 17.6808 28.137 19.4133 31.7853 17.9021Z"/><path d="M11.2943 36.2599C15.2432 36.2599 18.4445 33.0587 18.4445 29.1097C18.4445 25.1607 15.2432 21.9595 11.2943 21.9595C7.34533 21.9595 4.14404 25.1607 4.14404 29.1097C4.14404 33.0587 7.34533 36.2599 11.2943 36.2599Z"/></svg>';

  /* ══ 3. NAV ═════════════════════════════════════════════════════════════
     Orders and Code grey out until the account actually has one. They
     stay clickable — the page behind them explains itself. */

  /* GIFT & REFER — added 2026-09-18, Garry. Gifts are paid and live on a
     tab of their own, in every flow, so the free pack never has to ask who
     it is for.

     MORE — 2026-09-24, Garry. The phone bar holds five and the sidebar
     holds six, so on the phone the two tabs nobody opens daily — Gift &
     Refer and Settings — moved behind one More button (`more: true`), and
     the bar carries four real tabs plus it. The sidebar is untouched: on a
     desktop all six still stand in the rail. */
  var NAV = [
    { id: "home",     label: "Home",         href: "home.html",     icon: "home" },
    { id: "profile",  label: "Profile",      href: "profile.html",  icon: "user" },
    { id: "orders",   label: "Orders",       href: "orders.html",   icon: "box"  },
    { id: "qr",       label: "My QR",        href: "qr.html",       icon: "qr"   },
    /* Quick chat inbox (Phase-1, 2026-10-13). Not in the phone's bottom bar —
       the phone gets it as a chat icon beside the bell, like a DM inbox. */
    { id: "messages", label: "Messages",     href: "messages.html", icon: "chat", tabs: false },
    { id: "gift",     label: "Gift & Refer", href: "gift.html",     icon: "gift",
      more: true, sub: "Gift a pack, invite friends, your tee" },
    { id: "settings", label: "Settings",     href: "settings.html", icon: "gear",
      more: true, sub: "Account, email, password, log out" }
  ];

  /* Everything outside the flow folder is two levels up. Pages use ROOT so
     that moving a folder never means hunting for ../.. in five files. */
  CM.ROOT = "../../";

  function navFlags(a) {
    return {
      /* a gift is an order too — someone who has only ever gifted still has a bill to see */
      orders: { locked: !a.order && !(a.gifts && a.gifts.length),
                dot: !!(a.order && a.order.status !== "delivered") },
      qr:     { locked: false, dot: false },
      profile:{ locked: !a.profile, dot: !a.profile },
      messages:{ locked: false, dot: CM.unread(a) > 0 }
    };
  }

  /* unread requests + unread chats — the chat icon's badge */
  CM.unread = function (a) {
    if (!a) { a = CM.account(); }
    var s = a && a.social;
    if (!s) { return 0; }
    return (s.requests || []).filter(function (r) { return r.unread; }).length +
           (s.chats || []).filter(function (c) { return c.unread; }).length;
  };

  /* ══ 4. SHELL ═══════════════════════════════════════════════════════════ */

  CM.shell = function (opts) {
    var a = CM.account();
    var f = navFlags(a);
    var app = document.querySelector(".app");
    var main = document.querySelector(".app__main");
    var initial = (a.user.name || "?").trim().charAt(0).toUpperCase();

    /* — sidebar, desktop — */
    var side = document.createElement("aside");
    side.className = "side";
    side.innerHTML =
      '<a class="side__logo" href="' + CM.ROOT + 'homepage.html" aria-label="Codemarca home">' + LOGO_WM + "</a>" +
      '<nav class="side__nav" aria-label="Dashboard">' +
        NAV.map(function (n) {
          var s = f[n.id] || {};
          var cur = n.id === opts.page;
          return '<a class="side__link" href="' + n.href + '"' +
            (cur ? ' aria-current="page"' : "") +
            (s.locked ? ' data-locked=""' : "") + ">" +
            (cur ? CM.iconSolid(n.icon) : CM.icon(n.icon)) + "<span>" + n.label + "</span>" +
            (s.dot ? '<span class="side__dot" aria-hidden="true"></span>' : "") +
            "</a>";
        }).join("") +
      "</nav>" +
      '<a class="side__me" href="settings.html">' +
        '<span class="avatar">' + (a.profile && a.profile.photo ? '<img src="' + a.profile.photo + '" alt="">' : CM.FACE) + "</span>" +
        '<span class="side__me__txt">' +
          '<span class="side__me__name">' + a.user.name + "</span>" +
          '<span class="side__me__mail">' + a.user.email + "</span>" +
        "</span>" +
      "</a>";
    app.insertBefore(side, app.firstChild);

    /* — top bar, mobile — */
    var top = document.createElement("header");
    top.className = "top";
    top.innerHTML =
      (opts.back
        ? '<a class="top__back" href="' + opts.back + '" aria-label="Back">' + CM.icon("back") + "</a>" +
          '<span class="top__title">' + (opts.title || "") + "</span>"
        : '<a class="top__logo" href="' + CM.ROOT + 'homepage.html" aria-label="Codemarca home">' + LOGO_MK + "</a>" +
          '<span class="top__title">' + (opts.title || "") + "</span>") +
      /* The avatar used to sit here and open Settings. Settings moved into
         More on the bar (2026-09-24), so the corner is the bell's now. */
      '<span class="top__end">' +
        '<a class="top__bell bell" href="messages.html" aria-label="Messages' + (CM.unread(a) ? ", " + CM.unread(a) + " unread" : "") + '">' +
          CM.icon("chat") + '<span class="bell__n"' + (CM.unread(a) ? "" : " hidden") + ">" + CM.unread(a) + "</span></a>" +
        '<button class="top__bell bell" type="button" data-bell aria-haspopup="dialog" ' +
          'aria-label="Notifications">' + CM.icon("bell") + '<span class="bell__n" hidden></span></button>' +
      "</span>";
    main.insertBefore(top, main.firstChild);

    /* — the bell, desktop — Garry, 2026-09-27. The phone had it in the top
       bar; the desktop has no top bar, so it gets a strip of its own above
       the page head, the same width as the content column, so the bell
       lands over the right edge of the cards on every tab. */
    var dbar = document.createElement("div");
    dbar.className = "dbar";
    dbar.innerHTML =
      '<a class="dbar__bell bell" href="messages.html" aria-label="Messages' + (CM.unread(a) ? ", " + CM.unread(a) + " unread" : "") + '">' +
        CM.icon("chat") + '<span class="bell__n"' + (CM.unread(a) ? "" : " hidden") + ">" + CM.unread(a) + "</span></a>" +
      '<button class="dbar__bell bell" type="button" data-bell aria-haspopup="dialog" aria-expanded="false" ' +
        'aria-label="Notifications">' + CM.icon("bell") + '<span class="bell__n" hidden></span></button>';
    main.insertBefore(dbar, top.nextSibling);
    var onScroll = function () { top.setAttribute("data-scrolled", window.scrollY > 8 ? "true" : "false"); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* — bottom tabs, mobile — */
    var tabs = document.createElement("nav");
    tabs.className = "tabs";
    tabs.setAttribute("aria-label", "Dashboard");
    var inMore = NAV.filter(function (n) { return n.more; });
    var onMore = inMore.some(function (n) { return n.id === opts.page; });

    /* More sits at the tail of the bar (Garry, 2026-09-24), so Home keeps the
       first slot. It lights up violet the same way a tab does while you are
       standing on one of the screens it holds, so the bar never says "you
       are nowhere". */
    tabs.innerHTML =
      NAV.filter(function (n) { return n.tabs !== false && !n.more; }).map(function (n) {
        var s = f[n.id] || {};
        var cur = n.id === opts.page;
        return '<a class="tabs__link" href="' + n.href + '"' +
          (cur ? ' aria-current="page"' : "") +
          (s.locked ? ' data-locked=""' : "") + ">" +
          (cur ? CM.iconSolid(n.icon) : CM.icon(n.icon)) + "<span>" + n.label + "</span>" +
          (s.dot ? '<span class="tabs__dot" aria-hidden="true"></span>' : "") +
          "</a>";
      }).join("") +
      '<button class="tabs__link" type="button" data-more' +
        (onMore ? ' aria-current="page"' : "") + ' aria-haspopup="dialog">' +
        (onMore ? CM.iconSolid("more") : CM.icon("more")) + "<span>More</span>" +
      "</button>";
    app.appendChild(tabs);

    CM.notes.mount(a, top.querySelector("[data-bell]"), dbar);

    tabs.querySelector("[data-more]").addEventListener("click", function () {
      CM.sheet({
        title: "More",
        html: '<div class="more">' + inMore.map(function (n) {
          var cur = n.id === opts.page;
          return '<a class="more__row" href="' + n.href + '"' +
            (cur ? ' aria-current="page"' : "") + ">" +
            '<span class="more__ic">' + CM.icon(n.icon) + "</span>" +
            '<span class="more__txt"><span class="more__l">' + n.label + "</span>" +
              '<span class="more__s">' + n.sub + "</span></span>" +
            '<span class="more__go">' + CM.icon("chev") + "</span>" +
          "</a>";
        }).join("") +
        '<button class="more__row" type="button" id="cmMoreLogout" style="width:100%;text-align:left;background:none;border:none;cursor:pointer;font:inherit;color:#ef4444;border-top:1px solid rgba(255,255,255,0.08);padding:14px 16px;display:flex;align-items:center;gap:12px">' +
          '<span class="more__ic" style="color:#ef4444">' + CM.icon("out") + "</span>" +
          '<span class="more__txt" style="flex:1"><span class="more__l" style="color:#ef4444;font-weight:700">Log out</span>' +
            '<span class="more__s" style="opacity:0.7">Sign out from this device</span></span>' +
          '<span class="more__go" style="color:#ef4444">' + CM.icon("chev") + "</span>" +
        '</button>' +
        "</div>"
      });
      var btnOut = document.getElementById("cmMoreLogout");
      if (btnOut) {
        btnOut.addEventListener("click", function () {
          if (CM.logout) CM.logout();
        });
      }
    });

    /* Deferred by a tick on purpose: not every home calls CM.draw, and the
       ones that do write the initial into .me__av after the shell has run.
       A timeout of 0 lands after the page's own script, whichever way it
       fills the card (Garry, 2026-09-24 — one page, one look). */
    setTimeout(function () { paintAvatar(a); }, 0);

    CM.foldCards();
    CM.fold();
    mountDemo(a);
    hookRealtimeInbox(a);
    return a;
  };

  function hookRealtimeInbox(a) {
    if (!window.CMChat) {
      var sc = document.createElement("script");
      sc.src = (CM.ROOT || "") + "cm-chat.js";
      document.head.appendChild(sc);
    }
    var check = setInterval(function () {
      if (window.CMChat) {
        clearInterval(check);
        var ownerHandle = (a.profile && a.profile.handle) || window.localStorage.getItem("cm.username") || "";
        if (!ownerHandle) return;
        ownerHandle = ownerHandle.toLowerCase().trim();
        window.CMChat.joinChannel("owner_" + ownerHandle);

        window.CMChat.getOwnerRooms(ownerHandle).then(function (rooms) {
          if (!rooms) return;
          var unread = rooms.filter(function (r) { return r.is_request && r.status === "pending"; }).length;
          if (unread > 0) {
            updateChatBells(unread);
          }
        });

        window.CMChat.on("NEW_REQUEST", function (ev, payload) {
          var bells = document.querySelectorAll(".top__bell.bell:not([data-bell]) .bell__n, .dbar__bell.bell:not([data-bell]) .bell__n");
          var cur = 0;
          bells.forEach(function (b) { var n = parseInt(b.textContent, 10); if (!isNaN(n)) cur = Math.max(cur, n); });
          cur++;
          updateChatBells(cur);
          if (window.CMChat.playNotificationSound) window.CMChat.playNotificationSound();
          if (CM.toast) CM.toast("New message request from " + (payload.name || "visitor").split(" ")[0]);
        });
      }
    }, 100);
    setTimeout(function () { clearInterval(check); }, 5000);
  }

  function updateChatBells(count) {
    var bells = document.querySelectorAll(".top__bell.bell:not([data-bell]) .bell__n, .dbar__bell.bell:not([data-bell]) .bell__n");
    bells.forEach(function (b) {
      b.textContent = count;
      b.hidden = count <= 0;
      if (b.classList) b.classList.toggle("hidden", count <= 0);
    });
  }

  /* ══ 4b. LONG NOTES FOLD ON A PHONE ═════════════════════════════════════
     Garry, 2026-09-24: the Orders tab reads fine on a desktop and is too
     much on a phone. The fix is NOT less copy on the phone — someone who
     reads the app and then the site has to find the same product, not two
     different explanations. So the words stay identical and simply do not
     all land at once: a paragraph marked `data-fold` clamps to two lines
     under 1024px with a More / Less toggle, and stands open on a desktop.

     The button appears only when the text actually overflows those two
     lines, so marking a short note costs nothing. Measured after the
     webfont lands, because Manrope wraps differently from the fallback. */
  CM.fold = function (root) {
    var mq = window.matchMedia("(max-width:1023px)");

    /* `data-fold="card"` is the other folder's, below — this one only ever
       clamps text, and matching a card here would clip the whole card. */
    Array.prototype.forEach.call(
      (root || document).querySelectorAll('[data-fold]:not([data-fold="card"])'), function (p) {
      if (p.dataset.foldReady) { return; }
      p.dataset.foldReady = "1";
      p.classList.add("fold");

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "fold__btn";
      p.insertAdjacentElement("afterend", btn);

      var open = false;
      function sync() {
        if (!mq.matches) {                  /* desktop: nothing is folded */
          p.dataset.open = "true";
          btn.hidden = true;
          return;
        }
        p.dataset.open = open ? "true" : "false";
        if (!open) { btn.hidden = p.scrollHeight - p.clientHeight <= 2; }
        btn.textContent = open ? "Less" : "More";
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      }

      /* A note inside a closed accordion measures zero, so the folder has
         to be asked again the moment the panel opens — CM.refold(panel). */
      p._foldSync = sync;
      btn.addEventListener("click", function () { open = !open; sync(); });
      /* a rotate or a resize across the breakpoint re-folds it */
      (mq.addEventListener ? mq.addEventListener.bind(mq, "change") : mq.addListener.bind(mq))(
        function () { open = false; sync(); }
      );
      sync();
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () { if (!open) { sync(); } });
      }
    });
  };

  /* A WHOLE CARD FOLDS ON A PHONE — same reasoning, one level up.
     `data-fold="card"` keeps the card's title on screen and puts the rest
     behind it: a supporting card is still announced, it just does not spend
     a third of a phone screen explaining itself before the list the tab is
     actually for. Open on a desktop, where there is room for all of it. */
  CM.foldCards = function (root) {
    var mq = window.matchMedia("(max-width:1023px)");

    Array.prototype.forEach.call(
      (root || document).querySelectorAll('[data-fold="card"]'), function (card) {
        if (card.dataset.foldReady) { return; }
        card.dataset.foldReady = "1";
        card.classList.add("foldc");

        var title = card.firstElementChild;
        var body = document.createElement("div");
        body.className = "foldc__body";
        while (title.nextSibling) { body.appendChild(title.nextSibling); }
        card.appendChild(body);

        var head = document.createElement("button");
        head.type = "button";
        head.className = "foldc__head";
        card.insertBefore(head, title);
        head.appendChild(title);
        head.insertAdjacentHTML("beforeend",
          '<span class="foldc__chev">' + CM.icon("chev") + "</span>");

        var open = false;
        function sync() {
          var shut = mq.matches && !open;
          body.hidden = shut;
          head.setAttribute("aria-expanded", String(!shut));
          head.disabled = !mq.matches;
        }
        head.addEventListener("click", function () {
          open = !open;
          sync();
          /* a clamped paragraph inside measured zero while the card was
             shut, so its own More button has to be worked out now */
          if (!body.hidden) { CM.refold(body); }
        });
        (mq.addEventListener ? mq.addEventListener.bind(mq, "change") : mq.addListener.bind(mq))(
          function () { open = false; sync(); }
        );
        sync();
      });
  };

  CM.refold = function (root) {
    Array.prototype.forEach.call(
      (root || document).querySelectorAll('[data-fold]:not([data-fold="card"])'), function (p) {
        if (p._foldSync) { p._foldSync(); }
      });
  };

  /* ══ 5. CODEMARCA SIGNATURE SCANNABLE QR ════════════════════════════
     Encodes real target URL with Error Correction Level H.
     Includes signature purple eyes (#6E27E6) and center Codemarca logo mark. */

  CM.qr = function (seed) {
    var raw = String(seed || "code").trim();
    var target = raw.indexOf("http") === 0 ? raw : ("https://codemarca.com/" + raw.replace(/^@/, ""));

    var N = 25;
    var qr = null;

    if (typeof qrcode === "function") {
      try {
        qr = qrcode(0, "H");
        qr.addData(target);
        qr.make();
        N = qr.getModuleCount();
      } catch (e) {
        console.warn("QR encoding notice:", e);
      }
    }

    function isFinder(r, c) {
      if (r < 7 && c < 7) return true;
      if (r < 7 && c >= N - 7) return true;
      if (r >= N - 7 && c < 7) return true;
      return false;
    }

    var logoM = Math.max(5, Math.floor(N * 0.22));
    if (logoM % 2 === 0) logoM += 1;
    var logoStart = Math.floor((N - logoM) / 2);
    var logoEnd = logoStart + logoM;

    function isLogo(r, c) {
      return r >= logoStart && r < logoEnd && c >= logoStart && c < logoEnd;
    }

    // Hash fallback if qrcode not available
    var h = 2166136261;
    for (var i = 0; i < raw.length; i++) { h ^= raw.charCodeAt(i); h = (h * 16777619) >>> 0; }
    function rnd() { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; h >>>= 0; return h / 4294967296; }

    var mods = "";
    for (var y = 0; y < N; y++) {
      for (var x = 0; x < N; x++) {
        if (isFinder(y, x) || isLogo(y, x)) continue;
        var on = qr ? qr.isDark(y, x) : (rnd() > 0.52);
        if (on) {
          mods += '<rect x="' + (x + 0.06).toFixed(2) + '" y="' + (y + 0.06).toFixed(2) + '" width="0.88" height="0.88" rx="0.30" fill="#101215"/>';
        }
      }
    }

    function finder(fx, fy) {
      return '<rect x="' + fx + '" y="' + fy + '" width="7" height="7" rx="1.6" fill="#101215"/>' +
             '<rect x="' + (fx + 1.4).toFixed(2) + '" y="' + (fy + 1.4).toFixed(2) + '" width="4.2" height="4.2" rx="1" fill="#fff"/>' +
             '<rect x="' + (fx + 2.4).toFixed(2) + '" y="' + (fy + 2.4).toFixed(2) + '" width="2.2" height="2.2" rx=".6" fill="#6E27E6"/>';
    }

    var badgePad = 0.2;
    var bX = (logoStart - badgePad).toFixed(2);
    var bY = (logoStart - badgePad).toFixed(2);
    var bS = (logoM + badgePad * 2).toFixed(2);
    var mPad = 0.7;
    var mX = (logoStart - badgePad + mPad).toFixed(2);
    var mY = (logoStart - badgePad + mPad).toFixed(2);
    var mS = (logoM + badgePad * 2 - mPad * 2).toFixed(2);

    var logoBadge = '<rect x="' + bX + '" y="' + bY + '" width="' + bS + '" height="' + bS + '" rx="1.3" fill="#fff"/>' +
      '<svg x="' + mX + '" y="' + mY + '" width="' + mS + '" height="' + mS + '" viewBox="0 0 40 40" fill="#6E27E6">' +
      '<path d="M33.1134 20.2323H23.257C21.5532 20.2323 20.1719 18.851 20.1719 17.1473V7.29084C20.1719 5.58706 18.7907 4.20581 17.0869 4.20581H7.2291C5.52529 4.20581 4.14404 5.58706 4.14404 7.29084V17.1479C4.14404 18.8517 5.52529 20.233 7.2291 20.233H17.0855C18.7893 20.233 20.1706 21.6142 20.1706 23.318V33.1744C20.1706 34.8782 21.5518 36.2595 23.2556 36.2595H33.1134C34.8172 36.2595 36.1984 34.8782 36.1984 33.1744V23.3173C36.1984 21.6135 34.8172 20.2323 33.1134 20.2323Z"/>' +
      '<path d="M31.7853 17.9021C35.4337 16.3909 37.1662 12.2083 35.655 8.55988C34.1438 4.9115 29.9612 3.17899 26.3128 4.69019C22.6644 6.20139 20.9319 10.3841 22.4431 14.0324C23.9543 17.6808 28.137 19.4133 31.7853 17.9021Z"/>' +
      '<path d="M11.2943 36.2599C15.2432 36.2599 18.4445 33.0587 18.4445 29.1097C18.4445 25.1607 15.2432 21.9595 11.2943 21.9595C7.34533 21.9595 4.14404 25.1607 4.14404 29.1097C4.14404 33.0587 7.34533 36.2599 11.2943 36.2599Z"/>' +
      '</svg>';

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + N + ' ' + N + '" role="img" aria-label="Codemarca QR code">' +
      '<rect width="' + N + '" height="' + N + '" fill="#fff"/>' +
      mods + finder(0, 0) + finder(N - 7, 0) + finder(0, N - 7) + logoBadge + '</svg>';
  };

  /* ── THE FIVE TEES ───────────────────────────────────────────────────
     The referral reward, drawn rather than photographed until the mockups
     exist. One black tee outline; each design only changes where the code
     sits and what is printed beside it. The code keeps its white ground on
     purpose — a QR printed dark-on-black is a QR that does not scan.
     Shared by every home that sells the tee (2-page-live, 4-active). */

  CM.TEES = [
    { k: "pocket", n: "Pocket",       s: "Small code, left chest",        side: "Front", qr: [64, 30, 17] },
    { k: "centre", n: "Front centre", s: "Big code across the chest",     side: "Front", qr: [40, 34, 40] },
    { k: "name",   n: "Name tag",     s: "Code with your name under it",  side: "Front", qr: [45, 30, 30] },
    { k: "back",   n: "Big back",     s: "Plain front, code on the back", side: "Back",  qr: [35, 28, 50] },
    { k: "hem",    n: "Low corner",   s: "Small code near the hem",       side: "Front", qr: [70, 88, 16] }
  ];

  CM.tee = function (d, pattern, a) {
    var back = d.side === "Back";
    var neck = back ? "C72 13 48 13 42 10" : "C74 18 46 18 42 10";
    var rib  = back ? "M42 10 C48 13 72 13 78 10" : "M42 10 C46 18 74 18 78 10";
    var q = d.qr;
    var code = pattern.replace("<svg ", '<svg x="' + q[0] + '" y="' + q[1] +
      '" width="' + q[2] + '" height="' + q[2] + '" ');
    /* no words on the tees for now — just the code. Real product photos
       replace these drawings later (Garry, 2026-10-08). */
    return '<svg viewBox="0 0 120 120" aria-hidden="true">' +
      '<path d="M42 10 L20 16 L4 38 L18 48 L26 41 L26 112 Q26 114 28 114 L92 114 Q94 114 94 112 ' +
        'L94 41 L102 48 L116 38 L100 16 L78 10 ' + neck + ' Z" fill="#0B0B0D" stroke="rgba(255,255,255,.14)" stroke-width=".8"/>' +
      '<path d="' + rib + '" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="1.2"/>' +
      code + "</svg>";
  };

  /* ── THE FREE TEE CARD ───────────────────────────────────────────────
     Paints the light referral card (.rf in home.css): meter, subline, the
     five tees and the invite buttons. `pattern` is the square to print on
     the tees — the account's own code, or a sample when it has none yet.
     INVITE LINK = HANDLE = PAGE: an account with no page has
     `referrals.link: null` and its card carries a locked row, not buttons. */

  CM.referCard = function (a, pattern) {
    /* an account that never had a page has no referrals block — no handle,
       no invite link. Same shape, all zeroes, so the card still paints. */
    var R = a.referrals ||
      (a.referrals = { counted: 0, goal: 50, waiting: 0, people: [], link: null, claimed: false });
    var refUrl = R.link ? "https://" + R.link : null;
    var left = Math.max(0, R.goal - R.counted);
    document.getElementById("rfFill").style.width = Math.min(100, R.counted / R.goal * 100) + "%";
    document.getElementById("rfBar").setAttribute("aria-valuenow", R.counted);
    document.getElementById("rfSub").innerHTML = R.counted === 0
      ? "Your first friend who finishes their page puts you at <b>1</b>."
      : "<b>" + left + " more</b> to go" +
        (R.waiting ? " · " + R.waiting + " friends are still building their page" : "");

    document.getElementById("tees").innerHTML = CM.TEES.map(function (d) {
      /* picture only — no name, no description (Garry, 2026-09-27). The
         designs are the kind of thing you point at, not read, and real
         photographs land here later. The name rides along for the picker. */
      return '<div class="rf__tee" title="' + d.n + '" aria-label="' + d.n + '">' +
        '<span class="rf__fig">' + CM.tee(d, pattern, a) +
          '<span class="rf__side">' + d.side + "</span></span>" +
      "</div>";
    }).join("");

    /* no link without a page — the card shows the locked row instead */
    if (!R.link) { return; }
    document.querySelector("[data-copy-ref]").addEventListener("click", function () {
      CM.copy(refUrl, "Invite link copied");
    });
    document.querySelector("[data-share-ref]").addEventListener("click", function () {
      CM.shareSheet({ title: "Invite friends", url: refUrl, name: a.profile.title });
    });
  };

  /* ══ 6. SMALL HELPERS ═══════════════════════════════════════════════════ */

  /* ── THE CONDITIONAL LAYER ────────────────────────────────────────────
     Three passes every dashboard page used to repeat by hand. Splitting
     the dashboard into flow folders multiplied that copy by five, so it
     moved in here instead.

       data-when="a b"    keep this node only in these states of this flow
       data-fill="x.y"    write a dot-path value out of the account object
       data-ic="name"     paint an icon inside
       data-ic-in="name"  REPLACE the node with the icon
       data-ic-btn="name" paint an icon at the end

     Call it once, after the page has done its own conditional work:

         CM.draw(a, { "user.first": "Garry" })

     `extra` wins over the account, for values that are derived rather
     than stored — CM.derived(a) supplies the two every screen needs. */

  /* the card wears the page's own photo when there is one; the initial is
     the fallback, not the rule */
  function paintAvatar(a) {
    var photo = a && a.profile && a.profile.photo;
    Array.prototype.forEach.call(document.querySelectorAll(".me__av, .pm__av"), function (el) {
      if (el.querySelector("img")) { return; }
      el.innerHTML = photo ? '<img src="' + photo + '" alt="">' : CM.FACE;
    });
  }

  CM.draw = function (a, extra) {
    extra = extra || {};

    /* signed up off a gifted sticker (1-empty `scanned`): the page they
       build is what that sticker opens, so onboarding is told which code */
    if (a.state === "scanned" && a.code) {
      Array.prototype.forEach.call(document.querySelectorAll('a[href$="onboarding.html"]'), function (el) {
        el.href = el.getAttribute("href") + "?claim=" + encodeURIComponent(a.code.id);
      });
    }
    /* A pack that has already landed: building the page now switches the
       stickers in their hand on, so onboarding hands them to the active
       account, not to "pack on the way" (2026-10-08). */
    if (a.state === "delivered") {
      Array.prototype.forEach.call(document.querySelectorAll('a[href*="onboarding.html?ordered=1"]'), function (el) {
        el.href = el.getAttribute("href").replace("ordered=1", "ordered=landed");
      });
    }


    Array.prototype.forEach.call(document.querySelectorAll("[data-when]"), function (el) {
      if (el.getAttribute("data-when").split(" ").indexOf(a.state) === -1) { el.hidden = true; }
    });

    Array.prototype.forEach.call(document.querySelectorAll("[data-fill]"), function (el) {
      var k = el.getAttribute("data-fill");
      var v = (k in extra) ? extra[k]
            : k.split(".").reduce(function (o, p) { return o == null ? o : o[p]; }, a);
      if (v !== undefined && v !== null && v !== "") { el.textContent = v; }
    });

    paintAvatar(a);

    /* a page switched off says so on the "you" card too (2026-10-08) */
    if (a.profile && a.profile.live === false) {
      Array.prototype.forEach.call(document.querySelectorAll(".me__live"), function (el) {
        el.dataset.off = ""; el.innerHTML = "<i></i>Off";
      });
    }

    Array.prototype.forEach.call(document.querySelectorAll("[data-ic]"), function (el) {
      el.insertAdjacentHTML("afterbegin", CM.icon(el.getAttribute("data-ic")));
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-ic-in]"), function (el) {
      el.outerHTML = CM.icon(el.getAttribute("data-ic-in"));
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-ic-btn]"), function (el) {
      el.insertAdjacentHTML("beforeend", CM.icon(el.getAttribute("data-ic-btn")));
    });
  };

  /* ── WHAT IS STILL MISSING ────────────────────────────────────────────
     The same checklist onboarding's last step shows, on Home, for the same
     reason: Save & exit lets people leave the builder with a page that is
     live but half filled in (Garry, 2026-09-23). Read off `a.profile`:

       contacts  how many of phone / WhatsApp / email are on the page.
                 Zero is the one genuinely broken state — a scan opens a
                 name and nothing else — so that row is marked `must`.
       links     socials and custom links, counted
       photo     null until one is uploaded
       bio       "" until written

     Every row opens the Profile tab at its own field (`?add=`), so the
     card is a way in rather than a scolding. Nothing missing → no card. */
  CM.pageTodo = function (a) {
    var p = a.profile;
    if (!p) { return []; }
    var out = [];
    if (!contactCount(p)) {
      out.push({ k:"contact", must:true, ic:"phone", l:"Add a way to reach you",
                 s:"A phone, WhatsApp or email. Without one, a scan opens just your name." });
    }
    if (!linkCount(p)) {
      out.push({ k:"links", ic:"link", l:"Add your links",
                 s:"Instagram, YouTube, your website — whichever ones you hand out." });
    }
    if (!p.photo) {
      out.push({ k:"photo", ic:"user", l:"Add a photo",
                 s:"It is the first thing on the page, and the first thing people recognise." });
    }
    /* No bio row — the field is marked optional in the editor, so asking for
       it here would contradict it (Garry, 2026-09-24). */
    return out;
  };

  /* Both counts are read off the page itself rather than off a number kept
     beside it (Garry, 2026-09-24) — a second copy of the truth is how Home
     came to ask for links a page already had. */
  function contactCount(p) {
    var n = 0;
    if (p.phone && p.phoneOn) { n++; }
    if ((p.waSame ? p.phone : p.wa) && p.waOn) { n++; }
    if (p.email && p.emailOn) { n++; }
    return n;
  }
  function linkCount(p) {
    var n = 0, k;
    for (k in (p.links || {})) { if (p.links[k] && p.links[k].v && p.links[k].on) { n++; } }
    (p.customs || []).forEach(function (c) { if (c.url && c.on !== false) { n++; } });
    return n;
  }

  /* Fills a `<section class="card todo" data-page-todo hidden>` and shows it.
     Left hidden when the page is complete, so a finished account never sees
     an empty card. */
  CM.mountTodo = function (a) {
    var host = document.querySelector("[data-page-todo]");
    if (!host) { return; }
    var left = CM.pageTodo(a);
    if (!left.length) { return; }

    host.innerHTML =
      '<div class="todo__head">' +
        '<span class="card__title">Finish your page</span>' +
        '<span class="todo__n">' + left.length + (left.length === 1 ? " thing left" : " things left") + "</span>" +
      "</div>" +
      '<div class="todo__rows">' +
        left.map(function (m) {
          return '<a class="todo__row" href="profile.html?add=' + m.k + '"' +
            (m.must ? " data-must" : "") + ">" +
            '<span class="todo__ic">' + CM.icon(m.ic) + "</span>" +
            '<span class="todo__txt"><span class="todo__l">' + m.l + "</span>" +
            '<span class="todo__s">' + m.s + "</span></span>" +
            '<span class="todo__go">' + CM.icon("chev") + "</span>" +
          "</a>";
        }).join("") +
      "</div>";
    host.hidden = false;
  };

  /* ── THE PACK SLIDER ──────────────────────────────────────────────────
     Scroll-snap does the moving — swipe, trackpad and keyboard all work
     without us. This only keeps the dots in step, and nudges the track
     along until a hand touches it, after which it stays where it is put.

     Three flow folders show the same three product photo frames, so it
     lives here rather than three times over. */

  CM.carousel = function (shots) {
    if (!shots) { return; }
    var track = shots.querySelector(".shot__track");
    var dots  = [].slice.call(shots.querySelectorAll(".shot__dot"));
    if (!track || !dots.length) { return; }
    var auto = true;

    function mark() {
      var i = Math.round(track.scrollLeft / track.clientWidth);
      dots.forEach(function (d, n) {
        if (n === i) { d.setAttribute("data-on", ""); }
        else { d.removeAttribute("data-on"); }
      });
      return i;
    }
    function go(i) { track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" }); }

    dots.forEach(function (d, n) {
      d.addEventListener("click", function () { auto = false; go(n); });
    });
    track.addEventListener("scroll", mark, { passive: true });
    ["pointerdown", "wheel", "touchstart"].forEach(function (e) {
      track.addEventListener(e, function () { auto = false; }, { passive: true });
    });
    window.setInterval(function () {
      if (auto && !document.hidden) { go((mark() + 1) % dots.length); }
    }, 4500);
    mark();

    CM.lightbox(track, ".shot__ph");
  };

  /* Object.assign, written out — the dashboard still targets whatever a
     three-year-old Android browser is running. */
  /* ── THE SCAN SCENE ───────────────────────────────────────────────────
     The one drawing that explains the whole product without a word:

       1. a printed sticker turns up
       2. a phone comes in and scans it
       3. the phone is now showing the contact page

     It loops. It is drawn, not filmed — the "page" on the phone is the
     real thing built out of the same tokens, so it never goes out of date
     the way a screenshot would.

     Used wherever a dashboard screen has to sell the idea to someone who
     has not built a page yet. Call it into an empty element:

         host.innerHTML = CM.scanScene(a);

     The spans keep their data-fill hooks, so call CM.draw(a, …) after.
     Styles live in dashboard.css under "SCAN SCENE". */

  CM.scanScene = function (a, opts) {
    opts = opts || {};
    var seed = opts.seed || (a.code ? a.code.id : "preview");
    var qr   = CM.qr(seed);

    return '<div class="scene" aria-hidden="true">' +

      '<div class="phone">' +
        '<div class="phone__screen">' +

          /* 2 — what the camera sees */
          '<div class="cam">' +
            '<span class="cam__qr">' + qr + "</span>" +
            '<span class="cam__frame"></span>' +
            '<span class="cam__beam"></span>' +
            '<span class="cam__tick">' + CM.icon("check") + "</span>" +
          "</div>" +

          /* 3 — and what it opens */
          '<div class="pm">' +
            '<span class="pm__av" data-fill="user.initial">G</span>' +
            '<span class="pm__name" data-fill="user.name">Garry</span>' +
            '<span class="pm__url">codemarca.com/<span data-fill="handle">garry</span></span>' +
            '<span class="pm__soc">' + SOCIALS + "</span>" +
            '<span class="pm__btns">' +
              '<span class="pm__btn pm__btn--call" data-ic="phone">Call</span>' +
              '<span class="pm__btn pm__btn--wa">WhatsApp</span>' +
              '<span class="pm__btn pm__btn--save" data-ic="down">Save contact</span>' +
            "</span>" +
          "</div>" +

        "</div>" +
      "</div>" +

      /* 1 — the printed sticker, held up to the camera */
      '<span class="scene__sticker">' + qr + "</span>" +

    "</div>";
  };

  /* the four the page shows by default — brand marks, so they are drawn
     here rather than pulled from the icon set */
  var SOCIALS =
    '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#E1306C"/><rect x="6.5" y="6.5" width="11" height="11" rx="3.4" fill="none" stroke="#fff" stroke-width="1.7"/><circle cx="12" cy="12" r="2.7" fill="none" stroke="#fff" stroke-width="1.7"/><circle cx="15.4" cy="8.6" r=".9" fill="#fff"/></svg>' +
    '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#FF0000"/><path d="M10 8.8v6.4l5.4-3.2z" fill="#fff"/></svg>' +
    '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#0A66C2"/><path d="M8 10.2h2v6H8zM9 7.2a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2zM11.6 10.2h1.9v.9c.3-.5 1-1.1 2-1.1 2 0 2.4 1.3 2.4 3v3.2h-2v-2.8c0-.7 0-1.6-1-1.6s-1.2.8-1.2 1.6v2.8h-2z" fill="#fff"/></svg>' +
    '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#101215"/><path d="M6 5.4h3.3l3 4.1 3.5-4.1h2.9l-5 5.8 5.4 7.4h-3.3l-3.3-4.5-3.8 4.5H5.8l5.3-6.2z" fill="#fff"/></svg>';

  CM.assign = function (into) {
    Array.prototype.slice.call(arguments, 1).forEach(function (o) {
      if (!o) { return; }
      for (var k in o) { if (Object.prototype.hasOwnProperty.call(o, k)) { into[k] = o[k]; } }
    });
    return into;
  };

  CM.derived = function (a) {
    return {
      "user.first":   (a.user.name || "").split(" ")[0],
      "user.initial": (a.user.name || "?").charAt(0).toUpperCase()
    };
  };


  CM.money = function (n) { return "₹" + n.toLocaleString("en-IN"); };

  CM.url = function (handle) { return "codemarca.com/" + handle; };

  var toastEl, toastT;
  CM.toast = function (msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = CM.icon("check") + "<span>" + msg + "</span>";
    /* reflow so the transition replays on a repeat tap */
    void toastEl.offsetWidth;
    toastEl.setAttribute("data-on", "");
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.removeAttribute("data-on"); }, 2000);
  };

  CM.copy = function (text, msg) {
    if (navigator.clipboard) { navigator.clipboard.writeText(text).catch(function () {}); }
    CM.toast(msg || "Copied");
  };

  /* wire any [data-copy] button without the page having to think about it */
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || typeof t.closest !== "function") { return; }
    var b = t.closest("[data-copy]");
    if (b) { CM.copy(b.getAttribute("data-copy"), b.getAttribute("data-copy-msg")); }
    var s = t.closest("[data-soon]");
    if (s) { CM.toast(s.getAttribute("data-soon")); }
  });

  /* ══ 7. SHOW MY CODE ════════════════════════════════════════════════════
     The dashboard's one full-screen mode. Called from the home hero and
     from the code card on the code screen:

         CM.showCode({ title, sub, url, seed })

     `url` is what a real encoder would encode. `seed` is only for the
     fake pattern — pass the code id so the square shown here matches the
     square printed on the stickers.

     Built once, on first use, and reused after that. There is only ever
     one of these in the document.

     WAKE LOCK — the screen going to sleep while someone is lining up a
     camera is the one failure this mode cannot survive, so it asks to
     stay awake and quietly gives up if the browser says no. Raising the
     actual brightness is not something the web can do; that is a
     Capacitor call when the app ships. */

  var showEl, showLock, showPrev;

  function buildShow() {
    showEl = document.createElement("div");
    showEl.className = "show";
    showEl.setAttribute("role", "dialog");
    showEl.setAttribute("aria-modal", "true");
    showEl.setAttribute("aria-label", "Your code, full screen");
    showEl.hidden = true;
    showEl.innerHTML =
      '<button class="show__close" type="button" aria-label="Close">' + CM.icon("close") + "</button>" +
      '<p class="show__hint">Point a camera here</p>' +
      '<div class="show__qr" data-qr></div>' +
      '<div class="show__id">' +
        '<span class="show__name" data-name></span>' +
        '<span class="show__sub" data-sub></span>' +
      "</div>" +
      '<div class="show__acts">' +
        '<button class="btn btn--ghost btn--sm" type="button" data-dl>' +
          CM.icon("down") + "Download</button>" +
        '<button class="btn btn--ghost btn--sm" type="button" data-send>' +
          CM.icon("share") + "Share</button>" +
        '<button class="btn btn--ghost btn--sm" type="button" data-link>' +
          CM.icon("copy") + "Copy link</button>" +
      "</div>";

    showEl.querySelector(".show__close").addEventListener("click", closeShow);
    /* tapping the empty space around the square closes it — the square
       itself does not, because that is the bit people point at */
    showEl.addEventListener("click", function (e) {
      if (e.target === showEl) { closeShow(); }
    });
    document.body.appendChild(showEl);
  }

  function onShowKey(e) { if (e.key === "Escape") { closeShow(); } }

  /* Rasterise the square on screen into a PNG. The pattern is fake for now
     (see CM.qr) but the plumbing is not — when a real encoder goes in, the
     SVG it returns comes through here unchanged. Everything happens in the
     page: serialise the node, hand it to an <img>, paint it on a canvas at
     print size. A white ground is painted first, because a QR that ends up
     on a dark background is a QR that does not scan. */
  function codePng(size, done) {
    var node = showEl.querySelector("[data-qr] svg");
    if (!node) { done(null); return; }
    var svg = node.cloneNode(true);
    svg.setAttribute("width", size);
    svg.setAttribute("height", size);

    var img = new Image();
    img.onload = function () {
      var c = document.createElement("canvas");
      c.width = c.height = size;
      var g = c.getContext("2d");
      g.fillStyle = "#FFFFFF";
      g.fillRect(0, 0, size, size);
      g.drawImage(img, 0, 0, size, size);
      if (c.toBlob) { c.toBlob(function (b) { done(b); }, "image/png"); }
      else { done(null); }
    };
    img.onerror = function () { done(null); };
    img.src = "data:image/svg+xml;charset=utf-8," +
      encodeURIComponent(new XMLSerializer().serializeToString(svg));
  }

  CM.showCode = function (opts) {
    if (!showEl) { buildShow(); }

    showEl.querySelector("[data-qr]").innerHTML = CM.qr(opts.seed || opts.url);
    showEl.querySelector("[data-name]").textContent = opts.title || "";
    showEl.querySelector("[data-sub]").textContent = opts.sub != null ? opts.sub : (opts.url || "");

    var acc = (typeof CM.account === "function") ? CM.account() : null;
    var uname = "";
    if (opts.handle) {
      uname = opts.handle;
    } else if (opts.username) {
      uname = opts.username;
    } else if (opts.sub && typeof opts.sub === "string") {
      var matchSub = opts.sub.match(/codemarca\.com\/([a-z0-9._-]+)/i);
      if (matchSub) uname = matchSub[1];
    }
    if (!uname && opts.url && typeof opts.url === "string") {
      var matchUrl = opts.url.match(/codemarca\.com\/([a-z0-9._-]+)/i);
      if (matchUrl && matchUrl[1] !== "c") uname = matchUrl[1];
    }
    if (!uname && acc && acc.profile && acc.profile.handle) {
      uname = acc.profile.handle;
    }
    if (!uname) {
      try { uname = window.localStorage.getItem("cm.username") || ""; } catch (e) {}
    }
    if (!uname) {
      uname = String(opts.seed || "code");
    }
    uname = String(uname).replace(/^@/, "").replace(/[^a-z0-9._-]+/gi, "-").toLowerCase();

    /* 1024px is the size a print shop asks for and a phone wallpaper can
       take — one size covers both rather than offering a menu. */
    var file = "codemarca-scanner-" + uname + ".png";

    showEl.querySelector("[data-link]").onclick = function () {
      CM.copy(opts.url, "Link copied");
    };

    showEl.querySelector("[data-dl]").onclick = function () {
      codePng(1024, function (blob) {
        if (!blob) { CM.copy(opts.url, "Could not build the image — link copied"); return; }
        var href = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = href; a.download = file;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(href); }, 1000);
        CM.toast("Code saved as a PNG");
      });
    };

    /* The system share sheet, with the image attached where the browser
       allows it. Desktop browsers mostly do not, so the fallback is the
       thing a desktop user wanted anyway: the link on the clipboard. */
    showEl.querySelector("[data-send]").onclick = function () {
      codePng(1024, function (blob) {
        var data = { title: opts.title || "My Codemarca code", url: opts.url };
        if (blob && window.File && navigator.canShare) {
          var f = new File([blob], file, { type: "image/png" });
          if (navigator.canShare({ files: [f] })) { data.files = [f]; }
        }
        if (navigator.share) { navigator.share(data).catch(function () {}); }
        else { CM.copy(opts.url, "Link copied — sharing needs a phone"); }
      });
    };

    showPrev = document.activeElement;
    showEl.hidden = false;
    document.body.setAttribute("data-showing", "");
    /* reflow, so the fade and the scale actually play on a repeat open */
    void showEl.offsetWidth;
    showEl.setAttribute("data-on", "");
    showEl.querySelector(".show__close").focus();
    document.addEventListener("keydown", onShowKey);

    if ("wakeLock" in navigator) {
      navigator.wakeLock.request("screen")
        .then(function (l) { showLock = l; })
        .catch(function () { /* denied, or the tab is not visible — fine */ });
    }
  };

  function closeShow() {
    if (!showEl || showEl.hidden) { return; }
    showEl.removeAttribute("data-on");
    document.body.removeAttribute("data-showing");
    document.removeEventListener("keydown", onShowKey);
    if (showLock) { showLock.release().catch(function () {}); showLock = null; }
    if (showPrev && showPrev.focus) { showPrev.focus(); }
    setTimeout(function () { if (!showEl.hasAttribute("data-on")) { showEl.hidden = true; } }, 260);
  }

  CM.closeCode = closeShow;

  /* the wordmark, as it is drawn everywhere else — for pages outside the
     dashboard shell that still want the logo (scan.html) */
  CM.wordmark = function (cls) {
    return LOGO_WM.replace('class="wm"', 'class="' + (cls || "wm") + '"');
  };

  /* the mark on its own, in whatever colour the CSS gives it — for places
     that use it as decoration rather than as the logo */
  CM.mark = function (cls) {
    return LOGO_MK
      .replace('class="mk"', 'class="' + (cls || "") + '"')
      .replace('fill="#6E27E6"', 'fill="currentColor"')
      .replace('role="img" aria-label="Codemarca"', 'aria-hidden="true"');
  };

  /* ══ 7b. DIALOG ═════════════════════════════════════════════════════════
     One question, a few answers. A sheet from the bottom on a phone, a
     centred card on desktop.

         CM.dialog({
           title: "…", body: "…",
           actions: [ { id:"save", label:"Save and leave", kind:"go" }, … ],
           onPick: function (id) { … }      // id, or null if dismissed
         });

     `kind` is go · bad · quiet. Escape and a tap outside both count as
     dismissing it — the same as the quiet "stay" answer, never as the
     destructive one. */

  var dlgEl, dlgPrev, dlgPick;

  function dlgClose(id) {
    if (!dlgEl || dlgEl.hidden) { return; }
    dlgEl.removeAttribute("data-on");
    document.removeEventListener("keydown", dlgKey);
    if (dlgPrev && dlgPrev.focus) { dlgPrev.focus(); }
    setTimeout(function () { if (!dlgEl.hasAttribute("data-on")) { dlgEl.hidden = true; } }, 240);
    var cb = dlgPick; dlgPick = null;
    if (cb) { cb(id); }
  }
  function dlgKey(e) { if (e.key === "Escape") { dlgClose(null); } }

  CM.dialog = function (o) {
    if (!dlgEl) {
      dlgEl = document.createElement("div");
      dlgEl.className = "dlg";
      dlgEl.hidden = true;
      dlgEl.innerHTML =
        '<div class="dlg__box" role="alertdialog" aria-modal="true" ' +
          'aria-labelledby="dlgTitle" aria-describedby="dlgBody">' +
          '<h2 class="dlg__t" id="dlgTitle"></h2>' +
          '<p class="dlg__b" id="dlgBody"></p>' +
          '<div class="dlg__acts"></div>' +
        "</div>";
      dlgEl.addEventListener("click", function (e) {
        if (e.target === dlgEl) { dlgClose(null); return; }
        var b = e.target.closest("[data-dlg]");
        if (b) { dlgClose(b.getAttribute("data-dlg")); }
      });
      document.body.appendChild(dlgEl);
    }

    dlgEl.querySelector(".dlg__t").textContent = o.title || "";
    dlgEl.querySelector(".dlg__b").textContent = o.body || "";
    dlgEl.querySelector(".dlg__acts").innerHTML = (o.actions || []).map(function (a) {
      var cls = a.kind === "go" ? "btn--go" : a.kind === "bad" ? "btn--bad" : "btn--quiet";
      return '<button class="btn ' + cls + ' btn--wide" type="button" data-dlg="' + a.id + '">' +
        a.label + "</button>";
    }).join("");

    dlgPick = o.onPick || null;
    dlgPrev = document.activeElement;
    dlgEl.hidden = false;
    void dlgEl.offsetWidth;
    dlgEl.setAttribute("data-on", "");
    document.addEventListener("keydown", dlgKey);
    var first = dlgEl.querySelector("[data-dlg]");
    if (first) { first.focus(); }
  };

  /* ══ 7c. SHARE SHEET ════════════════════════════════════════════════════
     The same sheet profile.html opens from its share icon, so the owner
     shares their page the way a visitor would: the link with a copy
     button, then one tap to WhatsApp, X, Facebook, Telegram or email, and
     the phone's own share menu as "More" where the browser has one.

         CM.shareSheet({ title, url, name })

     Opening it copies the link straight away, as profile.html does — the
     write has to happen inside the tap, because Safari refuses clipboard
     access from a timer. The promo block is left out: the owner already
     has a code. Targets and glyphs are copied from profile.html; keep the
     two lists in step until they are one component. */

  var shsEl, shsSeq;
  var shs = { url: "", name: "" };

  var SHARE = [
    { k:"whatsapp", n:"WhatsApp", c:"#25D366",
      g:'<path d="M6.2 18 7.3 14.6a6.7 6.7 0 1 1 2.5 2.4z" fill="none" stroke="#fff" stroke-width="1.7" stroke-linejoin="round"/><path d="M9.9 9.4c.35 1.7 1.7 3 3.4 3.4l.7-1.1 1.6.75-.25 1.4c-2.8.4-6-2.8-5.6-5.6l1.4-.25.75 1.6z" fill="#fff"/>',
      u:function (v) { return "https://wa.me/?text=" + encodeURIComponent(v); } },
    { k:"x", n:"X", c:"#101215",
      g:'<path d="M6 5.4h3.3l3 4.1 3.5-4.1h2.9l-5 5.8 5.4 7.4h-3.3l-3.3-4.5-3.8 4.5H5.8l5.3-6.2z" fill="#fff"/>',
      u:function (v) { return "https://x.com/intent/tweet?url=" + encodeURIComponent(v); } },
    { k:"facebook", n:"Facebook", c:"#1877F2",
      g:'<path d="M13.4 20v-7.1h2.4l.36-2.78H13.4V8.34c0-.8.23-1.35 1.39-1.35h1.48V4.5a19.7 19.7 0 0 0-2.16-.11c-2.13 0-3.59 1.3-3.59 3.69v2.04H8.1v2.78h2.42V20z" fill="#fff"/>',
      u:function (v) { return "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(v); } },
    { k:"telegram", n:"Telegram", c:"#229ED9",
      g:'<path d="M19.2 6.2 5.5 11.5c-.7.28-.7.78.02.98l3.44 1.07 7.98-5.03c.38-.23.72-.11.44.14l-6.46 5.84-.25 3.5c.29 0 .42-.13.58-.29l1.4-1.35 2.9 2.14c.53.3.92.14 1.05-.5l1.9-8.94c.19-.86-.31-1.25-.9-1.02z" fill="#fff"/>',
      u:function (v) { return "https://t.me/share/url?url=" + encodeURIComponent(v); } },
    { k:"email", n:"Email", c:"#5B5D68",
      g:'<rect x="5" y="7.4" width="14" height="9.2" rx="2" fill="none" stroke="#fff" stroke-width="1.6"/><path d="m5.8 8.6 6.2 4.3 6.2-4.3" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>',
      u:function (v) { return "mailto:?subject=" + encodeURIComponent(shs.name + " on Codemarca") + "&body=" + encodeURIComponent(v); } }
  ];

  var SHS_SPIN = '<span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>';
  var SHS_TICK = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8.4 6.5 12 13 4.6" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function shsCopy() {
    var b = shsEl.querySelector("[data-shs-copy]");
    if (navigator.clipboard) { navigator.clipboard.writeText(shs.url).catch(function () {}); }
    clearTimeout(shsSeq);
    b.dataset.state = "busy";
    b.innerHTML = SHS_SPIN;
    b.setAttribute("aria-label", "Copying link");
    shsSeq = setTimeout(function () {
      b.dataset.state = "done";
      b.innerHTML = SHS_TICK + "<span>Link copied</span>";
      b.setAttribute("aria-label", "Link copied");
      shsSeq = setTimeout(function () {
        b.dataset.state = "";
        b.textContent = "Copy";
        b.setAttribute("aria-label", "Copy link");
      }, 2000);
    }, 1000);
  }

  function shsClose() {
    if (!shsEl || shsEl.hidden) { return; }
    clearTimeout(shsSeq);
    shsEl.hidden = true;
    document.body.style.overflow = "";
    document.removeEventListener("keydown", shsKey);
  }
  function shsKey(e) { if (e.key === "Escape") { shsClose(); } }

  CM.shareSheet = function (o) {
    shs.url  = o.url;
    shs.name = o.name || "";

    if (!shsEl) {
      shsEl = document.createElement("div");
      shsEl.className = "shs";
      shsEl.hidden = true;
      shsEl.setAttribute("role", "dialog");
      shsEl.setAttribute("aria-modal", "true");
      shsEl.innerHTML =
        '<div class="shs__scrim" data-shs-close></div>' +
        '<div class="shs__panel">' +
          '<button class="shs__x" type="button" data-shs-close aria-label="Close">' + CM.icon("close") + "</button>" +
          '<div class="shs__grip" aria-hidden="true"></div>' +
          '<h2 class="shs__t"></h2>' +
          '<div class="shs__row"><span class="shs__url"></span>' +
            '<button type="button" data-shs-copy>Copy</button></div>' +
          '<div class="shs__targets"></div>' +
        "</div>";
      shsEl.addEventListener("click", function (e) {
        if (e.target.closest("[data-shs-close]")) { shsClose(); return; }
        if (e.target.closest("[data-shs-copy]")) {
          if (e.target.closest("[data-shs-copy]").dataset.state !== "busy") { shsCopy(); }
          return;
        }
        if (e.target.closest("[data-shs-more]") && navigator.share) {
          navigator.share({ title: shs.name + " on Codemarca", url: shs.url }).catch(function () {});
        }
      });
      document.body.appendChild(shsEl);
    }

    shsEl.setAttribute("aria-label", o.title || "Share this page");
    shsEl.querySelector(".shs__t").textContent = o.title || "Share this page";
    shsEl.querySelector(".shs__url").textContent = o.url.replace(/^https?:\/\//i, "");

    var html = SHARE.map(function (t) {
      return '<a href="' + t.u(shs.url).replace(/"/g, "&quot;") + '" target="_blank" rel="noopener">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="' + t.c + '"/>' +
        t.g + "</svg><span>" + t.n + "</span></a>";
    }).join("");
    if (navigator.share) {
      html += '<button type="button" data-shs-more>' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="#6E27E6"/>' +
        '<circle cx="8.4" cy="12" r="1.6" fill="#fff"/><circle cx="15.6" cy="12" r="1.6" fill="#fff"/><circle cx="12" cy="12" r="1.6" fill="#fff"/></svg>' +
        "<span>More</span></button>";
    }
    shsEl.querySelector(".shs__targets").innerHTML = html;

    shsEl.hidden = false;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", shsKey);
    shsCopy();
  };

  /* ── PHOTO STRIP ──────────────────────────────────────────────────────
     The bar under a swipe row of photos: its thumb is as wide a share of
     the bar as the row shows of itself, and it sits where the row is
     scrolled to. Markup is .ps > .ps__row + .ps__bar > i. */

  CM.strip = function (el) {
    if (!el) { return; }
    var row = el.querySelector(".ps__row"), thumb = el.querySelector(".ps__bar i");
    if (!row || !thumb) { return; }
    function paint() {
      var w = row.scrollWidth, seen = row.clientWidth;
      if (!w || seen >= w) { thumb.style.width = "100%"; thumb.style.left = "0"; return; }
      thumb.style.width = (seen / w * 100) + "%";
      thumb.style.left  = (row.scrollLeft / w * 100) + "%";
    }
    row.addEventListener("scroll", paint, { passive: true });
    window.addEventListener("resize", paint);
    paint();

    CM.lightbox(row, ".ps__ph");
  };

  /* ── LIGHTBOX ─────────────────────────────────────────────────────────
     Tap a photo and it opens full screen, with the rest of that row beside
     it (Garry, 2026-09-24). Swipe on a phone, arrows or the keyboard on a
     desktop, Esc or the cross to close. `sel` picks the photos inside
     `box`; each one is cloned, so a placeholder shows as a placeholder and
     a real <img> shows as the photo, with nothing to keep in step. */

  CM.lightbox = function (box, sel) {
    if (!box) { return; }
    var shots = [].slice.call(box.querySelectorAll(sel));
    if (!shots.length) { return; }

    shots.forEach(function (ph, i) {
      ph.setAttribute("role", "button");
      ph.setAttribute("tabindex", "0");
      ph.setAttribute("aria-label", "Open photo " + (i + 1) + " of " + shots.length);
      ph.addEventListener("click", function () { open(i); });
      ph.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(i); }
      });
    });

    function open(start) {
      var el = document.createElement("div");
      el.className = "lb";
      el.setAttribute("role", "dialog");
      el.setAttribute("aria-modal", "true");
      el.setAttribute("aria-label", "Photos");
      el.innerHTML =
        '<div class="lb__scrim" data-lb-close></div>' +
        '<button class="lb__x" type="button" data-lb-close aria-label="Close">' + CM.icon("close") + "</button>" +
        '<div class="lb__track"></div>' +
        (shots.length > 1
          ? '<button class="lb__go lb__go--prev" type="button" data-lb-go="-1" aria-label="Previous photo">' + CM.icon("chev") + "</button>" +
            '<button class="lb__go lb__go--next" type="button" data-lb-go="1" aria-label="Next photo">' + CM.icon("chev") + "</button>" +
            '<span class="lb__count"></span>'
          : "");

      var track = el.querySelector(".lb__track");
      shots.forEach(function (ph) {
        var slide = document.createElement("div");
        slide.className = "lb__slide";
        var copy = ph.cloneNode(true);
        copy.removeAttribute("role");
        copy.removeAttribute("tabindex");
        copy.removeAttribute("aria-label");
        copy.classList.add("lb__ph");
        slide.appendChild(copy);
        track.appendChild(slide);
      });

      /* WHICH PHOTO IS SHOWING is kept here, not read back off scrollLeft
         (fixed 2026-09-29). Smooth scrolling made the old way lie: press →
         twice quickly and the second press read a position halfway through
         the first animation, so it landed on the same slide or skipped one.
         Now the arrows move this number and the scroll follows; a swipe
         writes it back once the track settles. */
      var idx = start;
      function clamp(n) { return Math.max(0, Math.min(shots.length - 1, n)); }
      function at() { return idx; }
      function count() {
        var c = el.querySelector(".lb__count");
        if (c) { c.textContent = (idx + 1) + " / " + shots.length; }
      }
      function go(n) {
        idx = clamp(n);
        track.scrollTo({ left: idx * track.clientWidth, behavior: "smooth" });
        count();
      }

      function close() {
        el.remove();
        document.body.style.overflow = "";
        document.removeEventListener("keydown", key);
        shots[at()] && shots[at()].focus && shots[at()].focus({ preventScroll: true });
      }
      function key(e) {
        if (e.key === "Escape")     { close(); }
        if (e.key === "ArrowRight") { e.preventDefault(); go(idx + 1); }
        if (e.key === "ArrowLeft")  { e.preventDefault(); go(idx - 1); }
      }

      /* A tap anywhere that is not the photo itself or an arrow closes it —
         the scrim, the padding around the photo, all of it. Escape and the
         cross still work; this just means nobody has to aim (Garry,
         2026-09-29). */
      el.addEventListener("click", function (e) {
        var g = e.target.closest("[data-lb-go]");
        if (g) { go(idx + Number(g.getAttribute("data-lb-go"))); return; }
        if (!e.target.closest(".lb__ph")) { close(); }
      });

      /* a swipe is the other way the slide changes, so read it back once
         the track has stopped moving */
      var settle;
      function sync() {
        if (!track.clientWidth) { return; }
        idx = clamp(Math.round(track.scrollLeft / track.clientWidth));
        count();
      }
      track.addEventListener("scroll", function () {
        clearTimeout(settle);
        settle = setTimeout(sync, 90);
      }, { passive: true });
      /* scrollend fires once the finger is off and the snap has landed —
         cheaper and exact where the browser has it; the timer above is the
         fallback for the ones that do not */
      track.addEventListener("scrollend", sync);

      document.body.appendChild(el);
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", key);
      track.scrollLeft = start * track.clientWidth;
      count();
      el.querySelector(".lb__x").focus();
    }
  };

  /* ── A GENERAL SHEET ─────────────────────────────────────────────────
     Same shell as the share sheet — rises from the bottom on a phone, a
     centred card from 640px up — but holds any content, left-aligned.
     First use: the referral list on 4-active's home.

         CM.sheet({ title: "Your referrals", html: "…", onOpen: fn(panel) })

     A fresh node per open, removed on close, so nothing leaks between
     two different sheets. */

  CM.sheet = function (o) {
    var el = document.createElement("div");
    el.className = "shs shs--list";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", o.title || "");
    el.innerHTML =
      '<div class="shs__scrim" data-sheet-close></div>' +
      '<div class="shs__panel">' +
        '<div class="shs__grip" aria-hidden="true"></div>' +
        '<button class="shs__x" type="button" data-sheet-close aria-label="Close">' + CM.icon("close") + "</button>" +
        '<h2 class="shs__t">' + (o.title || "") + "</h2>" +
        '<div class="shs__body">' + (o.html || "") + "</div>" +
      "</div>";

    function close() {
      el.remove();
      document.body.style.overflow = "";
      document.removeEventListener("keydown", key);
    }
    function key(e) { if (e.key === "Escape") { close(); } }

    el.addEventListener("click", function (e) {
      if (e.target.closest("[data-sheet-close]")) { close(); }
    });
    document.body.appendChild(el);
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", key);
    if (o.onOpen) { o.onOpen(el.querySelector(".shs__panel"), close); }
    return close;
  };

  /* ══ 7d. NOTIFICATIONS ═════════════════════════════════════════════════
     Garry, 2026-09-27. One bell on every tab — the top bar on a phone, a
     strip above the page head on a desktop — and one panel behind it with
     three tabs, so nobody scrolls a single feed looking for their parcel:

         All      everything, newest first
         Orders   placed, shipped, delivered, invoices — gifts included
         Refer    friends in through the link, gifts claimed, the tee

     Anything that is neither (page live, scans) shows under All only.

     The list is the account's own: each state.js carries `notes`, in the
     shape the API should answer with —

         { id, tab: "orders" | "refer" | "account", icon, title, body,
           when, unread, href }

     A phone gets it as a bottom sheet (CM.sheet), a desktop as a dropdown
     under the bell. Same markup inside both, built by one function.

     ── FOR THE REACT BUILD ──────────────────────────────────────────────
     "read" lives in localStorage here only so the demo remembers it across
     tabs. In the product it is a PATCH on the note. */

  var NOTE_TABS = [
    { k: "all",    label: "All",
      empty: "Nothing yet. Order updates, friends joining through your link and gifts being claimed all land here." },
    { k: "orders", label: "Orders",
      empty: "No order news. When a pack is placed, shipped or delivered, it shows up here first." },
    { k: "refer",  label: "Refer",
      empty: "Nothing from your link yet. Every friend who signs up or finishes their page shows up here." }
  ];

  CM.notes = (function () {
    var list = [], readKey = "", read = {}, tab = "all", bells = [];

    function save() {
      try { window.localStorage.setItem(readKey, JSON.stringify(Object.keys(read))); } catch (e) {}
    }
    function isNew(n) { return n.unread && !read[n.id]; }
    function inTab(n, k) { return k === "all" || n.tab === k; }
    function unread(k) { return list.filter(function (n) { return inTab(n, k) && isNew(n); }).length; }

    function paintBells() {
      var n = unread("all");
      bells.forEach(function (b) {
        var c = b.querySelector(".bell__n");
        c.hidden = !n;
        c.textContent = n > 9 ? "9+" : String(n);
        b.setAttribute("aria-label", n ? "Notifications, " + n + " unread" : "Notifications");
      });
    }

    function row(n) {
      return '<a class="nt__row" href="' + (n.href || "#") + '" data-id="' + n.id + '"' +
          (isNew(n) ? " data-new" : "") + ">" +
        '<span class="nt__ic">' + CM.icon(n.icon || "bell") + "</span>" +
        '<span class="nt__txt">' +
          '<span class="nt__t">' + n.title + "</span>" +
          (n.body ? '<span class="nt__b">' + n.body + "</span>" : "") +
          '<span class="nt__w">' + n.when + "</span>" +
        "</span>" +
        '<span class="nt__dot" aria-hidden="true"></span>' +
      "</a>";
    }

    /* the panel's inside — tabs, the "n new" line, the list */
    function render(host) {
      function draw() {
        var t = NOTE_TABS.filter(function (x) { return x.k === tab; })[0];
        var rows = list.filter(function (n) { return inTab(n, tab); });
        var fresh = unread(tab);
        host.innerHTML =
          '<div class="nt">' +
            '<div class="nt__tabs" role="tablist" aria-label="Notification types">' +
              NOTE_TABS.map(function (x) {
                var c = unread(x.k);
                return '<button class="nt__tab" type="button" role="tab" data-tab="' + x.k + '"' +
                  ' aria-selected="' + (x.k === tab) + '">' + x.label +
                  (c ? '<span class="nt__n">' + c + "</span>" : "") + "</button>";
              }).join("") +
            "</div>" +
            (rows.length
              ? '<div class="nt__meta"><span>' + (fresh ? fresh + " new" : "All caught up") + "</span>" +
                  (fresh ? '<button type="button" data-read-all>Mark all as read</button>' : "") + "</div>" +
                '<div class="nt__list" role="tabpanel">' + rows.map(row).join("") + "</div>"
              : '<p class="nt__empty" role="tabpanel">' + t.empty + "</p>") +
          "</div>";
      }

      host.addEventListener("click", function (e) {
        var b = e.target.closest("[data-tab]");
        if (b) { tab = b.getAttribute("data-tab"); draw(); return; }
        if (e.target.closest("[data-read-all]")) {
          list.forEach(function (n) { if (inTab(n, tab)) { read[n.id] = 1; } });
          save(); paintBells(); draw(); return;
        }
        var r = e.target.closest(".nt__row");
        if (r) {
          read[r.getAttribute("data-id")] = 1;
          save(); paintBells();
          if (r.getAttribute("href") === "#") { e.preventDefault(); draw(); }
        }
      });
      draw();
    }

    /* desktop: a dropdown hanging off the bell, right edges lined up */
    function dropdown(bell, bar) {
      var pop = null;
      function close() {
        if (!pop) { return; }
        pop.remove(); pop = null;
        bell.setAttribute("aria-expanded", "false");
        document.removeEventListener("mousedown", outside);
        document.removeEventListener("keydown", key);
      }
      function outside(e) { if (!pop.contains(e.target) && !bell.contains(e.target)) { close(); } }
      function key(e) { if (e.key === "Escape") { close(); bell.focus(); } }
      bell.addEventListener("click", function () {
        if (pop) { close(); return; }
        pop = document.createElement("div");
        pop.className = "npop";
        pop.setAttribute("role", "dialog");
        pop.setAttribute("aria-label", "Notifications");
        pop.innerHTML = '<h2 class="npop__t">Notifications</h2><div class="npop__body"></div>';
        bar.appendChild(pop);
        render(pop.querySelector(".npop__body"));
        bell.setAttribute("aria-expanded", "true");
        document.addEventListener("mousedown", outside);
        document.addEventListener("keydown", key);
      });
    }

    return {
      mount: function (a, phoneBell, bar) {
        list = (a.notes || []).slice();
        readKey = "cm.notes." + FLOW.id + "." + (a.state || "");
        read = {};
        try {
          (JSON.parse(window.localStorage.getItem(readKey)) || []).forEach(function (id) { read[id] = 1; });
        } catch (e) {}

        var deskBell = bar.querySelector("[data-bell]");
        bells = [phoneBell, deskBell];
        paintBells();

        phoneBell.addEventListener("click", function () {
          CM.sheet({
            title: "Notifications",
            onOpen: function (panel) { render(panel.querySelector(".shs__body")); }
          });
        });
        dropdown(deskBell, bar);
      }
    };
  
})();

  /* ══ 8. DEMO SWITCHER — delete for production ═══════════════════════════ */

  function mountDemo(a) {
    return; // Demo switcher disabled for clean production UI
    if (!FLOW.states.length) { return; }
    var d = document.createElement("div");
    d.className = "demo";
    d.innerHTML =
      '<span class="demo__lbl">' + (FLOW.label || "Demo state") + "</span>" +
      '<select class="demo__sel" aria-label="Preview account state">' +
        FLOW.states.map(function (o) {
          return '<option value="' + o.k + '">' + o.label + "</option>";
        }).join("") +
      "</select>";
    var sel = d.querySelector("select");
    sel.value = a.state;
    sel.addEventListener("change", function () { CM.setState(sel.value); });
    document.body.appendChild(d);
  }

  /* ══ ME CARD — the copy icon in the link field (Garry, 2026-10-10) ══════
     Tooltip says "Copy" on hover; a tap copies the link and the same
     tooltip says "Copied" for a moment. No toast — the answer is right
     where the finger is. */
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".me__copy");
    if (!b) { return; }
    var u = b.closest(".me__link").querySelector(".me__url");
    var text = "https://" + u.textContent.trim();
    if (navigator.clipboard) { navigator.clipboard.writeText(text).catch(function () {}); }
    b.setAttribute("data-tip", "Copied");
    b.setAttribute("data-copied", "");
    clearTimeout(b._cmT);
    b._cmT = setTimeout(function () { b.removeAttribute("data-copied"); b.setAttribute("data-tip", "Copy"); }, 1400);
  });

  /* ══ UNIVERSAL LOG OUT ════════════════════════════════════════════════ */
  CM.logout = async function () {
    try {
      if (window.supabase && typeof window.supabase.createClient === "function") {
        var sc = window.supabase.createClient("https://inzigrmttewawjjkggbd.supabase.co", "sb_publishable_t03O5VnqWX8kbRPDSfdprQ_gjJFAUsg");
        await sc.auth.signOut();
      }
    } catch (e) {
      console.warn("Supabase signOut error:", e);
    }

    try {
      var keysToRemove = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && (k.indexOf("sb-") === 0 || k.indexOf("cm.") === 0 || k.indexOf("cm_") === 0)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(function (k) { localStorage.removeItem(k); });
      sessionStorage.clear();
    } catch (e) {}

    var root = (typeof CM !== "undefined" && CM.ROOT) ? CM.ROOT : "../../";
    window.location.href = root + "signup.html?logout=true";
  };

  window.CM = CM;

})(window, document);
