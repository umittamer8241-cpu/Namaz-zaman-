package com.geminamaz.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import org.json.JSONArray;
import org.json.JSONObject;

public final class AdhanScheduler {
    static final String PREFS = "adhan_settings";
    static final String ALARM_ACTION = "com.geminamaz.app.PLAY_ADHAN";
    private static final int REQUEST_CODE = 771;
    private static final long MAX_LATE_MS = 20 * 60 * 1000L;
    private AdhanScheduler() {}

    static SharedPreferences prefs(Context context) {
        return context.getApplicationContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }
    static boolean enabled(Context context) {
        return prefs(context).getBoolean("enabled", true);
    }
    static void setEnabled(Context context, boolean on) {
        prefs(context).edit().putBoolean("enabled", on).apply();
        if (!on) {
            cancel(context);
            context.stopService(new Intent(context, AdhanPlaybackService.class));
        } else scheduleNext(context);
    }
    static void updateEvents(Context context, String json) {
        try {
            JSONArray raw = new JSONArray(json);
            JSONArray safe = new JSONArray();
            long now = System.currentTimeMillis();
            for (int i = 0; i < raw.length() && safe.length() < 165; i++) {
                JSONObject row = raw.optJSONObject(i);
                if (row == null) continue;
                String id = row.optString("id", "");
                String recording = row.optString("recording", "");
                long at = row.optLong("at", 0);
                if (!(id.equals("fajr") || id.equals("dhuhr") || id.equals("asr")
                        || id.equals("maghrib") || id.equals("isha"))) continue;
                if (!("beautiful".equals(recording) || "calling".equals(recording) || "short".equals(recording))) continue;
                if (at < now - 60000L || at > now + 33L * 86400000L) continue;
                safe.put(new JSONObject().put("id", id).put("at", at).put("recording", recording));
            }
            prefs(context).edit().putString("events", safe.toString()).apply();
            scheduleNext(context);
        } catch (Exception ignored) { /* Keep the previous valid schedule. */ }
    }
    static void scheduleNext(Context context) {
        cancel(context);
        if (!enabled(context)) return;
        JSONArray events;
        try { events = new JSONArray(prefs(context).getString("events", "[]")); }
        catch (Exception e) { return; }
        long now = System.currentTimeMillis(), earliest = Long.MAX_VALUE;
        String prayer = "", recording = "";
        for (int i = 0; i < events.length(); i++) {
            JSONObject row = events.optJSONObject(i);
            if (row == null) continue;
            long at = row.optLong("at", 0);
            if (at > now + 1000 && at < earliest) {
                earliest = at; prayer = row.optString("id", ""); recording = row.optString("recording", "");
            }
        }
        if (earliest == Long.MAX_VALUE) return;
        Intent intent = new Intent(context, AdhanAlarmReceiver.class)
                .setAction(ALARM_ACTION).putExtra("at", earliest).putExtra("prayer", prayer)
                .putExtra("recording", recording);
        PendingIntent pending = PendingIntent.getBroadcast(context, REQUEST_CODE, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        AlarmManager alarm = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarm == null) return;
        try {
            if (Build.VERSION.SDK_INT < 31 || alarm.canScheduleExactAlarms()) {
                alarm.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, earliest, pending);
            } else {
                // A denied exact-alarm permission means delivery may be late.
                alarm.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, earliest, pending);
            }
        } catch (SecurityException e) {
            alarm.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, earliest, pending);
        }
    }
    private static void cancel(Context context) {
        AlarmManager alarm = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarm == null) return;
        Intent intent = new Intent(context, AdhanAlarmReceiver.class).setAction(ALARM_ACTION);
        PendingIntent old = PendingIntent.getBroadcast(context, REQUEST_CODE, intent,
                PendingIntent.FLAG_NO_CREATE | PendingIntent.FLAG_IMMUTABLE);
        if (old != null) { alarm.cancel(old); old.cancel(); }
    }
    static void onAlarm(Context context, Intent intent) {
        long scheduled = intent.getLongExtra("at", -1);
        String prayer = intent.getStringExtra("prayer");
        String recording = intent.getStringExtra("recording");
        SharedPreferences settings = prefs(context);
        long now = System.currentTimeMillis();
        if (enabled(context) && scheduled > 0 && now >= scheduled - 5000L
                && now - scheduled < MAX_LATE_MS
                && settings.getLong("last_played", -1) != scheduled
                && isScheduled(settings, scheduled, prayer, recording)) {
            settings.edit().putLong("last_played", scheduled).apply();
            AdhanPlaybackService.play(context, prayer, recording, false);
        }
        scheduleNext(context);
    }
    private static boolean isScheduled(SharedPreferences prefs, long scheduled, String prayer, String recording) {
        try {
            JSONArray events = new JSONArray(prefs.getString("events", "[]"));
            for (int i = 0; i < events.length(); i++) {
                JSONObject row = events.optJSONObject(i);
                if (row != null && row.optLong("at") == scheduled
                        && row.optString("id", "").equals(prayer)
                        && row.optString("recording", "").equals(recording)) return true;
            }
        } catch (Exception ignored) {}
        return false;
    }
}
