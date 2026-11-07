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
import android.os.Handler;
import android.os.Looper;
import android.os.CancellationSignal;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import org.json.JSONObject;
import java.util.Locale;

public class MainActivity extends Activity implements LocationListener, SensorEventListener {
    private static final int REQ_LOCATION = 24;
    private static final long STALE_AFTER_MS = 10L * 60L * 1000L;
    private WebView webView;
    private LocationManager locationManager;
    private SensorManager sensors;
    private Sensor rotation;
    private Location lastLocation;
    private boolean subscribed = false;
    private boolean ready = false;
    private boolean liveFix = false;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Runnable searchWarning = () -> {
        if (!liveFix) status("GPS hâlâ aranıyor. Geminin metal yapısı sinyali engelleyebilir; açık güvertede tekrar dene. Ağ konumu varsa yaklaşık bilgi kullanılabilir.");
    };

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(Color.rgb(6, 21, 36));
        getWindow().setNavigationBarColor(Color.rgb(6, 21, 36));
        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        sensors = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        rotation = sensors == null ? null : sensors.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR);
        if (rotation == null && sensors != null) rotation = sensors.getDefaultSensor(Sensor.TYPE_GEOMAGNETIC_ROTATION_VECTOR);
        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(6, 21, 36));
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setAllowFileAccess(true);
        webView.getSettings().setAllowFileAccessFromFileURLs(false);
        webView.getSettings().setAllowUniversalAccessFromFileURLs(false);
        webView.addJavascriptInterface(new Bridge(), "GemiNative");
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return !url.startsWith("file:///android_asset/");
            }
            @Override public void onPageFinished(WebView view, String url) {
                ready = true;
                if (lastLocation != null) emitLocation(lastLocation, true);
            }
        });
        setContentView(webView);
        webView.loadUrl("file:///android_asset/index.html");
    }

    public class Bridge {
        @JavascriptInterface public void requestLocation() {
            runOnUiThread(() -> beginLocation());
        }
    }

    private void js(String script) {
        if (webView != null && ready) webView.evaluateJavascript(script, null);
    }
    private void status(String message) {
        js("window.nativeSearching(" + JSONObject.quote(message) + ");");
    }
    private void error(String message) {
        js("window.nativeError(" + JSONObject.quote(message) + ");");
    }

    private boolean hasFine() {
        return checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
    }
    private boolean hasCoarse() {
        return checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;
    }

    private boolean isRecent(Location loc) {
        if (loc == null) return false;
        long age = System.currentTimeMillis() - loc.getTime();
        return age >= -60000 && age <= STALE_AFTER_MS && (!loc.hasAccuracy() || loc.getAccuracy() <= 10000);
    }

    private void acceptLocation(Location loc, boolean cache) {
        if (!isRecent(loc)) return;
        if (lastLocation != null) {
            long age = System.currentTimeMillis() - lastLocation.getTime();
            boolean recentGps = LocationManager.GPS_PROVIDER.equals(lastLocation.getProvider()) && age <= 60000;
            boolean newNetwork = LocationManager.NETWORK_PROVIDER.equals(loc.getProvider());
            if (recentGps && newNetwork) return;
            if (cache && lastLocation.getTime() > loc.getTime()) return;
        }
        if (!cache) liveFix = true;
        lastLocation = loc;
        emitLocation(loc, cache);
    }

    private void beginLocation() {
        if (!hasFine() && !hasCoarse()) {
            requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION}, REQ_LOCATION);
            return;
        }
        if (locationManager == null) {error("Telefon konum servisi bulunamadı.");return;}
        boolean gpsOn = hasFine() && locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER);
        boolean networkOn = (hasFine() || hasCoarse()) && locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER);
        if (!gpsOn && !networkOn) {
            error("Konum hizmetini aç ve uygulamaya Kesin konum izni ver. Gemide açık güvertede dene.");
            return;
        }
        status(gpsOn ? "GPS aranıyor; geminin içinde sinyal zayıflayabilir..." : "Kesin GPS kapalı/izinsiz; ağ konumu deneniyor. Kesin konum iznini aç.");
        try {
            if (gpsOn) acceptLocation(locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER),true);
            if (networkOn) acceptLocation(locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER),true);
            if (subscribed) locationManager.removeUpdates(this);
            if (gpsOn) locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER,7000L,10f,this);
            if (networkOn) locationManager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER,12000L,50f,this);
            subscribed = true;
            if (Build.VERSION.SDK_INT >= 30) {
                if (gpsOn) locationManager.getCurrentLocation(LocationManager.GPS_PROVIDER,(CancellationSignal)null,getMainExecutor(),
                        loc -> { if (loc != null) acceptLocation(loc,false); });
                if (networkOn) locationManager.getCurrentLocation(LocationManager.NETWORK_PROVIDER,(CancellationSignal)null,getMainExecutor(),
                        loc -> { if (loc != null) acceptLocation(loc,false); });
            }
            handler.removeCallbacks(searchWarning);
            if (!liveFix) handler.postDelayed(searchWarning,45000L);
        } catch (SecurityException e) {
            error("Konum izni eksik; Ayarlar > Uygulamalar > Namaz Zamanı > Konum bölümünü kontrol et.");
        } catch (RuntimeException e) {
            error("Konum alınamadı. Açık güvertede GPS'i tekrar dene.");
        }
    }

    private void emitLocation(Location l, boolean cached) {
        double lat=l.getLatitude(),lon=l.getLongitude();
        if (!Double.isFinite(lat) || !Double.isFinite(lon)) return;
        js(String.format(Locale.US,"window.nativeLocation(%.8f,%.8f,%.2f,%s,%d,%s);",
            lat,lon,l.hasAccuracy()?l.getAccuracy():0f,cached?"true":"false",l.getTime(),JSONObject.quote(l.getProvider())));
    }

    @Override public void onLocationChanged(Location location) {
        acceptLocation(location,false);
    }
    @Override public void onProviderEnabled(String name) {beginLocation();}
    @Override public void onProviderDisabled(String name) {
        if (LocationManager.GPS_PROVIDER.equals(name) || LocationManager.NETWORK_PROVIDER.equals(name)) {
            status("Bir konum kaynağı kapandı. GPS'i açıp tekrar dene.");
        }
    }

    @Override public void onSensorChanged(SensorEvent e) {
        if (e.sensor.getType()!=Sensor.TYPE_ROTATION_VECTOR && e.sensor.getType()!=Sensor.TYPE_GEOMAGNETIC_ROTATION_VECTOR) return;
        float[] matrix=new float[9],orientation=new float[3];
        SensorManager.getRotationMatrixFromVector(matrix,e.values);
        SensorManager.getOrientation(matrix,orientation);
        double heading=Math.toDegrees(orientation[0]);
        if (lastLocation!=null) {
            GeomagneticField field=new GeomagneticField((float)lastLocation.getLatitude(),
                (float)lastLocation.getLongitude(),(float)lastLocation.getAltitude(),System.currentTimeMillis());
            heading+=field.getDeclination();
        }
        heading=((heading%360)+360)%360;
        js(String.format(Locale.US,"window.nativeHeading(%.2f);",heading));
    }
    @Override public void onAccuracyChanged(Sensor sensor,int accuracy) {}

    @Override protected void onResume() {
        super.onResume();
        if (sensors!=null && rotation!=null) sensors.registerListener(this,rotation,SensorManager.SENSOR_DELAY_UI);
        if (webView!=null) webView.onResume();
        if (ready && (hasFine()||hasCoarse())) beginLocation();
    }
    @Override protected void onPause() {
        handler.removeCallbacks(searchWarning);
        if (sensors!=null) sensors.unregisterListener(this);
        if (locationManager!=null && subscribed) {locationManager.removeUpdates(this);subscribed=false;}
        if (webView!=null) webView.onPause();
        super.onPause();
    }
    @Override public void onRequestPermissionsResult(int code,String[] permissions,int[] results) {
        super.onRequestPermissionsResult(code,permissions,results);
        if (code==REQ_LOCATION) {
            if (hasFine()||hasCoarse()) beginLocation();
            else error("Konum izni verilmedi. Koordinatı elle girebilirsin.");
        }
    }
    @Override public void onBackPressed() {
        if (webView!=null && webView.canGoBack()) webView.goBack(); else super.onBackPressed();
    }
    @Override protected void onDestroy() {
        handler.removeCallbacks(searchWarning);
        if (webView!=null) webView.destroy();
        super.onDestroy();
    }
}
