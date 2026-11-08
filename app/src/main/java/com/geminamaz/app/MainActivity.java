package com.geminamaz.app;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.hardware.GeomagneticField;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.view.Surface;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.os.Bundle;
import android.os.CancellationSignal;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.provider.Settings;
import android.content.Intent;
import android.content.IntentSender;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.net.Uri;
import android.speech.tts.TextToSpeech;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GoogleApiAvailability;
import com.google.android.gms.location.CurrentLocationRequest;
import com.google.android.gms.location.DeviceOrientation;
import com.google.android.gms.location.DeviceOrientationListener;
import com.google.android.gms.location.DeviceOrientationRequest;
import com.google.android.gms.location.FusedOrientationProviderClient;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.Granularity;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.Priority;
import com.google.android.gms.location.LocationSettingsRequest;
import com.google.android.gms.common.api.ResolvableApiException;
import com.google.android.gms.tasks.CancellationTokenSource;
import org.json.JSONObject;
import java.util.Locale;
import java.net.URL;
import java.net.HttpURLConnection;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

public class MainActivity extends Activity implements LocationListener, SensorEventListener {
    private static final int REQ_LOCATION = 24;
    private static final int REQ_LOCATION_SETTINGS = 25;
    private static final long LOCATION_MAX_AGE_MS = 10 * 60 * 1000L;
    // Approximate-only Android permission can yield multi-kilometer fixes.
    // Accept moderate coarse estimates but expose their uncertainty in the UI.
    private static final float LOCATION_MAX_ACCURACY_M = 20000f;
    private static final long FIRST_FALLBACK_MS = 18000L;
    private WebView webView;
    private TextToSpeech arabicTts;
    private boolean arabicTtsReady = false;
    private String queuedArabic;
    private LocationManager locationManager;
    private SensorManager sensors;
    private Sensor rotation;
    private Sensor headingSensor; // Android 13+ true-heading sensor, optional
    private FusedOrientationProviderClient fusedOrientationClient;
    private DeviceOrientationListener fusedOrientationListener;
    private long lastFusedOrientationMs;
    // Never let inaccurate FOP callbacks block a usable Android heading.
    private long lastUsableFusedOrientationMs;
    private long lastUsablePlatformHeadingMs;
    private long lastNativeHeadingSensorMs;
    private boolean orientationRunning;
    private int fallbackSensorAccuracy = SensorManager.SENSOR_STATUS_UNRELIABLE;
    private double compassLat = Double.NaN;
    private double compassLon = Double.NaN;
    private long lastFusedDiagnosticMs;
    private long lastPlatformDiagnosticMs;
    private double lastDeclination=Double.NaN;
    private FusedLocationProviderClient fusedClient;
    private LocationCallback fusedCallback;
    private CancellationTokenSource currentToken;
    private boolean networkSubscribed;
    private boolean gpsSubscribed;
    private boolean nativeReady;
    private boolean freshFix;
    private Location latest;
    private String latestSource = "";
    private String pendingStatus = "Konum kaynağı hazırlanıyor...";
    private final Handler handler = new Handler(Looper.getMainLooper());
    private Runnable fallbackRunnable;
    private Runnable warningRunnable;
    private boolean working = false;
    private boolean settingsPromptShown = false;
    private boolean waitingSatellitePermission;
    private boolean satelliteOnlyActive;
    // Preserve an unfinished user-initiated GPS search across screen lock / app pause.
    // Resume ONLY satellite GPS, never automatically resume network/Google traffic.
    private boolean resumePendingGpsSearch;
    private long lastOnlineQiblaRequestMs=0L;
    private int candidateCount=0;
    private int rejectedCount=0;
    private String lastCandidateStatus="none";
    private String lastCandidateProvider="";
    private Boolean googleLocationAccuracyEnabled=null;
    private boolean autoLocationAttempted=false;

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.rgb(6,21,36));
        getWindow().setNavigationBarColor(Color.rgb(6,21,36));
        locationManager=(LocationManager)getSystemService(Context.LOCATION_SERVICE);
        sensors=(SensorManager)getSystemService(Context.SENSOR_SERVICE);
        rotation=sensors==null?null:sensors.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR);
        if(rotation==null&&sensors!=null)rotation=sensors.getDefaultSensor(Sensor.TYPE_GEOMAGNETIC_ROTATION_VECTOR);
        headingSensor=(Build.VERSION.SDK_INT>=33 && sensors!=null)
            ?sensors.getDefaultSensor(Sensor.TYPE_HEADING):null;
        webView=new WebView(this);
        webView.setBackgroundColor(Color.rgb(6,21,36));
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setAllowFileAccess(true);
        webView.getSettings().setAllowFileAccessFromFileURLs(false);
        webView.getSettings().setAllowUniversalAccessFromFileURLs(false);
        webView.addJavascriptInterface(new Bridge(),"GemiNative");
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient(){
            @Override public boolean shouldOverrideUrlLoading(WebView view,String url){
                return openExternalLink(url);
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){
                if(!request.isForMainFrame())return false;
                return openExternalLink(request.getUrl().toString());
            }
            @Override public void onPageFinished(WebView view,String url){
                nativeReady=true;
                sendStatus(pendingStatus);
                if(latest!=null)sendLocation(latest,true,latestSource);
                sendLocationDiagnostics();
                // UI restores last saved coordinates from localStorage.
                // Do NOT refresh GPS/Google after reload or screen wake without user action.
            }
        });
        setContentView(webView);
        webView.loadUrl("file:///android_asset/index.html");
    }

    public class Bridge {
        @JavascriptInterface public void requestLocation(){runOnUiThread(()->{
            waitingSatellitePermission=false;
            beginLocation();
        });}
        @JavascriptInterface public void requestSmartLocation(){
            runOnUiThread(()->{
                waitingSatellitePermission=false;
                beginLocation();
                sendLocationDiagnostics();
            });
        }
        @JavascriptInterface public void requestAutoLocation(){
            runOnUiThread(()->{
                // Auto begin only while screen is visible. No background service.
                if(autoLocationAttempted||isFinishing())return;
                autoLocationAttempted=true;
                if(!hasAnyPermission()){
                    boolean requested=getPreferences(MODE_PRIVATE)
                        .getBoolean("autoLocationPermissionPrompted",false);
                    if(!requested){
                        getPreferences(MODE_PRIVATE).edit()
                            .putBoolean("autoLocationPermissionPrompted",true).apply();
                        sendStatus("Konum için Android izni isteniyor...");
                        requestPermissions(new String[]{
                            Manifest.permission.ACCESS_FINE_LOCATION,
                            Manifest.permission.ACCESS_COARSE_LOCATION},REQ_LOCATION);
                    }else{
                        sendError("Konum izni gerekiyor. Konum Merkezi > Kesin konum izni.");
                    }
                }else{
                    beginLocation();
                }
            });
        }
        @JavascriptInterface public void retryOfflineGpsWhenPermitted(){
            runOnUiThread(()->{
                // Silent bootstrap on each app open ONLY if the app already
                // has precise permission. No dialog, no network calls.
                if(hasFine()&&locationEnabled()&&providerAvailable(LocationManager.GPS_PROVIDER)){
                    startSatelliteOnly();
                }else{
                    sendStatus(hasAnyPermission()
                        ?"Konum iznini kontrol et: uydu GPS için Kesin Konum gerekli. Akıllı konum araması ağ üzerinden de denenebilir."
                        :"Konum izni yok. Akıllı Konum Bul düğmesine basarak izin verebilirsin.");
                }
                sendLocationDiagnostics();
            });
        }
        @JavascriptInterface public void getLocationDiagnostics(){
            runOnUiThread(()->sendLocationDiagnostics());
        }
        @JavascriptInterface public void copyLocationReport(String report){
            runOnUiThread(()->{
                if(report==null||report.length()>4096)return;
                ClipboardManager c=(ClipboardManager)getSystemService(Context.CLIPBOARD_SERVICE);
                if(c!=null)c.setPrimaryClip(
                    ClipData.newPlainText("Namaz Zamanı konum tanı raporu",report));
            });
        }
        @JavascriptInterface public void requestSatelliteLocation(){runOnUiThread(()->{
            if(!hasFine()){
                waitingSatellitePermission=true;
                requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION},REQ_LOCATION);
            }else{
                waitingSatellitePermission=false;startSatelliteOnly();
            }
        });}
        @JavascriptInterface public void requestPreciseLocation(){runOnUiThread(()->{
            if(hasFine()){startSatelliteOnly();return;}
            waitingSatellitePermission=true;
            requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION},REQ_LOCATION);
        });}
        @JavascriptInterface public void openAppLocationPermissionSettings(){
            runOnUiThread(()->{
                try {
                    Intent intent=new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                        Uri.parse("package:"+getPackageName()));
                    startActivity(intent);
                }catch(Exception ignored){
                    sendError("Uygulama izinleri açılamadı. Ayarlar > Uygulamalar > Namaz Zamanı > İzinler bölümünü aç.");
                }
            });
        }
        @JavascriptInterface public void verifyQiblaOnline(double latitude,double longitude){
            runOnUiThread(()->{
                if(!Double.isFinite(latitude)||!Double.isFinite(longitude)||
                    Math.abs(latitude)>90||Math.abs(longitude)>180){
                    sendOnlineQiblaResult(false,null,null,
                        "Konum geçersiz. İnternet sorgusu yapılmadı.",latitude,longitude);
                    return;
                }
                long time=SystemClock.elapsedRealtime();
                if(time-lastOnlineQiblaRequestMs<30000L){
                    sendOnlineQiblaResult(false,null,null,
                        "Ağ kotasını korumak için 30 saniye bekle.",latitude,longitude);
                    return;
                }
                lastOnlineQiblaRequestMs=time;
                // No automatic network requests. Only an explicit button press
                // invokes this method; work runs off the UI thread.
                new Thread(()->{
                    Double sourceA=fetchQiblaDirection(
                        "https://api.aladhan.com/v1/qibla/"+
                        String.format(Locale.US,"%.5f/%.5f",latitude,longitude),false);
                    Double sourceB=fetchQiblaDirection(
                        "https://api.myquran.com/v3/qibla/"+
                        String.format(Locale.US,"%.5f,%.5f",latitude,longitude),true);
                    boolean complete=sourceA!=null&&sourceB!=null;
                    String message=complete?"İki bağımsız çevrim içi kaynak yanıtladı.":
                        sourceA!=null||sourceB!=null?
                            "Yalnız bir çevrim içi kaynak yanıtladı. Tam çapraz doğrulama yapılamadı.":
                            "İnternet yanıtı alınamadı. Çevrim dışı hesaplama korunuyor.";
                    runOnUiThread(()->sendOnlineQiblaResult(
                        complete,sourceA,sourceB,message,latitude,longitude));
                },"namaz-qibla-verify").start();
            });
        }
        @JavascriptInterface public void copyCompassReport(String report){
            runOnUiThread(()->{
                if(report==null||report.length()>8192)return;
                ClipboardManager clipboard=(ClipboardManager)getSystemService(Context.CLIPBOARD_SERVICE);
                if(clipboard!=null)clipboard.setPrimaryClip(
                    ClipData.newPlainText("Namaz Zamanı pusula tanı raporu",report));
            });
        }
        @JavascriptInterface public void setCompassLocation(double latitude,double longitude){
            runOnUiThread(()->{
                if(Double.isFinite(latitude)&&Double.isFinite(longitude)&&Math.abs(latitude)<=90&&Math.abs(longitude)<=180){
                    compassLat=latitude;compassLon=longitude;
                }
            });
        }
        @JavascriptInterface public void speakArabic(String text){
            runOnUiThread(()-> startArabicSpeech(text));
        }
        @JavascriptInterface public void stopArabic(){
            runOnUiThread(()-> {if(arabicTts!=null)arabicTts.stop();});
        }
        @JavascriptInterface public void openLocationSettings(){runOnUiThread(()->{
            try{startActivity(new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS));}
            catch(Exception ignored){sendError("Konum ayarları açılamadı. Telefon Ayarlar > Konum bölümünü aç.");}
        });}
    }

    // Fetch only a fixed allowlist of documented Qibla endpoints over HTTPS.
    // Strict timeouts and maximum response size protect ship data quota.
    private Double fetchQiblaDirection(String endpoint,boolean myQuran){
        HttpURLConnection conn=null;
        try{
            URL url=new URL(endpoint);
            String host=url.getHost();
            if(!"https".equalsIgnoreCase(url.getProtocol()))return null;
            if(!("api.aladhan.com".equals(host)||"api.myquran.com".equals(host)))return null;
            conn=(HttpURLConnection)url.openConnection();
            conn.setInstanceFollowRedirects(false);
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(4500);
            conn.setReadTimeout(4500);
            conn.setRequestProperty("Accept","application/json");
            conn.setRequestProperty("Accept-Encoding","identity");
            conn.setRequestProperty("User-Agent","NamazZamani-Qibla-Compare/0.19");
            if(conn.getResponseCode()!=HttpURLConnection.HTTP_OK)return null;
            StringBuilder text=new StringBuilder();
            try(BufferedReader rd=new BufferedReader(new InputStreamReader(
                conn.getInputStream(),StandardCharsets.UTF_8))){
                char[] buffer=new char[1024];int len;
                while((len=rd.read(buffer))!=-1){
                    if(text.length()+len>8192)return null;
                    text.append(buffer,0,len);
                }
            }
            JSONObject outer=new JSONObject(text.toString());
            if(myQuran){
                if(!outer.optBoolean("status",false))return null;
            }else if(outer.optInt("code",0)!=200)return null;
            JSONObject data=outer.optJSONObject("data");
            if(data==null)return null;
            double result=data.optDouble("direction",Double.NaN);
            if(!Double.isFinite(result)||result<0||result>=360)return null;
            return result;
        }catch(Exception ignored){return null;}
        finally{if(conn!=null)conn.disconnect();}
    }
    private void sendOnlineQiblaResult(boolean complete,Double a,Double b,
        String message,double lat,double lon){
        String aa=a!=null?String.format(Locale.US,"%.7f",a):"null";
        String bb=b!=null?String.format(Locale.US,"%.7f",b):"null";
        js(String.format(Locale.US,
            "window.nativeQiblaOnlineResult(%s,%s,%s,%s,%.7f,%.7f);",
            complete?"true":"false",aa,bb,JSONObject.quote(message),lat,lon));
    }
    private boolean openExternalLink(String address){
        if(address!=null&&address.startsWith("file:///android_asset/"))return false;
        try {
            Uri uri=Uri.parse(address);
            if("https".equalsIgnoreCase(uri.getScheme())){
                startActivity(new Intent(Intent.ACTION_VIEW,uri).addCategory(Intent.CATEGORY_BROWSABLE));
            }
        }catch(Exception ignored){}
        return true;
    }
    private void startArabicSpeech(String raw){
        String text=raw==null?"":raw.trim();
        if(text.length()==0)return;
        if(text.length()>4000)text=text.substring(0,4000);
        queuedArabic=text;
        if(arabicTts==null){
            arabicTts=new TextToSpeech(this,status->{
                arabicTtsReady=status==TextToSpeech.SUCCESS;
                if(arabicTtsReady&&arabicTts!=null){
                    int available=arabicTts.setLanguage(new Locale("ar"));
                    if(available==TextToSpeech.LANG_MISSING_DATA||available==TextToSpeech.LANG_NOT_SUPPORTED){
                        arabicTtsReady=false;
                    }else{
                        arabicTts.setSpeechRate(0.82f);
                        if(queuedArabic!=null)arabicTts.speak(queuedArabic,TextToSpeech.QUEUE_FLUSH,null,"dua_ar");
                    }
                }
            });
        }else if(arabicTtsReady){
            arabicTts.speak(text,TextToSpeech.QUEUE_FLUSH,null,"dua_ar");
        }
    }

    private void js(String script){
        if(nativeReady&&webView!=null)webView.evaluateJavascript(script,null);
    }
    private void sendStatus(String message){
        pendingStatus=message;
        js("window.nativeSearching("+JSONObject.quote(message)+");");
    }
    private void sendError(String message){
        pendingStatus=message;
        js("window.nativeError("+JSONObject.quote(message)+");");
    }
    private void sendLocationDiagnostics(){
        if(!nativeReady||webView==null)return;
        try{
            JSONObject result=new JSONObject();
            result.put("fine",hasFine());
            result.put("coarse",hasCoarse());
            result.put("systemEnabled",locationEnabled());
            result.put("gpsEnabled",providerAvailable(LocationManager.GPS_PROVIDER));
            result.put("networkEnabled",providerAvailable(LocationManager.NETWORK_PROVIDER));
            boolean google=false;
            try{
                google=GoogleApiAvailability.getInstance().isGooglePlayServicesAvailable(this)
                    ==ConnectionResult.SUCCESS;
            }catch(Exception ignored){}
            result.put("googleReady",google);
            result.put("searching",working);
            result.put("mode",satelliteOnlyActive?"satellite":working?"smart":"idle");
            result.put("source",latestSource);
            result.put("ageSeconds",latest==null?-1:
                Math.max(0,(System.currentTimeMillis()-latest.getTime())/1000));
            result.put("accuracyMeters",latest!=null&&latest.hasAccuracy()
                ?Math.round(latest.getAccuracy()):-1);
            result.put("latestValid",recent(latest));
            result.put("candidateCount",candidateCount);
            result.put("rejectedCount",rejectedCount);
            result.put("lastCandidateStatus",lastCandidateStatus);
            result.put("lastCandidateProvider",lastCandidateProvider);
            result.put("googleLocationAccuracyEnabled",
                googleLocationAccuracyEnabled==null?JSONObject.NULL:googleLocationAccuracyEnabled);
            // Never include latitude, longitude or other precise location.
            js("window.nativeLocationDiagnostics("+result.toString()+");");
        }catch(Exception ignored){}
    }
    private boolean hasFine(){
        return checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION)==PackageManager.PERMISSION_GRANTED;
    }
    private boolean hasCoarse(){
        return checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION)==PackageManager.PERMISSION_GRANTED;
    }
    private boolean hasAnyPermission(){return hasFine()||hasCoarse();}
    private boolean providerAvailable(String provider){
        try{return locationManager!=null&&locationManager.isProviderEnabled(provider);}
        catch(Exception ignored){return false;}
    }
    private boolean locationEnabled(){
        if(locationManager==null)return false;
        if(Build.VERSION.SDK_INT>=28){
            try{return locationManager.isLocationEnabled();}
            catch(RuntimeException ignored){return false;}
        }
        return providerAvailable(LocationManager.NETWORK_PROVIDER)||providerAvailable(LocationManager.GPS_PROVIDER);
    }
    private boolean recent(Location location){
        if(location==null||!Double.isFinite(location.getLatitude())||!Double.isFinite(location.getLongitude()))return false;
        long age=System.currentTimeMillis()-location.getTime();
        return age>=-60000L && age<=LOCATION_MAX_AGE_MS
            && (!location.hasAccuracy()||location.getAccuracy()<=LOCATION_MAX_ACCURACY_M);
    }

    private void accept(Location location,boolean cached,String source){
        if(location==null){
            lastCandidateStatus="null_callback";lastCandidateProvider=source;
            sendLocationDiagnostics();
            return;
        }
        candidateCount++;
        lastCandidateProvider=source;
        if(!recent(location)){
            rejectedCount++;
            long age=System.currentTimeMillis()-location.getTime();
            lastCandidateStatus=age>LOCATION_MAX_AGE_MS?"stale_fix":
                age< -60000L?"future_timestamp":
                location.hasAccuracy()&&location.getAccuracy()>LOCATION_MAX_ACCURACY_M
                ?"poor_accuracy":"invalid_coordinates";
            sendLocationDiagnostics();
            if(location.hasAccuracy()&&location.getAccuracy()>LOCATION_MAX_ACCURACY_M) {
                sendStatus("Yaklaşık konum geldi (±"+Math.round(location.getAccuracy()/1000f)+" km); daha hassas GPS aranıyor.");
            }
            return;
        }
        lastCandidateStatus=cached?"accepted_cache":"accepted_live";
        sendLocationDiagnostics();
        if(latest!=null&&recent(latest)){
            long age=System.currentTimeMillis()-latest.getTime();
            if(location.getTime()+15000L<latest.getTime())return;
            if(age<60000L&&latest.hasAccuracy()&&location.hasAccuracy()
                && latest.getAccuracy()<location.getAccuracy()/3f)return;
        }
        latest=location;latestSource=source;
        compassLat=location.getLatitude();compassLon=location.getLongitude();
        if(!cached){
            freshFix=true;
            resumePendingGpsSearch=false;
        }
        sendLocation(location,cached,source);
        if(location.hasAccuracy()&&location.getAccuracy()>2500f)
            sendStatus("Yalnızca yaklaşık konum alındı (±"+
                Math.round(location.getAccuracy()/1000f)+" km). Namaz vakitleri ve kıble yaklaşık olabilir. Kesin konumu aç.");
        else if(!cached)sendStatus("Güncel GPS/ağ konumu alındı.");
        sendLocationDiagnostics();
    }
    private void sendLocation(Location loc,boolean cached,String source){
        double lat=loc.getLatitude(),lon=loc.getLongitude();
        if(!Double.isFinite(lat)||!Double.isFinite(lon))return;
        js(String.format(Locale.US,"window.nativeLocation(%.8f,%.8f,%.1f,%s,%d,%s);",
            lat,lon,loc.hasAccuracy()?loc.getAccuracy():0f,cached?"true":"false",
            loc.getTime(),JSONObject.quote(source)));
    }

    private void startSatelliteOnly(){
        if(!hasFine()){
            sendError("İnternetsiz uydu GPS için Kesin Konum iznini aç.");
            return;
        }
        if(!locationEnabled()||!providerAvailable(LocationManager.GPS_PROVIDER)){
            sendError("Uydu GPS kapalı. Telefonun Konum ayarını aç.");
            return;
        }
        stopSources();
        satelliteOnlyActive=true;
        working=true;freshFix=false;
        sendStatus("Uydu GPS aranıyor (mobil veri/Wi-Fi konum sorgusu yapılmıyor). Açık gökyüzü gerekli...");
        sendLocationDiagnostics();
        startGpsFallback();
        warningRunnable=()->{
            if(!freshFix&&(latest==null||!recent(latest)))
                sendError("Uydu konumu hâlâ alınamadı. Açık gökyüzünde deneyin veya koordinatları elle girin.");
        };
        handler.postDelayed(warningRunnable,60000L);
    }
    private void beginLocation(){
        satelliteOnlyActive=false;
        if(!hasAnyPermission()){
            sendError("Konum izni gerekiyor. İzin ekranında 'Kesin konum'u seç.");
            sendLocationDiagnostics();
            requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION},REQ_LOCATION);
            return;
        }
        if(!locationEnabled()){
            sendError("Telefon konumu kapalı. Alttaki 'Konum ayarları' ile aç.");
            sendLocationDiagnostics();
            return;
        }
        stopSources();
        working=true;freshFix=false;
        candidateCount=0;rejectedCount=0;
        lastCandidateStatus="searching";lastCandidateProvider="";
        googleLocationAccuracyEnabled=null;
        sendStatus("Otomatik hassas konum: Google + uydu GPS + ağ birlikte aranıyor...");
        sendLocationDiagnostics();
        // On a ship, Wi-Fi may not reveal a geolocation. Start GNSS
        // immediately instead of waiting 28 seconds for Google to fail.
        if(hasFine())startGpsFallback();
        startGoogleOrNetwork();
        if(!hasFine())sendStatus("Sadece yaklaşık konum izni var. Kesin konuma izin verirsen uydu GPS de kullanılabilir.");
        fallbackRunnable=()->{
            if(!freshFix&&(latest==null||!recent(latest))){
                sendStatus(hasFine()
                    ?"Uydu GPS hâlâ aranıyor. Açık gökyüzü olan bir yerde bekle; koordinatı elle de girebilirsin."
                    :"Kesin konum kapalı. Uygulama izinlerinden aç veya elle koordinat gir.");
            }
        };
        handler.postDelayed(fallbackRunnable,FIRST_FALLBACK_MS);
        warningRunnable=()->{
            if(!freshFix&&(latest==null||!recent(latest))){
                sendError("Güncel konum alınamadı. GPS ve ağ araması devam ediyor. Açık güvertede dene, Kesin Konum iznini aç ya da haritadan koordinatı elle gir.");
            }
        };
        handler.postDelayed(warningRunnable,60000L);
    }

    private void startGoogleOrNetwork(){
        boolean googleReady=false;
        try{
            googleReady=GoogleApiAvailability.getInstance()
                .isGooglePlayServicesAvailable(this)==ConnectionResult.SUCCESS;
        }catch(Exception ignored){}
        if(googleReady){
            try{
                fusedClient=LocationServices.getFusedLocationProviderClient(this);
                LocationServices.getSettingsClient(this).isGoogleLocationAccuracyEnabled()
                    .addOnSuccessListener(enabled->{
                        googleLocationAccuracyEnabled=enabled;
                        sendLocationDiagnostics();
                        if(!enabled&&!freshFix)
                            sendStatus("Google Konum Doğruluğu kapalı: Wi-Fi/ağ konumu kısıtlı. GPS aranıyor.");
                    })
                    .addOnFailureListener(failure->sendLocationDiagnostics());
                // Ask Android to enable the same high-accuracy location settings used by map navigation.
                // A system-owned confirmation dialog is shown only if a setting must change.
                if(hasFine() && !settingsPromptShown){
                    LocationRequest desired=new LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY,4000L)
                        .setMinUpdateIntervalMillis(1500L)
                        .setWaitForAccurateLocation(false).build();
                    LocationSettingsRequest needs=new LocationSettingsRequest.Builder()
                        .addLocationRequest(desired).setAlwaysShow(true).build();
                    LocationServices.getSettingsClient(this).checkLocationSettings(needs)
                        .addOnFailureListener(ex -> {
                            if(ex instanceof ResolvableApiException && !settingsPromptShown){
                                try {
                                    settingsPromptShown=true;
                                    ((ResolvableApiException)ex).startResolutionForResult(this,REQ_LOCATION_SETTINGS);
                                }catch(IntentSender.SendIntentException failure){
                                    sendStatus("Telefonun yüksek doğruluklu konum ayarını aç.");
                                }
                            }
                        });
                }
                fusedClient.getLastLocation().addOnSuccessListener(loc->{
                    if(loc!=null&&System.currentTimeMillis()-loc.getTime()<120000L)
                        accept(loc,true,"google");
                });
                CurrentLocationRequest req=new CurrentLocationRequest.Builder()
                    .setPriority(hasFine()?Priority.PRIORITY_HIGH_ACCURACY:Priority.PRIORITY_BALANCED_POWER_ACCURACY)
                    .setGranularity(Granularity.GRANULARITY_PERMISSION_LEVEL)
                    .setMaxUpdateAgeMillis(30000L)
                    .setDurationMillis(60000L)
                    .build();
                currentToken=new CancellationTokenSource();
                fusedClient.getCurrentLocation(req,currentToken.getToken())
                    .addOnSuccessListener(loc->{
                        if(loc!=null)accept(loc,false,"google");
                        else{
                            lastCandidateStatus="google_no_fix";
                            lastCandidateProvider="google";
                            sendLocationDiagnostics();
                            if(!freshFix)sendStatus("Google henüz ölçüm döndürmedi; GPS ve ağ araması sürüyor.");
                        }
                    })
                    .addOnFailureListener(ex->{
                        if(!freshFix)sendStatus("Google konum yanıt vermedi. Android ağ konumu deneniyor.");
                    });
                LocationRequest updates=new LocationRequest.Builder(hasFine()?Priority.PRIORITY_HIGH_ACCURACY:Priority.PRIORITY_BALANCED_POWER_ACCURACY,4000L)
                    .setMinUpdateIntervalMillis(1500L)
                    .setWaitForAccurateLocation(false)
                    .build();
                fusedCallback=new LocationCallback(){
                    @Override public void onLocationResult(LocationResult res){
                        if(res!=null&&res.getLastLocation()!=null)
                            accept(res.getLastLocation(),false,"google");
                    }
                };
                fusedClient.requestLocationUpdates(updates,fusedCallback,Looper.getMainLooper())
                    .addOnFailureListener(failure->{
                        lastCandidateStatus="google_updates_failed";
                        lastCandidateProvider="google";
                        sendLocationDiagnostics();
                        if(!freshFix)sendStatus("Google konum aboneliği başlatılamadı; uydu GPS sürüyor.");
                    });
            }catch(Exception ex){
                sendStatus("Google Play konum servisi çalışmadı. Android ağ konumuyla devam ediliyor.");
                fusedClient=null;
            }
        } else {
            sendStatus("Google Play konum servisi kullanılamıyor. Android ağ konumu deneniyor.");
        }
        try{
            if(providerAvailable(LocationManager.NETWORK_PROVIDER)){
                accept(locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER),true,"network");
                locationManager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER,10000L,25f,this);
                networkSubscribed=true;
                if(Build.VERSION.SDK_INT>=30){
                    locationManager.getCurrentLocation(LocationManager.NETWORK_PROVIDER,
                        (CancellationSignal)null,getMainExecutor(),loc->{if(loc!=null)accept(loc,false,"network");});
                }
            }
        }catch(SecurityException e){sendError("Telefon konum izni eksik.");}
        catch(RuntimeException e){sendStatus("Ağ konumu yok. GPS yedeğine geçilecek.");}
    }

    private void startGpsFallback(){
        if(!hasFine()){
            sendError("Ağdan konum alınamadı. Uydu GPS'i için 'Kesin konum' izni ver.");
            return;
        }
        if(!providerAvailable(LocationManager.GPS_PROVIDER)){
            sendError("GPS kapalı veya devre dışı. Konum ayarlarını aç.");
            return;
        }
        try{
            accept(locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER),true,"gps");
            // Request first fix even while stationary.
            locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER,2000L,0f,this);
            gpsSubscribed=true;
            if(Build.VERSION.SDK_INT>=30)locationManager.getCurrentLocation(
                LocationManager.GPS_PROVIDER,(CancellationSignal)null,getMainExecutor(),
                loc->{if(loc!=null)accept(loc,false,"gps");});
        }catch(SecurityException e){sendError("GPS için Kesin konum izni gerekiyor.");}
        catch(RuntimeException e){sendError("GPS konumu bulunamadı. Açık güvertede tekrar dene.");}
    }

    private void stopSources(){
        if(fallbackRunnable!=null)handler.removeCallbacks(fallbackRunnable);
        if(warningRunnable!=null)handler.removeCallbacks(warningRunnable);
        if(currentToken!=null){currentToken.cancel();currentToken=null;}
        if(locationManager!=null&&(networkSubscribed||gpsSubscribed)){
            locationManager.removeUpdates(this);
        }
        networkSubscribed=false;gpsSubscribed=false;
        if(fusedClient!=null&&fusedCallback!=null){
            fusedClient.removeLocationUpdates(fusedCallback);
            fusedCallback=null;
        }
        working=false;
    }

    @Override public void onLocationChanged(Location loc){
        accept(loc,false,LocationManager.GPS_PROVIDER.equals(loc.getProvider())?"gps":"network");
    }
    @Override public void onProviderEnabled(String provider){
        // Provider toggles must not trigger network calls while offline.
        if(working){
            if(satelliteOnlyActive)startSatelliteOnly();
            else beginLocation();
        }
    }
    @Override public void onProviderDisabled(String provider){
        sendStatus("Konum kaynağı kapatıldı. Konumu aç veya GPS'i tekrar dene.");
    }

    // Primary: Google Fused Orientation Provider. It estimates heading against geographic
    // north when it has local magnetic declination and reports a heading error envelope.
    // Fallback: Android rotation vector only when FOP is absent or has stalled.
    // Never claim a trustworthy heading when the error is high or unreported.
    private int currentScreenRotation(){
        try{return getWindowManager().getDefaultDisplay().getRotation();}
        catch(Exception ignored){return Surface.ROTATION_0;}
    }
    // Measured directions from the two Android algorithms are sent separately for
    // comparison; they are not automatically averaged or substituted.
    private void sendCompassDiagnostic(double heading,double accuracy,String source,
            double pitch,double roll,double declination){
        if(!Double.isFinite(heading))return;
        long now=SystemClock.elapsedRealtime();
        if("fused".equals(source)){
            if(now-lastFusedDiagnosticMs<650L)return;
            lastFusedDiagnosticMs=now;
        }else{
            if(now-lastPlatformDiagnosticMs<650L)return;
            lastPlatformDiagnosticMs=now;
        }
        double azimuth=((heading%360d)+360d)%360d;
        String p=Double.isFinite(pitch)?String.format(Locale.US,"%.1f",pitch):"null";
        String rr=Double.isFinite(roll)?String.format(Locale.US,"%.1f",roll):"null";
        String dec=Double.isFinite(declination)?String.format(Locale.US,"%.1f",declination):"null";
        js(String.format(Locale.US,
          "window.nativeCompassDiagnostic(%.2f,%.1f,%s,%s,%s,%s,%d);",
          azimuth,Double.isFinite(accuracy)?accuracy:180d,
          JSONObject.quote(source),p,rr,dec,currentScreenRotation()));
    }
    private void sendCompassHeading(double heading,double error,String source,boolean trusted){
        if(!Double.isFinite(heading))return;
        double normalized=((heading%360d)+360d)%360d;
        double safeError=Double.isFinite(error)?Math.max(0,Math.min(180,error)):180;
        js(String.format(Locale.US,
           "window.nativeHeadingData(%.2f,%.2f,%s,%s);",
           normalized,safeError,JSONObject.quote(source),trusted?"true":"false"));
    }
    private void startOrientationTracking(){
        orientationRunning=true;
        lastFusedOrientationMs=0;
        lastUsableFusedOrientationMs=0;
        lastUsablePlatformHeadingMs=0;
        lastNativeHeadingSensorMs=0;
        fallbackSensorAccuracy=SensorManager.SENSOR_STATUS_UNRELIABLE;
        if(sensors!=null){
            if(rotation!=null)
                sensors.registerListener(this,rotation,SensorManager.SENSOR_DELAY_UI);
            if(headingSensor!=null)
                sensors.registerListener(this,headingSensor,SensorManager.SENSOR_DELAY_UI);
        }
        boolean googleReady=false;
        try{
            googleReady=GoogleApiAvailability.getInstance().isGooglePlayServicesAvailable(this)
                ==ConnectionResult.SUCCESS;
        }catch(Exception ignored){}
        if(!googleReady)return;
        try{
            fusedOrientationClient=LocationServices.getFusedOrientationProviderClient(this);
            fusedOrientationListener=(DeviceOrientation orientation)->{
                if(!orientationRunning)return;
                double heading=orientation.getHeadingDegrees();
                // Conservative FOP error can remain 180 until enough physical
                // calibration movement. This must NOT starve the fallback.
                double error=orientation.hasConservativeHeadingErrorDegrees()
                    ?orientation.getConservativeHeadingErrorDegrees()
                    :orientation.getHeadingErrorDegrees();
                boolean trusted=Double.isFinite(error)&&error<=25d;
                long now=SystemClock.elapsedRealtime();
                lastFusedOrientationMs=now;
                if(trusted)lastUsableFusedOrientationMs=now;
                sendCompassDiagnostic(heading,error,"fused",Double.NaN,Double.NaN,lastDeclination);
                if(trusted||now-lastUsablePlatformHeadingMs>=5000L){
                    // In the uncertain case JavaScript displays a marked
                    // approximate arrow, never a verified Qibla direction.
                    sendCompassHeading(heading,error,"fused",trusted);
                }
            };
            DeviceOrientationRequest request=new DeviceOrientationRequest.Builder(100000L).build();
            fusedOrientationClient.requestOrientationUpdates(request,(Runnable command)->{handler.post(command);},fusedOrientationListener)
              .addOnFailureListener(failure->{
                  // Keep the platform sensor registered as a low-trust fallback.
                  fusedOrientationListener=null;
              });
        }catch(Exception ignored){fusedOrientationClient=null;fusedOrientationListener=null;}
    }
    private void stopOrientationTracking(){
        orientationRunning=false;
        if(sensors!=null)sensors.unregisterListener(this);
        if(fusedOrientationClient!=null&&fusedOrientationListener!=null){
            try{fusedOrientationClient.removeOrientationUpdates(fusedOrientationListener);}
            catch(Exception ignored){}
        }
        fusedOrientationListener=null;
        lastFusedOrientationMs=0;
        lastUsableFusedOrientationMs=0;
        lastUsablePlatformHeadingMs=0;
        lastNativeHeadingSensorMs=0;
    }
    @Override public void onSensorChanged(SensorEvent event){
        if(!orientationRunning)return;
        final int type=event.sensor.getType();
        // If available this optional Android 13 heading sensor directly
        // supplies true-north bearing and its estimated angular error.
        if(Build.VERSION.SDK_INT>=33 && type==Sensor.TYPE_HEADING){
            if(event.values.length<2 || !Float.isFinite(event.values[0]))return;
            double measuredError=event.values[1];
            if(!Double.isFinite(measuredError)||measuredError<0||measuredError>180)
                measuredError=180;
            long now=SystemClock.elapsedRealtime();
            boolean trusted=measuredError<=25d;
            lastNativeHeadingSensorMs=now;
            if(trusted)lastUsablePlatformHeadingMs=now;
            sendCompassDiagnostic(event.values[0],measuredError,"android",
                Double.NaN,Double.NaN,Double.NaN);
            if(now-lastUsableFusedOrientationMs>=5000L)
                sendCompassHeading(event.values[0],measuredError,"android",trusted);
            return;
        }
        if(type!=Sensor.TYPE_ROTATION_VECTOR &&
           type!=Sensor.TYPE_GEOMAGNETIC_ROTATION_VECTOR)return;
        float[] matrix=new float[9],screenMatrix=new float[9],orientation=new float[3];
        SensorManager.getRotationMatrixFromVector(matrix,event.values);
        // Unlike Google FOP, the platform rotation-vector is tied to the
        // sensor's natural axes. Remap to the currently displayed screen top.
        boolean remapped;
        switch(currentScreenRotation()){
            case Surface.ROTATION_90:
                remapped=SensorManager.remapCoordinateSystem(matrix,
                    SensorManager.AXIS_Y,SensorManager.AXIS_MINUS_X,screenMatrix);break;
            case Surface.ROTATION_180:
                remapped=SensorManager.remapCoordinateSystem(matrix,
                    SensorManager.AXIS_MINUS_X,SensorManager.AXIS_MINUS_Y,screenMatrix);break;
            case Surface.ROTATION_270:
                remapped=SensorManager.remapCoordinateSystem(matrix,
                    SensorManager.AXIS_MINUS_Y,SensorManager.AXIS_X,screenMatrix);break;
            default:
                System.arraycopy(matrix,0,screenMatrix,0,matrix.length);
                remapped=true;
        }
        if(!remapped)return;
        SensorManager.getOrientation(screenMatrix,orientation);
        double heading=Math.toDegrees(orientation[0]);
        double pitch=Math.toDegrees(orientation[1]);
        double roll=Math.toDegrees(orientation[2]);
        // The platform rotation vector is magnetic-north based. Add the local
        // declination only here; FOP already includes it when available.
        double declination=Double.NaN;
        if(Double.isFinite(compassLat)&&Double.isFinite(compassLon)){
            GeomagneticField field=new GeomagneticField(
                (float)compassLat,(float)compassLon,0f,System.currentTimeMillis());
            declination=field.getDeclination();
            lastDeclination=declination;
            heading+=declination;
        }
        // Rotation-vector values[4] is estimated magnetic heading error
        // in RADIANS, if the sensor reports it. Event accuracy alone is
        // often UNKNOWN even while the sensor supplies valid orientation.
        int accuracy=event.accuracy;
        if(accuracy<0||accuracy>SensorManager.SENSOR_STATUS_ACCURACY_HIGH)
            accuracy=fallbackSensorAccuracy;
        double error=accuracy==SensorManager.SENSOR_STATUS_ACCURACY_HIGH?25d:
            accuracy==SensorManager.SENSOR_STATUS_ACCURACY_MEDIUM?45d:180d;
        if(event.values.length>4 && Float.isFinite(event.values[4])
            && event.values[4]>=0){
            double angularError=Math.toDegrees(event.values[4]);
            if(Double.isFinite(angularError))
                error=Math.min(180d,Math.max(angularError,accuracy==SensorManager.SENSOR_STATUS_UNRELIABLE?35d:0d));
        }
        boolean trusted=error<=25d && accuracy!=SensorManager.SENSOR_STATUS_UNRELIABLE;
        long now=SystemClock.elapsedRealtime();
        if(trusted)lastUsablePlatformHeadingMs=now;
        sendCompassDiagnostic(heading,error,"android",pitch,roll,declination);
        // Block fallback only for RECENT TRUSTED Google readings, not simply
        // because FOP has emitted unusable 180-degree errors.
        if(now-lastUsableFusedOrientationMs<5000L)return;
        // On devices offering TYPE_HEADING prefer its newer sample.
        if(headingSensor!=null&&now-lastNativeHeadingSensorMs<3500L)return;
        sendCompassHeading(heading,error,"android",trusted);
    }
    @Override public void onAccuracyChanged(Sensor sensor,int accuracy){
        if(sensor==rotation)fallbackSensorAccuracy=accuracy;
    }
    @Override protected void onResume(){
        super.onResume();
        startOrientationTracking();
        if(webView!=null)webView.onResume();
        // onPause() unsubscribes from GPS. If that interrupted an unfinished
        // search, restart the satellite-only provider after screen wake.
        // This never launches a Google/network request or asks for permission.
        if(resumePendingGpsSearch){
            resumePendingGpsSearch=false;
            if(hasAnyPermission()&&locationEnabled()){
                // Resume the complete high-accuracy search on returning to UI.
                beginLocation();
            }else{
                sendError(hasAnyPermission()
                    ?"Telefon konumu kapalı. Ayarlardan açıp tekrar dene."
                    :"Konum izni gerekli. Konum Merkezi'nden izin ver.");
            }
        }
        sendLocationDiagnostics();
    }
    @Override protected void onPause(){
        // Remember an unfinished search BEFORE stopSources() clears `working`.
        resumePendingGpsSearch=working&&!freshFix;
        stopSources();
        stopOrientationTracking();
        if(webView!=null)webView.onPause();
        super.onPause();
    }
    @Override protected void onActivityResult(int code,int resultCode,Intent data){
        super.onActivityResult(code,resultCode,data);
        if(code==REQ_LOCATION_SETTINGS){
            if(resultCode==RESULT_OK){
                sendStatus("Yüksek doğruluklu Google konumu etkinleştirildi. Konum yenileniyor...");
                beginLocation();
            } else {
                sendStatus("Google yüksek doğruluk ayarı onaylanmadı. Mevcut konum kaynaklarıyla devam ediliyor.");
            }
        }
    }
    @Override public void onRequestPermissionsResult(int code,String[] permissions,int[] results){
        super.onRequestPermissionsResult(code,permissions,results);
        if(code==REQ_LOCATION){
            if(waitingSatellitePermission){
                waitingSatellitePermission=false;
                if(hasFine())startSatelliteOnly();
                else sendError("Uydu GPS için Kesin Konum iznini aç veya koordinatları elle gir.");
            }else if(hasAnyPermission())beginLocation();
            else sendError("Konum izni reddedildi. Ayarlar > Uygulamalar > Namaz Zamanı > İzinler > Konum bölümünden izin ver veya koordinatları elle gir.");
            sendLocationDiagnostics();
        }
    }
    @Override public void onBackPressed(){
        if(webView==null){super.onBackPressed();return;}
        // Respect the premium in-app location sheet before navigating away
        // or closing the Android activity. All UI access remains on main.
        webView.evaluateJavascript(
            "Boolean(window.NamazLocationHub&&window.NamazLocationHub.isOpen&&window.NamazLocationHub.isOpen())",
            state->{
                if("true".equals(state)){
                    webView.evaluateJavascript("window.NamazLocationHub.close()",null);
                }else if(webView.canGoBack()){
                    webView.goBack();
                }else{
                    MainActivity.super.onBackPressed();
                }
            }
        );
    }
    @Override protected void onDestroy(){
        stopSources();
        if(arabicTts!=null){arabicTts.stop();arabicTts.shutdown();arabicTts=null;}
        if(webView!=null)webView.destroy();
        super.onDestroy();
    }
}
