package com.geminamaz.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import java.io.File;
import java.io.InputStream;
import java.io.FileOutputStream;

public class AdhanPlaybackService extends Service {
    private static final String CHANNEL = "adhan_playback_v1";
    private static final String PLAY = "com.geminamaz.app.ADHAN_PLAY";
    private static final String STOP = "com.geminamaz.app.ADHAN_STOP";
    private MediaPlayer player;

    public static void play(Context context, String prayer, String recording, boolean preview) {
        Intent command = new Intent(context, AdhanPlaybackService.class)
                .setAction(PLAY).putExtra("prayer", prayer)
                .putExtra("recording", recording).putExtra("preview", preview);
        try {
            if (Build.VERSION.SDK_INT >= 26) context.startForegroundService(command);
            else context.startService(command);
        } catch (RuntimeException ignored) {
            // Some devices prohibit a background foreground-service start without exact-alarm access.
        }
    }
    @Override public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null) { stopSelf(); return START_NOT_STICKY; }
        if (STOP.equals(intent.getAction())) { stopSelf(); return START_NOT_STICKY; }
        if (!PLAY.equals(intent.getAction())
                || (!intent.getBooleanExtra("preview", false) && !AdhanScheduler.enabled(this))) {
            stopSelf(); return START_NOT_STICKY;
        }
        String prayer = intent.getStringExtra("prayer");
        String recording = intent.getStringExtra("recording");
        if (prayer == null) prayer = "";
        if (!("beautiful".equals(recording) || "calling".equals(recording) || "short".equals(recording))) {
            stopSelf(); return START_NOT_STICKY;
        }
        createChannel();
        Intent open = new Intent(this, MainActivity.class)
                .addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent show = PendingIntent.getActivity(this, 920, open,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        PendingIntent stop = PendingIntent.getService(this, 921,
                new Intent(this, AdhanPlaybackService.class).setAction(STOP),
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        Notification.Builder builder = Build.VERSION.SDK_INT >= 26
                ? new Notification.Builder(this, CHANNEL) : new Notification.Builder(this);
        Notification notice = builder
                .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
                .setContentTitle("Namaz Zamanı · Ezan")
                .setContentText(prayerName(prayer) + " · Ezan çalıyor")
                .setContentIntent(show).setOngoing(true)
                .setCategory(Notification.CATEGORY_TRANSPORT)
                .addAction(new Notification.Action.Builder(
                        android.R.drawable.ic_media_pause, "Durdur", stop).build()).build();
        try {
            if (Build.VERSION.SDK_INT >= 29) {
                startForeground(920, notice, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
            } else startForeground(920, notice);
            stopPlayer();
            String source = "beautiful".equals(recording) ? "Beautiful_adhan.ogg"
                    : "calling".equals(recording) ? "Muslim_calling_to_prayer.ogg" : "Adhan.ogg";
            File sound = new File(getCacheDir(), "adhan_"+recording+".ogg");
            long expectedLength = "beautiful".equals(recording) ? 1229032L
                    : "calling".equals(recording) ? 820174L : 338741L;
            if (!sound.exists() || sound.length() != expectedLength) {
                try (InputStream in = getAssets().open("audio/"+source);
                     FileOutputStream out = new FileOutputStream(sound)) {
                    byte[] buffer = new byte[16384];
                    int count;
                    while ((count = in.read(buffer)) >= 0) if (count > 0) out.write(buffer, 0, count);
                }
            }
            player = new MediaPlayer();
            player.setAudioAttributes(new AudioAttributes.Builder()
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .setUsage(AudioAttributes.USAGE_ALARM).build());
            player.setWakeMode(this, PowerManager.PARTIAL_WAKE_LOCK);
            player.setDataSource(sound.getAbsolutePath());
            player.setOnCompletionListener(mp -> stopSelf());
            player.setOnErrorListener((mp, what, extra) -> { stopSelf(); return true; });
            player.prepare();
            player.start();
        } catch (Exception e) { stopSelf(); }
        return START_NOT_STICKY;
    }
    private void createChannel() {
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel channel = new NotificationChannel(CHANNEL, "Ezan çalarken",
                    NotificationManager.IMPORTANCE_LOW);
            channel.setDescription("Namaz vaktinde ezan oynatımı");
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) manager.createNotificationChannel(channel);
        }
    }
    private String prayerName(String id) {
        switch (id) {
            case "fajr": return "Sabah";
            case "dhuhr": return "Öğle";
            case "asr": return "İkindi";
            case "maghrib": return "Akşam";
            case "isha": return "Yatsı";
            default: return "Ön izleme";
        }
    }
    private void stopPlayer() {
        if (player != null) {
            try { player.stop(); } catch (Exception ignored) {}
            player.release(); player = null;
        }
    }
    @Override public void onDestroy() {
        stopPlayer();
        if (Build.VERSION.SDK_INT >= 24) stopForeground(STOP_FOREGROUND_REMOVE);
        else stopForeground(true);
        super.onDestroy();
    }
    @Override public IBinder onBind(Intent intent) { return null; }
}
