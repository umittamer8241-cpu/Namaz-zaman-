package com.geminamaz.app;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.hardware.GeomagneticField;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
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

public class MainActivity extends Activity implements LocationListener, SensorEventListener {
    private static final int REQ_LOCATION = 24;
    private static final int REQ_LOCATION_SETTINGS = 25;
    private static final long LOCATION_MAX_AGE_MS = 10 * 60 * 1000L;
    private static final float LOCATION_MAX_ACCURACY_M = 5000f;
    private static final long FIRST_FALLBACK_MS = 28000L;
    private WebView webView;
    private TextToSpeech arabicTts;
    private boolean arabicTtsReady = false;
    private String queuedArabic;
    private LocationManager locationManager;
    private SensorManager sensors;
    private Sensor rotation;
    private FusedOrientationProviderClient fusedOrientationClient;
    private DeviceOrientationListener fusedOrientationListener;
    private long lastFusedOrientationMs;
    private boolean orientationRunning;
    private int fallbackSensorAccuracy = SensorManager.SENSOR_STATUS_UNRELIABLE;
    private double compassLat = Double.NaN;
    private double compassLon = Double.NaN;
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

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.rgb(6,21,36));
        getWindow().setNavigationBarColor(Color.rgb(6,21,36));
        locationManager=(LocationManager)getSystemService(Context.LOCATION_SERVICE);
        sensors=(SensorManager)getSystemService(Context.SENSOR_SERVICE);
        rotation=sensors==null?null:sensors.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR);
        if(rotation==null&&sensors!=null)rotation=sensors.getDefaultSensor(Sensor.TYPE_GEOMAGNETIC_ROTATION_VECTOR);
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
                // JS may have requested location before onPageFinished; check again after UI initialization.
                if(hasAnyPermission()&&!working)beginLocation();
            }
        });
        setContentView(webView);
        webView.loadUrl("file:///android_asset/index.html");
    }

    public class Bridge {
        @JavascriptInterface public void requestLocation(){runOnUiThread(()->beginLocation());}
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
        if(Build.VERSION.SDK_INT>=28)return locationManager.isLocationEnabled();
        return providerAvailable(LocationManager.NETWORK_PROVIDER)||providerAvailable(LocationManager.GPS_PROVIDER);
    }
    private boolean recent(Location location){
        if(location==null||!Double.isFinite(location.getLatitude())||!Double.isFinite(location.getLongitude()))return false;
        long age=System.currentTimeMillis()-location.getTime();
        return age>=-60000L && age<=LOCATION_MAX_AGE_MS
            && (!location.hasAccuracy()||location.getAccuracy()<=LOCATION_MAX_ACCURACY_M);
    }

    private void accept(Location location,boolean cached,String source){
        if(location==null)return;
        if(!recent(location)){
            if(location.hasAccuracy()&&location.getAccuracy()>LOCATION_MAX_ACCURACY_M) {
                sendStatus("Google konum bilgisi çok yaklaşık (±"+Math.round(location.getAccuracy()/1000f)+" km). Daha hassas sonuç için GPS aranıyor.");
            }
            return;
        }
        if(latest!=null&&recent(latest)){
            long age=System.currentTimeMillis()-latest.getTime();
            if(location.getTime()+15000L<latest.getTime())return;
            if(age<60000L&&latest.hasAccuracy()&&location.hasAccuracy()
                && latest.getAccuracy()<location.getAccuracy()/3f)return;
        }
        latest=location;latestSource=source;
        compassLat=location.getLatitude();compassLon=location.getLongitude();
        if(!cached)freshFix=true;
        sendLocation(location,cached,source);
    }
    private void sendLocation(Location loc,boolean cached,String source){
        double lat=loc.getLatitude(),lon=loc.getLongitude();
        if(!Double.isFinite(lat)||!Double.isFinite(lon))return;
        js(String.format(Locale.US,"window.nativeLocation(%.8f,%.8f,%.1f,%s,%d,%s);",
            lat,lon,loc.hasAccuracy()?loc.getAccuracy():0f,cached?"true":"false",
            loc.getTime(),JSONObject.quote(source)));
    }

    private void beginLocation(){
        if(!hasAnyPermission()){
            sendError("Konum izni gerekiyor. İzin ekranında 'Kesin konum'u seç.");
            requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION},REQ_LOCATION);
            return;
        }
        if(!locationEnabled()){
            sendError("Telefon konumu kapalı. Alttaki 'Konum ayarları' ile aç.");
            return;
        }
        stopSources();
        working=true;freshFix=false;
        sendStatus("1/2 · Google Haritalar konum motoru yüksek doğrulukla çalışıyor (Wi-Fi / baz / uydu)...");
        startGoogleOrNetwork();
        fallbackRunnable=()->{if(!freshFix){
            sendStatus("2/2 · Google henüz konum vermedi, doğrudan uydu GPS yedeği de etkinleşiyor...");
            startGpsFallback();
        }};
        handler.postDelayed(fallbackRunnable,FIRST_FALLBACK_MS);
        warningRunnable=()->{
            if(!freshFix){
                sendError("Konum bulunamadı. Gemi Wi-Fi interneti tek başına konum vermez. Telefonun Konum ayarlarında Google Konum Doğruluğu ve Kesin Konum açık olmalı. Açık güvertede dene veya koordinat gir.");
            }
        };
        handler.postDelayed(warningRunnable,45000L);
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
                // Ask Android to enable the same high-accuracy location settings used by map navigation.
                // A system-owned confirmation dialog is shown only if a setting must change.
                if(hasFine() && !settingsPromptShown){
                    LocationRequest desired=new LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY,8000L)
                        .setMinUpdateIntervalMillis(4000L).build();
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
                    .setMaxUpdateAgeMillis(15000L)
                    .setDurationMillis(35000L)
                    .build();
                currentToken=new CancellationTokenSource();
                fusedClient.getCurrentLocation(req,currentToken.getToken())
                    .addOnSuccessListener(loc->{
                        if(loc!=null)accept(loc,false,"google");
                        else if(!freshFix)sendStatus("Google henüz konum bulamadı; ağ ve GPS yedeği deneniyor.");
                    })
                    .addOnFailureListener(ex->{
                        if(!freshFix)sendStatus("Google konum yanıt vermedi. Android ağ konumu deneniyor.");
                    });
                LocationRequest updates=new LocationRequest.Builder(hasFine()?Priority.PRIORITY_HIGH_ACCURACY:Priority.PRIORITY_BALANCED_POWER_ACCURACY,8000L)
                    .setMinUpdateIntervalMillis(4000L)
                    .setWaitForAccurateLocation(false)
                    .build();
                fusedCallback=new LocationCallback(){
                    @Override public void onLocationResult(LocationResult res){
                        if(res!=null&&res.getLastLocation()!=null)
                            accept(res.getLastLocation(),false,"google");
                    }
                };
                fusedClient.requestLocationUpdates(updates,fusedCallback,Looper.getMainLooper());
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
            locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER,7000L,10f,this);
            gpsSubscribed=true;
            if(Build.VERSION.SDK_INT>=30)locationManager.getCurrentLocation(
                LocationManager.GPS_PROVIDER,(CancellationSignal)null,getMainExecutor(),
                loc->{if(loc!=null)accept(loc,false,"gps");});
            if(fusedClient!=null){
                CurrentLocationRequest accurate=new CurrentLocationRequest.Builder()
                    .setPriority(Priority.PRIORITY_HIGH_ACCURACY)
                    .setGranularity(Granularity.GRANULARITY_PERMISSION_LEVEL)
                    .setMaxUpdateAgeMillis(30000L)
                    .setDurationMillis(20000L).build();
                CancellationTokenSource token=new CancellationTokenSource();
                fusedClient.getCurrentLocation(accurate,token.getToken())
                    .addOnSuccessListener(loc->{if(loc!=null)accept(loc,false,"google");});
            }
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
        if(nativeReady)beginLocation();
    }
    @Override public void onProviderDisabled(String provider){
        sendStatus("Konum kaynağı kapatıldı. Konumu aç veya GPS'i tekrar dene.");
    }

    // Primary: Google Fused Orientation Provider. It estimates heading against geographic
    // north when it has local magnetic declination and reports a heading error envelope.
    // Fallback: Android rotation vector only when FOP is absent or has stalled.
    // Never claim a trustworthy heading when the error is high or unreported.
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
        fallbackSensorAccuracy=SensorManager.SENSOR_STATUS_UNRELIABLE;
        if(sensors!=null&&rotation!=null){
            sensors.registerListener(this,rotation,SensorManager.SENSOR_DELAY_UI);
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
                double error=orientation.hasConservativeHeadingErrorDegrees()
                    ?orientation.getConservativeHeadingErrorDegrees()
                    :orientation.getHeadingErrorDegrees();
                lastFusedOrientationMs=SystemClock.elapsedRealtime();
                sendCompassHeading(heading,error,"fused",Double.isFinite(error)&&error<=25d);
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
    }
    @Override public void onSensorChanged(SensorEvent event){
        if(!orientationRunning)return;
        if(event.sensor.getType()!=Sensor.TYPE_ROTATION_VECTOR &&
           event.sensor.getType()!=Sensor.TYPE_GEOMAGNETIC_ROTATION_VECTOR)return;
        if(lastFusedOrientationMs>0 &&
           SystemClock.elapsedRealtime()-lastFusedOrientationMs<5000L)return;
        float[] matrix=new float[9],orientation=new float[3];
        SensorManager.getRotationMatrixFromVector(matrix,event.values);
        SensorManager.getOrientation(matrix,orientation);
        double heading=Math.toDegrees(orientation[0]);
        // The platform rotation vector is magnetic-north based. Add the local
        // declination only here; FOP already includes it when available.
        if(Double.isFinite(compassLat)&&Double.isFinite(compassLon)){
            GeomagneticField field=new GeomagneticField(
                (float)compassLat,(float)compassLon,0f,System.currentTimeMillis());
            heading+=field.getDeclination();
        }
        // Rotation-vector accuracy quality is vendor-dependent: display the
        // source as a fallback and require HIGH before permitting an arrow.
        int accuracy=event.accuracy;
        if(accuracy<0||accuracy>SensorManager.SENSOR_STATUS_ACCURACY_HIGH)
            accuracy=fallbackSensorAccuracy;
        boolean trusted=accuracy==SensorManager.SENSOR_STATUS_ACCURACY_HIGH;
        sendCompassHeading(heading,trusted?25d:180d,"android",trusted);
    }
    @Override public void onAccuracyChanged(Sensor sensor,int accuracy){
        if(sensor==rotation)fallbackSensorAccuracy=accuracy;
    }
    @Override protected void onResume(){
        super.onResume();
        startOrientationTracking();
        if(webView!=null)webView.onResume();
        if(nativeReady)beginLocation();
    }
    @Override protected void onPause(){
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
            if(hasAnyPermission())beginLocation();
            else sendError("Konum izni reddedildi. Koordinatları elle girebilirsin.");
        }
    }
    @Override public void onBackPressed(){
        if(webView!=null&&webView.canGoBack())webView.goBack();
        else super.onBackPressed();
    }
    @Override protected void onDestroy(){
        stopSources();
        if(arabicTts!=null){arabicTts.stop();arabicTts.shutdown();arabicTts=null;}
        if(webView!=null)webView.destroy();
        super.onDestroy();
    }
}
