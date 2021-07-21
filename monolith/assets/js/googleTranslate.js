let tr = false;

function googleTranslateElementInit() {
  if(!tr) {
   tr = new google.translate.TranslateElement({
      pageLanguage: 'en', 
      includedLanguages: 'af,ar,az,be,bg,bn,bs,ca,ceb,cs,cy,da,de,el,en,eo,es,et,eu,fa,fi,fr,ga,gl,gu,ha,hi,hmn,hr,ht,hu,hy,id,ig,is,it,iw,ja,jv,ka,kk,km,kn,ko,la,lo,lt,lv,mg,mi,mk,ml,mn,mr,ms,mt,my,nl,no,ny,pa,pl,pt,ro,ru,si,sk,sl,so,sq,sr,su,sv,sw,ta,te,tg,th,tl,tr,uk,ur,uz,vi,yi,yo,zh-CN,zh-TW,zu', 
      gaTrack: true, 
      gaId: 'UA-9604792-1'
    }, 'google_translate_element');
  }
}

jQuery(document).ready(function () {
  jQuery.getScript('https://ssl.google-analytics.com/ga.js', 
    function( data1, textStatus1, jqxhr1 ) { //google translate still uses old analytics method if you try to track usage
      _gaq.push (['_gat._anonymizeIp']);
      jQuery.getScript('https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit', function( data, textStatus, jqxhr ) {
      });
    }
  );
});