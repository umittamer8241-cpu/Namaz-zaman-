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
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import org.json.JSONObject;
import java.util.Locale;

public class MainActivity extends Activity implements LocationListener, SensorEventListener {
    private static final int REQ_LOCATION = 24;
    private WebView webView;
    private LocationManager locationManager;
    private SensorManager sensors;
    private Sensor rotation;
    private Location lastLocation;
    private boolean subscribed = false;
    private boolean ready = false;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(Color.rgb(6, 21, 36));
        getWindow().setNavigationBarColor(Color.rgb(6, 21, 36));
        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        sensors = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        rotation = sensors.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR);
        if (rotation == null) rotation = sensors.getDefaultSensor(Sensor.TYPE_GEOMAGNETIC_ROTATION_VECTOR);
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
            @Override public boolean shouldOverrideUrlLoading(WebView v, String url) {
                return !url.startsWith("file:///android_asset/");
            }
            @Override public void onPageFinished(WebView v, String url) {
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

    private void error(String message) {
        js("window.nativeError(" + JSONObject.quote(message) + ");");
    }

    private void beginLocation() {
        if (checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION}, REQ_LOCATION);
            return;
        }
        if (locationManager == null || !locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
            error("GPS/konumu aç ve tekrar dene. İnternet gerekmez.");
            return;
        }
        try {
            Location prev = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER);
            if (prev != null) { lastLocation = prev; emitLocation(prev, true); }
            if (!subscribed) {
                locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 15000L, 30f, this);
                subscribed = true;
            }
        } catch (SecurityException e) {
            error("Konum izni eksik.");
        } catch (RuntimeException e) {
            error("GPS kullanılamıyor. Açık gökyüzünde tekrar dene.");
        }
    }

    private void emitLocation(Location l, boolean cached) {
        double lat = l.getLatitude(), lon = l.getLongitude();
        if (!Double.isFinite(lat) || !Double.isFinite(lon)) return;
        js(String.format(Locale.US, "window.nativeLocation(%.8f,%.8f,%.2f,%s,%d);",
            lat, lon, l.hasAccuracy() ? l.getAccuracy() : 0.0, cached ? "true" : "false", l.getTime()));
    }

    @Override public void onLocationChanged(Location l) {
        lastLocation = l;
        emitLocation(l, false);
    }
    @Override public void onProviderEnabled(String name) {
        if (LocationManager.GPS_PROVIDER.equals(name)) beginLocation();
    }
    @Override public void onProviderDisabled(String name) {
        if (LocationManager.GPS_PROVIDER.equals(name)) error("GPS kapatıldı.");
    }

    @Override public void onSensorChanged(SensorEvent e) {
        if (e.sensor.getType() != Sensor.TYPE_ROTATION_VECTOR &&
            e.sensor.getType() != Sensor.TYPE_GEOMAGNETIC_ROTATION_VECTOR) return;
        float[] matrix = new float[9], orientation = new float[3];
        SensorManager.getRotationMatrixFromVector(matrix, e.values);
        SensorManager.getOrientation(matrix, orientation);
        double heading = Math.toDegrees(orientation[0]);
        if (lastLocation != null) {
            GeomagneticField field = new GeomagneticField((float) lastLocation.getLatitude(),
                (float) lastLocation.getLongitude(), (float) lastLocation.getAltitude(), System.currentTimeMillis());
            heading += field.getDeclination();
        }
        heading = ((heading % 360) + 360) % 360;
        js(String.format(Locale.US, "window.nativeHeading(%.2f);", heading));
    }
    @Override public void onAccuracyChanged(Sensor s, int a) { }

    @Override protected void onResume() {
        super.onResume();
        if (sensors != null && rotation != null) sensors.registerListener(this, rotation, SensorManager.SENSOR_DELAY_UI);
        if (webView != null) webView.onResume();
        if (ready && checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) beginLocation();
    }
    @Override protected void onPause() {
        if (sensors != null) sensors.unregisterListener(this);
        if (locationManager != null && subscribed) { locationManager.removeUpdates(this); subscribed = false; }
        if (webView != null) webView.onPause();
        super.onPause();
    }
    @Override public void onRequestPermissionsResult(int code, String[] perms, int[] results) {
        super.onRequestPermissionsResult(code, perms, results);
        if (code == REQ_LOCATION) {
            if (results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED) beginLocation();
            else error("Konum izni reddedildi. Koordinatı elle girebilirsin.");
        }
    }
    @Override public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }
    @Override protected void onDestroy() {
        if (webView != null) webView.destroy();
        super.onDestroy();
    }
}
